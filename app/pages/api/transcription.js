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
            keyFilename: "../key.json",
        });

        const audioBytes = Buffer.from(req.body.audio, "base64");
        const audio = { content: audioBytes };
        const config = {
            encoding: "WEBM OPUS",  // Ensure this matches your actual audio format
            sampleRateHertz: 48000,  // Ensure this matches your actual audio sample rate
            languageCode: "en-US",
        };
        const request = { audio: audio, config: config };
        const [response] = await client.recognize(request);
        const transcription = response.results
            .map((result) => result.alternatives[0].transcript)
            .join("\n");

        // Output transcription for verification
        console.log("Transcription:", transcription);

        res.status(200).json({
            message: "Transcription successful",
            transcription: transcription,
        });
    } catch (error) {
        console.error("Error transcribing audio:", error);
        res.status(500).json({ error: "Error processing your request", details: error.message });
    }
}
