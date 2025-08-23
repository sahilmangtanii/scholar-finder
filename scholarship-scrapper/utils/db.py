from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()
mongo_uri = os.getenv("MONGODB_URI")
if not mongo_uri:
    raise ValueError("MONGODB_URI not set in environment variables.")

client = MongoClient(mongo_uri)
db = client["ScholarshipFinder"]
collection = db["Scholarships"]

def insert_scholarship(data):
    if "title" not in data:
        raise ValueError("Data must contain a 'title' field.")
    collection.update_one(
        {"title": data["title"]},  # avoid duplicates based on title
        {"$set": data},
        upsert=True
    )

def get_all_scholarships():
    return list(collection.find())