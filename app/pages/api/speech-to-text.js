import { SpeechClient } from "@google-cloud/speech";
import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  if (!req.body || !req.body.audio) {
    return res.status(400).json({ error: "No audio data provided" });
  }

  try {
    const client = new SpeechClient({
      keyFilename: "../hackdavis24-421623-44db182a59f8.json",
    });

    const audioBytes = Buffer.from(req.body.audio, "base64");
    const audio = { content: audioBytes };
    const config = {
      encoding: "WEBM OPUS",
      sampleRateHertz: 48000,
      languageCode: "en-US",
    };
    const request = { audio: audio, config: config };
    const [response] = await client.recognize(request);
    const transcription = response.results
      .map((result) => result.alternatives[0].transcript)
      .join("\n");

    // Output transcription for verification
    console.log("Transcription:", transcription);

    // Send transcription to Flask backend
    const backendUrl = 'http://localhost:8080/api/generate_music';
    const backendResponse = await axios.post(backendUrl, { transcription });

    // Send backend response back to the client, if needed
    res.status(200).json({ message: 'Transcription processed', backendData: backendResponse.data });
  } catch (error) {
    console.error("Error transcribing audio:", error);
    res.status(500).json({ error: "Error processing your request", details: error.message });
  }
}
