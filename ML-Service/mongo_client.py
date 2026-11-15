from pymongo import MongoClient
import os
from dotenv import load_dotenv

# Load environment variables if needed
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/farm_firm")

client = MongoClient(MONGO_URI)
db = client["farm_firm"]

