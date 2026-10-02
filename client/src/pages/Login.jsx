import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

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
      const data = await loginUser(formData);

      login(data.data);
      navigate("/dashboard");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-layout">
        {/* =================================
            LEFT - LOGIN FORM
        ================================= */}

        <section className="login-form-section">
          <div className="login-form-container">
            {/* Logo */}
            <Link to="/" className="login-brand">
              <div className="login-brand-icon">IP</div>

              <div className="login-brand-text">
                <strong>InvoicePro</strong>
                <span>Business Manager</span>
              </div>
            </Link>

            {/* Form Header */}
            <div className="login-header">
              <h1>Welcome back</h1>

              <p>Sign in to your account to continue</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="login-form">
              {/* Email */}
              <div className="login-field">
                <label htmlFor="email">Email</label>

                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                />
              </div>

              {/* Password */}
              <div className="login-field">
                <div className="login-password-label">
                  <label htmlFor="password">Password</label>

                  <button
                    type="button"
                    className="login-forgot-btn"
                    onClick={() =>
                      setError("Password reset is not available yet.")
                    }
                  >
                    Forgot password?
                  </button>
                </div>

                <input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                />
              </div>

              {/* Remember Me */}
              <label className="login-remember">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                />

                <span>Remember me</span>
              </label>

              {/* Error */}
              {error && (
                <div className="login-error">
                  <span>!</span>
                  <p>{error}</p>
                </div>
              )}

              {/* Submit */}
              <button type="submit" className="login-submit" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            {/* Register */}
            <p className="login-register">
              Don't have an account? <Link to="/register">Sign up</Link>
            </p>
          </div>
        </section>

        {/* =================================
            RIGHT - VISUAL PANEL
        ================================= */}

        <section className="login-visual-section">
          <div className="login-visual-content">
            {/* Decorative Shapes */}
            <div className="visual-orb visual-orb-one"></div>
            <div className="visual-orb visual-orb-two"></div>

            {/* Illustration */}
            <div className="login-illustration">
              {/* Floating checklist */}
              <div className="illustration-card checklist-card">
                <div className="check-row">
                  <span>✓</span>
                  <div></div>
                </div>

                <div className="check-row">
                  <span>✓</span>
                  <div></div>
                </div>

                <div className="check-row">
                  <span>✓</span>
                  <div></div>
                </div>
              </div>

              {/* Main Dashboard */}
              <div className="illustration-dashboard">
                <div className="dashboard-top">
                  <div className="dashboard-title"></div>
                  <div className="dashboard-dot"></div>
                </div>

                <div className="dashboard-chart">
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>

                <div className="dashboard-stats">
                  <div></div>
                  <div></div>
                  <div></div>
                </div>
              </div>

              {/* Floating Invoice */}
              <div className="illustration-invoice">
                <div className="invoice-line invoice-line-title"></div>
                <div className="invoice-line"></div>
                <div className="invoice-line"></div>
                <div className="invoice-line short"></div>

                <div className="invoice-total"></div>
              </div>

              {/* Floating Coins */}
              <div className="visual-coin coin-one">₹</div>
              <div className="visual-coin coin-two">₹</div>

              {/* Plus */}
              <div className="visual-plus">+</div>
            </div>

            <div className="login-visual-text">
              <h2>
                Manage your business
                <br />
                with confidence.
              </h2>

              <p>
                Create invoices, manage quotations, track payments and keep your
                business organized in one place.
              </p>
            </div>

            {/* Visual indicators */}
            <div className="visual-indicators">
              <span className="active"></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Login;
