import React, { useEffect, useState } from "react";
import '../src/app/globals.css';

export default function app() {
  const [message, setMessage] = useState("Loading");
  const [people, setPeople] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [result, setResult] = useState(null);



  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch('http://localhost:8080/api/generate_music', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: inputValue }), // Changed to send text
    })
    .then(response => response.json())
    .then(data => {
      setResult(data.result);
    })
    .catch(error => console.error('Error:', error));
  };

  return (
    <div>
      <div>{message}</div>
      {people.map((person, index) => (
        <div key={index}>{person}</div>
      ))}
      <form onSubmit={handleSubmit}>
        <input type="text" value={inputValue} onChange={handleInputChange} /> {/* Changed type to text */}
        <button type="submit">Submit</button>
      </form>
      {result !== null && <div>Result: {result}</div>}
    </div>
  );
}


