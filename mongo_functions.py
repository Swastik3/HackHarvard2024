from pymongo import MongoClient
from sentiment import get_sentiment
from summary import get_summary
from takeaways import get_takeaways
from mood import get_mood
from datetime import datetime
import time
from bson import ObjectId

client = MongoClient("mongodb://localhost:27017/")
db = client["main_db"]

user_info = db["user_info"]
user_data = db["user_data"]
prescriptions = db["prescriptions"]

def get_timeline(user_id):
    query = {"user_id": user_id}
    timeline = user_data.find(query).sort("timestamp", -1)
    return list(timeline)

def get_prescriptions(user_id):
    query = {"user_id": user_id}
    user_prescriptions = prescriptions.find(query).sort("created_at", -1)
    return list(user_prescriptions)

def add_conversation(user_id, conversation, conversation_with, conversation_type):
    summary = get_summary(conversation)
    sentiment = get_sentiment(conversation)
    mood = get_mood(conversation, sentiment)
    takeaways = get_takeaways(conversation)
    conversation = conversation[1:]
    conversation = [{"sender": i["role"], "message": i["content"]} for i in conversation]
    conversation_data = {
        "user_id": user_id,
        "type": conversation_type,  # 'bot_conversation' or 'connection_conversation'
        "conversation_with": conversation_with,  # None for bot_conversation
        "content": conversation,
        "summary": summary,
        "sentiment": sentiment,
        "mood": mood,
        "takeaways": takeaways,
        "timestamp": int(time.time()) * 1000
    }
    print(conversation_data)
    user_data.insert_one(conversation_data)

def add_notes(user_id, notes):
    summary = get_summary(notes)
    sentiment = get_sentiment(notes)
    mood = get_mood(notes, sentiment)
    notes_data = {
        "user_id": user_id,
        "type": "notes",
        "content": notes,
        "summary": summary,
        "sentiment": sentiment,
        "mood": mood,
        "timestamp": int(time.time()) * 1000
    }
    print(notes_data)
    
    user_data.insert_one(notes_data)

def add_connection(user_id, connection_name, connection_user_id):
    connection_data = {
        "user_id": user_id,
        "type": "connection_added",
        "connection_name": connection_name,
        "connection_user_id": connection_user_id,
        "timestamp": int(time.time()) * 1000
    }
    
    user_data.insert_one(connection_data)

def add_prescription(prescription):
    prescriptions.insert_one(prescription)

def get_goals(user_id):
    query = {"user_id": user_id, "type": "goal"}
    goals = user_data.find(query)
    return list(goals)

def add_goal(user_id, goal):
    goal_data = {
        "user_id": user_id,
        "type": "goal",
        "text": goal["text"],
        "completed": goal.get("completed", False),
        "frequency": goal.get("frequency", "daily"),
        "created_at": goal.get("created_at", datetime.utcnow()),
        "last_updated": goal.get("last_updated", datetime.utcnow()),
        "expiry": goal.get("expiry"),
    }
    return user_data.insert_one(goal_data)

def update_goal(goal_id, updated_data):
    user_data.update_one({"_id": ObjectId(goal_id)}, {"$set": updated_data})
