

from flask import Flask, request, jsonify
from flask_cors import CORS
import scipy.io.wavfile
import torch
from transformers import AutoProcessor, MusicgenForConditionalGeneration

# Initialize the Flask app and CORS
app = Flask(__name__)
CORS(app)

# Load the models
processor = AutoProcessor.from_pretrained("facebook/musicgen-small")
model = MusicgenForConditionalGeneration.from_pretrained("facebook/musicgen-small")

# Endpoint to generate music based on the provided style and description
@app.route("/api/generate_music", methods=['POST'])
def generate_music():
    # Get the JSON data from the request
    data = request.get_json()
    input_text = data['transcription']

    # Process the input text and prepare it for the model
    inputs = processor(text=[input_text], return_tensors="pt")

    # Generate audio values
    with torch.no_grad():  # Disable gradients for inference
        audio_values = model.generate(**inputs, max_new_tokens=256)

    # Get the sampling rate from the model's configuration
    sampling_rate = model.config.audio_encoder.sampling_rate

    # Write the audio to a WAV file (you might want to return this differently, e.g., as a binary stream)
    output_path = "generated_music2.wav"
    scipy.io.wavfile.write(output_path, rate=sampling_rate, data=audio_values[0, 0].numpy())

    # Return the path to the generated audio file
    return jsonify(result=output_path)

if __name__ == "__main__":
    app.run(debug=True, port=8080)
