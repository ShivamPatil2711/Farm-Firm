"""Seed synthetic accepted quotation history for price-suggestion testing."""

import argparse
import os
from datetime import datetime, timedelta, timezone

from bson import ObjectId
from dotenv import load_dotenv
from pymongo import MongoClient


SEED_MARKER = "price-suggestion-demo"
DEFAULT_WEEKS = 8


def seed_price_data(crop_name: str, base_price: float, weeks: int) -> None:
    load_dotenv()
    client = MongoClient(os.getenv("MONGO_URI", "mongodb://localhost:27017/farm_firm"))
    db = client["farm_firm"]

    db.firmrequests.delete_many({"_priceSuggestionSeed": SEED_MARKER, "cropname": crop_name})
    db.quotations.delete_many({"_priceSuggestionSeed": SEED_MARKER, "cropname": crop_name})

    firm_id = ObjectId()
    farmer_id = ObjectId()
    now = datetime.now(timezone.utc)
    firm_requests = []
    quotations = []

    for week in range(weeks):
        created_at = now - timedelta(days=(weeks - week) * 7)
        request_id = ObjectId()
        price = round(base_price + (week - (weeks - 1) / 2) * base_price * 0.02, 2)

        firm_requests.append(
            {
                "_id": request_id,
                "cropname": crop_name,
                "deadline": created_at + timedelta(days=14),
                "requirement": 100,
                "status": "Accepted",
                "firmId": firm_id,
                "farmerId": farmer_id,
                "rate": price,
                "createdAt": created_at,
                "updatedAt": created_at,
                "_priceSuggestionSeed": SEED_MARKER,
            }
        )
        quotations.append(
            {
                "rate": price,
                "farmerId": farmer_id,
                "firmRequestId": request_id,
                "status": "Accepted",
                "createdAt": created_at,
                "updatedAt": created_at,
                "cropname": crop_name,
                "_priceSuggestionSeed": SEED_MARKER,
            }
        )

    db.firmrequests.insert_many(firm_requests)
    db.quotations.insert_many(quotations)
    client.close()

    print(
        f"Seeded {weeks} accepted weekly quotations for {crop_name!r}. "
        f"Suggested-price endpoint: /api/ml/demand/price/{crop_name}"
    )


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Seed synthetic quotation history for price suggestions."
    )
    parser.add_argument("--crop", default="Wheat", help="Crop name to seed.")
    parser.add_argument(
        "--base-price",
        type=float,
        default=2500,
        help="Approximate middle price per unit.",
    )
    parser.add_argument(
        "--weeks",
        type=int,
        default=DEFAULT_WEEKS,
        help="Number of weekly observations to create (minimum 4).",
    )
    args = parser.parse_args()

    if args.weeks < 4:
        parser.error("--weeks must be at least 4")
    if args.base_price <= 0:
        parser.error("--base-price must be positive")

    seed_price_data(args.crop.strip(), args.base_price, args.weeks)


if __name__ == "__main__":
    main()
