import websocket
import json
import base64
import time
import uuid
import threading
from dotenv import load_dotenv
import os
import wave
import numpy as np
import io
import asyncio
import websockets

# Load environment variables from .env file
load_dotenv()

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

def check_audio_end(base64_audio_chunk, threshold):
    audio_data = base64.b64decode(base64_audio_chunk)
    
    # Convert audio data to numpy array
    audio_samples = np.frombuffer(audio_data, dtype=np.byte)

    # Calculate the average volume
    average_volume = np.mean(np.abs(audio_samples))
    print(average_volume)
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
            "instructions": "You are a helpful AI assistant. Follow the instructions to assist the user.",
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
        print(base64_audio[:10])
        input_buffer.append(base64_audio)

        if check_audio_end(base64_audio, threshold=33):  # Adjust threshold as needed
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
        print(len(input_buffer))

def start_websocket_server():
    start_server = websockets.serve(handle_client, "localhost", 8765)
    asyncio.get_event_loop().run_until_complete(start_server)
    asyncio.get_event_loop().run_forever()

if __name__ == "__main__":
    # Start the WebSocket server
    start_websocket_server()