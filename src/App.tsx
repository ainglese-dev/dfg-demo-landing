import { useState } from 'react';
import Navbar from '@/sections/Navbar';
import Hero from '@/sections/Hero';
import TrustStats from '@/sections/TrustStats';
import Services from '@/sections/Services';
import OpenService from '@/sections/OpenService';
import About from '@/sections/About';
import TaxesToGo from '@/sections/TaxesToGo';
import FAQ from '@/sections/FAQ';
import Appointment from '@/sections/Appointment';
import Footer from '@/sections/Footer';
import WhatsAppButton from '@/sections/WhatsAppButton';
import ScrollToTop from '@/sections/ScrollToTop';
import CookieConsent from '@/sections/CookieConsent';
import PolicyModal, { type PolicyType } from '@/sections/PolicyModal';

export default function App() {
  const [openPolicy, setOpenPolicy] = useState<PolicyType>(null);

  return (
    <div className="min-h-screen bg-bg font-sans text-text selection:bg-accent/30 selection:text-primary">
      <Navbar />
      <main>
        <Hero />
        <TrustStats />
        <Services />
        <OpenService />
        <About />
        <TaxesToGo />
        <FAQ />
        <Appointment />
      </main>
      <Footer onOpenPolicy={setOpenPolicy} />
      <WhatsAppButton />
      <ScrollToTop />
      <CookieConsent onOpenPolicy={setOpenPolicy} />
      <PolicyModal policy={openPolicy} onClose={() => setOpenPolicy(null)} />
    </div>
  );
}
