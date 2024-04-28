import google.generativeai as genai
import google.ai.generativelanguage as glm

import textwrap
import numpy as np
import pandas as pd

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
musicmodel = MusicgenForConditionalGeneration.from_pretrained("facebook/musicgen-small")
model = 'models/embedding-001'


DOCUMENT1 = {
    "title": "energetic and motivated",
    "content": "upbeat, electronic dance music with a fast tempo and driving beat"
  }
DOCUMENT2 = {
    "title": "creative and inspired",
    "content": "instrumental music with a mix of classical and electronic elements, featuring complex melodies and harmonies"
    }
DOCUMENT3 = {
    "title": "nostalgic and missing my childhood",
    "content": "classic rock or pop music from the 1980s or 1990s with familiar melodies and lyrics"
}
DOCUMENT4 = {
    "title": "relaxed and at peace",
    "content": "calming, ambient music with soothing sounds and a slow tempo"
}
DOCUMENT5 = {
    "title": "happy and excited",
    "content": "upbeat, dance music with a driving beat and energetic melody"
}
documents = [DOCUMENT1, DOCUMENT2, DOCUMENT3, DOCUMENT4, DOCUMENT5]

genai.configure(api_key="AIzaSyCFG_pTV2GgOZ45eZkHdgN7hjH2A_eNHoE")

df = pd.DataFrame(documents)
df.columns = ['Title', 'Text']
def embed_fn(title, text):
    return genai.embed_content(model=model, content=text, task_type="retrieval_document", title=title)["embedding"]

df['Embeddings'] = df.apply(lambda row: embed_fn(row['Title'], row['Text']), axis=1)

def find_best_passage(query, dataframe):
    query_embedding = genai.embed_content(model=model, content=query, task_type="retrieval_query")
    dot_products = np.dot(np.stack(dataframe['Embeddings']), query_embedding["embedding"])
    idx = np.argmax(dot_products)
    return dataframe.iloc[idx]['Text'] 
# Endpoint to generate music based on the provided style and description
@app.route("/api/generate_music", methods=['POST'])
def generate_music():
    # Get the JSON data from the request
    data = request.get_json()
    input_text = data['transcription']


    query=input_text+" Can you recommend me a choice of music?"



    passage = find_best_passage(query, df)

    # Process the input text and prepare it for the model
    inputs = processor(text=[passage], return_tensors="pt")

    # Generate audio values
    with torch.no_grad():  # Disable gradients for inference
        audio_values = musicmodel.generate(**inputs, max_new_tokens=256)

    # Get the sampling rate from the model's configuration
    sampling_rate = musicmodel.config.audio_encoder.sampling_rate

    # Write the audio to a WAV file (you might want to return this differently, e.g., as a binary stream)
    output_path = "generated_music6.wav"
    scipy.io.wavfile.write(output_path, rate=sampling_rate, data=audio_values[0, 0].numpy())

    # Return the path to the generated audio file
    return jsonify(result=output_path)

if __name__ == "__main__":
    app.run(debug=True, port=8080)
