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

@app.route('/recommend', methods=['POST'])
def recommend():
    data = request.get_json()
    query=data['query']
    messages, output = answer(query)
    response=output.response
    ppl={}
    people=output.people
    for i in people:
        name=i.name
        age=i.age
        issue=i.issue
        story=i.story
        ppl[name]={"age":age,"issue":issue,"story":story}
    data={"response":response,"people":ppl}
    return data

if __name__ == '__main__':
    app.run(debug=True, port=8000)