// pages/api/speech-to-text.js

import { SpeechClient } from "@google-cloud/speech";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const client = new SpeechClient();
      const audioBytes = req.body.audio;

      const audio = {
        content: audioBytes,
      };

      const config = {
        encoding: "LINEAR16",
        sampleRateHertz: 16000,
        languageCode: "en-US",
      };

      const request = {
        audio: audio,
        config: config,
      };

      const [response] = await client.recognize(request);
      const transcription = response.results
        .map((result) => result.alternatives[0].transcript)
        .join("\n");

      res.status(200).json({ transcription });
    } catch (error) {
      console.error("Error transcribing audio:", error);
      res.status(500).json({ error: "Error processing your request" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
