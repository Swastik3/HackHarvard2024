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
from mongo_functions import get_timeline, get_summaries, add_conversation, add_notes, add_connection
from pydantic import BaseModel
import base64
import openai
import whisper
# from google.cloud import speech

class EmergencyResponse(BaseModel):
    message: str
    name: str
    phone: int
    

client = MongoClient("mongodb://localhost:27017/")
db = client["main_db"]
whisper_model = whisper.load_model("tiny")

user_info = db["user_info"]
user_data = db["user_data"]

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")
CORS(app, origins="*", allow_headers=[  "Content-Type", "Authorization", "Access-Control-Allow-Credentials"],)

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

# Load phone numbers from JSON
with open('scraped_data.json', 'r') as f:
    phone_numbers = json.load(f)

@app.route('/process_audio', methods=['POST'])
def process_audio():
    print("Endpoint process audio started")
    # Get the encrypted audio data from the request
    encrypted_audio = request.json.get('audio')
    
    # Decrypt the audio (assuming it's base64 encoded)
    audio_data = base64.b64decode(encrypted_audio)
    # Assuming the audio data is in a file, save the audio data to a temporary file
    with open("temp_audio.wav", "wb") as f:
        f.write(audio_data)

    # Transcribe the audio using Whisper
    result = whisper_model.transcribe("temp_audio.wav")

    # Extract the transcribed text
    transcription = result["text"]
    print("Transcription: ", transcription)
    # Send the transcription to OpenAI for processing
    openai.api_key = os.getenv("OPENAI_API_KEY")

    # sample_text = "I'm feeling really down and and I just cut myself out of hate. I need help."
    system_prompt = f"You are an AI assistant. Process the following text and return a brief consoling message and a relevant phone number with the name of the hotline from this list: {json.dumps(phone_numbers)}"
    
    openAIclient = openai.OpenAI()
    completion = openAIclient.beta.chat.completions.parse(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": transcription}
        ],
        response_format = EmergencyResponse
    )
    
    # Extract the response from OpenAI
    ai_response = completion.choices[0].message.parsed
    print("Message :", ai_response.message)
    print("Phone number: ", ai_response.phone)
    print("Name: ", ai_response.name)
    
    return jsonify(ai_response), 200

@app.route('/process_text', methods=['POST'])
def process_text():
    print("Endpoint process text started")
    # Get the encrypted audio data from the request
    input_text= request.json.get('text')

    # # Extract the transcribed text
    print("Transcription: ", input_text)
    # # Send the transcription to OpenAI for processing
    # openai.api_key = os.getenv("OPENAI_API_KEY")

    # # sample_text = "I'm feeling really down and and I just cut myself out of hate. I need help."
    # system_prompt = f"You are an AI assistant. Process the following text and return a brief consoling message and a relevant phone number with the name of the hotline from this list: {json.dumps(phone_numbers)}"
    
    # openAIclient = openai.OpenAI()
    # completion = openAIclient.beta.chat.completions.parse(
    #     model="gpt-4o-mini",
    #     messages=[
    #         {"role": "system", "content": system_prompt},
    #         {"role": "user", "content": input_text}
    #     ],
    #     response_format = EmergencyResponse
    # )
    
    # # Extract the response from OpenAI
    # ai_response = completion.choices[0].message.parsed
    # print("Message :", ai_response.message)
    # print("Phone number: ", ai_response.phone)
    # print("Name: ", ai_response.name)
    print("done")
    return jsonify("ai_response"), 200

if __name__ == '__main__':


    app.run(debug=True, port=8000, host="0.0.0.0")
