from pymongo import MongoClient

MONGO_URI = "mongodb+srv://youtubepy:dEVANSHU_lOOPS16022005@cluster0.2fqxvse.mongodb.net/?appName=Cluster0"

client = MongoClient(MONGO_URI)

db = client["interviewiq"]
collection = db["evaluations"]
users_collection = db["users"]