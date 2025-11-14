import React from "react";

export default function Nav({ onLogout, showLogout = false }) {
  return (
    <nav
      style={{
        background: "#4A6CF7",
        padding: "12px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        color: "white",
        boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
      }}
    >
      <div style={{ fontSize: "20px", fontWeight: "bold", letterSpacing: "0.5px" }}>
        QuizMaster
      </div>

      {showLogout && (
        <button
          onClick={onLogout}
          style={{
            background: "white",
            color: "#4A6CF7",
            border: "none",
            padding: "6px 14px",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "600",
            transition: "0.2s",
          }}
        >
          Logout
        </button>
      )}
    </nav>
  );
}
