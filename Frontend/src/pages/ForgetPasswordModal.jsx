import { useState, useRef, useEffect } from "react";
import { authApi } from "../api/authApi";

// ── Shared styles ─────────────────────────────────────────────────────────────
const inputBase = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 13px",
  borderRadius: 8,
  fontSize: 13,
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "#fff",
  outline: "none",
  transition: "border-color 0.2s, background 0.2s",
};
const labelStyle = {
  display: "block",
  fontSize: 12,
  fontWeight: 600,
  color: "rgba(255,255,255,0.6)",
  marginBottom: 6,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};
const primaryBtn = (disabled) => ({
  width: "100%",
  padding: "11px",
  borderRadius: 9,
  border: "none",
  cursor: disabled ? "not-allowed" : "pointer",
  background: disabled
    ? "rgba(37,99,235,0.4)"
    : "linear-gradient(135deg,#2563eb,#1d4ed8)",
  color: "#fff",
  fontWeight: 700,
  fontSize: 14,
  boxShadow: disabled ? "none" : "0 6px 20px rgba(37,99,235,0.4)",
  transition: "opacity 0.2s",
});
const ghostBtn = {
  width: "100%",
  marginTop: 10,
  padding: "10px",
  borderRadius: 9,
  cursor: "pointer",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "rgba(255,255,255,0.55)",
  fontSize: 13,
  fontWeight: 500,
};
const errorBox = {
  padding: "10px 13px",
  borderRadius: 8,
  marginBottom: 14,
  background: "rgba(239,68,68,0.1)",
  border: "1px solid rgba(239,68,68,0.25)",
  color: "#f87171",
  fontSize: 12,
  display: "flex",
  alignItems: "center",
  gap: 7,
};
const successBox = {
  padding: "10px 13px",
  borderRadius: 8,
  marginBottom: 14,
  background: "rgba(16,185,129,0.1)",
  border: "1px solid rgba(16,185,129,0.25)",
  color: "#34d399",
  fontSize: 12,
  display: "flex",
  alignItems: "center",
  gap: 7,
};

function EyeIcon({ visible }) {
  return visible ? (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function StepBar({ step }) {
  const labels = ["Email", "OTP", "New Password", "Done"];
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 26 }}>
      {labels.map((label, i) => {
        const s = i + 1;
        const active = step === s;
        const done = step > s;
        return (
          <div
            key={s}
            style={{
              display: "flex",
              alignItems: "center",
              flex: s < labels.length ? 1 : 0,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  fontSize: 12,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: done
                    ? "#16a34a"
                    : active
                      ? "linear-gradient(135deg,#2563eb,#1d4ed8)"
                      : "rgba(255,255,255,0.07)",
                  color: done || active ? "#fff" : "rgba(255,255,255,0.3)",
                  border:
                    done || active ? "none" : "1px solid rgba(255,255,255,0.1)",
                  transition: "all 0.3s",
                  boxShadow: active ? "0 0 12px rgba(37,99,235,0.5)" : "none",
                }}
              >
                {done ? "✓" : s}
              </div>
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                  color: active
                    ? "#4B9FFF"
                    : done
                      ? "#34d399"
                      : "rgba(255,255,255,0.25)",
                }}
              >
                {label}
              </span>
            </div>
            {s < labels.length && (
              <div
                style={{
                  flex: 1,
                  height: 2,
                  margin: "0 6px",
                  marginBottom: 18,
                  background: done ? "#16a34a" : "rgba(255,255,255,0.08)",
                  borderRadius: 1,
                  transition: "background 0.3s",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function StrengthBar({ password }) {
  if (!password) return null;
  const len = password.length;
  const score =
    (len >= 6 ? 1 : 0) +
    (len >= 10 ? 1 : 0) +
    (/[A-Z]/.test(password) ? 1 : 0) +
    (/[0-9]/.test(password) ? 1 : 0) +
    (/[^A-Za-z0-9]/.test(password) ? 1 : 0);
  const levels = [
    { min: 0, label: "Too short", color: "#ef4444" },
    { min: 1, label: "Weak", color: "#f97316" },
    { min: 2, label: "Fair", color: "#eab308" },
    { min: 3, label: "Good", color: "#3b82f6" },
    { min: 5, label: "Strong", color: "#10b981" },
  ];
  const level = [...levels].reverse().find((l) => score >= l.min) || levels[0];
  return (
    <div style={{ marginTop: 7 }}>
      <div style={{ display: "flex", gap: 3, marginBottom: 4 }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 3,
              borderRadius: 2,
              transition: "background 0.2s",
              background: score >= i ? level.color : "rgba(255,255,255,0.08)",
            }}
          />
        ))}
      </div>
      <span style={{ fontSize: 10, color: level.color, fontWeight: 600 }}>
        {level.label}
      </span>
    </div>
  );
}

function OtpInput({ value, onChange }) {
  const inputs = useRef([]);
  const digits = (value + "      ").slice(0, 6).split("");

  function handleKey(i, e) {
    if (e.key === "Backspace") {
      e.preventDefault();
      const next = value.slice(0, i) + " " + value.slice(i + 1);
      onChange(next.trimEnd());
      if (i > 0) inputs.current[i - 1]?.focus();
    } else if (e.key === "ArrowLeft" && i > 0) inputs.current[i - 1]?.focus();
    else if (e.key === "ArrowRight" && i < 5) inputs.current[i + 1]?.focus();
  }
  function handleChange(i, e) {
    const char = e.target.value.replace(/\D/g, "").slice(-1);
    if (!char) return;
    const arr = value.padEnd(6, " ").split("");
    arr[i] = char;
    onChange(arr.join("").trimEnd());
    if (i < 5) inputs.current[i + 1]?.focus();
  }
  function handlePaste(e) {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    onChange(pasted);
    inputs.current[Math.min(pasted.length, 5)]?.focus();
  }

  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        justifyContent: "center",
        margin: "20px 0",
      }}
    >
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => (inputs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d.trim()}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKey(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => {
            e.target.style.borderColor = "rgba(74,159,255,0.7)";
            e.target.style.background = "rgba(74,159,255,0.1)";
            e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.2)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = d.trim()
              ? "rgba(74,159,255,0.4)"
              : "rgba(255,255,255,0.12)";
            e.target.style.background = "rgba(255,255,255,0.06)";
            e.target.style.boxShadow = "none";
          }}
          style={{
            width: 46,
            height: 52,
            textAlign: "center",
            fontSize: 22,
            fontWeight: 800,
            borderRadius: 10,
            outline: "none",
            caretColor: "#4B9FFF",
            background: "rgba(255,255,255,0.06)",
            border: `2px solid ${d.trim() ? "rgba(74,159,255,0.4)" : "rgba(255,255,255,0.12)"}`,
            color: "#fff",
            transition: "all 0.15s",
            fontFamily: "'Courier New', monospace",
          }}
        />
      ))}
    </div>
  );
}

// ── Main modal ────────────────────────────────────────────────────────────────
export default function ForgotPasswordModal({ onClose }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (resendCooldown > 0) {
      timerRef.current = setTimeout(
        () => setResendCooldown((c) => c - 1),
        1000,
      );
    }
    return () => clearTimeout(timerRef.current);
  }, [resendCooldown]);

  function startCooldown() {
    setResendCooldown(60);
  }

  // ── Step 1: Send OTP ────────────────────────────────────────────────────────
  async function handleSendOtp(e) {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    setLoading(true);
    try {
      await authApi.forgotPassword(email.trim().toLowerCase());
      startCooldown();
      setStep(2);
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message;
      if (status === 404) {
        setError(
          `No account found with email "${email.trim()}". Please check and try again.`,
        );
      } else {
        setError(msg || "Failed to send OTP. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  // ── Resend OTP ──────────────────────────────────────────────────────────────
  async function handleResend() {
    if (resendCooldown > 0) return;
    setError("");
    setSuccessMsg("");
    setOtp("");
    setLoading(true);
    try {
      await authApi.forgotPassword(email.trim().toLowerCase());
      setSuccessMsg("New OTP sent! Check your inbox.");
      startCooldown();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend.");
    } finally {
      setLoading(false);
    }
  }

  // ── Step 2: Verify OTP ──────────────────────────────────────────────────────
  async function handleVerifyOtp(e) {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    if (otp.trim().length < 6) {
      setError("Please enter the complete 6-digit OTP.");
      return;
    }
    setLoading(true);
    try {
      await authApi.verifyOtp(email.trim().toLowerCase(), otp.trim());
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ── Step 3: Reset password ──────────────────────────────────────────────────
  async function handleResetPassword(e) {
    e.preventDefault();
    setError("");
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPassword(
        email.trim().toLowerCase(),
        otp.trim(),
        newPassword,
      );
      setStep(4);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  }

  const passwordsMatch = confirmPassword && confirmPassword === newPassword;
  const passwordsMismatch = confirmPassword && confirmPassword !== newPassword;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 500,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.8)",
        backdropFilter: "blur(8px)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 440,
          background: "rgba(6,12,30,0.99)",
          backdropFilter: "blur(30px)",
          border: "1px solid rgba(74,159,255,0.2)",
          borderRadius: 20,
          padding: "30px 30px 26px",
          boxShadow:
            "0 50px 120px rgba(0,0,0,0.8), 0 0 80px rgba(37,99,235,0.12)",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {step < 4 && (
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
              color: "rgba(255,255,255,0.35)",
              lineHeight: 1,
              padding: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "rgba(255,255,255,0.35)")
            }
          >
            ×
          </button>
        )}

        <StepBar step={step} />

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <div style={{ marginBottom: 22 }}>
              <h2
                style={{
                  fontSize: 19,
                  fontWeight: 800,
                  color: "#fff",
                  margin: "0 0 7px",
                }}
              >
                🔐 Forgot Password?
              </h2>
              <p
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.45)",
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                Enter your registered email. We'll send a 6-digit OTP to verify
                your identity.
              </p>
            </div>
            <form onSubmit={handleSendOtp}>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Email Address</label>
                <div style={{ position: "relative" }}>
                  <span
                    style={{
                      position: "absolute",
                      left: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "rgba(255,255,255,0.3)",
                      display: "flex",
                    }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="yourname@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    style={{ ...inputBase, paddingLeft: 36 }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "rgba(74,159,255,0.6)";
                      e.target.style.background = "rgba(255,255,255,0.08)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "rgba(255,255,255,0.12)";
                      e.target.style.background = "rgba(255,255,255,0.06)";
                    }}
                  />
                </div>
              </div>
              {error && (
                <div style={errorBox}>
                  <span>⚠</span>
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                style={primaryBtn(loading)}
              >
                {loading ? "Sending OTP…" : "Send OTP →"}
              </button>
              <button type="button" onClick={onClose} style={ghostBtn}>
                Cancel
              </button>
            </form>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <div style={{ marginBottom: 16 }}>
              <h2
                style={{
                  fontSize: 19,
                  fontWeight: 800,
                  color: "#fff",
                  margin: "0 0 7px",
                }}
              >
                📬 Enter OTP
              </h2>
              <p
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.45)",
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                We sent a 6-digit code to{" "}
                <span style={{ color: "#4B9FFF", fontWeight: 600 }}>
                  {email}
                </span>
                .<br />
                It expires in{" "}
                <span style={{ color: "#fbbf24", fontWeight: 600 }}>
                  5 minutes
                </span>
                .
              </p>
            </div>
            <form onSubmit={handleVerifyOtp}>
              <OtpInput
                value={otp}
                onChange={(v) => {
                  setOtp(v);
                  setError("");
                }}
              />
              {error && (
                <div style={{ ...errorBox, marginTop: -8 }}>
                  <span>⚠</span>
                  {error}
                </div>
              )}
              {successMsg && (
                <div style={{ ...successBox, marginTop: -8 }}>
                  <span>✓</span>
                  {successMsg}
                </div>
              )}
              <button
                type="submit"
                disabled={loading || otp.trim().length < 6}
                style={primaryBtn(loading || otp.trim().length < 6)}
              >
                {loading ? "Verifying…" : "Verify OTP →"}
              </button>
              <div style={{ textAlign: "center", marginTop: 14 }}>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
                  Didn't receive it?{" "}
                </span>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCooldown > 0}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: resendCooldown > 0 ? "not-allowed" : "pointer",
                    fontSize: 12,
                    fontWeight: 600,
                    color:
                      resendCooldown > 0 ? "rgba(255,255,255,0.2)" : "#4B9FFF",
                  }}
                >
                  {resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : "Resend OTP"}
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setError("");
                  setOtp("");
                }}
                style={ghostBtn}
              >
                ← Back
              </button>
            </form>
          </>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <>
            <div style={{ marginBottom: 22 }}>
              <h2
                style={{
                  fontSize: 19,
                  fontWeight: 800,
                  color: "#fff",
                  margin: "0 0 7px",
                }}
              >
                🔑 New Password
              </h2>
              <p
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.45)",
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                Choose a strong password for{" "}
                <span style={{ color: "#4B9FFF", fontWeight: 600 }}>
                  {email}
                </span>
                .
              </p>
            </div>
            <form onSubmit={handleResetPassword}>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>New Password</label>
                <div style={{ position: "relative" }}>
                  <span
                    style={{
                      position: "absolute",
                      left: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "rgba(255,255,255,0.3)",
                      display: "flex",
                    }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <input
                    type={showNew ? "text" : "password"}
                    required
                    placeholder="Min 6 characters"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setError("");
                    }}
                    style={{ ...inputBase, paddingLeft: 36, paddingRight: 38 }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "rgba(74,159,255,0.6)";
                      e.target.style.background = "rgba(255,255,255,0.08)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "rgba(255,255,255,0.12)";
                      e.target.style.background = "rgba(255,255,255,0.06)";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew((p) => !p)}
                    style={{
                      position: "absolute",
                      right: 11,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "rgba(255,255,255,0.4)",
                      padding: 0,
                      display: "flex",
                    }}
                  >
                    <EyeIcon visible={showNew} />
                  </button>
                </div>
                <StrengthBar password={newPassword} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Confirm Password</label>
                <div style={{ position: "relative" }}>
                  <span
                    style={{
                      position: "absolute",
                      left: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: passwordsMatch
                        ? "#10b981"
                        : "rgba(255,255,255,0.3)",
                      display: "flex",
                    }}
                  >
                    {passwordsMatch ? (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <rect
                          x="3"
                          y="11"
                          width="18"
                          height="11"
                          rx="2"
                          ry="2"
                        />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    )}
                  </span>
                  <input
                    type={showConfirm ? "text" : "password"}
                    required
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError("");
                    }}
                    style={{
                      ...inputBase,
                      paddingLeft: 36,
                      paddingRight: 38,
                      borderColor: passwordsMismatch
                        ? "rgba(239,68,68,0.5)"
                        : "rgba(255,255,255,0.12)",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "rgba(74,159,255,0.6)";
                      e.target.style.background = "rgba(255,255,255,0.08)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = passwordsMismatch
                        ? "rgba(239,68,68,0.5)"
                        : "rgba(255,255,255,0.12)";
                      e.target.style.background = "rgba(255,255,255,0.06)";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((p) => !p)}
                    style={{
                      position: "absolute",
                      right: 11,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "rgba(255,255,255,0.4)",
                      padding: 0,
                      display: "flex",
                    }}
                  >
                    <EyeIcon visible={showConfirm} />
                  </button>
                </div>
                {passwordsMismatch && (
                  <div style={{ fontSize: 11, color: "#f87171", marginTop: 5 }}>
                    ⚠ Passwords don't match
                  </div>
                )}
                {passwordsMatch && (
                  <div style={{ fontSize: 11, color: "#10b981", marginTop: 5 }}>
                    ✓ Passwords match
                  </div>
                )}
              </div>
              {error && (
                <div style={errorBox}>
                  <span>⚠</span>
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={
                  loading ||
                  newPassword.length < 6 ||
                  newPassword !== confirmPassword
                }
                style={{
                  ...primaryBtn(
                    loading ||
                      newPassword.length < 6 ||
                      newPassword !== confirmPassword,
                  ),
                  background:
                    !loading &&
                    newPassword.length >= 6 &&
                    newPassword === confirmPassword
                      ? "linear-gradient(135deg,#16a34a,#15803d)"
                      : "rgba(22,163,74,0.4)",
                  boxShadow:
                    !loading &&
                    newPassword.length >= 6 &&
                    newPassword === confirmPassword
                      ? "0 6px 20px rgba(22,163,74,0.35)"
                      : "none",
                }}
              >
                {loading ? "Resetting…" : "Reset Password"}
              </button>
            </form>
          </>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <div style={{ textAlign: "center", padding: "8px 0 4px" }}>
            <div style={{ fontSize: 60, marginBottom: 18 }}>🎉</div>
            <h2
              style={{
                fontSize: 20,
                fontWeight: 800,
                color: "#fff",
                margin: "0 0 10px",
              }}
            >
              Password Reset!
            </h2>
            <p
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.45)",
                lineHeight: 1.7,
                margin: "0 0 28px",
              }}
            >
              Your password has been successfully updated.
              <br />
              You can now log in with your new credentials.
            </p>
            <button
              onClick={onClose}
              style={{
                ...primaryBtn(false),
                background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
              }}
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
