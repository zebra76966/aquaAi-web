import "./OutreachPage.css";
import { FiCheck } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function ConsultantOutreachPage() {
  const navigate = useNavigate();

  return (
    <section className="otr-section">
      <div className="otr-inner">
        <div className="otr-heading">
          <p className="otr-eyebrow">For Consultants</p>
          <h1 className="otr-title">A tank is crashing right now. We know whose, and where.</h1>
          <p className="otr-subtitle">Your next job is a customer whose fish are already sick.</p>
        </div>

        <div className="otr-callout">Bookings from people who already know they have a problem.</div>

        <div className="otr-body">
          <p>
            The hardest part of aquatic consultancy isn't the work. It's being found by the right person at the right time — usually after they've already tried three things
            off YouTube and lost half a tank.
          </p>
          <p>
            <strong className="otr-highlight">Aqua Providers changes when the customer finds you.</strong>
          </p>
        </div>

        <div className="otr-block">
          <h2 className="otr-h2">We escalate to you at the moment of crisis</h2>
          <div className="otr-body">
            <p>
              Aqua AI monitors users' tanks continuously — water chemistry across a dozen parameters, AI-driven disease detection from photo and video, health scoring, and
              trend analysis over time.
            </p>
            <p>
              When the system detects something severe or critical — a disease it can identify, parameters heading somewhere dangerous, a health score falling off a cliff —
              it recommends escalating to a consultant. Then it shows them the consultants nearest to them, with their ratings, services and live availability.
            </p>
            <p>That's not a lead. That's a customer who has just been told by an intelligent system that they need professional help, right now.</p>
          </div>
        </div>

        <div className="otr-block">
          <h2 className="otr-h2">You arrive already knowing what you're walking into</h2>
          <div className="otr-body">
            <p>
              Before you set off, you can see the tank's history: water parameters over time, the AI's health analysis, the species involved, the photographs. No forty
              minutes of diagnosis before you can quote.
            </p>
            <p>You turn up informed, diagnose faster, and look exactly like the expert you are.</p>
          </div>
        </div>

        <div className="otr-block">
          <h2 className="otr-h2">Everything else runs itself</h2>
          <ul className="otr-list">
            <li>
              <FiCheck />
              <span>
                <strong>Calendar and availability</strong> — publish your real diary; customers book only slots you've opened
              </span>
            </li>
            <li>
              <FiCheck />
              <span>
                <strong>Booking control</strong> — requests come to you. Approve or decline. Nothing is confirmed without your say-so
              </span>
            </li>
            <li>
              <FiCheck />
              <span>
                <strong>Service listings</strong> — publish your services with your prices, your units (per hour, per visit, per job), your durations
              </span>
            </li>
            <li>
              <FiCheck />
              <span>
                <strong>In-app messaging</strong> — talk to the customer inside the booking. No personal number handed out
              </span>
            </li>
            <li>
              <FiCheck />
              <span>
                <strong>Protection from time-wasters</strong> — late cancellations and no-shows are tracked and penalised at the user's end. Repeat offenders lose booking
                privileges. Your diary is protected.
              </span>
            </li>
          </ul>
        </div>

        <div className="otr-block">
          <h2 className="otr-h2">Intelligence for your business, not just your bookings</h2>
          <ul className="otr-list">
            <li>
              <FiCheck />
              <span>
                <strong>Demand intelligence</strong> — where the work is, what's being asked for, when it peaks.
              </span>
            </li>
            <li>
              <FiCheck />
              <span>
                <strong>Research your own business</strong> — AI analysis of your profile, performance and positioning.
              </span>
            </li>
            <li>
              <FiCheck />
              <span>
                <strong>Research your competitors</strong> — the local market landscape, who's active, where the gaps are.
              </span>
            </li>
            <li>
              <FiCheck />
              <span>
                <strong>Growth recommendations</strong> — specific, data-backed opportunities for your practice.
              </span>
            </li>
            <li>
              <FiCheck />
              <span>
                <strong>AI business assistant</strong> — text or voice, briefed on your data.
              </span>
            </li>
          </ul>
          <div className="otr-body">
            <p>
              Plus booking volume and trends, completion rate, earnings, rating trends and trust progression — an operating picture most independent consultants have never
              had.
            </p>
          </div>
        </div>

        <div className="otr-block">
          <h2 className="otr-h2">Reputation that's earned and visible</h2>
          <div className="otr-body">
            <p>
              Trust scores and badges built on evidence — response speed, completion rate, review history — displayed publicly, recalculated nightly, running Bronze →
              Silver → Gold → Platinum.
            </p>
            <p>Reviews and star ratings come from verified, completed bookings only. No anonymous drive-by ratings from people who never hired you.</p>
          </div>
        </div>

        <div className="otr-divider" />

        <div className="otr-block" style={{ marginTop: 0 }}>
          <h2 className="otr-h2">What it costs: nothing</h2>
          <div className="otr-body">
            <p>
              <strong className="otr-highlight">Read that again. No monthly fee. No subscription. No listing charges.</strong>
            </p>
          </div>

          <div className="otr-price-row">
            <div className="otr-stat-card">
              <div className="otr-stat-value">£0</div>
              <div className="otr-stat-label">monthly fee</div>
            </div>
            <div className="otr-stat-card">
              <div className="otr-stat-value">10%</div>
              <div className="otr-stat-label">deposit, paid by the customer</div>
            </div>
          </div>

          <div className="otr-body">
            <p>
              When a customer books you, they pay a 10% deposit through the app to secure the slot — that deposit is our fee. You collect the remaining balance directly, in
              person, however you normally take payment.
            </p>
            <p>You never write us a cheque. Ever. If you don't get booked, we don't get paid. Our incentive is identical to yours.</p>
          </div>
        </div>

        <p className="otr-quote">
          The user base is already there
          <span>Aqua AI users are the most engaged, most informed fishkeepers in the country — and every one of them is a potential booking.</span>
        </p>

        <div className="otr-cta-wrap">
          <button className="otr-cta-btn" onClick={() => navigate("/register")}>
            Apply as a Consultant
          </button>
        </div>
        <p className="otr-note">Applications are verified before approval — we check credentials, because the trust architecture only works if everyone in it is real.</p>
        <p className="otr-sign">The Aqua AI Team</p>

        <div className="otr-divider" />

        <div className="otr-footer">
          <p>&copy; 2026 Aqua AI. All rights reserved.</p>
          <p>
            Questions? Contact us at <a href="mailto:support@aquaai.uk">support@aquaai.uk</a>
          </p>
        </div>
      </div>
    </section>
  );
}
