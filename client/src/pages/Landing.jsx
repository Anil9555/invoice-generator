import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import "./Landing.css";

const Landing = () => {
    useEffect(() => {
      const revealElements = document.querySelectorAll(
        ".landing-features, .landing-how-it-works, .landing-why, .landing-final-cta",
      );

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("landing-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.12,
        },
      );

      revealElements.forEach((element) => {
        element.classList.add("landing-reveal");
        observer.observe(element);
      });

      return () => observer.disconnect();
    }, []);

    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);


  return (
    <div className="landing-page">
      {/* =========================
          NAVBAR
      ========================= */}
      <header className="landing-navbar">
        <div className="landing-container">
          {/* LOGO */}
          <Link to="/" className="landing-logo">
            <div className="landing-logo-icon">IP</div>

            <div className="landing-logo-text">
              <strong>InvoicePro</strong>
              <span>Business Manager</span>
            </div>
          </Link>

          {/* DESKTOP NAVIGATION */}
          <nav className="landing-nav">
            <a href="#features">Features</a>

            <a href="#how-it-works">How it works</a>

            <a href="#why-invoicepro">Why InvoicePro</a>
          </nav>

          {/* DESKTOP ACTIONS */}
          <div className="landing-nav-actions">
            <Link to="/login" className="landing-login-btn">
              Login
            </Link>

            <Link to="/register" className="landing-start-btn">
              Get Started
            </Link>
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            type="button"
            className="landing-mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>

          {/* MOBILE MENU */}
          {mobileMenuOpen && (
            <div className="landing-mobile-menu">
              <a href="#features" onClick={() => setMobileMenuOpen(false)}>
                Features
              </a>

              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>
                How it works
              </a>

              <a
                href="#why-invoicepro"
                onClick={() => setMobileMenuOpen(false)}
              >
                Why InvoicePro
              </a>

              <div className="landing-mobile-menu-divider"></div>

              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                Login
              </Link>

              <Link
                to="/register"
                className="landing-mobile-menu-start"
                onClick={() => setMobileMenuOpen(false)}
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* =========================
          HERO
      ========================= */}
      <main>
        <section className="landing-hero">
          <div className="landing-container">
            {/* LEFT CONTENT */}

            <div className="landing-hero-content">
              <div className="landing-eyebrow">
                <span className="landing-eyebrow-dot"></span>
                Invoicing • Quotations • Payments
              </div>

              <h1>
                Run your
                <br />
                <span>business billing</span>
                <br />
                in one place.
              </h1>

              <p>
                Create professional invoices and quotations, manage customers,
                track payments, and keep your business organized — without
                juggling multiple tools.
              </p>

              <div className="landing-hero-actions">
                <Link to="/register" className="landing-primary-btn">
                  Start for free
                  <span>→</span>
                </Link>

                <a href="#how-it-works" className="landing-secondary-btn">
                  See how it works
                </a>
              </div>

              <div className="landing-hero-trust">
                <div>
                  <span className="landing-trust-check">✓</span>
                  No complicated setup
                </div>

                <div>
                  <span className="landing-trust-check">✓</span>
                  Built for growing businesses
                </div>
              </div>
            </div>

            {/* RIGHT PRODUCT PREVIEW */}

            <div className="landing-hero-preview">
              <div className="landing-preview-glow"></div>

              <div className="landing-preview-window">
                <div className="landing-preview-topbar">
                  <div className="landing-window-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>

                  <span>InvoicePro</span>

                  <div></div>
                </div>

                <div className="landing-preview-body">
                  <div className="landing-preview-header">
                    <div>
                      <small>INVOICE</small>

                      <h3>INV-0007</h3>
                    </div>

                    <span className="landing-preview-paid">PAID</span>
                  </div>

                  <div className="landing-preview-customer">
                    <span>Bill to</span>

                    <strong>ABC Enterprises</strong>

                    <small>abc@example.com</small>
                  </div>

                  <div className="landing-preview-items">
                    <div className="landing-preview-item header">
                      <span>Item</span>

                      <span>Qty</span>

                      <span>Amount</span>
                    </div>

                    <div className="landing-preview-item">
                      <span>Website Development</span>

                      <span>1</span>

                      <strong>₹25,000</strong>
                    </div>

                    <div className="landing-preview-item">
                      <span>Maintenance</span>

                      <span>2</span>

                      <strong>₹6,000</strong>
                    </div>
                  </div>

                  <div className="landing-preview-total">
                    <span>Total</span>

                    <strong>₹31,000</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PLACEHOLDERS FOR NEXT STEPS */}

        <section id="features" className="landing-features">
          <div className="landing-container">
            <div className="landing-section-heading">
              <div className="landing-section-label">WHY INVOICEPRO</div>

              <h2>
                Everything your business needs,
                <span> in one workspace.</span>
              </h2>

              <p>
                Stop switching between spreadsheets, documents and different
                tools. InvoicePro brings your everyday business workflow
                together.
              </p>
            </div>

            <div className="landing-feature-showcase">
              {/* LEFT */}
              <div className="landing-feature-list">
                <div className="landing-feature-item active">
                  <div className="landing-feature-icon">₹</div>

                  <div>
                    <strong>Professional Invoices</strong>

                    <p>
                      Create polished invoices in seconds, calculate taxes
                      automatically and keep everything organized.
                    </p>
                  </div>

                  <span className="landing-feature-arrow">→</span>
                </div>

                <div className="landing-feature-item">
                  <div className="landing-feature-icon">Q</div>

                  <div>
                    <strong>Smart Quotations</strong>

                    <p>
                      Create quotations quickly and convert accepted quotes
                      directly into invoices.
                    </p>
                  </div>

                  <span className="landing-feature-arrow">→</span>
                </div>

                <div className="landing-feature-item">
                  <div className="landing-feature-icon">C</div>

                  <div>
                    <strong>Customer Management</strong>

                    <p>
                      Keep customer information, invoices and business history
                      together.
                    </p>
                  </div>

                  <span className="landing-feature-arrow">→</span>
                </div>

                <div className="landing-feature-item">
                  <div className="landing-feature-icon">₹</div>

                  <div>
                    <strong>Payment Tracking</strong>

                    <p>
                      Know what has been paid, what is pending and what needs
                      your attention.
                    </p>
                  </div>

                  <span className="landing-feature-arrow">→</span>
                </div>
              </div>

              {/* RIGHT PRODUCT PREVIEW */}
              <div className="landing-feature-preview">
                <div className="landing-feature-preview-glow"></div>

                <div className="landing-feature-dashboard">
                  <div className="landing-feature-dashboard-top">
                    <div>
                      <span>INVOICE OVERVIEW</span>
                      <strong>March 2026</strong>
                    </div>

                    <div className="landing-feature-date">This month</div>
                  </div>

                  <div className="landing-feature-stats">
                    <div>
                      <span>Total Revenue</span>
                      <strong>₹2,84,500</strong>
                      <small>↑ 18.4%</small>
                    </div>

                    <div>
                      <span>Paid Invoices</span>
                      <strong>42</strong>
                      <small>↑ 8 this month</small>
                    </div>

                    <div>
                      <span>Pending</span>
                      <strong>₹48,200</strong>
                      <small>12 invoices</small>
                    </div>
                  </div>

                  <div className="landing-feature-chart">
                    <div className="landing-chart-label">Revenue overview</div>

                    <div className="landing-chart-bars">
                      <span style={{ height: "32%" }}></span>
                      <span style={{ height: "46%" }}></span>
                      <span style={{ height: "38%" }}></span>
                      <span style={{ height: "61%" }}></span>
                      <span style={{ height: "53%" }}></span>
                      <span style={{ height: "74%" }}></span>
                      <span style={{ height: "68%" }}></span>
                      <span style={{ height: "88%" }}></span>
                      <span style={{ height: "79%" }}></span>
                      <span style={{ height: "94%" }}></span>
                    </div>
                  </div>

                  <div className="landing-feature-invoice-row">
                    <div className="landing-mini-invoice-icon">INV</div>

                    <div>
                      <strong>INV-0042</strong>
                      <span>ABC Enterprises</span>
                    </div>

                    <div>
                      <strong>₹31,000</strong>
                      <span className="landing-paid-badge">Paid</span>
                    </div>
                  </div>

                  <div className="landing-feature-invoice-row">
                    <div className="landing-mini-invoice-icon">INV</div>

                    <div>
                      <strong>INV-0041</strong>
                      <span>Digital Studio</span>
                    </div>

                    <div>
                      <strong>₹18,500</strong>
                      <span className="landing-pending-badge">Pending</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="landing-how-it-works">
          <div className="landing-container">
            <div className="landing-section-heading">
              <div className="landing-section-label">HOW IT WORKS</div>

              <h2>
                From customer to
                <span> paid invoice.</span>
              </h2>

              <p>
                A simple workflow designed to help you create, manage and track
                your invoices without the usual paperwork.
              </p>
            </div>

            <div className="landing-steps">
              <div className="landing-step">
                <div className="landing-step-number">01</div>

                <div className="landing-step-icon">+</div>

                <h3>Add your customer</h3>

                <p>
                  Save your customer's business details once and reuse them
                  whenever you create an invoice or quotation.
                </p>

                <span className="landing-step-line"></span>
              </div>

              <div className="landing-step">
                <div className="landing-step-number">02</div>

                <div className="landing-step-icon">₹</div>

                <h3>Create an invoice</h3>

                <p>
                  Select products or services, set quantities, apply taxes and
                  generate a professional invoice in seconds.
                </p>

                <span className="landing-step-line"></span>
              </div>

              <div className="landing-step">
                <div className="landing-step-number">03</div>

                <div className="landing-step-icon">✓</div>

                <h3>Track your payment</h3>

                <p>
                  Keep track of paid and pending invoices so you always know
                  what is received and what is still outstanding.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="why-invoicepro" className="landing-why">
          <div className="landing-container">
            <div className="landing-why-grid">
              {/* Left Content */}

              <div className="landing-why-content">
                <div className="landing-section-label">WHY INVOICEPRO</div>

                <h2>
                  Built for businesses
                  <span> that are growing.</span>
                </h2>

                <p>
                  Your business should not depend on spreadsheets, scattered
                  documents and manual calculations. InvoicePro gives you one
                  simple place to manage your everyday invoicing workflow.
                </p>

                <div className="landing-why-points">
                  <div className="landing-why-point">
                    <span>✓</span>
                    <div>
                      <strong>Less manual work</strong>
                      <p>Automate calculations, taxes and invoice totals.</p>
                    </div>
                  </div>

                  <div className="landing-why-point">
                    <span>✓</span>
                    <div>
                      <strong>Everything stays organized</strong>
                      <p>
                        Keep customers, products, invoices and quotations in one
                        place.
                      </p>
                    </div>
                  </div>

                  <div className="landing-why-point">
                    <span>✓</span>
                    <div>
                      <strong>Know your business numbers</strong>
                      <p>
                        Track revenue, payments and pending invoices from your
                        dashboard.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Visual */}

              <div className="landing-why-visual">
                <div className="landing-why-glow"></div>

                <div className="landing-why-card">
                  <div className="landing-why-card-header">
                    <div>
                      <span>BUSINESS OVERVIEW</span>
                      <strong>InvoicePro</strong>
                    </div>

                    <div className="landing-live-status">
                      <span></span>
                      Live
                    </div>
                  </div>

                  <div className="landing-why-main-stat">
                    <span>Total Revenue</span>

                    <strong>₹8,42,500</strong>

                    <small>↑ 24.8% this month</small>
                  </div>

                  <div className="landing-why-mini-grid">
                    <div>
                      <span>Invoices</span>
                      <strong>128</strong>
                    </div>

                    <div>
                      <span>Customers</span>
                      <strong>64</strong>
                    </div>

                    <div>
                      <span>Pending</span>
                      <strong>₹72,400</strong>
                    </div>

                    <div>
                      <span>Paid</span>
                      <strong>₹7,70,100</strong>
                    </div>
                  </div>

                  <div className="landing-why-progress">
                    <div className="landing-why-progress-top">
                      <span>Payment collection</span>
                      <strong>91%</strong>
                    </div>

                    <div className="landing-why-progress-bar">
                      <span></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <section className="landing-final-cta">
        <div className="landing-container">
          <div className="landing-final-cta-card">
            <div className="landing-final-cta-glow"></div>

            <div className="landing-final-cta-content">
              <div className="landing-section-label">START TODAY</div>

              <h2>
                Ready to simplify
                <span> your invoicing?</span>
              </h2>

              <p>
                Create professional invoices, manage customers, track payments
                and keep your business organized from one simple workspace.
              </p>

              <div className="landing-final-cta-actions">
                <Link
                  to="/register"
                  className="landing-btn landing-btn-primary"
                >
                  Create Free Account
                  <span>→</span>
                </Link>

                <Link to="/login" className="landing-btn landing-btn-secondary">
                  Sign In
                </Link>
              </div>

              <small>
                No complicated setup. Just create an account and get started.
              </small>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          FOOTER
      ========================= */}
      <footer className="landing-footer">
        <div className="landing-container">
          <div className="landing-footer-main">
            <div className="landing-footer-brand">
              <Link to="/" className="landing-footer-logo">
                Invoice<span>Pro</span>
              </Link>

              <p>Simple, professional invoicing for growing businesses.</p>
            </div>

            <div className="landing-footer-links">
              <div className="landing-footer-column">
                <h4>Product</h4>

                <a href="#features">Features</a>

                <a href="#how-it-works">How it works</a>

                <Link to="/login">Sign in</Link>
              </div>

              <div className="landing-footer-column">
                <h4>Business</h4>

                <a href="#why-invoicepro">Why InvoicePro</a>

                <Link to="/register">Get started</Link>
              </div>

              <div className="landing-footer-column">
                <h4>Account</h4>

                <Link to="/login">Login</Link>

                <Link to="/register">Create account</Link>
              </div>
            </div>
          </div>

          <div className="landing-footer-bottom">
            <span>© 2026 InvoicePro. All rights reserved.</span>

            <span>Built for modern businesses.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
