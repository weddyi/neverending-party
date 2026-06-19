"use client";

interface WelcomeScreenProps {
  onContinue: () => void;
}

export default function WelcomeScreen({ onContinue }: WelcomeScreenProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        position: "relative",
        zIndex: 1,
      }}
    >
      <div className="float-anim" style={{ fontSize: "80px", marginBottom: "16px" }}>
        🎉
      </div>

      <h1
        className="neon-text"
        style={{
          fontSize: "clamp(2rem, 8vw, 3.5rem)",
          fontWeight: 900,
          color: "#ec4899",
          textAlign: "center",
          marginBottom: "8px",
          letterSpacing: "-1px",
          fontFamily: "'Fredoka One', 'Nunito Black', cursive",
        }}
      >
        NeverEnding Party
      </h1>

      <p
        style={{
          color: "#8b5cf6",
          fontSize: "1rem",
          textAlign: "center",
          marginBottom: "24px",
          fontStyle: "italic",
        }}
      >
        The AI-powered party game that never runs out
      </p>

      <div
        style={{
          background: "linear-gradient(135deg, #1a0a0f88, #1a0a2e88)",
          border: "2px solid #ec4899",
          borderRadius: "20px",
          padding: "20px",
          maxWidth: "380px",
          width: "100%",
          margin: "0 0 24px",
          textAlign: "center",
          backdropFilter: "blur(10px)",
          boxShadow: "0 0 30px #ec489933",
        }}
      >
        <div style={{ fontSize: "48px", marginBottom: "8px" }}>🔞</div>
        <h2 style={{ color: "#f59e0b", fontSize: "1.5rem", fontWeight: 800, marginBottom: "8px" }}>
          Adults Only — 18+
        </h2>
        <p style={{ color: "#ec4899", fontSize: "1rem", fontWeight: 600, marginBottom: "12px" }}>
          Spicy questions, real conversations, zero filter
        </p>
        <p style={{ color: "#aaa", fontSize: "0.85rem", lineHeight: 1.5 }}>
          This game contains mature themes. All players must consent to participate.
          Play responsibly and respect boundaries.
        </p>
      </div>

      <button
        onClick={onContinue}
        className="glow-pink"
        style={{
          background: "linear-gradient(135deg, #ec4899, #8b5cf6)",
          color: "white",
          border: "none",
          borderRadius: "50px",
          padding: "18px 40px",
          fontSize: "1.1rem",
          fontWeight: 800,
          cursor: "pointer",
          width: "100%",
          maxWidth: "320px",
          fontFamily: "'Fredoka One', cursive",
        }}
      >
        I&apos;m 18+ and ready to play 🎉
      </button>

      <p style={{ color: "#555", fontSize: "0.75rem", marginTop: "16px", textAlign: "center" }}>
        Any resemblance to your actual secrets is entirely intentional.
      </p>
    </div>
  );
}
