"use client";

import { useState } from "react";

export default function TestResume() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);

  async function handleSubmit() {
    const formData = new FormData();

    formData.append("resume", file);

    formData.append(
      "jobDescription",
      "Looking for a Java developer with React, AWS and Docker experience."
    );

    const res = await fetch("/api/ai/resume-match", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    setResult(data);
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Resume Test</h1>

      <input
        type="file"
        accept=".pdf"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <button onClick={handleSubmit}>
        Test Resume Match
      </button>

      <pre>
        {JSON.stringify(result, null, 2)}
      </pre>
    </div>
  );
}