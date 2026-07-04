import React, { useState } from 'react';
import { Hexagon, Mail, Phone, User, Heart } from 'lucide-react';
import logoImg from '../../logo.png';

export default function Footer() {
  const [logoFailed, setLogoFailed] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-slate-950 border-t border-slate-900 py-16 relative overflow-hidden">
      {/* Visual background lines */}
      <div className="absolute top-0 right-1/4 w-px h-full bg-slate-900/40 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pb-12 border-b border-slate-900">
          
          {/* Left Column: Brand & Mission */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              {!logoFailed ? (
                <div className="relative h-8 flex items-center">
                  <img
                    src={logoImg}
                    alt="Creative Z Logo"
                    referrerPolicy="no-referrer"
                    onError={() => setLogoFailed(true)}
                    className="h-8 w-auto object-contain transition-all duration-300 hover:brightness-110"
                  />
                </div>
              ) : (
                <div className="bg-slate-900 border border-purple-500/30 p-2 rounded-lg flex items-center justify-center">
                  <div className="relative w-5 h-5 flex items-center justify-center">
                    <Hexagon size={20} className="text-purple-400 fill-purple-950/20 absolute" />
                    <span className="absolute text-[8px] font-mono font-extrabold text-white">CZ</span>
                  </div>
                </div>
              )}
              <span className="font-display font-black text-xl tracking-tight text-white">
                Creative Z
              </span>
            </div>

            <p className="text-slate-400 text-sm leading-relaxed max-w-md">
              Creative Z is a learning design studio, specializing in gamified learning experiences, custom corporate board games, and bespoke interactive training modules for forward-thinking corporate teams.
            </p>

            {/* Horizontal Links List */}
            <div className="flex flex-wrap items-center gap-6 pt-2">
              {['SERVICES', 'ABOUT US', 'WHY US'].map((link) => {
                const elementId = link === 'SERVICES' ? 'services' : link === 'ABOUT US' ? 'about' : 'why-us';
                return (
                  <button
                    key={link}
                    onClick={() => scrollToSection(elementId)}
                    className="font-mono text-xs font-bold tracking-wider text-slate-500 hover:text-white transition-colors uppercase"
                  >
                    {link}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Contact info */}
          <div className="flex flex-col md:items-end justify-end gap-6 text-left md:text-right">
            <div className="space-y-4 max-w-sm md:ml-auto">
              <h4 className="font-mono text-xs font-extrabold text-purple-400 tracking-widest uppercase">
                // CONNECT WITH THE STUDIO
              </h4>
              
              <div className="space-y-3 font-sans text-sm text-slate-400">
                <div className="flex items-center gap-3 md:justify-end">
                  <User size={14} className="text-slate-500" />
                  <span>
                    Contact Person: <strong className="text-white">Zhi Kuan (Z)</strong>
                  </span>
                </div>
                
                <div className="flex items-center gap-3 md:justify-end">
                  <Phone size={14} className="text-slate-500" />
                  <a href="tel:0187720802" className="hover:text-purple-400 transition-colors">
                    018-7720802
                  </a>
                </div>

                <div className="flex items-center gap-3 md:justify-end">
                  <Mail size={14} className="text-slate-500" />
                  <a href="mailto:creativezventure@gmail.com" className="hover:text-purple-400 transition-colors">
                    creativezventure@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Credits & Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 text-xs text-slate-500 font-mono">
          <p>© {new Date().getFullYear()} Creative Z. All Rights Reserved.</p>
          <p className="flex items-center gap-1.5 mt-4 sm:mt-0">
            Engineered with <Heart size={10} className="text-purple-500 fill-purple-500" /> for Next-Gen Teams.
          </p>
        </div>
      </div>
    </footer>
  );
}
