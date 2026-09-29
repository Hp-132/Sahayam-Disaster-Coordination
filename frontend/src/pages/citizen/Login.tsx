import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { saveCitizenSession } from "../../lib/session";
import logoSvg from "../../assets/logo.svg";

export default function CitizenLogin() {
  const nav = useNavigate();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!login.trim() || !password) {
      setError("Enter your phone/email and password.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.signin({ login: login.trim(), password });
      const citizen = res.citizen as {
        id: number; full_name: string; phone: string; email?: string; created_at?: string;
      };
      saveCitizenSession(citizen, res.token);
      nav("/citizen/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed. Please try again.");
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
              <h2 className="gov-card-title">🔑 Citizen Sign In</h2>
              <p className="text-muted" style={{ fontSize: "0.85rem", marginTop: "0.2rem" }}>
                Sign in with the phone or email you registered with.
              </p>
            </div>
          </div>

          <form onSubmit={onSubmit} noValidate>
            <div className="form-group">
              <label className="form-label">Phone or Email</label>
              <input
                type="text"
                className="form-control"
                autoComplete="username"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                placeholder="10-digit mobile or email address"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
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

            {error && (
              <div style={{ padding: "0.75rem", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "6px", color: "#b91c1c", fontSize: "0.88rem", marginBottom: "1rem" }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-block" style={{ padding: "0.75rem" }} disabled={submitting}>
              {submitting ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p className="text-muted" style={{ marginTop: "1.25rem", marginBottom: 0, fontSize: "0.88rem", textAlign: "center" }}>
            New here? <Link to="/citizen/register" style={{ color: "var(--gov-blue)", fontWeight: 700 }}>Create a citizen account</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
