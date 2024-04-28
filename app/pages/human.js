import React, { useState } from 'react';
import '../src/app/globals.css';

export default function Human() {
  const [mood, setMood] = useState('');

  const handleMoodChange = (event) => {
    setMood(event.target.value);
  };

  return (
    <div>
      <h1>Select Your Mood</h1>
      <form onSubmit={async (event) => {
        event.preventDefault();
        try {
          const response = await fetch('/generate_and_stream', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompts: [mood] }),
          });
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          new Audio(url).play();
        } catch (error) {
          console.error('Error:', error);
        }
      }}>
        <select value={mood} onChange={handleMoodChange}>
          <option value="Stressed">Stressed Out</option>
          <option value="Okay">Okay/I'm Alright</option>
          <option value="Happy">Happy</option>
        </select>
        <button type="submit">Submit Mood</button>
      </form>
      <p>Selected Mood: {mood}</p>
    </div>
  );
}

// mental states: stressed out, okay/i'm alright, happy

