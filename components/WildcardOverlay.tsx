"use client";

interface WildcardOverlayProps {
  wildcardQuestion: string | null;
  onReveal: () => void;
  onDismiss: () => void;
}

export default function WildcardOverlay({
  wildcardQuestion,
  onReveal,
  onDismiss,
}: WildcardOverlayProps) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#000000bb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 500,
        padding: "24px",
        backdropFilter: "blur(6px)",
      }}
    >
      {!wildcardQuestion ? (
        <div
          className="bounce-in"
          style={{
            background: "linear-gradient(135deg, #1a0a2e, #2d0a1a)",
            border: "3px solid #f59e0b",
            borderRadius: "24px",
            padding: "32px",
            textAlign: "center",
            maxWidth: "360px",
            width: "100%",
            boxShadow: "0 0 40px #f59e0b44",
          }}
        >
          <div style={{ fontSize: "64px", marginBottom: "8px" }}>🃏</div>
          <h2
            style={{
              color: "#f59e0b",
              fontSize: "1.5rem",
              fontWeight: 900,
              marginBottom: "8px",
            }}
          >
            WILDCARD!
          </h2>
          <p style={{ color: "#aaa", marginBottom: "24px" }}>
            A group challenge — everyone participates!
          </p>
          <button
            onClick={onReveal}
            style={{
              background: "linear-gradient(135deg, #f59e0b, #ec4899)",
              color: "white",
              border: "none",
              borderRadius: "50px",
              padding: "14px 32px",
              fontSize: "1rem",
              fontWeight: 800,
              cursor: "pointer",
              width: "100%",
            }}
          >
            Reveal the Challenge 🎲
          </button>
        </div>
      ) : (
        <div
          className="bounce-in"
          style={{
            background: "linear-gradient(135deg, #1a0a2e, #2d0a1a)",
            border: "3px solid #f59e0b",
            borderRadius: "24px",
            padding: "32px",
            textAlign: "center",
            maxWidth: "380px",
            width: "100%",
            boxShadow: "0 0 40px #f59e0b44",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "8px" }}>🃏</div>
          <div style={{ color: "#f59e0b", fontWeight: 700, marginBottom: "12px" }}>
            GROUP CHALLENGE
          </div>
          <p
            style={{
              color: "white",
              fontSize: "1.2rem",
              fontWeight: 700,
              marginBottom: "24px",
              lineHeight: 1.4,
            }}
          >
            {wildcardQuestion}
          </p>
          <button
            onClick={onDismiss}
            style={{
              background: "linear-gradient(135deg, #ec4899, #8b5cf6)",
              color: "white",
              border: "none",
              borderRadius: "50px",
              padding: "14px 32px",
              fontSize: "1rem",
              fontWeight: 800,
              cursor: "pointer",
              width: "100%",
            }}
          >
            Done! Next Question →
          </button>
        </div>
      )}
    </div>
  );
}
