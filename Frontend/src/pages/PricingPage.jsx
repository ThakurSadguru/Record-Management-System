// pages/PricingPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar, BottomCTA } from "../components/SharedComponents";

const PLANS = [
  {
    name: "Starter",
    price: { monthly: "Free", yearly: "Free" },
    desc: "Perfect for small teams getting started.",
    color: "#64748b",
    features: [
      "Up to 3 users",
      "5 custom modules",
      "1,000 records",
      "Basic roles (Admin/Staff/Viewer)",
      "Email support",
    ],
    cta: "Get Started Free",
    highlight: false,
  },
  {
    name: "Professional",
    price: { monthly: "₹2,499", yearly: "₹1,999" },
    period: "/month",
    desc: "For growing teams that need more power.",
    color: "#2563eb",
    features: [
      "Up to 25 users",
      "Unlimited modules",
      "100,000 records",
      "Sub-modules & nesting",
      "File uploads",
      "Activity logs",
      "Recycle bin (30 days)",
      "Priority support",
    ],
    cta: "Start Free Trial",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: { monthly: "Custom", yearly: "Custom" },
    desc: "For large organizations with custom needs.",
    color: "#7c3aed",
    features: [
      "Unlimited users",
      "Unlimited everything",
      "Super Admin role",
      "Custom integrations",
      "On-premise option",
      "SLA guarantee",
      "Dedicated support",
      "Custom onboarding",
    ],
    cta: "Contact Sales",
    highlight: false,
  },
];

export default function PricingPage() {
  const navigate = useNavigate();
  const [yearly, setYearly] = useState(false);

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
      <Navbar navigate={navigate} active="pricing" />

      <div style={{ textAlign: "center", padding: "80px 48px 60px" }}>
        <div
          style={{
            display: "inline-block",
            padding: "6px 18px",
            borderRadius: 20,
            background: "rgba(5,150,105,0.15)",
            border: "1px solid rgba(5,150,105,0.3)",
            fontSize: 12,
            fontWeight: 600,
            color: "#34d399",
            marginBottom: 20,
            letterSpacing: 1,
          }}
        >
          SIMPLE PRICING
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
          Pay for what
          <br />
          <span
            style={{
              background: "linear-gradient(135deg,#34d399,#6ee7b7)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            you actually use
          </span>
        </h1>
        <p
          style={{
            fontSize: 17,
            color: "rgba(255,255,255,0.55)",
            maxWidth: 440,
            margin: "0 auto 32px",
          }}
        >
          No hidden fees. No per-module charges. Just straightforward pricing
          that scales with your team.
        </p>

        {/* Toggle */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 99,
            padding: "6px 8px",
          }}
        >
          <button
            onClick={() => setYearly(false)}
            style={{
              padding: "6px 18px",
              borderRadius: 99,
              border: "none",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
              background: !yearly ? "#2563eb" : "transparent",
              color: "#fff",
              transition: "background 0.2s",
            }}
          >
            Monthly
          </button>
          <button
            onClick={() => setYearly(true)}
            style={{
              padding: "6px 18px",
              borderRadius: 99,
              border: "none",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
              background: yearly ? "#2563eb" : "transparent",
              color: "#fff",
              transition: "background 0.2s",
            }}
          >
            Yearly{" "}
            <span
              style={{
                fontSize: 10,
                background: "#059669",
                padding: "2px 7px",
                borderRadius: 99,
                marginLeft: 4,
              }}
            >
              -20%
            </span>
          </button>
        </div>
      </div>

      <div
        style={{
          maxWidth: 960,
          margin: "0 auto",
          padding: "0 48px 100px",
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 20,
          alignItems: "start",
        }}
      >
        {PLANS.map((p) => (
          <div
            key={p.name}
            style={{
              background: p.highlight
                ? "rgba(37,99,235,0.12)"
                : "rgba(255,255,255,0.03)",
              border: `1.5px solid ${p.highlight ? "rgba(37,99,235,0.5)" : "rgba(255,255,255,0.08)"}`,
              borderRadius: 20,
              padding: "32px 28px",
              position: "relative",
              transform: p.highlight ? "scale(1.03)" : "scale(1)",
            }}
          >
            {p.highlight && (
              <div
                style={{
                  position: "absolute",
                  top: -12,
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "#2563eb",
                  padding: "4px 16px",
                  borderRadius: 99,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 1,
                  whiteSpace: "nowrap",
                }}
              >
                MOST POPULAR
              </div>
            )}
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: p.color,
                letterSpacing: 1,
                marginBottom: 8,
              }}
            >
              {p.name.toUpperCase()}
            </div>
            <div style={{ fontSize: 36, fontWeight: 900, marginBottom: 4 }}>
              {yearly ? p.price.yearly : p.price.monthly}
              {p.period && (
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 400,
                    color: "rgba(255,255,255,0.4)",
                  }}
                >
                  {p.period}
                </span>
              )}
            </div>
            <p
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.5)",
                margin: "0 0 24px",
                lineHeight: 1.6,
              }}
            >
              {p.desc}
            </p>
            <button
              onClick={() => navigate("/")}
              style={{
                width: "100%",
                padding: "11px",
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 700,
                background: p.highlight
                  ? "linear-gradient(135deg,#2563eb,#1d4ed8)"
                  : "rgba(255,255,255,0.08)",
                color: "#fff",
                marginBottom: 24,
                boxShadow: p.highlight
                  ? "0 4px 20px rgba(37,99,235,0.4)"
                  : "none",
              }}
            >
              {p.cta}
            </button>
            <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {p.features.map((f) => (
                <li
                  key={f}
                  style={{
                    fontSize: 13,
                    color: "rgba(255,255,255,0.7)",
                    padding: "6px 0",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <span style={{ color: p.color, fontSize: 15, flexShrink: 0 }}>
                    ✓
                  </span>{" "}
                  {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <BottomCTA navigate={navigate} />
    </div>
  );
}
