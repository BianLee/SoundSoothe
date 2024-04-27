from flask import Flask, request, Response
import time
import scipy
from transformers import AutoProcessor, MusicgenForConditionalGeneration
import io

app = Flask(__name__)

@app.route('/', methods = ['GET'])
def base():
    return("This is the base response.")

@app.route('/generate_and_stream', methods=['POST'])
def generate_and_stream():
    # Receive list of prompts from request
    prompts = request.json.get('prompts')

    # Initialize processor and model
    processor = AutoProcessor.from_pretrained("facebook/musicgen-small")
    model = MusicgenForConditionalGeneration.from_pretrained("facebook/musicgen-small")

    # Generate audio segments for each prompt
    audio_segments = []
    for prompt in prompts:
        inputs = processor(text=[prompt], padding=True, return_tensors="pt")
        audio_values = model.generate(**inputs, max_new_tokens=256)
        audio_segments.append(audio_values[0, 0].numpy())

    # Stitch together audio segments
    stitched_audio = stitch_audio_segments(audio_segments)

    # Stream the stitched audio
    return stream_audio(stitched_audio)

def stitch_audio_segments(audio_segments):
    # Stitch together audio segments (dummy function)
    # You'll need to implement the logic for stitching audio segments together
    # including crossfading, adjusting volume levels, etc.
    stitched_audio = b''.join(audio_segments)
    return stitched_audio

def stream_audio(audio_data):
    def generate():
        # Stream audio data in chunks
        chunk_size = 1024
        offset = 0
        while offset < len(audio_data):
            yield audio_data[offset:offset + chunk_size]
            offset += chunk_size
            time.sleep(0.1)  # Add a small delay to control streaming speed

    return Response(generate(), mimetype='audio/wav')

if __name__ == '__main__':
    app.run(debug=True)
