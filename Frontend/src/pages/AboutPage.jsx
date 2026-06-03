// pages/AboutPage.jsx
import { useNavigate } from "react-router-dom";
import { Navbar, BottomCTA } from "../components/SharedComponents";

const TEAM = [
  {
    name: "Arjun Sharma",
    role: "CEO & Co-founder",
    avatar: "AS",
    color: "#2563eb",
  },
  {
    name: "Priya Nair",
    role: "CTO & Co-founder",
    avatar: "PN",
    color: "#7c3aed",
  },
  {
    name: "Rahul Mehta",
    role: "Head of Product",
    avatar: "RM",
    color: "#059669",
  },
  {
    name: "Sneha Patel",
    role: "Lead Designer",
    avatar: "SP",
    color: "#d97706",
  },
];

const STATS = [
  { value: "500+", label: "Organizations" },
  { value: "2M+", label: "Records managed" },
  { value: "99.9%", label: "Uptime SLA" },
  { value: "4.9★", label: "Customer rating" },
];

export default function AboutPage() {
  const navigate = useNavigate();
  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg,#050d1f 0%,#0a1628 50%,#0d1f3c 100%)",
        color: "#fff",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
      }}
    >
      <Navbar navigate={navigate} active="about" />

      {/* Hero */}
      <div style={{ textAlign: "center", padding: "80px 48px 60px" }}>
        <div
          style={{
            display: "inline-block",
            padding: "6px 18px",
            borderRadius: 20,
            background: "rgba(217,119,6,0.15)",
            border: "1px solid rgba(217,119,6,0.3)",
            fontSize: 12,
            fontWeight: 600,
            color: "#fbbf24",
            marginBottom: 20,
            letterSpacing: 1,
          }}
        >
          OUR STORY
        </div>
        <h1
          style={{
            fontSize: 52,
            fontWeight: 900,
            margin: "0 0 16px",
            letterSpacing: -1,
            lineHeight: 1.1,
          }}
        >
          We believe data management
          <br />
          <span
            style={{
              background: "linear-gradient(135deg,#fbbf24,#f59e0b)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            shouldn't require developers
          </span>
        </h1>
        <p
          style={{
            fontSize: 17,
            color: "rgba(255,255,255,0.55)",
            maxWidth: 600,
            margin: "0 auto",
          }}
        >
          RMS was born from frustration. Too many teams were building custom
          spreadsheets or paying for bloated enterprise software. We built the
          middle ground — powerful enough for enterprises, simple enough for
          anyone.
        </p>
      </div>

      {/* Stats */}
      <div
        style={{
          maxWidth: 900,
          margin: "0 auto 80px",
          padding: "0 48px",
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 20,
        }}
      >
        {STATS.map((s) => (
          <div
            key={s.label}
            style={{
              textAlign: "center",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 16,
              padding: "28px 16px",
            }}
          >
            <div
              style={{
                fontSize: 36,
                fontWeight: 900,
                color: "#4B9FFF",
                marginBottom: 6,
              }}
            >
              {s.value}
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Mission */}
      <div
        style={{
          maxWidth: 900,
          margin: "0 auto 80px",
          padding: "0 48px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 32,
        }}
      >
        {[
          {
            icon: "🎯",
            title: "Our Mission",
            text: "To give every team — regardless of size or technical ability — the power to build exactly the data management system they need, without writing a single line of code.",
          },
          {
            icon: "🔮",
            title: "Our Vision",
            text: "A world where every organization, from a 3-person startup to a 50,000-person enterprise, runs on clean, structured, accessible data that every team member can interact with.",
          },
        ].map((item) => (
          <div
            key={item.title}
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 16,
              padding: "32px",
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 16 }}>{item.icon}</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 12px" }}>
              {item.title}
            </h3>
            <p
              style={{
                fontSize: 14,
                color: "rgba(255,255,255,0.55)",
                lineHeight: 1.8,
                margin: 0,
              }}
            >
              {item.text}
            </p>
          </div>
        ))}
      </div>

      {/* Team */}
      <div style={{ maxWidth: 900, margin: "0 auto 100px", padding: "0 48px" }}>
        <h2
          style={{
            fontSize: 28,
            fontWeight: 800,
            textAlign: "center",
            marginBottom: 40,
          }}
        >
          Meet the team
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 20,
          }}
        >
          {TEAM.map((m) => (
            <div
              key={m.name}
              style={{
                textAlign: "center",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 16,
                padding: "28px 16px",
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: `linear-gradient(135deg,${m.color},${m.color}aa)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  fontWeight: 800,
                  color: "#fff",
                  margin: "0 auto 14px",
                }}
              >
                {m.avatar}
              </div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
                {m.name}
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                {m.role}
              </div>
            </div>
          ))}
        </div>
      </div>

      <BottomCTA navigate={navigate} />
    </div>
  );
}
