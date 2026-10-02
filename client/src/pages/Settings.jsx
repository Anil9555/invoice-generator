import React, { useEffect, useState } from "react";
import "./Settings.css";
import { getSettings, saveSettings } from "../services/settingsService";
import {
  getAccount,
  updateAccount,
  changePassword,
} from "../services/accountService";

import { useTheme } from "../context/ThemeContext";

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const [activeSection, setActiveSection] = React.useState("business");
  const [businessForm, setBusinessForm] = useState({
    business_name: "",
    business_email: "",
    phone: "",
    gstin: "",
    address: "",
  });
  

  const [invoiceForm, setInvoiceForm] = useState({
    invoice_prefix: "INV-",
    currency: "INR",
    default_tax_rate: 18,
    payment_terms: "Due within 30 days",
  });

  const [quotationForm, setQuotationForm] = useState({
    quotation_prefix: "QUO-",
    quotation_validity: 30,
    quotation_terms:
      "This quotation is valid for the specified period from the quotation date.",
  });

  const [accountForm, setAccountForm] = useState({
    name: "",
    email: "",
  });

  const [savingAccount, setSavingAccount] = useState(false);
  const [accountMessage, setAccountMessage] = useState("");

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");

  const [savingQuotation, setSavingQuotation] = useState(false);
  const [quotationMessage, setQuotationMessage] = useState("");

  const [savingInvoice, setSavingInvoice] = useState(false);
  const [invoiceMessage, setInvoiceMessage] = useState("");
  const [savingBusiness, setSavingBusiness] = useState(false);
  const [businessMessage, setBusinessMessage] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await getSettings();

        if (response?.success && response.data) {
          setBusinessForm({
            business_name: response.data.business_name || "",
            business_email: response.data.business_email || "",
            phone: response.data.phone || "",
            gstin: response.data.gstin || "",
            address: response.data.address || "",
          });

          setInvoiceForm({
            invoice_prefix: response.data.invoice_prefix || "INV-",
            currency: response.data.currency || "INR",
            default_tax_rate: response.data.default_tax_rate ?? 18,
            payment_terms: response.data.payment_terms || "Due within 30 days",
          });

          setQuotationForm({
            quotation_prefix: response.data.quotation_prefix || "QUO-",
            quotation_validity: response.data.quotation_validity ?? 30,
            quotation_terms:
              response.data.quotation_terms ||
              "This quotation is valid for the specified period from the quotation date.",
          });

          setAccountForm({
            name: response.data.name || "",
            email: response.data.email || "",
          });
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      }
    };

    fetchSettings();
  }, []);

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const response = await getAccount();

        if (response?.success && response.data) {
          setAccountForm({
            name: response.data.name || "",
            email: response.data.email || "",
          });
        }
      } catch (error) {
        console.error("Failed to load account:", error);
      }
    };

    fetchAccount();
  }, []);

  const handleSaveBusiness = async () => {
    try {
      setSavingBusiness(true);
      setBusinessMessage("");

      const response = await saveSettings({
        ...businessForm,
      });

      if (response?.success) {
        setBusinessMessage("Business profile saved successfully.");
      } else {
        setBusinessMessage(
          response?.message || "Failed to save business profile.",
        );
      }
    } catch (error) {
      console.error("Save business settings error:", error);
      setBusinessMessage("Failed to save business profile.");
    } finally {
      setSavingBusiness(false);
    }
  };

  const handleSaveInvoice = async () => {
    try {
      setSavingInvoice(true);
      setInvoiceMessage("");

      const response = await saveSettings({
        ...businessForm,
        ...invoiceForm,
      });

      if (response?.success) {
        setInvoiceMessage("Invoice settings saved successfully.");
      } else {
        setInvoiceMessage(
          response?.message || "Failed to save invoice settings.",
        );
      }
    } catch (error) {
      console.error("Save invoice settings error:", error);
      setInvoiceMessage("Failed to save invoice settings.");
    } finally {
      setSavingInvoice(false);
    }
  };

  const handleSaveQuotation = async () => {
    try {
      setSavingQuotation(true);
      setQuotationMessage("");

      const response = await saveSettings({
        ...businessForm,
        ...invoiceForm,
        ...quotationForm,
      });

      if (response?.success) {
        setQuotationMessage("Quotation settings saved successfully.");
      } else {
        setQuotationMessage(
          response?.message || "Failed to save quotation settings.",
        );
      }
    } catch (error) {
      console.error("Save quotation settings error:", error);
      setQuotationMessage("Failed to save quotation settings.");
    } finally {
      setSavingQuotation(false);
    }
  };

  const handleSaveAccount = async () => {
    try {
      setSavingAccount(true);
      setAccountMessage("");

      const response = await updateAccount({
        name: accountForm.name,
        email: accountForm.email,
      });

      if (response?.success) {
        setAccountMessage("Account information updated successfully.");
      } else {
        setAccountMessage(
          response?.message || "Failed to update account information.",
        );
      }
    } catch (error) {
      console.error("Update account error:", error);
      setAccountMessage("Failed to update account information.");
    } finally {
      setSavingAccount(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      setSavingPassword(true);
      setPasswordMessage("");

      const response = await changePassword(passwordForm);

      if (response?.success) {
        setPasswordMessage("Password changed successfully.");

        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        setPasswordMessage(response?.message || "Failed to change password.");
      }
    } catch (error) {
      console.error("Change password error:", error);
      setPasswordMessage("Failed to change password.");
    } finally {
      setSavingPassword(false);
    }
  };

  const showSuccessPopup =
    businessMessage === "Business profile saved successfully.";

  return (
    <>
      {businessMessage === "Business profile saved successfully." && (
        <div className="settings-toast success">
          <div className="settings-toast-icon">✓</div>

          <div className="settings-toast-content">
            <strong>Success</strong>
            <span>Business profile saved successfully.</span>
          </div>

          <button
            type="button"
            className="settings-toast-close"
            onClick={() => setBusinessMessage("")}
          >
            ×
          </button>
        </div>
      )}

      <div className="settings-page">
        <div className="settings-header">
          <div>
            <h1>Settings</h1>
            <p>Manage your business, invoice and account preferences.</p>
          </div>
        </div>

        <div className="settings-layout">
          {/* Settings Navigation */}
          <aside className="settings-sidebar">
            <button
              className={`settings-nav-item ${
                activeSection === "business" ? "active" : ""
              }`}
              onClick={() => setActiveSection("business")}
            >
              Business Profile
            </button>

            <button
              className={`settings-nav-item ${
                activeSection === "invoice" ? "active" : ""
              }`}
              onClick={() => setActiveSection("invoice")}
            >
              Invoice Settings
            </button>

            <button
              className={`settings-nav-item ${
                activeSection === "quotation" ? "active" : ""
              }`}
              onClick={() => setActiveSection("quotation")}
            >
              Quotation Settings
            </button>

            <button
              className={`settings-nav-item ${
                activeSection === "account" ? "active" : ""
              }`}
              onClick={() => setActiveSection("account")}
            >
              Account
            </button>

            <button
              className={`settings-nav-item ${
                activeSection === "appearance" ? "active" : ""
              }`}
              onClick={() => setActiveSection("appearance")}
            >
              Appearance
            </button>
          </aside>
          {/* Settings Content */}
          {/* Business Profile */}

          <main className="settings-content">
            {activeSection === "business" && (
              <section className="settings-card">
                <div className="settings-card-header">
                  <div>
                    <h2>Business Profile</h2>
                    <p>
                      Add your business information that will be used throughout
                      your invoices and quotations.
                    </p>
                  </div>
                </div>

                <div className="settings-form">
                  <div className="settings-form-group">
                    <label>Business Name</label>
                    <input
                      type="text"
                      name="business_name"
                      value={businessForm.business_name}
                      onChange={(e) =>
                        setBusinessForm({
                          ...businessForm,
                          business_name: e.target.value,
                        })
                      }
                      placeholder="Enter business name"
                    />
                  </div>

                  <div className="settings-form-group">
                    <label>Business Email</label>
                    <input
                      type="email"
                      name="business_email"
                      value={businessForm.business_email}
                      onChange={(e) =>
                        setBusinessForm({
                          ...businessForm,
                          business_email: e.target.value,
                        })
                      }
                      placeholder="Enter business email"
                    />
                  </div>

                  <div className="settings-form-group">
                    <label>Phone</label>
                    <input
                      type="text"
                      name="phone"
                      value={businessForm.phone}
                      onChange={(e) =>
                        setBusinessForm({
                          ...businessForm,
                          phone: e.target.value,
                        })
                      }
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div className="settings-form-group">
                    <label>GSTIN</label>
                    <input
                      type="text"
                      name="gstin"
                      value={businessForm.gstin}
                      onChange={(e) =>
                        setBusinessForm({
                          ...businessForm,
                          gstin: e.target.value,
                        })
                      }
                      placeholder="Enter GSTIN"
                    />
                  </div>

                  <div className="settings-form-group full-width">
                    <label>Business Address</label>
                    <textarea
                      name="address"
                      value={businessForm.address}
                      onChange={(e) =>
                        setBusinessForm({
                          ...businessForm,
                          address: e.target.value,
                        })
                      }
                      rows="4"
                      placeholder="Enter complete business address"
                    ></textarea>
                  </div>
                </div>

                <div className="settings-actions">
                  <button
                    type="button"
                    className="settings-save-btn"
                    onClick={handleSaveBusiness}
                    disabled={savingBusiness}
                  >
                    {savingBusiness ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </section>
            )}
            {/* Invoice Settings */}
            {activeSection === "invoice" && (
              <section className="settings-card">
                <div className="settings-card-header">
                  <div>
                    <h2>Invoice Settings</h2>
                    <p>
                      Configure default settings that will be used when creating
                      invoices.
                    </p>
                  </div>
                </div>

                <div className="settings-form">
                  <div className="settings-form-group">
                    <label>Invoice Prefix</label>
                    <input
                      type="text"
                      value={invoiceForm.invoice_prefix}
                      onChange={(e) =>
                        setInvoiceForm({
                          ...invoiceForm,
                          invoice_prefix: e.target.value,
                        })
                      }
                      placeholder="INV-"
                    />
                  </div>

                  <div className="settings-form-group">
                    <label>Currency</label>
                    <select
                      value={invoiceForm.currency}
                      onChange={(e) =>
                        setInvoiceForm({
                          ...invoiceForm,
                          currency: e.target.value,
                        })
                      }
                    >
                      <option value="INR">INR (₹) - Indian Rupee</option>
                      <option value="USD">USD ($) - US Dollar</option>
                      <option value="EUR">EUR (€) - Euro</option>
                      <option value="GBP">GBP (£) - British Pound</option>
                    </select>
                  </div>

                  <div className="settings-form-group">
                    <label>Default Tax Rate (%)</label>
                    <input
                      type="number"
                      value={invoiceForm.default_tax_rate}
                      onChange={(e) =>
                        setInvoiceForm({
                          ...invoiceForm,
                          default_tax_rate: e.target.value,
                        })
                      }
                      placeholder="18"
                      min="0"
                      max="100"
                    />
                  </div>

                  <div className="settings-form-group">
                    <label>Payment Terms</label>
                    <select
                      value={invoiceForm.payment_terms}
                      onChange={(e) =>
                        setInvoiceForm({
                          ...invoiceForm,
                          payment_terms: e.target.value,
                        })
                      }
                    >
                      <option value="Due immediately">Due immediately</option>
                      <option value="Due within 7 days">
                        Due within 7 days
                      </option>
                      <option value="Due within 15 days">
                        Due within 15 days
                      </option>
                      <option value="Due within 30 days">
                        Due within 30 days
                      </option>
                      <option value="Due within 45 days">
                        Due within 45 days
                      </option>
                      <option value="Due within 60 days">
                        Due within 60 days
                      </option>
                    </select>
                  </div>
                </div>

                <div className="settings-actions">
                  <div className="settings-actions">
                    {invoiceMessage && (
                      <p className="settings-message">{invoiceMessage}</p>
                    )}

                    <button
                      type="button"
                      className="settings-save-btn"
                      onClick={handleSaveInvoice}
                      disabled={savingInvoice}
                    >
                      {savingInvoice ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              </section>
            )}
            {activeSection === "quotation" && (
              <section className="settings-card">
                <div className="settings-card-header">
                  <div>
                    <h2>Quotation Settings</h2>
                    <p>
                      Configure default settings that will be used when creating
                      quotations.
                    </p>
                  </div>
                </div>

                <div className="settings-form">
                  <div className="settings-form-group">
                    <label>Quotation Prefix</label>
                    <input
                      type="text"
                      value={quotationForm.quotation_prefix}
                      onChange={(e) =>
                        setQuotationForm({
                          ...quotationForm,
                          quotation_prefix: e.target.value,
                        })
                      }
                      placeholder="QUO-"
                    />
                  </div>

                  <div className="settings-form-group">
                    <label>Default Validity</label>
                    <select
                      value={quotationForm.quotation_validity}
                      onChange={(e) =>
                        setQuotationForm({
                          ...quotationForm,
                          quotation_validity: e.target.value,
                        })
                      }
                    >
                      <option value="7">7 days</option>
                      <option value="15">15 days</option>
                      <option value="30">30 days</option>
                      <option value="45">45 days</option>
                      <option value="60">60 days</option>
                      <option value="90">90 days</option>
                    </select>
                  </div>

                  <div className="settings-form-group full-width">
                    <label>Terms & Conditions</label>
                    <textarea
                      rows="6"
                      value={quotationForm.quotation_terms}
                      onChange={(e) =>
                        setQuotationForm({
                          ...quotationForm,
                          quotation_terms: e.target.value,
                        })
                      }
                      placeholder="Enter default quotation terms and conditions"
                    ></textarea>
                  </div>
                </div>

                <div className="settings-actions">
                  {quotationMessage && (
                    <p className="settings-message">{quotationMessage}</p>
                  )}

                  <button
                    type="button"
                    className="settings-save-btn"
                    onClick={handleSaveQuotation}
                    disabled={savingQuotation}
                  >
                    {savingQuotation ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </section>
            )}
            {/* Account */}
            {activeSection === "account" && (
              <section className="settings-card">
                <div className="settings-card-header">
                  <div>
                    <h2>Account</h2>
                    <p>
                      Manage your account information and password settings.
                    </p>
                  </div>
                </div>

                <div className="settings-form">
                  <div className="settings-form-group">
                    <label>Name</label>
                    <input
                      type="text"
                      value={accountForm.name}
                      onChange={(e) =>
                        setAccountForm({
                          ...accountForm,
                          name: e.target.value,
                        })
                      }
                      placeholder="Enter your name"
                    />
                  </div>

                  <div className="settings-form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={accountForm.email}
                      onChange={(e) =>
                        setAccountForm({
                          ...accountForm,
                          email: e.target.value,
                        })
                      }
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div className="settings-card-header">
                  <div>
                    <h2>Change Password</h2>
                    <p>
                      Update your account password to keep your account secure.
                    </p>
                  </div>
                </div>

                <div className="settings-form">
                  <div className="settings-form-group">
                    <label>Current Password</label>
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          currentPassword: e.target.value,
                        })
                      }
                      placeholder="Enter current password"
                    />
                  </div>

                  <div className="settings-form-group">
                    <label>New Password</label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          newPassword: e.target.value,
                        })
                      }
                      placeholder="Enter new password"
                    />
                  </div>

                  <div className="settings-form-group">
                    <label>Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          confirmPassword: e.target.value,
                        })
                      }
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>

                <div className="settings-actions">
                  {accountMessage && (
                    <p className="settings-message">{accountMessage}</p>
                  )}

                  <button
                    type="button"
                    className="settings-save-btn"
                    onClick={handleSaveAccount}
                    disabled={savingAccount}
                  >
                    {savingAccount ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </section>
            )}

            {/* Appearance */}

            {activeSection === "appearance" && (
              <section className="settings-card">
                <div className="settings-card-header">
                  <div>
                    <h2>Appearance</h2>
                    <p>Customize how InvoicePro looks on your device.</p>
                  </div>
                </div>

                {/* Theme */}

                <div className="settings-form">
                  <div className="settings-form-group">
                    <label>Theme</label>

                    <select
                      value={theme}
                      onChange={(e) => setTheme(e.target.value)}
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="system">System Default</option>
                    </select>
                  </div>
                </div>
                <div className="settings-actions">
                  <button className="settings-save-btn">Save Changes</button>
                </div>
              </section>
            )}
          </main>
        </div>
      </div>
    </>
  );
};



export default Settings;
