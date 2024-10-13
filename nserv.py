from flask import Flask, request, jsonify
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
app = Flask(__name__)
CORS(app)

ms = []

@app.route('/reset', methods=['POST'])
def reset_conversation():
    global ms
    ms = []
    return jsonify({"message": "Conversation reset successfully"}), 200

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