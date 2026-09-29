import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { saveCitizenSession } from "../../lib/session";
import logoSvg from "../../assets/logo.svg";

const PHONE_RE = /^\d{10}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function CitizenRegister() {
  const nav = useNavigate();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({
    fullName: "", phone: "", email: "", password: "", confirmPassword: "",
  });

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.fullName.trim() || !form.phone.trim() || !form.password) {
      setError("Please fill in your name, phone number, and password.");
      return;
    }
    if (!PHONE_RE.test(form.phone.trim())) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }
    if (form.email.trim() && !EMAIL_RE.test(form.email.trim())) {
      setError("Enter a valid email address, or leave it blank.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.signup({
        full_name: form.fullName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        password: form.password,
      });
      const citizen = res.citizen as {
        id: number; full_name: string; phone: string; email?: string; created_at?: string;
      };
      saveCitizenSession(citizen, res.token);
      nav("/citizen/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app-shell" style={{ background: "#f8fafc" }}>
      <header className="gov-header">
        <div className="gov-header-inner">
          <div className="gov-brand">
            <div className="gov-logo-box">
              <img src={logoSvg} alt="Sahayam" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </div>
            <span className="gov-title-text">SAHAYAM</span>
            <span className="gov-badge-official">Citizen Portal</span>
          </div>

          <Link to="/citizen/auth" className="btn btn-sm btn-secondary" style={{ background: "#ffffff", color: "#0f172a" }}>
            ← Back
          </Link>
        </div>
      </header>

      <main className="container-narrow" style={{ padding: "3rem 1rem" }}>
        <div className="gov-card" style={{ boxShadow: "var(--shadow-md)" }}>
          <div className="gov-card-header">
            <div>
              <h2 className="gov-card-title">📝 Create Citizen Account</h2>
              <p className="text-muted" style={{ fontSize: "0.85rem", marginTop: "0.2rem" }}>
                Your password is hashed and never stored in plain text.
              </p>
            </div>
          </div>

          <form onSubmit={onSubmit} noValidate>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                className="form-control"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                placeholder="Your full name"
                autoComplete="name"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input
                className="form-control"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="10-digit mobile number"
                autoComplete="tel"
                inputMode="numeric"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email (optional)</label>
              <input
                type="email"
                className="form-control"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password *</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Min 6 characters"
                  autoComplete="new-password"
                  style={{ paddingRight: "3.2rem" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  style={{
                    position: "absolute", right: "0.5rem", top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer", fontSize: "0.8rem",
                    color: "var(--text-muted)", fontWeight: 700, padding: "0.3rem 0.5rem",
                  }}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showConfirm ? "text" : "password"}
                  className="form-control"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  placeholder="Repeat password"
                  autoComplete="new-password"
                  style={{ paddingRight: "3.2rem" }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                  style={{
                    position: "absolute", right: "0.5rem", top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer", fontSize: "0.8rem",
                    color: "var(--text-muted)", fontWeight: 700, padding: "0.3rem 0.5rem",
                  }}
                >
                  {showConfirm ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ padding: "0.75rem", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "6px", color: "#b91c1c", fontSize: "0.88rem", marginBottom: "1rem" }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-block" style={{ padding: "0.75rem" }} disabled={submitting}>
              {submitting ? "Creating account…" : "Sign Up"}
            </button>
          </form>

          <p className="text-muted" style={{ marginTop: "1.25rem", marginBottom: 0, fontSize: "0.88rem", textAlign: "center" }}>
            Already have an account? <Link to="/citizen/login" style={{ color: "var(--gov-blue)", fontWeight: 700 }}>Sign in</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
