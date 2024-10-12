import websocket
import json
import base64
import time
import uuid
import threading
from dotenv import load_dotenv
import os
import numpy as np
import asyncio
import websockets
import pyaudio  # Import pyaudio for real-time audio playback

from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime
from bson import ObjectId

from flask_socketio import SocketIO, emit

# Import custom modules (ensure these are available in your project)
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

# Load environment variables from .env file
load_dotenv()

# ==========================
# OpenAI WebSocket Client Setup
# ==========================

# Instruction for OpenAI model
instruction = "Respond like an psychiatrist."

# Replace with your actual WebSocket URL
WEBSOCKET_URL = "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01"
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Variables to store response and audio data
response_text = ""
audio_chunks = []
input_buffer = []
input_buffer_lock = threading.Lock()  # To ensure thread-safe operations

def generate_event_id():
    timestamp = int(time.time() * 1000)  # Current time in milliseconds
    random_string = str(uuid.uuid4())[:8]  # First 8 characters of a UUID
    return f"{timestamp}_{random_string}"

# Initialize pyaudio stream for audio playback
p = pyaudio.PyAudio()
stream = p.open(format=pyaudio.paInt16,
                channels=1,
                rate=24000,
                output=True)

def on_message(ws, message):
    global response_text, audio_chunks
    event = json.loads(message)
    
    if event["type"] == "response.output_item.added":
        # Handle text response 
        for content in event["item"]["content"]:
            if content["type"] == "text":
                response_text += content["text"]
    
    elif event["type"] == "response.audio.delta":
        # Handle audio delta
        audio_chunk = base64.b64decode(event["delta"])
        audio_chunks.append(audio_chunk)
        
        # Play the audio chunk as it arrives
        stream.write(audio_chunk)
    
    elif event["type"] == "response.audio.done":
        # Handle audio done
        print("Audio response complete")
    
    elif event["type"] == "response.done":
        # Handle response done
        print(f"Response complete: {response_text}")
        
    elif event["type"] == "input_audio_buffer.speech_started":
        print("Speech started")
    
    elif event["type"] == "input_audio_buffer.speech_stopped":
        print("Speech ended")

def on_error(ws, error):
    print(f"Error: {error}")

def on_close(ws, close_status_code, close_msg):
    print(f"WebSocket closed with status: {close_status_code}, message: {close_msg}")

def on_open(ws):
    print("WebSocket opened")
    
    # Step 1: Send session.update event to configure the session
    session_update_event = {
        "event_id": generate_event_id(),
        "type": "session.update",
        "session": {
            "modalities": ["text", "audio"],
            "instructions": instruction,
            "voice": "alloy",
            "input_audio_format": "pcm16",
            "output_audio_format": "pcm16", 
            "turn_detection": {
                "type": "server_vad",
            },
            "tools": [],
            "tool_choice": "auto",
            "temperature": 0.8,
        }
    }
    ws.send(json.dumps(session_update_event))

    # Step 3: Send input_audio_buffer.commit event to commit the audio data
    input_audio_buffer_commit_event = {
        "event_id": generate_event_id(),
        "type": "input_audio_buffer.commit"
    }
    ws.send(json.dumps(input_audio_buffer_commit_event))
    
    # Step 4: Send response.create event to trigger response generation
    response_create_event = {
        "event_id": generate_event_id(),
        "type": "response.create",
        "response": {
            "modalities": ["audio", "text"],
            "instructions": instruction,
            "voice": "alloy",
            "output_audio_format": "pcm16",
            "tools": [],
            "tool_choice": "auto",
            "temperature": 0.7,
            "max_output_tokens": 300
        }
    }
    ws.send(json.dumps(response_create_event))

def append_audio_buffer(ws):
    """
    This function will keep appending the base64 audio from input_buffer to the OpenAI WebSocket session.
    """
    while True:
        with input_buffer_lock:
            if input_buffer:
                base64_audio = input_buffer.pop(0)
                input_audio_buffer_append_event = {
                    "event_id": generate_event_id(),
                    "type": "input_audio_buffer.append",
                    "audio": base64_audio
                }
                ws.send(json.dumps(input_audio_buffer_append_event))
        time.sleep(0.1)  # Prevent excessive CPU usage, adjust this delay as needed

def start_openai_ws():
    """
    Start OpenAI WebSocket and handle real-time interactions.
    """
    ws = websocket.WebSocketApp(
        WEBSOCKET_URL,
        header={"Authorization": f"Bearer {OPENAI_API_KEY}",
                "OpenAI-Beta": "realtime=v1"},
        on_message=on_message,
        on_error=on_error,
        on_close=on_close
    )
    
    ws.on_open = on_open
    ws_thread = threading.Thread(target=ws.run_forever, daemon=True)
    ws_thread.start()
    
    # Append audio buffer in a separate thread
    audio_append_thread = threading.Thread(target=append_audio_buffer, args=(ws,), daemon=True)
    audio_append_thread.start()

    return ws

# ==========================
# Flask App and SocketIO Setup
# ==========================

app = Flask(__name__)
CORS(app, origins="*")
socketio = SocketIO(app, cors_allowed_origins="*")

# MongoDB Setup
client_mongo = MongoClient("mongodb://localhost:27017/")
db = client_mongo["main_db"]

user_info = db["user_info"]
user_data = db["user_data"]

# ==========================
# Flask REST API Endpoints
# ==========================

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
    try:
        user = user_info.find_one({"_id": ObjectId(user_id)})
    except:
        return jsonify({"message": "Invalid user ID"}), 400
    if user:
        user['_id'] = str(user['_id'])
        return jsonify(user), 200
    return jsonify({"message": "User not found"}), 404

@app.route('/api/user/username/<user_id>', methods=['GET'])
def get_username(user_id):
    try:
        user = user_info.find_one({"_id": ObjectId(user_id)})
    except:
        return jsonify({"message": "Invalid user ID"}), 400
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

# ==========================
# Flask-SocketIO Event Handlers
# ==========================

@socketio.on('audio-stream')
def handle_audio_stream(data):
    #print("Audio stream received")
    #print(f"Received audio stream: {type(data)}, {len(data)} bytes")
    # Assuming data is base64-encoded audio
    base64_audio = data.decode('utf-8') if isinstance(data, bytes) else data
    with input_buffer_lock:
        input_buffer.append(base64_audio)  # Add the audio to input buffer
    emit('audio-received', {'status': 'received'})

@socketio.on('audio-stream-end')
def handle_audio_stream_end():
    print("Audio stream ended")
    # Optionally, you can notify the OpenAI WebSocket client or perform other actions
    emit('audio-end', {'status': 'ended'})

@socketio.on('connect')
def handle_connect():
    print("Client connected")
    emit('connection-response', {'message': 'Connected to server'})

@socketio.on('disconnect')
def handle_disconnect():
    print("Client disconnected")

# ==========================
# Start OpenAI WebSocket Client in Background
# ==========================

def initialize_openai_connection():
    start_openai_ws()

# ==========================
# Main Entry Point
# ==========================

if __name__ == '__main__':
    # Start the OpenAI WebSocket client in a separate thread
    openai_thread = threading.Thread(target=initialize_openai_connection, daemon=True)
    openai_thread.start()
    
    # Run the Flask app with SocketIO
    # Choose a port different from any WebSocket ports to avoid conflicts
    socketio.run(app, port=5000, debug=True, host="0.0.0.0")
