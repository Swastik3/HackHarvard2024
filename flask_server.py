from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from pymongo import MongoClient
from datetime import datetime
from dotenv import load_dotenv
from bson import ObjectId
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
    get_prescriptions
)

from flask_socketio import SocketIO

load_dotenv()

client = MongoClient("mongodb://localhost:27017/")
db = client["main_db"]

user_info = db["user_info"]
user_data = db["user_data"]

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

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
    user = user_info.find_one({"_id": ObjectId(user_id)})
    if user:
        user['_id'] = str(user['_id'])
        return jsonify(user), 200
    return jsonify({"message": "User not found"}), 404

@app.route('/api/user/username/<user_id>', methods=['GET'])
def get_username(user_id):
    user = user_info.find_one({"_id": ObjectId(user_id)})
    if user:
        return jsonify({"username": user["username"]}), 200
    return jsonify({"message": "User not found"}), 404

@app.route('/api/user/userid/<username>', methods=['GET'])
def get_userid(username):
    user = user_info.find_one({"username": username})
    if user:
        return jsonify({"user_id": str(user["_id"])}), 200
    return jsonify({"message": "User not found"}), 404

@app.route('/api/emergency', methods=['POST'])
def add_emergency():
    data = request.json
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
    add_connection(data["user_id"], data["connection_name"], data["connection_user_id"])
    return jsonify({"message": "Connection added successfully"}), 201

@app.route('/api/conversation', methods=['POST'])
def add_conversation_api():
    data = request.json
    user_id = data["user_id"]
    conversation = data["conversation"]
    conversation_with = data.get("conversation_with")  # Can be None for bot conversations
    conversation_type = data["conversation_type"]  # 'bot_conversation' or 'connection_conversation'
    
    add_conversation(user_id, conversation, conversation_with, conversation_type)
    return jsonify({"message": "Conversation added successfully"}), 201

@app.route('/api/notes', methods=['POST'])
def add_notes_api():
    data = request.json
    add_notes(data["user_id"], data["notes"])
    return jsonify({"message": "Notes added successfully"}), 201

@app.route('/api/timeline/<user_id>', methods=['GET'])
def get_timeline_api(user_id):
    timeline = get_timeline(user_id)
    for item in timeline:
        item['_id'] = str(item['_id'])
    return jsonify(timeline), 200

# Prescriptions Endpoints

@app.route('/api/prescription', methods=['POST'])
def add_prescription_api():
    data = request.json
    prescription = {
        "user_id": data["user_id"],
        "tasks": data["tasks"],  # List of tasks with details
        "created_at": datetime.utcnow(),
        "expiry": data.get("expiry")  # Optional expiry date
    }
    add_prescription(prescription)
    return jsonify({"message": "Prescription added successfully"}), 201

@app.route('/api/prescription/<user_id>', methods=['GET'])
def get_prescription_api(user_id):
    prescriptions = get_prescriptions(user_id)
    for pres in prescriptions:
        pres['_id'] = str(pres['_id'])
    return jsonify(prescriptions), 200

@socketio.on('audio-stream')
def handle_audio_stream(data):
    print("Audio stream received")
    print(f"Received audio stream: {type(data)}, {len(data)} bytes")
    # Handle binary audio data here
    # save it to a file or process as needed

@socketio.on('audio-stream-end')
def handle_audio_stream_end():
    print("Audio stream ended")
    # Process the audio stream end event

@socketio.on('connect')
def test_connect():
    print("Client connected")

if __name__ == '__main__':
    socketio.run(app, port=8765, debug=True, host="0.0.0.0")
