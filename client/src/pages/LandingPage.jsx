import Hero from '../components/landing/Hero';
import HowItWorks from '../components/landing/HowItWorks';
import ImpactCounter from '../components/landing/ImpactCounter';
import Features from '../components/landing/Features';
import Testimonials from '../components/landing/Testimonials';
import CallToAction from '../components/landing/CallToAction';

export default function LandingPage() {
  return (
    <>
      <Hero />
      <div className="watercolor-divider" />
      <HowItWorks />
      <ImpactCounter />
      <Features />
      <div className="watercolor-divider" />
      <Testimonials />
      <CallToAction />
    </>
  );
}
