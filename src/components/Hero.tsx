import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Gamepad2, ChevronRight } from 'lucide-react';
import GameBoard from './GameBoard';

interface HeroProps {
  onStartJourneyClick: () => void;
}

export default function Hero({ onStartJourneyClick }: HeroProps) {
  
  const scrollToServices = () => {
    const element = document.getElementById('services');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen pt-32 pb-20 flex items-center bg-transparent overflow-hidden">
      
      {/* Decorative large colored ambient blur bubbles */}
      <div className="absolute top-1/4 right-5 w-120 h-120 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-1/4 left-5 w-120 h-120 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse-glow" style={{ animationDelay: '3s' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Headline and Badges */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lg:col-span-7 space-y-8 text-left"
          >
            
            {/* Pill-shaped Badge at top */}
            <div className="inline-flex">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-purple-500/30 text-purple-400 font-mono text-[10px] md:text-xs font-bold uppercase tracking-wider glow-purple">
                <Gamepad2 size={12} className="animate-pulse text-purple-400" />
                <span>Gamified Learning | Team Building | Custom Training Games</span>
              </span>
            </div>

            {/* Massive Bold Uppercase Headline */}
            <div className="space-y-3">
              <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-tight uppercase">
                PURPOSE-BUILT
                <span className="block bg-gradient-to-r from-purple-400 via-fuchsia-500 to-indigo-500 bg-clip-text text-transparent text-glow-purple">
                  GAME SYSTEMS.
                </span>
              </h1>
            </div>

            {/* Explanatory Paragraph */}
            <p className="text-slate-400 text-base sm:text-lg leading-relaxed max-w-xl">
              We design and facilitate custom-built team-building programmes, gamified training sessions, and bespoke board games that turn learning objectives into engaging, memorable experiences.
            </p>

            {/* Two Side-By-Side Interactive Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              
              {/* Primary: Start Journey Button */}
              <button
                onClick={onStartJourneyClick}
                className="py-4 px-8 rounded-xl bg-slate-900 border border-purple-500/50 hover:border-purple-400 text-white font-display font-bold text-xs uppercase tracking-wider glow-purple transition-all duration-300 hover:scale-102 hover:bg-slate-900/80 cursor-pointer flex items-center justify-center gap-2 group/btn"
              >
                <Sparkles size={14} className="text-purple-400 group-hover/btn:animate-spin" />
                <span>START YOUR JOURNEY</span>
                <ChevronRight size={14} className="text-slate-500 group-hover/btn:translate-x-1 transition-transform" />
              </button>

              {/* Secondary: Explore Services Button */}
              <button
                onClick={scrollToServices}
                className="py-4 px-8 rounded-xl bg-transparent border border-slate-800 hover:border-slate-600 text-slate-400 hover:text-white font-display font-bold text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer flex items-center justify-center"
              >
                EXPLORE SERVICES
              </button>

            </div>

            {/* Tech terminal lines representing micro specs */}
            <div className="pt-4 border-t border-slate-900 flex flex-wrap gap-x-8 gap-y-2 font-mono text-[10px] text-slate-500">
              <p>📍 LOCATION: <span className="text-slate-400">MALAYSIA / REGIONAL</span></p>
              <p>🎲 FORMAT: <span className="text-slate-400">PHYSICAL + HYBRID BOARDS</span></p>
              <p>⚡ STATUS: <span className="text-purple-400">OPERATIONAL</span></p>
            </div>

          </motion.div>

          {/* Right Column: Gamified UI Element (GameBoard Component) */}
          <motion.div
            initial={{ opacity: 0, y: 45 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="lg:col-span-5 w-full"
          >
            <GameBoard />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
