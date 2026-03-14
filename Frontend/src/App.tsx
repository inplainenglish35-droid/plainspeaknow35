import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

export default function App() {
  const [text, setText] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  async function simplify() {
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/simplify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test", // temporary for testing
        },
        body: JSON.stringify({
          text,
          mode: "understand",
        }),
      });

      const data = await response.json();

      setOutput(data.output || JSON.stringify(data));
    } catch (err) {
      setOutput("Request failed");
    }

    setLoading(false);
  }

  return (
    <div style={{ padding: 40, fontFamily: "sans-serif" }}>
      <h1>Plainspeak Test</h1>

      <textarea
        rows={10}
        style={{ width: "100%" }}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste complex text here..."
      />

      <br /><br />

      <button onClick={simplify} disabled={loading}>
        {loading ? "Processing..." : "Simplify"}
      </button>

      <h2>Result</h2>

      <pre style={{ whiteSpace: "pre-wrap" }}>{output}</pre>
    </div>
  );
}
