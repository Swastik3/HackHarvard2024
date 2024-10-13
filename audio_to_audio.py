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

# Load environment variables from .env file
load_dotenv()

instruction = "Respond like an cute anime Girl."

# Replace with your actual WebSocket URL
WEBSOCKET_URL = "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01"
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Variables to store response and audio data
response_text = ""
audio_chunks = []
input_buffer = []

def generate_event_id():
    timestamp = int(time.time() * 1000)  # Current time in milliseconds
    random_string = str(uuid.uuid4())[:8]  # First 8 characters of a UUID
    return f"{timestamp}_{random_string}"

# Initialize pyaudio stream
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
            "turn_detection": None,
            "tools": [],
            "tool_choice": "auto",
            "temperature": 0.8,
            "turn_detection": {
                "type": "server_vad",
            }
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
            "instructions":instruction,
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
        if input_buffer:
            base64_audio = input_buffer.pop(0)
            input_audio_buffer_append_event = {
                "event_id": generate_event_id(),
                "type": "input_audio_buffer.append",
                "audio": base64_audio
            }
            ws.send(json.dumps(input_audio_buffer_append_event))
        time.sleep(0.1)  # Prevent excessive CPU usage, adjust this delay as needed

async def handle_client(web_socket, path, ws):
    global input_buffer, audio_chunks
    async for base64_audio in web_socket:
        #print(base64_audio[:10])  # Log the first 10 characters of the base64 audio
        input_buffer.append(base64_audio)  # Add the audio to input buffer

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
    ws_thread = threading.Thread(target=ws.run_forever)
    ws_thread.start()
    
    # Append audio buffer in a separate thread
    audio_append_thread = threading.Thread(target=append_audio_buffer, args=(ws,))
    audio_append_thread.start()

    return ws

def start_websocket_server(ws):
    start_server = websockets.serve(lambda web_socket, path: handle_client(web_socket, path, ws), "localhost", 8765)
    asyncio.get_event_loop().run_until_complete(start_server)
    asyncio.get_event_loop().run_forever()

if __name__ == "__main__":
    # Start the WebSocket connection to OpenAI
    ws = start_openai_ws()
    
    # Start the WebSocket server for handling clients
    start_websocket_server(ws)
