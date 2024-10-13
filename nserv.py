from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import json
import os
from pymongo import MongoClient
from datetime import datetime
from dotenv import load_dotenv
import pandas as pd
import random
from recc import answer
load_dotenv()
from magic import nike, get_messages, reset
app = Flask(__name__)
CORS(app)

ms = []

@app.route('/reset', methods=['POST'])
def reset_conversation():
    global ms
    ms = []
    return jsonify({"message": "Conversation reset successfully"}), 200

def cleanup_old_files():
    files_to_delete = ['input.mp3', 'speech.mp3']
    for file in files_to_delete:
        if os.path.exists(file):
            try:
                os.remove(file)
                app.logger.info(f"Deleted old file: {file}")
            except Exception as e:
                app.logger.error(f"Failed to delete {file}: {str(e)}")

# Call cleanup function when the app starts

@app.route('/update', methods=['POST'])
def update():
    data = request.get_json()
    messages = get_messages
    reset()
    
    return {"message": "success"}

@app.route('/process_audio', methods=['POST'])
def process_audio():
    cleanup_old_files()
    if 'audio' not in request.files:
        app.logger.error("No audio file in request")
        return {"error": "No audio file provided"}, 400

    audio_file = request.files['audio']
    
    if audio_file.filename == '':
        app.logger.error("No selected file")
        return {"error": "No selected file"}, 400

    input_path = 'input.mp3'
    output_path = 'speech.mp3'
    
    try:
        # Save the uploaded file
        audio_file.save(input_path)
        app.logger.info(f"Audio file saved to {input_path}")
        
        # Check if the file was actually saved and has content
        if not os.path.exists(input_path) or os.path.getsize(input_path) == 0:
            app.logger.error(f"Failed to save audio file or file is empty: {input_path}")
            return {"error": "Failed to save audio file or file is empty"}, 500

        # Log file details
        app.logger.info(f"Input file size: {os.path.getsize(input_path)} bytes")
        
        # Call nike function (make sure this function is defined)
        nike()
        app.logger.info("nike() function called")
        
        if not os.path.exists(output_path):
            app.logger.error(f"Failed to generate {output_path}")
            return {"error": f"Failed to generate {output_path}"}, 500
        
        app.logger.info(f"Output file size: {os.path.getsize(output_path)} bytes")
        
        return send_file(output_path, mimetype="audio/mpeg", as_attachment=True, download_name="speech.mp3")
    
    except Exception as e:
        app.logger.error(f"An error occurred: {str(e)}", exc_info=True)
        return {"error": f"An error occurred: {str(e)}"}, 500
    
@app.route('/recommend', methods=['POST'])
def recommend():
    global ms
    data = request.get_json()
    query = data['query']
    ms.append({
        'role': 'user',
        'content': query
    })
    output = answer(query)
    response = output.response
    ppl = {}
    people = output.people
    for i in people:
        name = i.name
        age = i.age
        issue = i.issue
        story = i.story
        ppl[name] = {"age": age, "issue": issue, "story": story}
    ms.append({
        'role': 'assistant',
        'content': {"response": response, "people": ppl}
    })
    print("------------------------")
    print(ms)
    return {"messages": ms}

if __name__ == '__main__':
    app.run(debug=True, port=8000)