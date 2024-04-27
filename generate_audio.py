import requests
import subprocess
import json

# Define the URL of the Flask server
flask_server_url = 'http://127.0.0.1:5000/generate_and_stream'

# Define the list of prompts
prompts = ["80s pop track with bassy drums and synth", "90s rock song with loud guitars and heavy drums"]

# Send a POST request to the Flask server with the list of prompts
response = requests.post(flask_server_url, json={'prompts': prompts}, stream=True)

# Check if the request was successful
if response.status_code == 200:
    # Create a subprocess to play the streaming audio
    player_process = subprocess.Popen(['ffplay', '-'], stdin=subprocess.PIPE)

    # Stream and play the audio data
    for chunk in response.iter_content(chunk_size=1024):
        player_process.stdin.write(chunk)
else:
    print("Failed to start audio streaming:", response.text)
