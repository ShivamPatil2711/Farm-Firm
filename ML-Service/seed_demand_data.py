"""Seed synthetic weekly request history for demand-insight testing."""

import argparse
import os
from datetime import datetime, timedelta, timezone

from bson import ObjectId
from dotenv import load_dotenv
from pymongo import MongoClient


SEED_MARKER = "demand-insights-demo"
DEFAULT_WEEKS = 52
DEFAULT_CROPS = {
    "Wheat": 100,
    "Rice": 80,
    "Tomato": 60,
}


def seed_demand_data(crops: dict[str, float], weeks: int) -> None:
    load_dotenv()
    client = MongoClient(os.getenv("MONGO_URI", "mongodb://localhost:27017/farm_firm"))
    db = client["farm_firm"]

    crop_names = list(crops)
    db.firmrequests.delete_many(
        {"_demandInsightSeed": SEED_MARKER, "cropname": {"$in": crop_names}}
    )
    db.quotations.delete_many(
        {"_demandInsightSeed": SEED_MARKER, "cropname": {"$in": crop_names}}
    )

    now = datetime.now(timezone.utc)
    firm_requests = []
    quotations = []

    for crop_name, base_quantity in crops.items():
        firm_id = ObjectId()
        farmer_id = ObjectId()

        for week in range(weeks):
            created_at = now - timedelta(days=(weeks - week) * 7)
            request_id = ObjectId()
            quantity = round(base_quantity * (1 + (week * 0.04)), 1)

            firm_requests.append(
                {
                    "_id": request_id,
                    "cropname": crop_name,
                    "deadline": created_at + timedelta(days=14),
                    "requirement": quantity,
                    "status": "Accepted",
                    "firmId": firm_id,
                    "farmerId": farmer_id,
                    "createdAt": created_at,
                    "updatedAt": created_at,
                    "_demandInsightSeed": SEED_MARKER,
                }
            )
            quotations.append(
                {
                    "rate": 1,
                    "farmerId": farmer_id,
                    "firmRequestId": request_id,
                    "status": "Accepted",
                    "createdAt": created_at,
                    "updatedAt": created_at,
                    "cropname": crop_name,
                    "_demandInsightSeed": SEED_MARKER,
                }
            )

    db.firmrequests.insert_many(firm_requests)
    db.quotations.insert_many(quotations)
    client.close()

    print(
        f"Seeded {len(firm_requests)} weekly requests and "
        f"{len(quotations)} accepted quotations for {', '.join(crop_names)}."
    )


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Seed synthetic weekly request history for demand insights."
    )
    parser.add_argument(
        "--weeks",
        type=int,
        default=DEFAULT_WEEKS,
        help="Number of weekly observations per crop (minimum 4).",
    )
    args = parser.parse_args()

    if args.weeks < 4:
        parser.error("--weeks must be at least 4")

    seed_demand_data(DEFAULT_CROPS, args.weeks)


if __name__ == "__main__":
    main()
