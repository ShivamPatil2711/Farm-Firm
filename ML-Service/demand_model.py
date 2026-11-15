from fastapi import APIRouter, Query
from pydantic import BaseModel
from prophet import Prophet
import pandas as pd
from collections import defaultdict
from datetime import datetime
from statistics import median
from typing import Optional

from mongo_client import db

router = APIRouter()

def build_demand_timeseries(crop_name: str) -> pd.DataFrame:
    daily_demand = defaultdict(float)

    # 1. Open firm demands
    firm_requests = list(db.firmrequests.find(
        {"cropname": {"$regex": f"^{crop_name}$", "$options": "i"}}
    ))
    for fr in firm_requests:
        date = fr.get("createdAt")
        if date:
            day = pd.Timestamp(date).normalize()
            daily_demand[day] += fr.get("requirement", 1)

    # 2. Direct requests
    crops_of_type = list(db.crops.find(
        {"cropname": {"$regex": f"^{crop_name}$", "$options": "i"}}
    ))
    crop_ids = [c["_id"] for c in crops_of_type]
    direct_requests = list(db.requests.find(
        {"cropId": {"$in": crop_ids}}
    ))
    for dr in direct_requests:
        date = dr.get("createdAt") or dr.get("deadline")
        if date:
            day = pd.Timestamp(date).normalize()
            daily_demand[day] += dr.get("requirement", 1)

    # 3. Accepted quotations (2x weight)
    firm_request_ids = [fr["_id"] for fr in firm_requests]
    if firm_request_ids:
        accepted_quotations = list(db.quotations.find({
            "firmRequestId": {"$in": firm_request_ids},
            "status": "Accepted"
        }))
        for q in accepted_quotations:
            fr = db.firmrequests.find_one({"_id": q["firmRequestId"]})
            if fr:
                date = q.get("createdAt")
                if date:
                    day = pd.Timestamp(date).normalize()
                    daily_demand[day] += fr.get("requirement", 1) * 2

    if not daily_demand:
        return pd.DataFrame(columns=["ds", "y"])

    df = pd.DataFrame([
        {"ds": date, "y": qty}
        for date, qty in sorted(daily_demand.items())
    ])
    # Resample weekly and handle missing columns if empty
    df = df.set_index("ds").resample("W").sum().reset_index()
    df.columns = ["ds", "y"]
    return df


class DemandForecast(BaseModel):
    crop_name: str
    forecast: list[dict]
    trend: str
    trend_percent: float
    confidence: float
    data_points: int


def build_price_timeseries(crop_name: str) -> pd.DataFrame:
    """Build weekly prices from accepted quotations for a crop."""
    firm_requests = list(db.firmrequests.find(
        {
            "cropname": {"$regex": f"^{crop_name}$", "$options": "i"},
            "status": "Accepted",
        },
        {"_id": 1},
    ))
    firm_request_ids = [request["_id"] for request in firm_requests]
    if not firm_request_ids:
        return pd.DataFrame(columns=["ds", "y"])

    accepted_quotations = list(db.quotations.find({
        "firmRequestId": {"$in": firm_request_ids},
        "status": "Accepted",
        "rate": {"$gt": 0},
    }, {"createdAt": 1, "rate": 1}))
    prices = []
    for quotation in accepted_quotations:
        date = quotation.get("createdAt")
        rate = quotation.get("rate")
        if date and isinstance(rate, (int, float)) and rate > 0:
            prices.append({"ds": pd.Timestamp(date).normalize(), "y": float(rate)})

    if not prices:
        return pd.DataFrame(columns=["ds", "y"])

    return (
        pd.DataFrame(prices)
        .set_index("ds")
        .resample("W")
        .mean()
        .dropna()
        .reset_index()
    )


class PriceSuggestion(BaseModel):
    crop_name: str
    suggested_price: Optional[float]
    lower: Optional[float]
    upper: Optional[float]
    trend: str
    trend_percent: float
    confidence: float
    data_points: int
    price_observations: int


def suggest_crop_price(crop_name: str, weeks_ahead: int = 1) -> PriceSuggestion:
    df = build_price_timeseries(crop_name)
    data_points = len(df)
    price_observations = int(df["y"].count()) if data_points else 0

    if not data_points:
        return PriceSuggestion(
            crop_name=crop_name,
            suggested_price=None,
            lower=None,
            upper=None,
            trend="insufficient_data",
            trend_percent=0.0,
            confidence=0.0,
            data_points=0,
            price_observations=0,
        )

    # A short history cannot support Prophet reliably, but its observed range
    # is still useful as an explicitly low-confidence reference.
    if data_points < 4:
        observed_prices = df["y"].tolist()
        return PriceSuggestion(
            crop_name=crop_name,
            suggested_price=round(float(median(observed_prices)), 2),
            lower=round(float(min(observed_prices)), 2),
            upper=round(float(max(observed_prices)), 2),
            trend="insufficient_data",
            trend_percent=0.0,
            confidence=round(min((data_points / 12) * 50, 50), 1),
            data_points=data_points,
            price_observations=price_observations,
        )

    model = Prophet(
        yearly_seasonality=True,
        weekly_seasonality=False,
        daily_seasonality=False,
        changepoint_prior_scale=0.05,
        interval_width=0.80,
    )
    model.add_seasonality(name="kharif_rabi_cycle", period=182.5, fourier_order=5)
    model.fit(df)

    future = model.make_future_dataframe(periods=weeks_ahead, freq="W")
    forecast = model.predict(future)
    future_only = forecast[forecast["ds"] > df["ds"].max()].copy()
    next_period = future_only.iloc[0]
    first_value = float(future_only.iloc[0]["yhat"])
    last_value = float(future_only.iloc[-1]["yhat"])
    trend_percent = ((last_value - first_value) / max(abs(first_value), 1)) * 100

    if trend_percent > 5:
        trend = "rising"
    elif trend_percent < -5:
        trend = "falling"
    else:
        trend = "stable"

    return PriceSuggestion(
        crop_name=crop_name,
        suggested_price=round(max(0, float(next_period["yhat"])), 2),
        lower=round(max(0, float(next_period["yhat_lower"])), 2),
        upper=round(max(0, float(next_period["yhat_upper"])), 2),
        trend=trend,
        trend_percent=round(trend_percent, 1),
        confidence=round(min((data_points / 52) * 95, 95), 1),
        data_points=data_points,
        price_observations=price_observations,
    )


def train_and_forecast(crop_name: str, weeks_ahead: int = 8) -> DemandForecast:
    df = build_demand_timeseries(crop_name)
    data_points = len(df)

    if data_points < 4:
        return DemandForecast(
            crop_name=crop_name,
            forecast=[],
            trend="insufficient_data",
            trend_percent=0.0,
            confidence=0.0,
            data_points=data_points,
        )

    model = Prophet(
        yearly_seasonality=True,
        weekly_seasonality=False,
        daily_seasonality=False,
        changepoint_prior_scale=0.05,
        interval_width=0.90,
    )
    model.add_seasonality(name="kharif_rabi_cycle", period=182.5, fourier_order=5)
    model.fit(df)

    future = model.make_future_dataframe(periods=weeks_ahead, freq="W")
    forecast = model.predict(future)

    future_only = forecast[forecast["ds"] > df["ds"].max()].copy()
    forecast_data = [
        {
            "date": row["ds"].strftime("%Y-%m-%d"),
            "predicted": max(0, round(row["yhat"], 1)),
            "lower": max(0, round(row["yhat_lower"], 1)),
            "upper": max(0, round(row["yhat_upper"], 1)),
        }
        for _, row in future_only.iterrows()
    ]

    if len(future_only) >= 2:
        first_val = future_only.iloc[0]["yhat"]
        last_val  = future_only.iloc[-1]["yhat"]
        trend_pct = ((last_val - first_val) / max(first_val, 1)) * 100

        if trend_pct > 10: trend = "rising"
        elif trend_pct < -10: trend = "falling"
        else: trend = "stable"
    else:
        trend = "stable"
        trend_pct = 0.0

    confidence = min((data_points / 52) * 95, 95)
    return DemandForecast(
        crop_name=crop_name,
        forecast=forecast_data,
        trend=trend,
        trend_percent=round(trend_pct, 1),
        confidence=round(confidence, 1),
        data_points=data_points,
    )

@router.get("/forecast/{crop_name}", response_model=DemandForecast)
async def get_forecast(crop_name: str, weeks: int = Query(default=8, ge=2, le=24)):
    return train_and_forecast(crop_name, weeks)


@router.get("/price/{crop_name}", response_model=PriceSuggestion)
async def get_price_suggestion(
    crop_name: str, weeks: int = Query(default=1, ge=1, le=8)
):
    return suggest_crop_price(crop_name, weeks)


@router.get("/hot-crops")
async def get_hot_crops(state: str = Query(default=None), limit: int = Query(default=8, le=20)):
    pipeline = [
        {"$group": {"_id": {"$toLower": "$cropname"}}},
        {"$project": {"name": "$_id"}},
        {"$limit": 30}
    ]
    crop_names = [doc["_id"] for doc in db.firmrequests.aggregate(pipeline)]

    results = []
    for name in crop_names:
        f = train_and_forecast(name, weeks_ahead=4)
        if f.trend != "insufficient_data":
            results.append({
                "crop_name": name.title(),
                "trend": f.trend,
                "trend_percent": f.trend_percent,
                "confidence": f.confidence,
                "next_week_demand": f.forecast[0]["predicted"] if f.forecast else 0,
            })

    results.sort(key=lambda x: x["trend_percent"], reverse=True)
    return results[:limit]

