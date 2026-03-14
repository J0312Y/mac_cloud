import { useEffect } from 'react';
import Hero from '../components/sections/Hero';
import Features from '../components/sections/Features';
import HowItWorks from '../components/sections/HowItWorks';
import Pricing from '../components/sections/Pricing';
import { FAQ, CTA } from '../components/sections/FAQCTA';
import { useReveal } from '../hooks';

export default function Landing() {
  useReveal();
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <>
      <Hero />
      <Features />
      <HowItWorks />
      <Pricing />
      <FAQ />
      <CTA />
    </>
  );
}
