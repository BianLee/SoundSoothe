// components/AudioRecorder.js
import React, { useState, useEffect } from "react";

export default function AudioRecorder() {
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioData, setAudioData] = useState(null);

  useEffect(() => {
    if (recording) {
      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        const recorder = new MediaRecorder(stream);
        recorder.ondataavailable = (e) => {
          setAudioData(e.data);
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
    reader.readAsDataURL(audioData);
    reader.onloadend = async () => {
      const base64String = reader.result
        .replace("data:", "")
        .replace(/^.+,/, "");

      const res = await fetch("/api/speech-to-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ audio: base64String }),
      });

      const data = await res.json();
      console.log(data);
    };
  };

  return (
    <div>
      <button onClick={toggleRecording}>
        {recording ? "Stop Recording" : "Start Recording"}
      </button>
      {audioData && <button onClick={sendAudio}>Transcribe</button>}
    </div>
  );
}
