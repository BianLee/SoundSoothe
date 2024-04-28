import React, { useState, useEffect } from "react";
import "../../src/app/globals.css";

export default function AudioRecorder() {
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioData, setAudioData] = useState(null);
  const [audioURL, setAudioURL] = useState(null);
  const [transcription, setTranscription] = useState(""); // State to hold the transcription text

  useEffect(() => {
    if (recording) {
      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        const recorder = new MediaRecorder(stream);
        const chunks = [];

        recorder.ondataavailable = (e) => {
          chunks.push(e.data);
        };

        recorder.onstop = () => {
          const completeBlob = new Blob(chunks, { type: "audio/mp4" });
          setAudioData(completeBlob);
          const url = URL.createObjectURL(completeBlob);
          setAudioURL(url);
        };

        recorder.start();
        setMediaRecorder(recorder);
      });
    } else {
      mediaRecorder?.stop();
    }

    return () =>
      mediaRecorder?.stream.getTracks().forEach((track) => track.stop());
  }, [recording]);

  const toggleRecording = () => setRecording(!recording);

  const sendAudio = async () => {
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result.split(",")[1];
      const resText = await fetch("/api/transcription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ audio: base64String }),
      });
      if (resText.ok) {
        const data = await resText.json();  // Correctly parsing the JSON response
        console.log(data);  // Log the data from the speech to text
        setTranscription(data.transcription)

      } const res = await fetch("/api/speech-to-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ audio: base64String }),
      });
      const data = await res;
      const strData = JSON.stringify(data);
      setTranscription(strData);
    };
    reader.readAsDataURL(audioData);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-800 to-purple-800 px-4 py-4">
      <div className="flex flex-col items-center w-full max-w-lg">
        <button
          className={`px-6 py-3 rounded-lg text-white font-bold text-lg transition-colors shadow-lg ${recording
            ? "bg-red-600 hover:bg-red-800"
            : "bg-blue-600 hover:bg-blue-800"
            }`}
          onClick={toggleRecording}
        >
          {recording ? "Stop Recording" : "Start Recording"}
        </button>
        {audioData && (
          <button
            className="mt-4 px-6 py-3 bg-gray-600 hover:bg-gray-800 text-white rounded-lg font-bold text-lg transition-colors shadow-lg"
            onClick={sendAudio}
          >
            Transcribe
          </button>
        )}
        {audioURL && (
          <div className="mt-4 w-full">
            <audio controls src={audioURL} className="w-full">
              Your browser does not support the audio element.
            </audio>
          </div>
        )}

        <div className="mt-4 w-full p-4 bg-white rounded-lg shadow-lg text-gray-800">
          <h3 className="text-lg font-semibold">Transcription:</h3>
          <p>{transcription}</p>
        </div>
      </div>
    </div>
  );
}
