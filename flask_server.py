from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from pymongo import MongoClient
from datetime import datetime
from dotenv import load_dotenv
import pandas as pd
from bson import ObjectId
import random
import time
from sentiment import get_sentiment
from summary import get_summary
from mongo_functions import get_timeline, get_summaries, add_conversation, add_notes, add_connection

import websocket
import base64
import uuid
import threading
import numpy as np
import io
import asyncio
import websockets
from flask_socketio import SocketIO, emit
import eventlet
import wave

# Load environment variables from .env file
load_dotenv()

# Replace with your actual WebSocket URL
WEBSOCKET_URL = "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01"
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Variables to store response and audio data
response_text = ""
audio_chunks = []
input_buffer = []

audio_chunks_2 = []

client = MongoClient("mongodb://localhost:27017/")
db = client["main_db"]

user_info = db["user_info"]
user_data = db["user_data"]

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

def generate_event_id():
    timestamp = int(time.time() * 1000)  # Current time in milliseconds
    random_string = str(uuid.uuid4())[:8]  # First 8 characters of a UUID
    return f"{timestamp}_{random_string}"

def check_audio_end(base64_audio_chunk, threshold):
    audio_data = base64.b64decode(base64_audio_chunk)
    
    # Convert audio data to numpy array
    audio_samples = np.frombuffer(audio_data, dtype=np.byte)

    # Calculate the average volume
    average_volume = np.mean(np.abs(audio_samples))
    return average_volume < threshold

def on_message(ws, message):
    global response_text, audio_chunks
    print(f"Received message: {message}", end="\n\n")
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
    
    elif event["type"] == "response.audio.done":
        # Handle audio done
        print("Audio response complete")
        # Optionally save or play the audio chunks
        save_audio_to_file(audio_chunks)
    
    elif event["type"] == "response.done":
        # Handle response done
        print(f"Response complete: {response_text}")
        ws.close()

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
            "instructions": "Describe what you hear in the audio.",
            "voice": "alloy",
            "input_audio_format": "pcm16",
            "output_audio_format": "pcm16", 
            "turn_detection": None,
            "tools": [],
            "tool_choice": "auto",
            "temperature": 0.8,
        }
    }
    ws.send(json.dumps(session_update_event))
    
    # Step 2: Send input_audio_buffer.append event to append audio data
    for base64_audio in input_buffer:
        input_audio_buffer_append_event = {
            "event_id": generate_event_id(),
            "type": "input_audio_buffer.append",
            "audio": base64_audio
        }
        ws.send(json.dumps(input_audio_buffer_append_event))
    
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
            "instructions": "Assist the user",
            "voice": "alloy",
            "output_audio_format": "pcm16",
            "tools": [],
            "tool_choice": "auto",
            "temperature": 0.7,
            "max_output_tokens": 300
        }
    }
    ws.send(json.dumps(response_create_event))

def save_audio_to_file(audio_chunks):
    with open("output_audio.wav", "wb") as wavefile:
        wave_writer = wave.open(wavefile, 'wb')
        wave_writer.setnchannels(1)  # Mono channel
        wave_writer.setsampwidth(2)  # Little endian (2 bytes per sample)
        wave_writer.setframerate(24000)  # 24k sample rate
        wave_writer.writeframes(b''.join(audio_chunks))
        wave_writer.close()

async def handle_client(web_socket, path):
    global input_buffer, audio_chunks
    async for message in web_socket:
        base64_audio = message
        input_buffer.append(base64_audio)

        if check_audio_end(base64_audio, threshold=15):  # Adjust threshold as needed
            # Create WebSocket connection to OpenAI
            if len(input_buffer) > 1:
                ws = websocket.WebSocketApp(
                    WEBSOCKET_URL,
                    header={"Authorization": f"Bearer {OPENAI_API_KEY}",
                            "OpenAI-Beta": "realtime=v1"},
                    on_message=on_message,
                    on_error=on_error,
                    on_close=on_close
                )
                
                # Set on_open handler
                ws.on_open = on_open
                
                # Run the WebSocket application in a separate thread
                def run_ws():
                    ws.run_forever()
                
                thread = threading.Thread(target=run_ws)
                thread.start()
                
                # Wait for the OpenAI WebSocket to finish
                thread.join()
                
                # Send the audio chunks back to the frontend
                for chunk in audio_chunks:
                    await web_socket.send(base64.b64encode(chunk).decode('utf-8'))
                
            # Clear the input buffer for the next session
            input_buffer = []
            audio_chunks = []

@socketio.on('audio-stream')
def handle_audio_stream(data):
    print("Audio stream received")  # Add this to check if the handler is called
    print(f"Received audio stream: {type(data)}, {len(data)} bytes")
    # Handle binary audio data here
    # save it to a file
    
    audio_chunks_2.append(data)

    print(f'Received audio stream: {len(data)} bytes')

@socketio.on('audio-stream-end')
def handle_audio_stream_end():
    print("Audio stream ended")
    if not audio_chunks_2:
        print("No audio chunks received")
        return

    # Concatenate all chunks into a single byte stream
    audio_data = b''.join(audio_chunks_2)

    # Convert the audio data to the desired format (e.g., WAV)
    # Here, we assume the chunks are already in a format that can be concatenated directly
    # If not, you may need to decode and re-encode the chunks

    # Save the concatenated audio data to a file
    filename = 'audio.wav'
    with wave.open(filename, 'wb') as wf:
        wf.setnchannels(1)  # Mono
        wf.setsampwidth(2)  # 16-bit
        wf.setframerate(44100)  # 44.1 kHz
        wf.writeframes(audio_data)

    print(f'Audio saved to {filename}')

    # Clear the list for the next recording
    audio_chunks_2.clear()

@socketio.on('connect')
def test_connect():
    print("Client connected")

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

@app.route('/api/conversation', methods=['POST'])
def add_conversation_api():
    data = request.json
    add_conversation(data["user_id"], data["conversation"], data["conversation_with"], data["conversation_type"])
    return jsonify({"message": "Conversation added successfully"}), 201

@app.route('/api/notes', methods=['POST'])
def add_notes_api():
    data = request.json
    add_notes(data["user_id"], data["notes"])
    return jsonify({"message": "Notes added successfully"}), 201

@app.route('/api/connection', methods=['POST'])
def add_connection_api():
    data = request.json
    add_connection(data["user_id"], data["connection_name"], data["connection_user_id"])
    return jsonify({"message": "Connection added successfully"}), 201

@app.route('/api/emergency', methods=['POST'])
def add_emergency():
    data = request.json
    emergency_data = {
        "user_id": data["user_id"],
        "type": "emergency",
        "hotline_called": data["hotline_called"],
        "timestamp": time.time()
    }
    user_data.insert_one(emergency_data)
    return jsonify({"message": "Emergency call recorded successfully"}), 201

@app.route('/api/timeline/<user_id>', methods=['GET'])
def get_timeline_api(user_id):
    timeline = get_timeline(user_id)
    for item in timeline:
        item['_id'] = str(item['_id'])
    
    return jsonify(timeline), 200

if __name__ == '__main__':
    socketio.run(app, port=8765, debug=True, host="0.0.0.0")

