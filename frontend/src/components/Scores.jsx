import React, { useEffect, useState } from "react";
import { api } from "../api";

export default function Scores({ token, onRedoAttempt }) {
  const [scores, setScores] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (!token) {
      setScores([]);
      setCategories([]);
      return;
    }

    api("/scores", {
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

  function categoryName(id) {
    const match = categories.find((c) => String(c.id) === String(id));
    return match ? match.name : id;
  }

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
                  {onRedoAttempt && (
                    <th style={{ ...thStyle, textAlign: "right" }}>Redo</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {scores.map((s) => (
                  <tr key={s.id}>
                    <td style={tdStyle}>{s.total}</td>
                    <td style={tdStyle}>{s.correct}</td>
                    <td style={tdStyle}>{categoryName(s.category)}</td>
                    <td style={tdStyle}>{s.difficulty}</td>
                    {onRedoAttempt && (
                      <td style={{ ...tdStyle, textAlign: "right" }}>
                        <button
                          type="button"
                          onClick={() => onRedoAttempt(s)}
                          style={redoButtonStyle}
                        >
                          Redo
                        </button>
                      </td>
                    )}
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
  width: "100%",
  marginTop: 32,
};

const cardStyle = {
  background: "#ffffff",
  borderRadius: 16,
  padding: 20,
  boxShadow: "0 18px 45px rgba(15, 23, 42, 0.12)",
};

const cardHeaderStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
};

const titleStyle = {
  fontSize: 20,
  fontWeight: 700,
  margin: 0,
  color: "#0f172a",
};

const subtitleStyle = {
  marginTop: 4,
  fontSize: 14,
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
  marginTop: 16,
  fontSize: 14,
  color: "#6b7280",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: 4,
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

const redoButtonStyle = {
  padding: "6px 12px",
  fontSize: 13,
  borderRadius: 999,
  border: "none",
  cursor: "pointer",
  fontWeight: 600,
  background:
    "linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(59, 130, 246, 0.15))",
  color: "#1d4ed8",
};
