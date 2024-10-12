from pymongo import MongoClient
from sentiment import get_sentiment
from summary import get_summary
from datetime import datetime
import time

client = MongoClient("mongodb://localhost:27017/")
db = client["main_db"]

user_info = db["user_info"]
user_data = db["user_data"]

def get_timeline(user_id):
    query = {"user_id": user_id}
    
    timeline = user_data.find(query)
    return list(timeline)

def get_summaries(user_id):
    timeline = get_timeline(user_id)
    summaries = [
        {
            "type": item["type"],
            "summary": item["summary"],
            "sentiment": item["sentiment"],
            "timestamp": item["timestamp"]
        }
        for item in timeline
    ]
    return summaries

def add_conversation(user_id, conversation, conversation_with, conversation_type):
    summary = get_summary(conversation)
    sentiment = get_sentiment(conversation)
    
    conversation_data = {
        "user_id": user_id,
        "type": conversation_type,
        "conversation_with": conversation_with,
        "content": conversation,
        "summary": summary,
        "sentiment": sentiment,
        "timestamp": time.time()
    }
    
    user_data.insert_one(conversation_data)

def add_notes(user_id, notes):
    summary = get_summary(notes)
    sentiment = get_sentiment(notes)
    
    notes_data = {
        "user_id": user_id,
        "type": "notes",
        "content": notes,
        "summary": summary,
        "sentiment": sentiment,
        "timestamp": time.time()
    }
    
    user_data.insert_one(notes_data)

def add_connection(user_id, connection_name, connection_user_id):
    connection_data = {
        "user_id": user_id,
        "type": "connection",
        "connection_name": connection_name,
        "connection_user_id": connection_user_id,
        "timestamp": time.time()
    }
    
    user_data.insert_one(connection_data)