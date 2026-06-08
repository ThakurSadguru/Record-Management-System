import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar, BottomCTA } from "../components/SharedComponents";

// ── Plan definitions ──────────────────────────────────────────────────────────
const PLANS = [
  {
    id: "starter",
    name: "Starter",
    tier: "STARTER",
    price: { monthly: "Free", yearly: "Free" },
    priceNum: { monthly: 0, yearly: 0 },
    period: "forever",
    desc: "Perfect for small teams getting started.",
    color: "#64748b",
    gradient: "linear-gradient(135deg,#334155,#475569)",
    accentBg: "rgba(100,116,139,0.08)",
    accentBorder: "rgba(100,116,139,0.25)",
    maxUsers: 3,
    maxMembers: 2,
    paid: false,
    enterprise: false,
    features: [
      "Up to 3 users",
      "5 custom modules",
      "1,000 records",
      "Basic roles (Admin / Staff / Viewer)",
      "Email support",
    ],
    cta: "Get Started Free",
    highlight: false,
  },
  {
    id: "professional",
    name: "Professional",
    tier: "PROFESSIONAL",
    price: { monthly: "₹2,499", yearly: "₹1,874" },
    priceNum: { monthly: 2499, yearly: 1874 },
    period: "/month",
    desc: "For growing teams that need more power.",
    color: "#2563eb",
    gradient: "linear-gradient(135deg,#1d4ed8,#2563eb)",
    accentBg: "rgba(37,99,235,0.1)",
    accentBorder: "rgba(37,99,235,0.45)",
    maxUsers: 25,
    maxMembers: 24,
    paid: true,
    enterprise: false,
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
    id: "enterprise",
    name: "Enterprise",
    tier: "ENTERPRISE",
    price: { monthly: "Custom", yearly: "Custom" },
    priceNum: { monthly: 0, yearly: 0 },
    period: "pricing",
    desc: "For large organisations with complex needs.",
    color: "#7c3aed",
    gradient: "linear-gradient(135deg,#6d28d9,#7c3aed)",
    accentBg: "rgba(124,58,237,0.08)",
    accentBorder: "rgba(124,58,237,0.25)",
    maxUsers: Infinity,
    maxMembers: 999,
    paid: false,
    enterprise: true,
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

const ROLES = ["Admin", "Staff", "Viewer"];
const INDUSTRIES = [
  "Healthcare",
  "Education",
  "Corporate HR",
  "Legal",
  "Manufacturing",
  "Finance",
  "Government",
  "Technology",
  "Other",
];
const ORG_SIZES = ["1–10", "11–50", "51–200", "201–500", "500+"];
const DEPLOYMENTS = ["Cloud (SaaS)", "On-premise", "Hybrid"];

// ── Shared input style ────────────────────────────────────────────────────────
const IS = {
  width: "100%",
  boxSizing: "border-box",
  padding: "9px 12px",
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.05)",
  color: "#fff",
  fontSize: 13,
  outline: "none",
  transition: "border-color 0.15s, background 0.15s",
};
function focusIn(e) {
  e.target.style.borderColor = "rgba(74,159,255,0.55)";
  e.target.style.background = "rgba(255,255,255,0.08)";
}
function focusOut(e) {
  e.target.style.borderColor = "rgba(255,255,255,0.12)";
  e.target.style.background = "rgba(255,255,255,0.05)";
}

// ── Password strength meter ───────────────────────────────────────────────────
function StrengthBar({ pw }) {
  if (!pw) return null;
  const score =
    (pw.length >= 8 ? 1 : 0) +
    (/[A-Z]/.test(pw) ? 1 : 0) +
    (/[0-9]/.test(pw) ? 1 : 0) +
    (/[^A-Za-z0-9]/.test(pw) ? 1 : 0);
  const labels = ["Too short", "Weak", "Fair", "Good", "Strong"];
  const colors = ["#94a3b8", "#ef4444", "#f59e0b", "#3b82f6", "#10b981"];
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ display: "flex", gap: 3, marginBottom: 4 }}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 3,
              borderRadius: 2,
              background: score >= i ? colors[score] : "rgba(255,255,255,0.1)",
              transition: "background 0.2s",
            }}
          />
        ))}
      </div>
      <span style={{ fontSize: 10, fontWeight: 600, color: colors[score] }}>
        {labels[score]}
      </span>
    </div>
  );
}

// ── Field component ───────────────────────────────────────────────────────────
function Field({ label, required, error, children, span }) {
  return (
    <div style={{ gridColumn: span === 2 ? "1/-1" : undefined }}>
      <label
        style={{
          display: "block",
          fontSize: 11,
          fontWeight: 600,
          color: "rgba(255,255,255,0.5)",
          marginBottom: 5,
          letterSpacing: "0.04em",
        }}
      >
        {label}
        {required && <span style={{ color: "#f87171", marginLeft: 2 }}>*</span>}
      </label>
      {children}
      {error && (
        <div
          style={{
            fontSize: 11,
            color: "#f87171",
            marginTop: 4,
            fontWeight: 500,
          }}
        >
          ⚠ {error}
        </div>
      )}
    </div>
  );
}

// ── Step indicator ────────────────────────────────────────────────────────────
function StepBar({ current, total, color }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 6,
        marginBottom: 20,
        alignItems: "center",
      }}
    >
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: 3,
            borderRadius: 2,
            background: i < current ? color : "rgba(255,255,255,0.1)",
            transition: "background 0.3s",
          }}
        />
      ))}
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: "rgba(255,255,255,0.3)",
          whiteSpace: "nowrap",
          marginLeft: 6,
        }}
      >
        {current}/{total}
      </span>
    </div>
  );
}

// ── Registration Modal ────────────────────────────────────────────────────────
function RegistrationModal({ plan, yearly, onClose, onSuccess }) {
  const totalSteps = plan.paid ? 3 : 2; // 1=org+admin, 2=members(+enterprise), 3=billing(paid only)
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showCPw, setShowCPw] = useState(false);
  const [members, setMembers] = useState([]);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    orgName: "",
    industry: "",
    orgSize: "",
    adminName: "",
    adminEmail: "",
    adminPhone: "",
    password: "",
    confirmPw: "",
    // enterprise
    companySize: "",
    deployment: "Cloud (SaaS)",
    requirements: "",
    // billing
    cardName: "",
    cardNum: "",
    expiry: "",
    cvv: "",
  });

  function set(k, v) {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: "" }));
  }

  function validate() {
    const e = {};
    if (step === 1) {
      if (!form.orgName.trim()) e.orgName = "Organisation name is required";
      if (!form.adminName.trim()) e.adminName = "Your name is required";
      if (!form.adminEmail.trim() || !/\S+@\S+\.\S+/.test(form.adminEmail))
        e.adminEmail = "Valid email required";
      if (form.password.length < 8) e.password = "Minimum 8 characters";
      if (form.password !== form.confirmPw)
        e.confirmPw = "Passwords do not match";
    }
    if (step === 3 && plan.paid) {
      if (!form.cardName.trim()) e.cardName = "Cardholder name required";
      if (form.cardNum.replace(/\s/g, "").length < 16)
        e.cardNum = "Enter a valid 16-digit card number";
      if (!form.expiry.trim()) e.expiry = "Required";
      if (!form.cvv.trim() || form.cvv.length < 3) e.cvv = "Required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function next() {
    if (!validate()) return;
    if (step < totalSteps) {
      setStep((s) => s + 1);
      return;
    }
    submit();
  }

  async function submit() {
    setLoading(true);
    // TODO: replace with real API call
    // await api.post('/api/register', { plan: plan.id, yearly, ...form, members });
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    onSuccess({ plan, form, members, yearly });
  }

  function addMember() {
    if (!plan.enterprise && members.length >= plan.maxMembers) return;
    setMembers((p) => [...p, { id: Date.now(), email: "", role: "Staff" }]);
  }
  function removeMember(id) {
    setMembers((p) => p.filter((m) => m.id !== id));
  }
  function updateMember(id, k, v) {
    setMembers((p) => p.map((m) => (m.id === id ? { ...m, [k]: v } : m)));
  }

  const slotsLeft = plan.maxMembers - members.length;
  const priceStr = plan.enterprise
    ? "Custom"
    : plan.paid
      ? `${yearly ? plan.price.yearly : plan.price.monthly}/mo`
      : "Free forever";

  // pill gradient per plan
  const pillBg = {
    starter: "rgba(100,116,139,0.2)",
    professional: "rgba(37,99,235,0.2)",
    enterprise: "rgba(124,58,237,0.2)",
  }[plan.id];
  const pillColor = {
    starter: "#94a3b8",
    professional: "#60a5fa",
    enterprise: "#a78bfa",
  }[plan.id];
  const pillBorder = {
    starter: "rgba(100,116,139,0.3)",
    professional: "rgba(37,99,235,0.4)",
    enterprise: "rgba(124,58,237,0.4)",
  }[plan.id];

  const stepTitles = {
    1: plan.enterprise
      ? "Tell us about your organisation"
      : "Create your account",
    2: "Invite team members",
    3: "Payment details",
  };
  const stepSubtitles = {
    1: plan.enterprise
      ? "Our sales team will reach out within 24 hours."
      : plan.paid
        ? "14-day free trial — no charge today."
        : "Get started in under 2 minutes.",
    2: plan.enterprise
      ? "No user limit — add as many as needed."
      : `${plan.name} supports up to ${plan.maxUsers} users including you.`,
    3: "Your trial starts now. We'll only charge after 14 days.",
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 500,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.72)",
        backdropFilter: "blur(10px)",
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 560,
          maxHeight: "92vh",
          overflowY: "auto",
          background: "rgba(5,10,25,0.98)",
          backdropFilter: "blur(30px)",
          border: `1px solid ${plan.color}44`,
          borderRadius: 20,
          padding: "28px 30px",
          boxShadow: `0 60px 120px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04)`,
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 18,
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 22,
            color: "rgba(255,255,255,0.3)",
            padding: 0,
            lineHeight: 1,
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "rgba(255,255,255,0.3)")
          }
        >
          ×
        </button>

        {/* Plan pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <span
            style={{
              padding: "4px 12px",
              borderRadius: 99,
              background: pillBg,
              color: pillColor,
              border: `1px solid ${pillBorder}`,
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {plan.name} · {priceStr}
          </span>
        </div>

        {/* Step bar */}
        <StepBar current={step} total={totalSteps} color={plan.color} />

        {/* Title */}
        <div style={{ marginBottom: 22 }}>
          <h2
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: "#fff",
              margin: "0 0 5px",
              letterSpacing: -0.3,
            }}
          >
            {stepTitles[step]}
          </h2>
          <p
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.45)",
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            {stepSubtitles[step]}
          </p>
        </div>

        {/* ── STEP 1: Org + Admin ── */}
        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Org section */}
            <div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "rgba(255,255,255,0.3)",
                  marginBottom: 10,
                }}
              >
                Organisation
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <Field
                  label="Organisation name"
                  required
                  error={errors.orgName}
                  span={2}
                >
                  <input
                    style={IS}
                    placeholder="Acme Corp"
                    value={form.orgName}
                    onChange={(e) => set("orgName", e.target.value)}
                    onFocus={focusIn}
                    onBlur={focusOut}
                  />
                </Field>
                <Field label="Industry">
                  <select
                    style={{ ...IS, cursor: "pointer" }}
                    value={form.industry}
                    onChange={(e) => set("industry", e.target.value)}
                    onFocus={focusIn}
                    onBlur={focusOut}
                  >
                    <option value="">Select industry…</option>
                    {INDUSTRIES.map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Organisation size">
                  <select
                    style={{ ...IS, cursor: "pointer" }}
                    value={form.orgSize}
                    onChange={(e) => set("orgSize", e.target.value)}
                    onFocus={focusIn}
                    onBlur={focusOut}
                  >
                    <option value="">Select size…</option>
                    {ORG_SIZES.map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </Field>
              </div>
            </div>

            {/* Admin section */}
            <div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "rgba(255,255,255,0.3)",
                  marginBottom: 10,
                }}
              >
                Admin account
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <Field label="Full name" required error={errors.adminName}>
                  <input
                    style={IS}
                    placeholder="Priya Sharma"
                    value={form.adminName}
                    onChange={(e) => set("adminName", e.target.value)}
                    onFocus={focusIn}
                    onBlur={focusOut}
                  />
                </Field>
                <Field label="Work email" required error={errors.adminEmail}>
                  <input
                    type="email"
                    style={IS}
                    placeholder="priya@acme.com"
                    value={form.adminEmail}
                    onChange={(e) => set("adminEmail", e.target.value)}
                    onFocus={focusIn}
                    onBlur={focusOut}
                  />
                </Field>
                <Field label="Password" required error={errors.password}>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPw ? "text" : "password"}
                      style={{ ...IS, paddingRight: 38 }}
                      placeholder="Min 8 characters"
                      value={form.password}
                      onChange={(e) => set("password", e.target.value)}
                      onFocus={focusIn}
                      onBlur={focusOut}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((p) => !p)}
                      style={{
                        position: "absolute",
                        right: 10,
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "rgba(255,255,255,0.35)",
                        padding: 0,
                        fontSize: 13,
                      }}
                    >
                      {showPw ? "🙈" : "👁"}
                    </button>
                  </div>
                  <StrengthBar pw={form.password} />
                </Field>
                <Field
                  label="Confirm password"
                  required
                  error={errors.confirmPw}
                >
                  <div style={{ position: "relative" }}>
                    <input
                      type={showCPw ? "text" : "password"}
                      style={{
                        ...IS,
                        paddingRight: 38,
                        borderColor:
                          form.confirmPw && form.confirmPw !== form.password
                            ? "rgba(239,68,68,0.5)"
                            : "rgba(255,255,255,0.12)",
                      }}
                      placeholder="Repeat password"
                      value={form.confirmPw}
                      onChange={(e) => set("confirmPw", e.target.value)}
                      onFocus={focusIn}
                      onBlur={focusOut}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCPw((p) => !p)}
                      style={{
                        position: "absolute",
                        right: 10,
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "rgba(255,255,255,0.35)",
                        padding: 0,
                        fontSize: 13,
                      }}
                    >
                      {showCPw ? "🙈" : "👁"}
                    </button>
                  </div>
                  {form.confirmPw && form.confirmPw === form.password && (
                    <div
                      style={{
                        fontSize: 10,
                        color: "#10b981",
                        marginTop: 4,
                        fontWeight: 600,
                      }}
                    >
                      ✓ Passwords match
                    </div>
                  )}
                </Field>
                <Field label="Phone number" span={2}>
                  <input
                    type="tel"
                    style={IS}
                    placeholder="+91 98765 43210 (optional)"
                    value={form.adminPhone}
                    onChange={(e) => set("adminPhone", e.target.value)}
                    onFocus={focusIn}
                    onBlur={focusOut}
                  />
                </Field>
              </div>
            </div>

            {/* Enterprise extra fields on step 1 */}
            {plan.enterprise && (
              <div>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "rgba(255,255,255,0.3)",
                    marginBottom: 10,
                  }}
                >
                  Enterprise details
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                  }}
                >
                  <Field label="Company headcount">
                    <select
                      style={{ ...IS, cursor: "pointer" }}
                      value={form.companySize}
                      onChange={(e) => set("companySize", e.target.value)}
                      onFocus={focusIn}
                      onBlur={focusOut}
                    >
                      <option value="">Select…</option>
                      {["50–200", "200–500", "500–2000", "2000+"].map((o) => (
                        <option key={o}>{o}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Preferred deployment">
                    <select
                      style={{ ...IS, cursor: "pointer" }}
                      value={form.deployment}
                      onChange={(e) => set("deployment", e.target.value)}
                      onFocus={focusIn}
                      onBlur={focusOut}
                    >
                      {DEPLOYMENTS.map((o) => (
                        <option key={o}>{o}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Requirements / notes" span={2}>
                    <textarea
                      style={{
                        ...IS,
                        resize: "none",
                        height: 80,
                        lineHeight: 1.6,
                      }}
                      placeholder="Tell us about your specific needs, integrations, compliance…"
                      value={form.requirements}
                      onChange={(e) => set("requirements", e.target.value)}
                      onFocus={focusIn}
                      onBlur={focusOut}
                    />
                  </Field>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 2: Team members ── */}
        {step === 2 && (
          <div>
            {/* Role guide */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: 8,
                marginBottom: 18,
              }}
            >
              {[
                ["Admin", "Manage everything", "#3b82f6"],
                ["Staff", "Add & edit records", "#10b981"],
                ["Viewer", "Read-only access", "#f59e0b"],
              ].map(([r, d, c]) => (
                <div
                  key={r}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 9,
                    padding: "10px 12px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: c,
                      marginBottom: 3,
                    }}
                  >
                    {r}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "rgba(255,255,255,0.4)",
                      lineHeight: 1.5,
                    }}
                  >
                    {d}
                  </div>
                </div>
              ))}
            </div>

            {/* Slots info */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 10,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.5)",
                }}
              >
                {members.length} member{members.length !== 1 ? "s" : ""} added
              </span>
              {!plan.enterprise && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "3px 10px",
                    borderRadius: 99,
                    background:
                      slotsLeft <= 0
                        ? "rgba(239,68,68,0.12)"
                        : "rgba(255,255,255,0.06)",
                    color: slotsLeft <= 0 ? "#f87171" : "rgba(255,255,255,0.4)",
                    border: `1px solid ${slotsLeft <= 0 ? "rgba(239,68,68,0.25)" : "rgba(255,255,255,0.08)"}`,
                  }}
                >
                  {slotsLeft <= 0
                    ? "Limit reached"
                    : `${slotsLeft} slot${slotsLeft !== 1 ? "s" : ""} left`}
                </span>
              )}
            </div>

            {/* Member rows */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                marginBottom: 10,
              }}
            >
              {members.map((m, idx) => (
                <div
                  key={m.id}
                  style={{ display: "flex", gap: 8, alignItems: "center" }}
                >
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.08)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 10,
                      fontWeight: 700,
                      color: "rgba(255,255,255,0.4)",
                      flexShrink: 0,
                    }}
                  >
                    {idx + 1}
                  </div>
                  <input
                    type="email"
                    style={{ ...IS, flex: 1 }}
                    placeholder="colleague@example.com"
                    value={m.email}
                    onChange={(e) =>
                      updateMember(m.id, "email", e.target.value)
                    }
                    onFocus={focusIn}
                    onBlur={focusOut}
                  />
                  <select
                    style={{ ...IS, width: 110, flexShrink: 0 }}
                    value={m.role}
                    onChange={(e) => updateMember(m.id, "role", e.target.value)}
                    onFocus={focusIn}
                    onBlur={focusOut}
                  >
                    {ROLES.map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => removeMember(m.id)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "rgba(255,255,255,0.25)",
                      fontSize: 20,
                      padding: "2px 4px",
                      lineHeight: 1,
                      flexShrink: 0,
                      transition: "color 0.15s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "#ef4444")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "rgba(255,255,255,0.25)")
                    }
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={addMember}
              disabled={!plan.enterprise && slotsLeft <= 0}
              style={{
                width: "100%",
                padding: "9px",
                borderRadius: 8,
                border: "1.5px dashed rgba(255,255,255,0.15)",
                background: "transparent",
                color: "rgba(255,255,255,0.45)",
                fontSize: 13,
                cursor:
                  !plan.enterprise && slotsLeft <= 0
                    ? "not-allowed"
                    : "pointer",
                marginBottom: 12,
                opacity: !plan.enterprise && slotsLeft <= 0 ? 0.4 : 1,
                transition: "border-color 0.15s, color 0.15s",
              }}
              onMouseEnter={(e) => {
                if (plan.enterprise || slotsLeft > 0) {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)";
                  e.currentTarget.style.color = "rgba(255,255,255,0.7)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
                e.currentTarget.style.color = "rgba(255,255,255,0.45)";
              }}
            >
              + Add member{" "}
              {!plan.enterprise &&
                `(${slotsLeft} slot${slotsLeft !== 1 ? "s" : ""} remaining)`}
            </button>

            {!plan.enterprise && slotsLeft <= 0 && (
              <div
                style={{
                  fontSize: 12,
                  color: "#fbbf24",
                  background: "rgba(251,191,36,0.08)",
                  border: "1px solid rgba(251,191,36,0.2)",
                  borderRadius: 8,
                  padding: "8px 12px",
                  marginBottom: 10,
                }}
              >
                ⚠ You've reached the {plan.maxMembers}-member limit. You can add
                more after upgrading your plan.
              </div>
            )}

            <div
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.25)",
                lineHeight: 1.7,
              }}
            >
              Invitation emails will be sent after your account is created. You
              can also invite team members later from{" "}
              <strong style={{ color: "rgba(255,255,255,0.4)" }}>
                Settings → Users
              </strong>
              .
            </div>
          </div>
        )}

        {/* ── STEP 3: Billing (Professional only) ── */}
        {step === 3 && plan.paid && (
          <div>
            {/* Trial badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "rgba(16,185,129,0.1)",
                border: "1px solid rgba(16,185,129,0.2)",
                borderRadius: 99,
                padding: "5px 14px",
                fontSize: 12,
                fontWeight: 600,
                color: "#34d399",
                marginBottom: 18,
              }}
            >
              🔒 14-day free trial — ₹0 charged today
            </div>

            {/* Order summary */}
            <div
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12,
                padding: "14px 18px",
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "rgba(255,255,255,0.3)",
                  marginBottom: 12,
                }}
              >
                Order summary
              </div>
              {[
                ["Plan", "Professional"],
                ["Billing cycle", yearly ? "Annual (save 25%)" : "Monthly"],
                [
                  "Price after trial",
                  `${yearly ? plan.price.yearly : plan.price.monthly}/month`,
                ],
                [
                  "Trial ends",
                  new Date(Date.now() + 14 * 86400000).toLocaleDateString(
                    "en-IN",
                    { day: "numeric", month: "long", year: "numeric" },
                  ),
                ],
              ].map(([k, v]) => (
                <div
                  key={k}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 13,
                    padding: "5px 0",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <span style={{ color: "rgba(255,255,255,0.4)" }}>{k}</span>
                  <span style={{ fontWeight: 600, color: "#fff" }}>{v}</span>
                </div>
              ))}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 15,
                  paddingTop: 10,
                  marginTop: 4,
                }}
              >
                <span
                  style={{ color: "rgba(255,255,255,0.5)", fontWeight: 600 }}
                >
                  Due today
                </span>
                <span style={{ fontWeight: 900, color: "#10b981" }}>₹0</span>
              </div>
            </div>

            {/* Card fields */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              <Field
                label="Cardholder name"
                required
                error={errors.cardName}
                span={2}
              >
                <input
                  style={IS}
                  placeholder="Name on card"
                  value={form.cardName}
                  onChange={(e) => set("cardName", e.target.value)}
                  onFocus={focusIn}
                  onBlur={focusOut}
                />
              </Field>
              <Field
                label="Card number"
                required
                error={errors.cardNum}
                span={2}
              >
                <input
                  style={IS}
                  placeholder="•••• •••• •••• ••••"
                  maxLength={19}
                  value={form.cardNum}
                  onChange={(e) =>
                    set(
                      "cardNum",
                      e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 16)
                        .replace(/(.{4})/g, "$1 ")
                        .trim(),
                    )
                  }
                  onFocus={focusIn}
                  onBlur={focusOut}
                />
              </Field>
              <Field label="Expiry" required error={errors.expiry}>
                <input
                  style={IS}
                  placeholder="MM/YY"
                  maxLength={5}
                  value={form.expiry}
                  onChange={(e) => {
                    const d = e.target.value.replace(/\D/g, "").slice(0, 4);
                    set(
                      "expiry",
                      d.length > 2 ? d.slice(0, 2) + "/" + d.slice(2) : d,
                    );
                  }}
                  onFocus={focusIn}
                  onBlur={focusOut}
                />
              </Field>
              <Field label="CVV" required error={errors.cvv}>
                <input
                  type="password"
                  style={IS}
                  placeholder="•••"
                  maxLength={4}
                  value={form.cvv}
                  onChange={(e) =>
                    set("cvv", e.target.value.replace(/\D/g, ""))
                  }
                  onFocus={focusIn}
                  onBlur={focusOut}
                />
              </Field>
            </div>

            <div
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.2)",
                marginTop: 14,
                lineHeight: 1.7,
              }}
            >
              🔒 Payments are encrypted and processed securely. Your card
              details are never stored on our servers. Cancel any time before
              day 15 to avoid charges.
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
          {step > 1 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              style={{
                padding: "10px 20px",
                borderRadius: 9,
                cursor: "pointer",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.7)",
                fontSize: 13,
                fontWeight: 600,
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.1)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.06)")
              }
            >
              ← Back
            </button>
          )}
          <button
            onClick={next}
            disabled={loading}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: 9,
              cursor: loading ? "not-allowed" : "pointer",
              border: "none",
              background: loading
                ? "rgba(37,99,235,0.5)"
                : step === totalSteps
                  ? "linear-gradient(135deg,#16a34a,#15803d)"
                  : plan.gradient,
              color: "#fff",
              fontWeight: 700,
              fontSize: 14,
              boxShadow: loading ? "none" : "0 4px 18px rgba(0,0,0,0.3)",
              transition: "opacity 0.15s",
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.opacity = "0.88";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
            }}
          >
            {loading
              ? "Creating account…"
              : step < totalSteps
                ? step === 1
                  ? "Continue →"
                  : step === 2 && plan.paid
                    ? "Continue to Payment →"
                    : "Create Account →"
                : plan.enterprise
                  ? "Send Enquiry"
                  : plan.paid
                    ? "Start Free Trial"
                    : "Create Free Account"}
          </button>
        </div>

        {step === 1 && (
          <p
            style={{
              textAlign: "center",
              marginTop: 14,
              fontSize: 11,
              color: "rgba(255,255,255,0.22)",
              lineHeight: 1.6,
            }}
          >
            By continuing you agree to our{" "}
            <span style={{ color: "#4B9FFF", cursor: "pointer" }}>
              Terms of Service
            </span>{" "}
            and{" "}
            <span style={{ color: "#4B9FFF", cursor: "pointer" }}>
              Privacy Policy
            </span>
            .
          </p>
        )}
      </div>
    </div>
  );
}

// ── Success Screen ────────────────────────────────────────────────────────────
function SuccessScreen({ plan, form, members, yearly, onClose }) {
  const navigate = useNavigate();
  const priceStr = plan.enterprise
    ? "Sales will contact you"
    : plan.paid
      ? `${yearly ? plan.price.yearly : plan.price.monthly}/mo`
      : "Free forever";
  const pillBg = {
    starter: "rgba(100,116,139,0.2)",
    professional: "rgba(37,99,235,0.2)",
    enterprise: "rgba(124,58,237,0.2)",
  }[plan.id];
  const pillColor = {
    starter: "#94a3b8",
    professional: "#60a5fa",
    enterprise: "#a78bfa",
  }[plan.id];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 500,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(12px)",
        padding: 16,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          background: "rgba(5,10,25,0.98)",
          border: `1px solid ${plan.color}55`,
          borderRadius: 20,
          padding: "36px 32px",
          boxShadow: "0 60px 120px rgba(0,0,0,0.8)",
          textAlign: "center",
        }}
      >
        {/* Success animation */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "rgba(16,185,129,0.12)",
            border: "2px solid rgba(16,185,129,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 32,
            margin: "0 auto 20px",
          }}
        >
          🎉
        </div>

        <h2
          style={{
            fontSize: 24,
            fontWeight: 800,
            color: "#fff",
            margin: "0 0 8px",
            letterSpacing: -0.3,
          }}
        >
          You're all set!
        </h2>
        <p
          style={{
            fontSize: 14,
            color: "rgba(255,255,255,0.5)",
            margin: "0 0 24px",
            lineHeight: 1.7,
          }}
        >
          Your organisation{" "}
          <strong style={{ color: "#fff" }}>{form.orgName}</strong> has been
          created.
          <br />
          Check <strong style={{ color: "#4B9FFF" }}>
            {form.adminEmail}
          </strong>{" "}
          to verify your account.
        </p>

        {/* Plan summary */}
        <div
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 14,
            padding: "16px 20px",
            textAlign: "left",
            marginBottom: 18,
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "rgba(255,255,255,0.3)",
              marginBottom: 12,
            }}
          >
            Account summary
          </div>
          {[
            [
              "Plan",
              <span
                style={{
                  padding: "2px 10px",
                  borderRadius: 99,
                  background: pillBg,
                  color: pillColor,
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                {plan.name}
              </span>,
            ],
            ["Organisation", form.orgName],
            ["Admin", form.adminName],
            ["Email", form.adminEmail],
            ["Pricing", priceStr],
            [
              "Team members",
              members.length > 0
                ? `${members.length} invite${members.length !== 1 ? "s" : ""} queued`
                : "None (invite from dashboard)",
            ],
          ].map(([k, v]) => (
            <div
              key={k}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "7px 0",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                fontSize: 13,
              }}
            >
              <span style={{ color: "rgba(255,255,255,0.4)" }}>{k}</span>
              <span
                style={{
                  fontWeight: 600,
                  color: "#fff",
                  maxWidth: 280,
                  textAlign: "right",
                }}
              >
                {v}
              </span>
            </div>
          ))}
        </div>

        {/* What's next */}
        <div
          style={{
            background: "rgba(37,99,235,0.07)",
            border: "1px solid rgba(37,99,235,0.18)",
            borderRadius: 12,
            padding: "14px 18px",
            textAlign: "left",
            marginBottom: 22,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#4B9FFF",
              marginBottom: 10,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            What's next
          </div>
          {[
            "Verify your email to activate your account",
            "Log in and create your first module",
            "Invite your team from Settings → Users",
            plan.paid
              ? "Your 14-day free trial has started"
              : "Upgrade anytime from Settings → Billing",
          ].map((t, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 8,
                marginBottom: 8,
                fontSize: 13,
                color: "rgba(255,255,255,0.6)",
              }}
            >
              <span
                style={{
                  color: "#10b981",
                  fontWeight: 700,
                  flexShrink: 0,
                  marginTop: 1,
                }}
              >
                {i + 1}.
              </span>
              {t}
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate("/login")}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: 10,
            border: "none",
            background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
            color: "#fff",
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
            boxShadow: "0 6px 20px rgba(37,99,235,0.4)",
          }}
        >
          Go to Login →
        </button>
      </div>
    </div>
  );
}

// ── Trust badges ──────────────────────────────────────────────────────────────
const TRUST = [
  [
    "🔒",
    "Secure payments",
    "PCI-DSS compliant processing. Card data never stored on our servers.",
  ],
  [
    "↩",
    "Cancel anytime",
    "No lock-in. Cancel from account settings at any time, no questions asked.",
  ],
  [
    "🎁",
    "14-day free trial",
    "Full-featured trial for Professional. No charge until day 15.",
  ],
];

// ── FAQ ───────────────────────────────────────────────────────────────────────
const FAQS = [
  [
    "Can I switch plans later?",
    "Yes — upgrade or downgrade at any time from Settings → Billing. Prorated credits are applied automatically.",
  ],
  [
    "What happens after the free trial?",
    "You'll receive an email reminder before day 15. If no cancellation, the first payment is charged on day 15.",
  ],
  [
    "Is there a per-user fee?",
    "No. Your plan price is flat — no per-user charges. The only limit is the total user count per plan.",
  ],
  [
    "Do you offer non-profit or educational discounts?",
    "Yes. Contact our sales team with proof of eligibility and we'll apply a 30% discount.",
  ],
];

// ── Main PricingPage ──────────────────────────────────────────────────────────
export default function PricingPage() {
  const navigate = useNavigate();
  const [yearly, setYearly] = useState(false);
  const [activePlan, setActivePlan] = useState(null);
  const [successData, setSuccessData] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);

  function handleSuccess(data) {
    setActivePlan(null);
    setSuccessData(data);
  }

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

      {/* Modals */}
      {activePlan && !successData && (
        <RegistrationModal
          plan={PLANS.find((p) => p.id === activePlan)}
          yearly={yearly}
          onClose={() => setActivePlan(null)}
          onSuccess={handleSuccess}
        />
      )}
      {successData && (
        <SuccessScreen {...successData} onClose={() => setSuccessData(null)} />
      )}

      {/* ── Hero ── */}
      <div style={{ textAlign: "center", padding: "88px 48px 56px" }}>
        <div
          style={{
            display: "inline-block",
            padding: "6px 18px",
            borderRadius: 20,
            background: "rgba(5,150,105,0.15)",
            border: "1px solid rgba(5,150,105,0.3)",
            fontSize: 12,
            fontWeight: 700,
            color: "#34d399",
            marginBottom: 22,
            letterSpacing: 1,
          }}
        >
          SIMPLE PRICING
        </div>
        <h1
          style={{
            fontSize: 54,
            fontWeight: 900,
            margin: "0 0 16px",
            letterSpacing: -1.5,
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
            color: "rgba(255,255,255,0.5)",
            maxWidth: 440,
            margin: "0 auto 36px",
            lineHeight: 1.7,
          }}
        >
          No hidden fees. No per-module charges. Straightforward pricing that
          scales with your team.
        </p>

        {/* Billing toggle */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 99,
            padding: "5px 6px",
          }}
        >
          <button
            onClick={() => setYearly(false)}
            style={{
              padding: "7px 20px",
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
              padding: "7px 20px",
              borderRadius: 99,
              border: "none",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
              background: yearly ? "#2563eb" : "transparent",
              color: "#fff",
              transition: "background 0.2s",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            Annual
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                background: "#059669",
                padding: "2px 8px",
                borderRadius: 99,
              }}
            >
              Save 25%
            </span>
          </button>
        </div>
      </div>

      {/* ── Plan cards ── */}
      <div
        style={{
          maxWidth: 1020,
          margin: "0 auto",
          padding: "0 48px 80px",
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 22,
          alignItems: "start",
        }}
      >
        {PLANS.map((p) => (
          <div
            key={p.id}
            style={{
              background: p.highlight ? p.accentBg : "rgba(255,255,255,0.025)",
              border: `1.5px solid ${p.highlight ? p.accentBorder : "rgba(255,255,255,0.07)"}`,
              borderRadius: 20,
              padding: "32px 28px",
              position: "relative",
              transform: p.highlight ? "scale(1.04)" : "scale(1)",
              transition: "transform 0.2s, box-shadow 0.2s, border-color 0.2s",
              boxShadow: p.highlight
                ? `0 20px 60px rgba(37,99,235,0.15)`
                : "none",
            }}
            onMouseEnter={(e) => {
              if (!p.highlight) {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)";
                e.currentTarget.style.boxShadow = "0 10px 40px rgba(0,0,0,0.3)";
              }
            }}
            onMouseLeave={(e) => {
              if (!p.highlight) {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
                e.currentTarget.style.boxShadow = "none";
              }
            }}
          >
            {p.highlight && (
              <div
                style={{
                  position: "absolute",
                  top: -14,
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "#2563eb",
                  padding: "5px 18px",
                  borderRadius: 99,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 1,
                  whiteSpace: "nowrap",
                  boxShadow: "0 4px 16px rgba(37,99,235,0.5)",
                }}
              >
                MOST POPULAR
              </div>
            )}

            {/* Tier */}
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: p.color,
                letterSpacing: 1.2,
                marginBottom: 10,
              }}
            >
              {p.tier}
            </div>

            {/* Price */}
            <div
              style={{
                fontSize: 42,
                fontWeight: 900,
                lineHeight: 1,
                marginBottom: 4,
              }}
            >
              {yearly ? p.price.yearly : p.price.monthly}
              {p.period !== "forever" && p.period !== "pricing" && (
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
              {(p.period === "forever" || p.period === "pricing") && (
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 400,
                    color: "rgba(255,255,255,0.4)",
                    marginLeft: 4,
                  }}
                >
                  {p.period}
                </span>
              )}
            </div>

            {/* Annual savings */}
            {yearly && p.paid && (
              <div
                style={{
                  fontSize: 11,
                  color: "#34d399",
                  fontWeight: 600,
                  marginBottom: 6,
                }}
              >
                Save ₹{(p.priceNum.monthly - p.priceNum.yearly) * 12}/year
              </div>
            )}

            <p
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.5)",
                margin: "0 0 20px",
                lineHeight: 1.6,
              }}
            >
              {p.desc}
            </p>

            {/* CTA */}
            <button
              onClick={() => setActivePlan(p.id)}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 700,
                background: p.highlight ? p.gradient : "rgba(255,255,255,0.07)",
                color: "#fff",
                marginBottom: 20,
                boxShadow: p.highlight
                  ? "0 4px 20px rgba(37,99,235,0.4)"
                  : "none",
                transition: "opacity 0.15s, background 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "0.88";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "1";
              }}
            >
              {p.cta}
            </button>

            {/* Usage badges */}
            <div
              style={{
                display: "flex",
                gap: 5,
                flexWrap: "wrap",
                marginBottom: 18,
              }}
            >
              {[
                p.id === "starter"
                  ? "3 users"
                  : p.id === "professional"
                    ? "25 users"
                    : "Unlimited users",
                p.id === "starter"
                  ? "1K records"
                  : p.id === "professional"
                    ? "100K records"
                    : "∞ records",
                p.id === "starter" ? "5 modules" : "Unlimited modules",
              ].map((badge) => (
                <span
                  key={badge}
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "3px 8px",
                    borderRadius: 99,
                    background: "rgba(255,255,255,0.06)",
                    color: "rgba(255,255,255,0.45)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  {badge}
                </span>
              ))}
            </div>

            {/* Features */}
            <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {p.features.map((f) => (
                <li
                  key={f}
                  style={{
                    fontSize: 13,
                    color: "rgba(255,255,255,0.68)",
                    padding: "7px 0",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <span style={{ color: p.color, fontSize: 14, flexShrink: 0 }}>
                    ✓
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* ── Trust row ── */}
      <div
        style={{
          maxWidth: 900,
          margin: "0 auto 72px",
          padding: "0 48px",
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 18,
        }}
      >
        {TRUST.map(([icon, title, desc]) => (
          <div
            key={title}
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 14,
              padding: "20px 22px",
            }}
          >
            <div style={{ fontSize: 26, marginBottom: 10 }}>{icon}</div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "#fff",
                marginBottom: 6,
              }}
            >
              {title}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.4)",
                lineHeight: 1.7,
              }}
            >
              {desc}
            </div>
          </div>
        ))}
      </div>

      {/* ── FAQ ── */}
      <div style={{ maxWidth: 680, margin: "0 auto 88px", padding: "0 48px" }}>
        <h2
          style={{
            fontSize: 26,
            fontWeight: 800,
            color: "#fff",
            marginBottom: 28,
            textAlign: "center",
            letterSpacing: -0.5,
          }}
        >
          Frequently asked questions
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {FAQS.map(([q, a], i) => (
            <div
              key={i}
              style={{
                background: "rgba(255,255,255,0.03)",
                border: `1px solid ${openFaq === i ? "rgba(37,99,235,0.3)" : "rgba(255,255,255,0.07)"}`,
                borderRadius: 12,
                overflow: "hidden",
                transition: "border-color 0.2s",
              }}
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{
                  width: "100%",
                  padding: "16px 20px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16,
                  textAlign: "left",
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>
                  {q}
                </span>
                <span
                  style={{
                    fontSize: 18,
                    color: "rgba(255,255,255,0.35)",
                    flexShrink: 0,
                    transition: "transform 0.2s",
                    transform: openFaq === i ? "rotate(45deg)" : "rotate(0)",
                  }}
                >
                  +
                </span>
              </button>
              {openFaq === i && (
                <div
                  style={{
                    padding: "0 20px 16px",
                    fontSize: 13,
                    color: "rgba(255,255,255,0.5)",
                    lineHeight: 1.7,
                  }}
                >
                  {a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <BottomCTA navigate={navigate} />
    </div>
  );
}
