import "./SocialsSection.css";
import { FiInstagram, FiTwitter, FiYoutube, FiMail, FiMessageCircle, FiPhone, FiGlobe, FiExternalLink } from "react-icons/fi";
import { FaWhatsapp, FaTiktok, FaFacebook, FaLinkedin, FaPinterest, FaReddit, FaTelegram, FaDiscord, FaSignal } from "react-icons/fa";
import { SiBluesky, SiThreads, SiMatrix, SiGooglechat } from "react-icons/si";
import { BsMicrosoftTeams } from "react-icons/bs";

/* ── All channels from supportData.js ── */
const MESSAGING = [
  { label: "WhatsApp", href: "https://wa.me/447586576323", icon: FaWhatsapp, color: "#25D366" },
  { label: "SMS", href: "sms:+447782207333", icon: FiPhone, color: "#00d4ff" },
  { label: "Signal", href: "https://signal.me/#p/+447586576323", icon: FaSignal, color: "#3a76f0" },
  { label: "Email (Support)", href: "mailto:support@aquaai.uk", icon: FiMail, color: "#00d4ff" },
  { label: "Email (Care)", href: "mailto:aquaai.care@gmail.com", icon: FiMail, color: "#00d4ff" },
  { label: "Teams", href: null, note: "Search AQUA-AI-Care", icon: BsMicrosoftTeams, color: "#6264a7" },
  { label: "Google Chat", href: "mailto:aquaai.care@gmail.com", icon: SiGooglechat, color: "#00897B" },
  { label: "Telegram Bot", href: "https://t.me/aquaai_care_bot", icon: FaTelegram, color: "#2AABEE" },
  { label: "Twitter / X DMs", href: "https://x.com/aquaai_care", icon: FiTwitter, color: "#e8f0fe" },
  { label: "Discord", href: "https://discord.gg/zvUVRTmqsB", icon: FaDiscord, color: "#5865F2" },
  { label: "Matrix", href: null, note: "@aquaai_care:matrix.org", icon: SiMatrix, color: "#e8f0fe" },
  { label: "Nextcloud Talk", href: null, note: "use21.thegood.cloud", icon: FiGlobe, color: "#0082C9" },
];

const SOCIALS = [
  { label: "Instagram", href: "https://instagram.com/aquaai_care", icon: FiInstagram, color: "#E1306C" },
  { label: "TikTok", href: "https://tiktok.com/@aquaai_care", icon: FaTiktok, color: "#e8f0fe" },
  { label: "Twitter / X", href: "https://x.com/aquaai_care", icon: FiTwitter, color: "#e8f0fe" },
  { label: "Facebook", href: "https://facebook.com/AQUA_AI", icon: FaFacebook, color: "#1877F2" },
  { label: "LinkedIn", href: "https://linkedin.com/company/AQUAAI", icon: FaLinkedin, color: "#0A66C2" },
  { label: "YouTube", href: "https://youtube.com/@aquaai_care", icon: FiYoutube, color: "#FF0000" },
  { label: "Pinterest", href: "https://pinterest.com/aquaai_care", icon: FaPinterest, color: "#E60023" },
  { label: "Threads", href: "https://threads.net/@aquaai_care", icon: SiThreads, color: "#e8f0fe" },
  { label: "Bluesky", href: "https://bsky.app/profile/aquaai_care", icon: SiBluesky, color: "#0085FF" },
  { label: "Reddit", href: "https://reddit.com/user/aquaai_care", icon: FaReddit, color: "#FF4500" },
  { label: "Telegram Channel", href: "https://t.me/aquaai_care", icon: FaTelegram, color: "#2AABEE" },
  { label: "Google Business", href: null, note: "Search AQUA AI on Google", icon: FiGlobe, color: "#4285F4" },
];

function ChannelCard({ label, href, note, icon: Icon, color }) {
  const content = (
    <>
      <div className="sc-card-icon" style={{ color }}>
        <Icon size={20} />
      </div>
      <div className="sc-card-info">
        <span className="sc-card-label">{label}</span>
        {note && <span className="sc-card-note">{note}</span>}
      </div>
      {href && <FiExternalLink className="sc-card-arrow" size={13} />}
    </>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className="sc-card">
        {content}
      </a>
    );
  }
  return <div className="sc-card sc-card--static">{content}</div>;
}

export default function SocialsSection() {
  return (
    <section className="sc-section" id="socials">
      <div className="sc-inner">
        <div className="sc-heading">
          <p className="sc-eyebrow">Connect With Us</p>
          <h2 className="sc-title">
            Find us <span className="sc-accent">everywhere</span>
          </h2>
          <p className="sc-subtitle">Reach out through any channel that suits you.</p>
        </div>

        {/* Messaging & Support */}
        {/* <div className="sc-block">
          <h3 className="sc-block-title">
            <FiMessageCircle size={16} /> Messaging & Support
          </h3>
          <div className="sc-grid">
            {MESSAGING.map((ch) => (
              <ChannelCard key={ch.label} {...ch} />
            ))}
          </div>
        </div> */}

        {/* Social Media */}
        <div className="sc-block">
          <h3 className="sc-block-title">
            <FiGlobe size={16} /> Social Media
          </h3>
          <div className="sc-grid">
            {SOCIALS.map((ch) => (
              <ChannelCard key={ch.label} {...ch} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
