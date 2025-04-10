import Navbar from '@/components/navbar/index';
import HeroSection from '@/components/sections/hero-section';
import FeaturesSection from '@/components/sections/features-section';
import HowItWorksSection from '@/components/sections/how-it-works-section';
import StoriesSection from '@/components/sections/stories-section';
import TestimonialsSection from '@/components/sections/testimonials-section';
import PricingSection from '@/components/sections/pricing-section';
import CtaSection from '@/components/sections/cta-section';
import Footer from '@/components/sections/footer';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-violet-50">
      <Navbar />
      <div id="home" className="pt-16">
        <HeroSection />
      </div>
      <div id="features">
        <FeaturesSection />
      </div>
      <div id="how-it-works">
        <HowItWorksSection />
      </div>
      <div id="stories">
        <StoriesSection />
      </div>
      <TestimonialsSection />
      <div id="pricing">
        <PricingSection />
      </div>
      <CtaSection />
      <Footer />
    </div>
  );
}
