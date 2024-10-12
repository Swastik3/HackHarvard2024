import google.generativeai as genai
from dotenv import load_dotenv
import os

load_dotenv()
genai.configure(api_key=os.environ["GEMINI_API_KEY"])
model = genai.GenerativeModel('gemini-1.5-flash')

def get_summary(data) -> str:
    prompt = """
    Generate a summary of the following text. The summary should be concise and capture the main points of the text. The summary is of the user's conversation with a bot and we want to highlight the summary back to the user. The text is as follows:
    {data}

    summarise:
"""
    response = model.generate_content(prompt.format(data=data))
    return response