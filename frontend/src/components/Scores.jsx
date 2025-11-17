import React, { useEffect, useState } from "react";
import { api } from "../api";

export default function Scores({ token }) {
  const [scores, setScores] = useState([]);
  const [categories, setCategories] = useState([]);

  // Convert category ID → category name
  function categoryName(id) {
    const match = categories.find(c => String(c.id) === String(id));
    return match ? match.name : id; // fallback to number
  }

  useEffect(() => {
    if (!token) return;

    // Load user's score history
    api("/scores", {
      method: "GET",
      headers: { Authorization: "Bearer " + token }
    })
      .then(setScores)
      .catch(() => setScores([]));

    // Load category list so we can map ID → name
    api("/quiz/categories", {
      headers: { Authorization: "Bearer " + token }
    })
      .then(setCategories)
      .catch(() => setCategories([]));

  }, [token]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f7f7f7",
        padding: "40px 20px",
        fontFamily: "Trebuchet MS, sans-serif",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "700px",
          background: "white",
          padding: "25px 30px",
          borderRadius: "12px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.12)"
        }}
      >
        <h2
          style={{
            textAlign: "center",
            marginBottom: "22px",
            fontSize: "26px",
            color: "#333",
            letterSpacing: "0.5px",
          }}
        >
          Your Score History
        </h2>

        {scores.length === 0 ? (
          <p style={{ textAlign: "center", color: "#666" }}>
            You have no past attempts yet.
          </p>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "separate",
              borderSpacing: "0 8px",
            }}
          >
            <thead>
              <tr style={{ background: "#e3e3e3", color: "#333" }}>
                <th style={thStyle}>Total</th>
                <th style={thStyle}>Correct</th>
                <th style={thStyle}>Category</th>
                <th style={thStyle}>Difficulty</th>
              </tr>
            </thead>

            <tbody>
              {scores.map((s, index) => (
                <tr
                  key={s.id}
                  style={{
                    background: index % 2 === 0 ? "#fafafa" : "#f0f0f0",
                    borderRadius: "8px",
                  }}
                >
                  <td style={tdStyle}>{s.total}</td>
                  <td style={tdStyle}>{s.correct}</td>
                  <td style={tdStyle}>{categoryName(s.category)}</td>
                  <td style={tdStyle}>{s.difficulty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const thStyle = {
  padding: "10px 6px",
  fontSize: "15px",
  fontWeight: "bold",
  borderBottom: "2px solid #ccc",
  textAlign: "center",
};

const tdStyle = {
  padding: "12px 8px",
  textAlign: "center",
  fontSize: "15px",
  color: "#444",
  borderBottom: "1px solid #ddd",
};
