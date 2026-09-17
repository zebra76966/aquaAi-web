import "./OutreachPage.css";
import { FiCheck } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function BreederOutreachPage() {
  const navigate = useNavigate();

  return (
    <section className="otr-section">
      <div className="otr-inner">
        <div className="otr-heading">
          <p className="otr-eyebrow">For Breeders</p>
          <h1 className="otr-title">Your next customer already knows they need your fish</h1>
          <p className="otr-subtitle">We tell 20,000 fishkeepers what's compatible with their tank. Then we show them you.</p>
        </div>

        <div className="otr-callout">Qualified buyers, delivered at the exact moment they decide to buy.</div>

        <div className="otr-body">
          <p>
            Here's how most of your online sales work today: someone stumbles across your listing, hopes it suits their tank, and buys on a guess. Half your enquiries are people asking whether your
            fish will survive alongside what they already keep.
          </p>
          <p>
            <strong className="otr-highlight">Aqua Providers inverts that.</strong>
          </p>
        </div>

        <div className="otr-block">
          <h2 className="otr-h2">We answer the compatibility question before they ever see your stock</h2>
          <div className="otr-body">
            <p>
              Every Aqua AI user has their habitat mapped — species, water parameters, tank volume, temperature, the lot. When they ask what they can add, our compatibility engine tells them exactly
              which species will thrive in their water.
            </p>
            <p>Then it shows them the breeders who have those species in stock — ranked by proximity and star rating.</p>
            <p>
              That's not a listing sitting in a search index hoping to be found. That's a buyer who has just been told, by a system they trust, that your fish is right for their tank. You're not
              advertising. You're being recommended.
            </p>
          </div>
        </div>

        <div className="otr-block">
          <h2 className="otr-h2">The first peer-to-peer marketplace built for live aquatics</h2>
          <div className="otr-body">
            <p>Aqua AI's marketplace was built for this from the ground up — livestock and dry goods, sold to people whose tanks we already understand:</p>
          </div>
          <ul className="otr-list">
            <li>
              <FiCheck />
              <span>
                <strong>Sell your way</strong> — nationwide delivery with courier tracking, or collection in store with OTP-confirmed handover
              </span>
            </li>
            <li>
              <FiCheck />
              <span>
                <strong>Tiered pricing</strong> — set different prices for small, medium and large specimens
              </span>
            </li>
            <li>
              <FiCheck />
              <span>
                <strong>Full stock control</strong> — add, edit, duplicate and bulk-list species; adjust quantities; mark sold out and restock in seconds
              </span>
            </li>
            <li>
              <FiCheck />
              <span>
                <strong>Disputes handled in-app</strong> — buyer submits evidence, you respond with a replacement or refund. No PayPal arbitration.
              </span>
            </li>
            <li>
              <FiCheck />
              <span>
                <strong>Payouts via Stripe</strong> — tracked per order, visible on your dashboard
              </span>
            </li>
          </ul>
        </div>

        <div className="otr-block">
          <h2 className="otr-h2">Intelligence no aquatics business has ever had</h2>
          <div className="otr-body">
            <p>This is where Aqua Providers stops being a shop front and starts being a business tool.</p>
          </div>
          <ul className="otr-list">
            <li>
              <FiCheck />
              <span>
                <strong>Restock before you sell out.</strong> We track demand velocity across the platform and tell you which species to restock, ranked by how fast they're moving.
              </span>
            </li>
            <li>
              <FiCheck />
              <span>
                <strong>Know your buyer before you ship.</strong> Every buyer carries a reliability score. If someone has a history of cancellations, no-shows or disputes, you'll know before you pack
                the box.
              </span>
            </li>
            <li>
              <FiCheck />
              <span>
                <strong>Research your own business.</strong> AI analysis of your profile, performance and positioning.
              </span>
            </li>
            <li>
              <FiCheck />
              <span>
                <strong>Research your competitors.</strong> See the market landscape — who's active, what's selling, where the gaps are.
              </span>
            </li>
            <li>
              <FiCheck />
              <span>
                <strong>Get told what to do next.</strong> Growth opportunities, seasonal demand forecasts, and specific recommendations for your operation.
              </span>
            </li>
            <li>
              <FiCheck />
              <span>
                <strong>Ask it anything.</strong> A voice or text business assistant that knows your data and answers questions about your business.
              </span>
            </li>
          </ul>
          <div className="otr-body">
            <p>Plus dispatch performance, dispute rates, revenue, cancellation analysis and stock alerts — the kind of MI/BI a wholesaler pays four figures a month for. It's included.</p>
          </div>
        </div>

        <div className="otr-block">
          <h2 className="otr-h2">Trust you can prove, not just claim</h2>
          <div className="otr-body">
            <p>Every breeder on Aqua AI carries a public trust profile buyers can see before they buy:</p>
          </div>
          <ul className="otr-list">
            <li>
              <FiCheck />
              <span>
                <strong>Verified Breeder · Verified Delivery · Quick Dispatch · Quote Responsive · Trusted Seller</strong>
              </span>
            </li>
          </ul>
          <div className="otr-body">
            <p>
              Badges are earned on evidence, not self-declared. Dispatch inside 24 hours consistently and it shows. Keep your dispute rate under 2% and it shows. Trust tiers run Bronze → Silver → Gold
              → Platinum, recalculated nightly, with a buyer-facing trust card carrying signals like "This breeder typically dispatches within 24 hours."
            </p>
            <p>Good breeders have spent years being indistinguishable from bad ones online. That ends here.</p>
          </div>
        </div>

        <div className="otr-divider" />

        <div className="otr-block" style={{ marginTop: 0 }}>
          <h2 className="otr-h2">What it costs</h2>
          <div className="otr-body">
            <p>eBay takes 10–11% — and won't let you sell live species at all. That single line is what reframes 7.5% from a fee you're paying to a bargain you're getting.</p>
          </div>

          <div className="otr-price-row">
            <div className="otr-stat-card">
              <div className="otr-stat-value">£24.99</div>
              <div className="otr-stat-label">per month</div>
            </div>
            <div className="otr-stat-card">
              <div className="otr-stat-value">7.5%</div>
              <div className="otr-stat-label">on completed sales</div>
            </div>
          </div>
          <p className="otr-fineprint">
            Card processing is included. Our actual platform fee is around 5% — for qualified buyers, delivered to you, with the fulfilment, dispute handling and payouts run for you.
          </p>

          <div className="otr-body">
            <p>No listing fees. No relisting fees. No paying to be seen by people who were never going to buy.</p>
          </div>
        </div>

        <p className="otr-quote">
          Early adopter pricing — locked for life
          <span>The first 100 breeders lock their rate permanently.</span>
        </p>

        <div className="otr-cta-wrap">
          <button className="otr-cta-btn" onClick={() => navigate("/register/?isprovider=true")}>
            Apply as a Breeder
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
