from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from pymongo import MongoClient
from datetime import datetime
from dotenv import load_dotenv
from bson import ObjectId, json_util
import time

from sentiment import get_sentiment
from summary import get_summary
from takeaways import get_takeaways
from mongo_functions import (
    get_timeline,
    add_conversation,
    add_notes,
    add_connection,
    add_prescription,
    get_prescriptions,
    get_goals,
    add_goal,
    update_goal,
)

from flask_socketio import SocketIO
from datetime import datetime
import time

load_dotenv()

client = MongoClient("mongodb://localhost:27017/")
db = client["main_db"]

user_info = db["user_info"]
user_data = db["user_data"]

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

def recursive_objectid_destroyer(doc):
    '''
    recursively convert all ObjectIds to strings and doesnt touch the rest
    '''
    if isinstance(doc, list):
        return [recursive_objectid_destroyer(item) for item in doc]
    if not isinstance(doc, dict):
        return
    for key, value in doc.items():
        if isinstance(value, dict):
            recursive_objectid_destroyer(value)
        if isinstance(value, list):
            for item in value:
                recursive_objectid_destroyer(item)
        if isinstance(value, ObjectId):
            doc[key] = str(value)
    return doc


@app.route('/api/create_user', methods=['POST'])
def create_user():
    data = request.json
    user = {
        "username": data["username"],
        "email": data["email"],
        "created_at": datetime.utcnow()
    }
    result = user_info.insert_one(user)
    return jsonify({"message": "User created successfully", "user_id": str(result.inserted_id)}), 201

@app.route('/api/user/<user_id>', methods=['GET'])
def get_user(user_id):
    user_id = int(user_id)
    user = user_info.find_one({"_id": ObjectId(user_id)})
    if user:
        print("USER KEYS")
        print(user)
        user["user_id"] = json.loads(json_util.dumps(user["_id"]))
        return jsonify(user), 200
    return jsonify({"message": "User not found"}), 404

@app.route('/api/user/username/<user_id>', methods=['GET'])
def get_username(user_id):
    user_id = int(user_id)
    user = user_info.find_one({"_id": ObjectId(user_id)})
    if user:
        return jsonify({"username": user["username"]}), 200
    return jsonify({"message": "User not found"}), 404

@app.route('/api/user/userid/<username>', methods=['GET'])
def get_userid(username):
    user = user_info.find_one({"username": username})
    if user:
        return jsonify({"user_id": str(user["user_id"])}), 200
    return jsonify({"message": "User not found"}), 404

@app.route('/api/emergency', methods=['POST'])
def add_emergency():
    data = request.json
    data["user_id"] = int(data["user_id"])
    emergency_data = {
        "user_id": data["user_id"],
        "type": "emergency_call",
        "hotline_called": data["hotline_called"],
        "timestamp": time.time()
    }
    user_data.insert_one(emergency_data)
    return jsonify({"message": "Emergency call recorded successfully"}), 201

@app.route('/api/connection', methods=['POST'])
def add_connection_api():
    data = request.json
    data["user_id"] = int(data["user_id"])
    add_connection(data["user_id"], data["connection_name"], data["connection_user_id"])
    return jsonify({"message": "Connection added successfully"}), 201

@app.route('/api/conversation', methods=['POST'])
def add_conversation_api():
    data = request.json
    data["user_id"] = int(data["user_id"])
    user_id = data["user_id"]
    conversation = data["conversation"]
    conversation_with = data.get("conversation_with")  # Can be None for bot conversations
    conversation_type = data["conversation_type"]  # 'bot_conversation' or 'connection_conversation'
    
    add_conversation(user_id, conversation, conversation_with, conversation_type)
    return jsonify({"message": "Conversation added successfully"}), 201

@app.route('/api/notes', methods=['POST'])
def add_notes_api():
    data = request.json
    data["user_id"] = int(data["user_id"])
    add_notes(data["user_id"], data["content"])
    return jsonify({"message": "Notes added successfully"}), 201

@app.route('/test', methods=['GET'])
def test():
    return jsonify({"message": "Hello, World!"}), 200

@app.route('/api/timeline/<user_id>', methods=['GET'])
def get_timeline_api(user_id):
    user_id = int(user_id)
    timeline = get_timeline(user_id)
    print("TIMELINE KEYS")
    recursive_objectid_destroyer(timeline)
    for item in timeline:
        print("ITEM KEYS")
        print(item)
        item['_id'] = str(item['_id'])

    return jsonify(timeline), 200

# Prescriptions Endpoints

@app.route('/api/prescription', methods=['POST'])
def add_prescription_api():
    data = request.json
    data["user_id"] = int(data["user_id"])
    prescription = {
        "user_id": data["user_id"],
        "tasks": data["tasks"],  # List of tasks with details
        "created_at": time.time(),
        "expiry": data.get("expiry"),  # Optional expiry date,
        "last_updated": time.time()
    }
    add_prescription(prescription)
    return jsonify({"message": "Prescription added successfully"}), 201

@app.route('/api/prescription/<user_id>', methods=['GET'])
def get_prescription_api(user_id):
    user_id = int(user_id)
    prescriptions = get_prescriptions(user_id)
    print("PRESCRIPTION KEYS")
    print(prescriptions)
    for pres in prescriptions:
        pres['_id'] = json.loads(json_util.dumps(pres['_id']))
    return jsonify(prescriptions), 200

@app.route('/api/prescription/update', methods=['POST'])
def update_prescription():
    data = request.json
    prescription_id = data["prescription_id"]
    tasks = data["tasks"]
    expiry = data.get("expiry")
    prescription = {
        "tasks": tasks,
        "expiry": expiry,
        "last_updated": time.time()
    }
    user_data.update_one({"_id": ObjectId(prescription_id)}, {"$set": prescription})
    return jsonify({"message": "Prescription updated successfully"}), 200

@app.route('/api/goals/<user_id>', methods=['GET'])
def get_goals_api(user_id):
    user_id = int(user_id)
    goals = get_goals(user_id)
    print("GOAL KEYS")
    print(goals)
    recursive_objectid_destroyer(goals)
    for goal in goals:
        goal['_id'] = json.loads(json_util.dumps(goal['_id']))
    return jsonify(goals), 200

@app.route('/api/goals/<user_id>', methods=['POST'])
def add_goal_api(user_id):
    data = request.json
    user_id = int(user_id)
    goal_id = add_goal(user_id, data)
    print("GOAL ID KEYS")
    print(goal_id)
    new_goal = user_data.find_one({"_id": goal_id.inserted_id})
    new_goal['_id'] = json.loads(json_util.dumps(new_goal['_id']))
    return jsonify(new_goal), 201

@app.route('/api/goals/update/<goal_id>', methods=['PATCH'])
def update_goal_api(goal_id):
    data = request.json
    update_goal(goal_id, data)
    updated_goal = user_data.find_one({"_id": ObjectId(goal_id)})
    print(updated_goal)
    updated_goal['_id'] = json.loads(json_util.dumps(updated_goal['_id']))
    return jsonify(updated_goal), 200

if __name__ == '__main__':
    app.run(debug=True, port=8000, host='0.0.0.0')
