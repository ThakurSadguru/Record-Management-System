// pages/SolutionsPage.jsx
import { useNavigate } from "react-router-dom";
import { Navbar, BottomCTA } from "../components/SharedComponents";

const SOLUTIONS = [
  {
    industry: "Healthcare",
    icon: "🏥",
    headline: "Patient & Staff Records",
    desc: "Manage patient intake forms, staff credentials, equipment inventory, and compliance documents — all in one secure system.",
    useCases: [
      "Patient registration modules",
      "Staff certification tracking",
      "Equipment maintenance logs",
      "Incident reporting",
    ],
    color: "#059669",
  },
  {
    industry: "Education",
    icon: "🎓",
    headline: "Student Information Systems",
    desc: "Track student enrollment, grades, attendance, and communications with role-based access for teachers, admins, and parents.",
    useCases: [
      "Student profile modules",
      "Course & grade tracking",
      "Parent communication logs",
      "Staff directory",
    ],
    color: "#7c3aed",
  },
  {
    industry: "Real Estate",
    icon: "🏢",
    headline: "Property & Client Management",
    desc: "Organize property listings, client interactions, contracts, and agent performance with custom modules for every workflow.",
    useCases: [
      "Property listing database",
      "Client CRM modules",
      "Contract document storage",
      "Agent activity tracking",
    ],
    color: "#d97706",
  },
  {
    industry: "Manufacturing",
    icon: "🏭",
    headline: "Production & Inventory Control",
    desc: "Track raw materials, production runs, quality checks, and supplier records with nested sub-modules for complex workflows.",
    useCases: [
      "Inventory management",
      "Supplier records",
      "Quality inspection logs",
      "Equipment maintenance",
    ],
    color: "#2563eb",
  },
  {
    industry: "Legal",
    icon: "⚖️",
    headline: "Case & Document Management",
    desc: "Organize client cases, legal documents, deadlines, and billing records with strict access controls per team member.",
    useCases: [
      "Client case modules",
      "Document file storage",
      "Deadline tracking",
      "Billing records",
    ],
    color: "#dc2626",
  },
  {
    industry: "HR & Staffing",
    icon: "👥",
    headline: "Employee Lifecycle Management",
    desc: "From onboarding to offboarding — manage employee records, performance reviews, leave requests, and payroll data.",
    useCases: [
      "Employee onboarding",
      "Performance reviews",
      "Leave management",
      "Payroll records",
    ],
    color: "#0891b2",
  },
];

export default function SolutionsPage() {
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
      <Navbar navigate={navigate} active="solutions" />

      <div style={{ textAlign: "center", padding: "80px 48px 60px" }}>
        <div
          style={{
            display: "inline-block",
            padding: "6px 18px",
            borderRadius: 20,
            background: "rgba(124,58,237,0.15)",
            border: "1px solid rgba(124,58,237,0.3)",
            fontSize: 12,
            fontWeight: 600,
            color: "#a78bfa",
            marginBottom: 20,
            letterSpacing: 1,
          }}
        >
          INDUSTRY SOLUTIONS
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
          RMS adapts to
          <br />
          <span
            style={{
              background: "linear-gradient(135deg,#a78bfa,#c4b5fd)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            your industry
          </span>
        </h1>
        <p
          style={{
            fontSize: 17,
            color: "rgba(255,255,255,0.55)",
            maxWidth: 540,
            margin: "0 auto",
          }}
        >
          No-code module builder means you can configure RMS for any workflow,
          any industry, any team size.
        </p>
      </div>

      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0 48px 100px",
          display: "grid",
          gridTemplateColumns: "repeat(2,1fr)",
          gap: 24,
        }}
      >
        {SOLUTIONS.map((s) => (
          <div
            key={s.industry}
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 16,
              padding: "28px",
              display: "flex",
              gap: 20,
              transition: "border-color 0.2s, transform 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = `${s.color}55`;
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div style={{ flexShrink: 0 }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 14,
                  background: `${s.color}20`,
                  border: `1px solid ${s.color}40`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 26,
                }}
              >
                {s.icon}
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: s.color,
                  letterSpacing: 1,
                  marginBottom: 4,
                }}
              >
                {s.industry.toUpperCase()}
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 8px" }}>
                {s.headline}
              </h3>
              <p
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.5)",
                  lineHeight: 1.6,
                  margin: "0 0 14px",
                }}
              >
                {s.desc}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {s.useCases.map((u) => (
                  <span
                    key={u}
                    style={{
                      fontSize: 11,
                      padding: "3px 10px",
                      borderRadius: 20,
                      background: `${s.color}15`,
                      border: `1px solid ${s.color}30`,
                      color: "rgba(255,255,255,0.7)",
                    }}
                  >
                    {u}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <BottomCTA navigate={navigate} />
    </div>
  );
}
