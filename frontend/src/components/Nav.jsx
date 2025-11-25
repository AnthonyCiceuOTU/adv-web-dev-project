import React from "react";

export default function Nav({ onLogout, showLogout = false, onNavigate }) {
  return (
    <nav
      style={{
        background: "#111827",
        padding: "10px 18px",
        margin: "0 auto 24px",
        maxWidth: "960px",
        borderRadius: "999px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        color: "#F9FAFB",
        boxShadow: "0 12px 30px rgba(15, 23, 42, 0.35)",
        position: "sticky",
        top: "12px",
        zIndex: 20,
      }}
    >
      {/* Left: Logo */}
      <div
        style={{
          fontSize: "22px",
          fontWeight: 800,
          letterSpacing: "0.6px",
          cursor: onNavigate ? "pointer" : "default",
        }}
        onClick={() => onNavigate && onNavigate("home")}
      >
        QuizMaster
        <span
          style={{
            fontSize: "12px",
            marginLeft: 8,
            opacity: 0.7,
            fontWeight: 500,
          }}
        >
          trivia
        </span>
      </div>

      {/* Right: Links */}
      <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
        {showLogout && (
          <>
            <button
              type="button"
              onClick={() => onNavigate && onNavigate("scores")}
              style={linkButtonStyle}
            >
              Scores
            </button>

            <button
              type="button"
              onClick={() => onNavigate && onNavigate("settings")}
              style={linkButtonStyle}
            >
              Settings
            </button>

            <button
              type="button"
              onClick={onLogout}
              style={{
                background: "linear-gradient(135deg, #F97373, #EF4444)",
                color: "#fff",
                border: "none",
                padding: "8px 18px",
                borderRadius: "999px",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "14px",
                boxShadow: "0 8px 18px rgba(239, 68, 68, 0.45)",
                transition:
                  "transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow =
                  "0 10px 22px rgba(239, 68, 68, 0.55)";
                e.currentTarget.style.opacity = "0.96";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 8px 18px rgba(239, 68, 68, 0.45)";
                e.currentTarget.style.opacity = "1";
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

const linkButtonStyle = {
  background: "transparent",
  border: "none",
  color: "#E5E7EB",
  fontSize: "14px",
  fontWeight: 500,
  cursor: "pointer",
  padding: "6px 10px",
  borderRadius: "999px",
  transition: "background 0.15s ease, color 0.15s ease, transform 0.15s ease",
};
