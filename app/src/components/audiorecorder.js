import React, { useState, useEffect } from "react";

export default function AudioRecorder() {
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioData, setAudioData] = useState(null);
  const [audioURL, setAudioURL] = useState(null); // URL for playing back the audio

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
      const base64String = reader.result.split(",")[1]; // Extract base64 part
      console.log("Encoded Base64 Audio:", base64String); // Debug: Log the base64 string

      const res = await fetch("/api/speech-to-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ audio: base64String }),
      });

      const data = await res.json();
      console.log("Server Response:", data); // Debug: Log the server response
    };
    reader.readAsDataURL(audioData); // Make sure this is being called correctly
  };

  return (
    <div className="bg-gray-100 p-4 rounded-lg shadow">
      <button
        onClick={toggleRecording}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        {recording ? "Stop Recording" : "Start Recording"}
      </button>
      {audioData && (
        <button
          onClick={sendAudio}
          className="ml-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Transcribe
        </button>
      )}
      {audioURL && (
        <div className="mt-4">
          <audio controls src={audioURL} className="w-full">
            Your browser does not support the audio element.
          </audio>
        </div>
      )}
    </div>
  );
}
