import React, { useState } from 'react';
import { Menu, X, Hexagon, Sparkles } from 'lucide-react';
import logoImg from '../../logo.png';

interface NavbarProps {
  onContactClick: () => void;
}

export default function Navbar({ onContactClick }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);

  const scrollToSection = (id: string) => {
    setIsOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Left: Logo Component with stylized "CZ" cube icon or custom logo.png */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            {!logoFailed ? (
              <div className="relative h-10 flex items-center">
                <img
                  src={logoImg}
                  alt="Creative Z Logo"
                  referrerPolicy="no-referrer"
                  onError={() => setLogoFailed(true)}
                  className="h-10 w-auto object-contain transition-all duration-300 hover:brightness-110"
                />
              </div>
            ) : (
              <div className="relative group">
                {/* Outer glow aura */}
                <div className="absolute inset-0 bg-purple-600 rounded-lg blur-md opacity-40 group-hover:opacity-75 transition-opacity duration-300 pointer-events-none" />
                
                {/* Creative "CZ" Cube represented by layered hexagons */}
                <div className="relative bg-slate-900 border border-purple-500/50 p-2 rounded-lg flex items-center justify-center">
                  <div className="relative w-6 h-6 flex items-center justify-center">
                    <Hexagon size={24} className="text-purple-400 fill-purple-950/20 absolute" />
                    <span className="absolute text-[10px] font-mono font-extrabold text-white tracking-tighter">CZ</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Show Text Brand if logo is our vector fallback or complementary to the logo */}
            <div className="flex flex-col">
              <span className="font-display font-black text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-purple-400 bg-clip-text text-transparent leading-none">
                Creative Z
              </span>
              <span className="block text-[8px] font-mono tracking-widest text-purple-400 uppercase leading-none mt-1">
                LEARNING DESIGN
              </span>
            </div>
          </div>

          {/* Center: Navigation links */}
          <div className="hidden md:flex items-center gap-10">
            {['SERVICES', 'ABOUT US', 'WHY US'].map((link) => {
              const elementId = link === 'SERVICES' ? 'services' : link === 'ABOUT US' ? 'about' : 'why-us';
              return (
                <button
                  key={link}
                  onClick={() => scrollToSection(elementId)}
                  className="font-mono text-xs font-semibold tracking-wider text-slate-400 hover:text-white transition-colors duration-200 uppercase relative py-2 group"
                >
                  {link}
                  <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-purple-500 transition-all duration-300 group-hover:w-full" />
                </button>
              );
            })}
          </div>

          {/* Right: Contact Us action link */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={onContactClick}
              className="font-mono text-xs font-bold tracking-wider text-purple-400 hover:text-white transition-all duration-300 border border-purple-500/30 hover:border-purple-500 px-5 py-2.5 rounded-xl bg-purple-950/10 hover:bg-purple-900/30 glow-purple"
            >
              CONTACT US
            </button>
          </div>

          {/* Mobile hamburger menu toggle */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl border border-slate-800 bg-slate-900/50 text-slate-400 hover:text-white transition-colors"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden bg-slate-950/95 border-b border-slate-900 backdrop-blur-lg px-4 pt-4 pb-6 space-y-4">
          <div className="flex flex-col gap-3">
            {['SERVICES', 'ABOUT US', 'WHY US'].map((link) => {
              const elementId = link === 'SERVICES' ? 'services' : link === 'ABOUT US' ? 'about' : 'why-us';
              return (
                <button
                  key={link}
                  onClick={() => scrollToSection(elementId)}
                  className="w-full text-left font-mono text-xs font-semibold tracking-wider text-slate-400 hover:text-white hover:bg-slate-900/40 p-3 rounded-xl transition-all uppercase"
                >
                  {link}
                </button>
              );
            })}
            
            <div className="pt-3 border-t border-slate-900">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onContactClick();
                }}
                className="w-full font-mono text-xs font-bold tracking-wider text-center text-white bg-gradient-to-r from-purple-600 to-indigo-600 p-3.5 rounded-xl glow-purple"
              >
                CONTACT US
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
