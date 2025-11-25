import React, { useEffect, useState } from "react";
import { api } from "../api";

export default function Scores({ token }) {
  const [scores, setScores] = useState([]);
  const [categories, setCategories] = useState([]);

  function categoryName(id) {
    const match = categories.find((c) => String(c.id) === String(id));
    return match ? match.name : id;
  }

  useEffect(() => {
    if (!token) return;

    api("/scores", {
      method: "GET",
      headers: { Authorization: "Bearer " + token },
    })
      .then(setScores)
      .catch(() => setScores([]));

    api("/quiz/categories", {
      headers: { Authorization: "Bearer " + token },
    })
      .then(setCategories)
      .catch(() => setCategories([]));
  }, [token]);

  if (!token) {
    return null;
  }

  return (
    <div style={outerWrapperStyle}>
      <div style={cardStyle}>
        <div style={cardHeaderStyle}>
          <div>
            <h2 style={titleStyle}>Score history</h2>
            <p style={subtitleStyle}>
              Track how you&apos;re doing across categories and difficulties.
            </p>
          </div>
          {scores.length > 0 && (
            <div style={badgeStyle}>{scores.length} attempts</div>
          )}
        </div>

        {scores.length === 0 ? (
          <p style={emptyStateStyle}>
            You haven&apos;t played any quizzes yet. Start a game to see your
            stats here.
          </p>
        ) : (
          <div style={{ overflowX: "auto", marginTop: 12 }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Questions</th>
                  <th style={thStyle}>Correct</th>
                  <th style={thStyle}>Category</th>
                  <th style={thStyle}>Difficulty</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((s) => (
                  <tr key={s.id}>
                    <td style={tdStyle}>{s.total}</td>
                    <td style={tdStyle}>{s.correct}</td>
                    <td style={tdStyle}>{categoryName(s.category)}</td>
                    <td style={tdStyle}>{s.difficulty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const outerWrapperStyle = {
  maxWidth: "900px",
  margin: "24px auto",
  padding: "4px 8px",
};

const cardStyle = {
  background: "white",
  borderRadius: "18px",
  padding: "20px 22px",
  boxShadow: "0 18px 40px rgba(15, 23, 42, 0.18)",
  border: "1px solid rgba(148, 163, 184, 0.25)",
};

const cardHeaderStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "12px",
  marginBottom: "8px",
};

const titleStyle = {
  margin: 0,
  fontSize: "22px",
  fontWeight: 700,
  color: "#0f172a",
};

const subtitleStyle = {
  margin: "4px 0 0",
  fontSize: "13px",
  color: "#6b7280",
};

const badgeStyle = {
  padding: "4px 10px",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: 600,
  background: "rgba(59, 130, 246, 0.08)",
  color: "#1d4ed8",
};

const emptyStateStyle = {
  marginTop: "16px",
  fontSize: "14px",
  color: "#6b7280",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "4px",
};

const thStyle = {
  padding: "10px 6px",
  fontSize: "13px",
  fontWeight: 600,
  borderBottom: "1px solid #e5e7eb",
  textAlign: "left",
  color: "#64748b",
};

const tdStyle = {
  padding: "10px 6px",
  fontSize: "14px",
  borderBottom: "1px solid #e5e7eb",
  color: "#111827",
};
