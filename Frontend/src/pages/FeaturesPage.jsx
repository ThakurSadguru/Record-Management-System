import { useNavigate } from "react-router-dom";
import logoSrc from "../assets/logo.png";
import { Navbar, BottomCTA } from "../components/SharedComponents";

const FEATURES = [
  {
    icon: "🛡️",
    title: "Enterprise Security",
    desc: "JWT-based authentication, role-based access control, and encrypted data storage. Every action is logged and audited.",
    bullets: [
      "JWT + BCrypt auth",
      "Role-based permissions",
      "Activity audit logs",
      "Soft-delete with recycle bin",
    ],
    color: "#2563eb",
  },
  {
    icon: "⊞",
    title: "Dynamic Modules",
    desc: "Create any data structure without code. Define fields, types, and validations visually — no database migrations needed.",
    bullets: [
      "Custom field types",
      "Nested sub-modules",
      "Dropdown & boolean fields",
      "File upload support",
    ],
    color: "#7c3aed",
  },
  {
    icon: "📋",
    title: "Smart Records",
    desc: "Store, search, and manage records across all your modules with full-text search and real-time filtering.",
    bullets: [
      "Full-text search",
      "Inline editing",
      "Bulk operations",
      "CSV export ready",
    ],
    color: "#059669",
  },
  {
    icon: "👥",
    title: "Team Management",
    desc: "Invite team members via email, assign roles, and control exactly what each person can see and do.",
    bullets: [
      "Email invite system",
      "ADMIN / STAFF / VIEWER roles",
      "Super Admin controls",
      "User activity tracking",
    ],
    color: "#d97706",
  },
  {
    icon: "🗑️",
    title: "Recycle Bin",
    desc: "Nothing is ever lost. Deleted modules and records are kept for 30 days with full restore capability.",
    bullets: [
      "30-day retention",
      "Selective restore",
      "Permanent purge option",
      "Delete audit trail",
    ],
    color: "#dc2626",
  },
  {
    icon: "📊",
    title: "Activity Tracking",
    desc: "See everything that happens in your system — who created, updated, deleted, or restored any record.",
    bullets: [
      "Real-time activity feed",
      "Filter by action type",
      "User-level tracking",
      "Login history",
    ],
    color: "#0891b2",
  },
];

export default function FeaturesPage() {
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
      {/* Navbar */}
      <Navbar navigate={navigate} active="features" />

      {/* Hero */}
      <div style={{ textAlign: "center", padding: "80px 48px 60px" }}>
        <div
          style={{
            display: "inline-block",
            padding: "6px 18px",
            borderRadius: 20,
            background: "rgba(37,99,235,0.15)",
            border: "1px solid rgba(37,99,235,0.3)",
            fontSize: 12,
            fontWeight: 600,
            color: "#60a5fa",
            marginBottom: 20,
            letterSpacing: 1,
          }}
        >
          EVERYTHING YOU NEED
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
          Built for teams that
          <br />
          <span
            style={{
              background: "linear-gradient(135deg,#4B9FFF,#60a5fa)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            mean business
          </span>
        </h1>
        <p
          style={{
            fontSize: 17,
            color: "rgba(255,255,255,0.55)",
            maxWidth: 520,
            margin: "0 auto",
          }}
        >
          Every feature is designed to make managing records faster, safer, and
          more collaborative.
        </p>
      </div>

      {/* Features Grid */}
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0 48px 100px",
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 24,
        }}
      >
        {FEATURES.map((f) => (
          <div
            key={f.title}
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 16,
              padding: "28px 24px",
              transition: "border-color 0.2s, transform 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = `${f.color}55`;
              e.currentTarget.style.transform = "translateY(-3px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: `${f.color}20`,
                border: `1px solid ${f.color}40`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                marginBottom: 16,
              }}
            >
              {f.icon}
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 10px" }}>
              {f.title}
            </h3>
            <p
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.5)",
                lineHeight: 1.7,
                margin: "0 0 16px",
              }}
            >
              {f.desc}
            </p>
            <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {f.bullets.map((b) => (
                <li
                  key={b}
                  style={{
                    fontSize: 12,
                    color: "rgba(255,255,255,0.6)",
                    padding: "3px 0",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span style={{ color: f.color, fontSize: 14 }}>✓</span> {b}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* CTA */}
      <BottomCTA navigate={navigate} />
    </div>
  );
}
