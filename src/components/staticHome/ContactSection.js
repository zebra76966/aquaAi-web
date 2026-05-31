import "./ContactSection.css";
import { useState } from "react";
import { FiMail, FiMessageCircle, FiPhone, FiGlobe, FiSend, FiInstagram, FiTwitter, FiFacebook, FiYoutube, FiCheck, FiAlertCircle, FiLoader } from "react-icons/fi";

/* ── API config ──────────────────────────────────────────────
   Move the token to an env variable in production:
   const TOKEN = import.meta.env.VITE_CONTACT_TOKEN;
   ──────────────────────────────────────────────────────────── */
const API_URL = "https://aquaai.uk/api/v1/service/contact-us/";

const EMPTY = { name: "", email: "", phone: "", subject: "", message: "" };

export default function ContactSection() {
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState("");

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          subject: form.subject.trim(),
          message: form.message.trim(),
        }),
      });

      if (!res.ok) {
        // Try to get a useful error message from the response body
        let detail = `Server error (${res.status})`;
        try {
          const data = await res.json();
          detail = data?.detail || data?.message || detail;
        } catch {}
        throw new Error(detail);
      }

      // Success — API returns { "message": "Enquiry submitted successfully" }
      setStatus("success");
      setForm(EMPTY);

      // Reset back to idle after 5 seconds
      setTimeout(() => setStatus("idle"), 5000);
    } catch (err) {
      setStatus("error");
      setErrorMsg(err.message || "Something went wrong. Please try again.");
    }
  }

  const isLoading = status === "loading";
  const isSuccess = status === "success";

  return (
    <section className="contact-section" id="contact">
      <div className="contact-inner">
        <div className="contact-heading">
          <p className="contact-eyebrow">Contact Us</p>
          <h2 className="contact-title">
            Get in <span className="contact-accent">Touch</span>
          </h2>
          <p className="contact-subtitle">We're here to help. Reach out through any channel that suits you.</p>
        </div>

        <div className="contact-grid">
          {/* ── Form ── */}
          <div className="contact-form-wrap">
            <form className="contact-form" onSubmit={handleSubmit} noValidate>
              <div className="cf-row">
                <div className="cf-field">
                  <label className="cf-label" htmlFor="cf-name">
                    Your Name
                  </label>
                  <input id="cf-name" className="cf-input" type="text" placeholder="Jane Smith" value={form.name} onChange={update("name")} required disabled={isLoading || isSuccess} />
                </div>
                <div className="cf-field">
                  <label className="cf-label" htmlFor="cf-email">
                    Email Address
                  </label>
                  <input id="cf-email" className="cf-input" type="email" placeholder="jane@example.com" value={form.email} onChange={update("email")} required disabled={isLoading || isSuccess} />
                </div>
              </div>

              <div className="cf-row">
                <div className="cf-field">
                  <label className="cf-label" htmlFor="cf-phone">
                    Phone / WhatsApp
                  </label>
                  <input id="cf-phone" className="cf-input" type="tel" placeholder="+44 7700 000000" value={form.phone} onChange={update("phone")} disabled={isLoading || isSuccess} />
                </div>
                <div className="cf-field">
                  <label className="cf-label" htmlFor="cf-subject">
                    Subject
                  </label>
                  <input id="cf-subject" className="cf-input" type="text" placeholder="How can we help?" value={form.subject} onChange={update("subject")} required disabled={isLoading || isSuccess} />
                </div>
              </div>

              <div className="cf-field">
                <label className="cf-label" htmlFor="cf-message">
                  Message
                </label>
                <textarea
                  id="cf-message"
                  className="cf-input cf-textarea"
                  rows={5}
                  placeholder="Tell us what's on your mind..."
                  value={form.message}
                  onChange={update("message")}
                  required
                  disabled={isLoading || isSuccess}
                />
              </div>

              {/* ── Error banner ── */}
              {status === "error" && (
                <div className="cf-alert cf-alert--error">
                  <FiAlertCircle />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* ── Success banner ── */}
              {isSuccess && (
                <div className="cf-alert cf-alert--success">
                  <FiCheck />
                  <span>Your enquiry has been submitted successfully! We'll be in touch soon.</span>
                </div>
              )}

              {/* ── Submit button ── */}
              {!isSuccess && (
                <button className={`cf-submit${isLoading ? " cf-submit--loading" : ""}`} type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <FiLoader className="cf-spinner" />
                      Sending…
                    </>
                  ) : (
                    <>
                      <FiSend />
                      Send Message
                    </>
                  )}
                </button>
              )}
            </form>
          </div>

          {/* ── Contact info card ── */}
          <div className="contact-info-card">
            <h3 className="ci-heading">Contact Details</h3>
            <div className="ci-items">
              <div className="ci-item">
                <div className="ci-icon">
                  <FiMail />
                </div>
                <div>
                  <p className="ci-label">Support</p>
                  <a href="mailto:support@aquaai.uk" className="ci-value">
                    support@aquaai.uk
                  </a>
                </div>
              </div>
              <div className="ci-item">
                <div className="ci-icon">
                  <FiMail />
                </div>
                <div>
                  <p className="ci-label">For Providers</p>
                  <a href="mailto:providers@aquaai.uk" className="ci-value">
                    providers@aquaai.uk
                  </a>
                </div>
              </div>
              <div className="ci-item">
                <div className="ci-icon">
                  <FiMessageCircle />
                </div>
                <div>
                  <p className="ci-label">WhatsApp</p>
                  <a href="https://wa.me/447586576323" className="ci-value">
                    +44 7586 576323
                  </a>
                </div>
              </div>
              <div className="ci-item">
                <div className="ci-icon">
                  <FiPhone />
                </div>
                <div>
                  <p className="ci-label">SMS</p>
                  <a href="sms:+447782207333" className="ci-value">
                    +44 7782 207333
                  </a>
                </div>
              </div>
              <div className="ci-item">
                <div className="ci-icon">
                  <FiGlobe />
                </div>
                <div>
                  <p className="ci-label">Website</p>
                  <a href="https://www.aquaai.uk" target="_blank" rel="noreferrer" className="ci-value">
                    www.aquaai.uk
                  </a>
                </div>
              </div>
            </div>

            <div className="ci-socials-wrap">
              <p className="ci-label">Follow Us</p>
              <div className="ci-socials">
                {[FiInstagram, FiTwitter, FiFacebook, FiYoutube].map((Icon, i) => (
                  <a key={i} href="#" className="ci-social">
                    <Icon />
                  </a>
                ))}
              </div>
            </div>

            <div className="ci-note">
              <p>
                Operated by <strong>Humara Ltd</strong>
              </p>
              <p>Registered in England and Wales</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
