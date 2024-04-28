import { PythonShell } from "python-shell";
import { SpeechClient } from "@google-cloud/speech";

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

    // Now pass this transcription as a prompt to the music generation script
    const options = {
      mode: "text",
      pythonOptions: ["-u"], // unbuffered stdout
      scriptPath: "",
      args: [transcription],
    };

    PythonShell.run("main.py", options, function (err, results) {
      if (err) {
        console.error("Error in music generation:", err);
        return res
          .status(500)
          .json({ error: "Failed to generate music", details: err.message });
      } else {
        res.status(200).json({ transcription, audioFile: results[0] });
      }
    });
  } catch (error) {
    console.error("Error transcribing audio:", error);
    res
      .status(500)
      .json({ error: "Error processing your request", details: error.message });
  }
}
