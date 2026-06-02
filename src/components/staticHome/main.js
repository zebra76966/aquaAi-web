import Navbar from "./Navbar";
import HeroLanding from "./HeroLanding";
import TrustBar from "./TrustBar";
import AboutSection from "./AboutSection";
import FeaturesGrid from "./FeaturesGrid";
import HowItWorksTimeline from "./HowItWorksTimeline";
import HowItWorks from "./HowItWorks"; // existing 4-step row
import PricingSection from "./PricingSection";
import UserGuides from "./UserGuides";
import CTABanner from "./CTABanner"; // existing CTA card
import ContactSection from "./ContactSection";
import Footer from "./Footer"; // existing footer
const Home = () => {
  return (
    <>
      <Navbar />
      <HeroLanding />
      <TrustBar />
      <AboutSection />

      {/* <HowItWorksTimeline /> */}
      {/* <HowItWorks /> */}
      {/* <PricingSection /> */}
      {/* <UserGuides /> */}
      <CTABanner />
      <ContactSection />
    </>
  );
};

export default Home;
