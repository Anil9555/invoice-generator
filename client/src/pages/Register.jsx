import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";
import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await registerUser(formData);

      alert("Registration successful!");

      navigate("/login");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-layout">
        {/* =================================
            LEFT - REGISTER FORM
        ================================= */}

        <section className="register-form-section">
          <div className="register-form-container">
            {/* Brand */}
            <Link to="/" className="register-brand">
              <div className="register-brand-icon">IP</div>

              <div className="register-brand-text">
                <strong>InvoicePro</strong>
                <span>Business Manager</span>
              </div>
            </Link>

            {/* Header */}
            <div className="register-header">
              <h1>Create your account</h1>

              <p>Start managing your business with InvoicePro</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="register-form">
              {/* Name */}
              <div className="register-field">
                <label htmlFor="name">Full name</label>

                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  autoComplete="name"
                  required
                />
              </div>

              {/* Email */}
              <div className="register-field">
                <label htmlFor="email">Email</label>

                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  autoComplete="email"
                  required
                />
              </div>

              {/* Password */}
              <div className="register-field">
                <label htmlFor="password">Password</label>

                <input
                  id="password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  autoComplete="new-password"
                  minLength={6}
                  required
                />

                <span className="register-password-hint">
                  Use at least 6 characters
                </span>
              </div>

              {/* Error */}
              {error && (
                <div className="register-error">
                  <span>!</span>

                  <p>{error}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                className="register-submit"
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            {/* Login */}
            <p className="register-login">
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </div>
        </section>

        {/* =================================
            RIGHT - VISUAL PANEL
        ================================= */}

        <section className="register-visual-section">
          <div className="register-visual-content">
            {/* Decorative orbs */}
            <div className="register-orb register-orb-one"></div>
            <div className="register-orb register-orb-two"></div>

            {/* Illustration */}
            <div className="register-illustration">
              {/* Main workspace */}
              <div className="register-workspace">
                <div className="workspace-header">
                  <div className="workspace-title"></div>
                  <div className="workspace-menu"></div>
                </div>

                <div className="workspace-content">
                  <div className="workspace-sidebar">
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>

                  <div className="workspace-main">
                    <div className="workspace-welcome"></div>

                    <div className="workspace-cards">
                      <div></div>
                      <div></div>
                      <div></div>
                    </div>

                    <div className="workspace-chart">
                      <span></span>
                      <span></span>
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating user card */}
              <div className="register-user-card">
                <div className="user-avatar">+</div>

                <div className="user-lines">
                  <span></span>
                  <span></span>
                </div>
              </div>

              {/* Floating invoice */}
              <div className="register-invoice-card">
                <div className="invoice-icon">₹</div>

                <div className="invoice-card-lines">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>

              {/* Floating dots */}
              <div className="register-dot register-dot-one"></div>
              <div className="register-dot register-dot-two"></div>

              <div className="register-plus">+</div>
            </div>

            {/* Text */}
            <div className="register-visual-text">
              <h2>
                Everything you need
                <br />
                to run your business.
              </h2>

              <p>
                Create professional invoices, manage customers, track payments
                and grow your business effortlessly.
              </p>
            </div>

            {/* Indicators */}
            <div className="register-indicators">
              <span></span>
              <span className="active"></span>
              <span></span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Register;
