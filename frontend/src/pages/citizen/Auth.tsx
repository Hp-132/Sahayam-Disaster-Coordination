import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { isCitizenAuthenticated } from "../../lib/session";
import logoSvg from "../../assets/logo.svg";

export default function CitizenAuth() {
  const nav = useNavigate();

  useEffect(() => {
    if (isCitizenAuthenticated()) nav("/citizen/dashboard", { replace: true });
  }, [nav]);

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

          <Link to="/" className="btn btn-sm btn-secondary" style={{ background: "#ffffff", color: "#0f172a" }}>
            ← Public Home
          </Link>
        </div>
      </header>

      <main className="container-narrow" style={{ padding: "3rem 1rem" }}>
        <div className="gov-card" style={{ boxShadow: "var(--shadow-md)", textAlign: "center" }}>
          <div style={{ fontSize: "2.4rem", marginBottom: "0.5rem" }}>🚨</div>
          <h2 className="gov-card-title" style={{ fontSize: "1.3rem" }}>Citizen Emergency Portal</h2>
          <p className="text-muted" style={{ fontSize: "0.9rem", marginTop: "0.35rem", marginBottom: "1.75rem" }}>
            Sign in to your account or create a new one to request emergency assistance,
            track your requests, and find nearby help.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            <Link to="/citizen/login" className="btn btn-primary btn-block" style={{ padding: "0.8rem" }}>
              Log In
            </Link>
            <Link to="/citizen/register" className="btn btn-secondary btn-block" style={{ padding: "0.8rem" }}>
              Sign Up
            </Link>
          </div>
        </div>

        <div className="gov-card" style={{ background: "var(--color-info-bg)", border: "1px solid var(--color-info-border)" }}>
          <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", display: "flex", gap: "0.6rem", alignItems: "flex-start" }}>
            <span>ℹ️</span>
            <span>
              In an immediate life-threatening emergency, call <strong>112</strong> (National Emergency Number)
              or <strong>108</strong> (Ambulance) directly.
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
