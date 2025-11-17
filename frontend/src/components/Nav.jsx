import React from "react";

export default function Nav({ onLogout, showLogout = false, onNavigate }) {
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
        fontFamily: "Trebuchet MS, sans-serif",
      }}
    >
      {/* Left: Logo */}
      <div
        style={{
          fontSize: "22px",
          fontWeight: "bold",
          letterSpacing: "0.5px",
          cursor: "pointer",
        }}
        onClick={() => onNavigate("home")}
      >
        QuizMaster
      </div>

      {/* Right: Links */}
      <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
        {showLogout && (
          <>
            {/* Scores Link */}
            <span
              onClick={() => onNavigate("scores")}
              style={{
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "500",
                color: "white",
                transition: "0.2s",
              }}
              onMouseEnter={(e) => (e.target.style.opacity = "0.8")}
              onMouseLeave={(e) => (e.target.style.opacity = "1")}
            >
              Scores
            </span>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              style={{
                background: "white",
                color: "#4A6CF7",
                border: "none",
                padding: "7px 16px",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "600",
                transition: "0.2s",
                fontFamily: "Trebuchet MS, sans-serif",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "#dfe6ff";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "white";
              }}
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}