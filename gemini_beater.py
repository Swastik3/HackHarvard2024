import google.generativeai as genai
from dotenv import load_dotenv
import os

load_dotenv()
genai.configure(api_key=os.environ["GEMINI_API_KEY"])
flash = genai.GenerativeModel('gemini-1.5-flash')

def flash_inference(prompt):
    response = flash.generate_content(prompt)
    return response.text