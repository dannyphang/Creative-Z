import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import WhyUs from './components/WhyUs';
import Services from './components/Services';
import Process from './components/Process';
import Footer from './components/Footer';
import ContactModal from './components/ContactModal';
import ParticleNetwork from './components/ParticleNetwork';

export default function App() {
  const [isContactOpen, setIsContactOpen] = useState(false);

  const openContact = () => setIsContactOpen(true);
  const closeContact = () => setIsContactOpen(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-purple-500/30 selection:text-white relative overflow-hidden">
      
      {/* Global Background Grid Layers */}
      <div className="fixed inset-0 blueprint-grid opacity-100 pointer-events-none z-0" />
      
      {/* Interactive Particle Network Overlay */}
      <ParticleNetwork />
      
      {/* Absolute top/bottom master subtle glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[1px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent pointer-events-none z-10" />
      
      {/* Navigation Bar */}
      <Navbar onContactClick={openContact} />

      {/* Main Sections */}
      <main className="relative z-10">
        
        {/* Section 2: Hero Section (with built-in Game Board column) */}
        <Hero onStartJourneyClick={openContact} />

        {/* Section 3: What We Do (Our Core Services) */}
        <Services />

        {/* Section 4: How We Work (Our Process Section) */}
        <Process />

        {/* Section 5: "Why Creative Z" Strengths Banner */}
        <WhyUs />

      </main>

      {/* Section 6: Footer with full brand details and Zhi Kuan's contact info */}
      <div className="relative z-10">
        <Footer />
      </div>

      {/* Pop-up Interactive Contact Intake Terminal Dialog */}
      <ContactModal isOpen={isContactOpen} onClose={closeContact} />

    </div>
  );
}
