frontend/src/App.jsx
import { useState } from "react";

export default function App() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);

  const classify = async () => {
    const res = await fetch("http://localhost:5000/classify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ description: input }),
    });

    const data = await res.json();
    setResult(data);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>CustomsIQ</h1>

      <textarea
        rows="4"
        style={{ width: "100%" }}
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <button onClick={classify}>Classify</button>

      {result && (
        <div>
          <h3>{result.code}</h3>
          <p>{result.description}</p>
          <p>{result.explanation}</p>

          <h4>Matches:</h4>
          {result.candidates?.map((c, i) => (
            <div key={i}>{c.description}</div>
          ))}
        </div>
      )}
    </div>
  );
}
