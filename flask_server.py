from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from pymongo import MongoClient
from datetime import datetime
from dotenv import load_dotenv
import pandas as pd
import random

load_dotenv()
app = Flask(__name__)
CORS(app)

if __name__ == '__main__':
    app.run(debug=True, port=8000)