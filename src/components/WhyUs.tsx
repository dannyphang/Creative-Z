import React from 'react';
import { motion } from 'motion/react';
import { Hammer, Scale, Shield, Briefcase, RotateCcw, Brain, Sparkles } from 'lucide-react';

export default function WhyUs() {
  const strengths = [
    {
      title: "CUSTOM-DESIGNED SOLUTIONS",
      subtitle: "BESPOKE SYSTEMS",
      icon: Hammer,
      accent: "text-purple-400 border-purple-500/20",
      glowColor: "rgba(168, 85, 247, 0.15)",
      desc: "Every card, simulation variable, and dynamic system is custom-designed and crafted around your organization's exact business challenges, values, and operational rules."
    },
    {
      title: "BALANCED PLAY & STRUCTURE",
      subtitle: "RIGOROUS MECHANICS",
      icon: Scale,
      accent: "text-blue-400 border-blue-500/20",
      glowColor: "rgba(59, 130, 246, 0.15)",
      desc: "We strike a perfect mathematical balance between highly engaging, immersive gameplay loops and clear, structured learning objectives that translate into performance."
    },
    {
      title: "PROFESSIONAL FACILITATION",
      subtitle: "EXPERT GAME MASTERS",
      icon: Shield,
      accent: "text-pink-400 border-pink-500/20",
      glowColor: "rgba(236, 72, 153, 0.15)",
      desc: "Our seasoned facilitators act as executive game masters—orchestrating gameplay flow, prompting strategic reflection, and leading concrete business debriefs."
    },
    {
      title: "CORPORATE-APPROPRIATE DESIGN",
      subtitle: "ENTERPRISE-GRADE THEMING",
      icon: Briefcase,
      accent: "text-amber-400 border-amber-500/20",
      glowColor: "rgba(245, 158, 11, 0.15)",
      desc: "Polished aesthetic standards and executive-ready themes tailored specifically for high-level management, cross-functional teams, and prestigious client events."
    },
    {
      title: "REUSABLE LEARNING TOOLS",
      subtitle: "LONG-TERM IP ASSETS",
      icon: RotateCcw,
      accent: "text-emerald-400 border-emerald-500/20",
      glowColor: "rgba(16, 185, 129, 0.15)",
      desc: "Receive premium production-grade physical board kits, cards, digital boards, and companion tools that can be redeployed internally for years of onboarding."
    },
    {
      title: "COMPLEX GAMIFIED SYSTEMS",
      subtitle: "MATHEMATICAL BALANCING",
      icon: Brain,
      accent: "text-cyan-400 border-cyan-500/20",
      glowColor: "rgba(6, 182, 212, 0.15)",
      desc: "A proven background designing deep mathematical systems, multiplayer resource allocation grids, and interactive behavioral simulations that reveal human habits."
    }
  ];

  return (
    <section id="why-us" className="relative py-24 bg-transparent border-t border-b border-slate-900/60 overflow-hidden">
      {/* Structural subtle lines in the background */}
      <div className="absolute top-0 left-12 w-px h-full bg-gradient-to-b from-slate-900 via-purple-500/5 to-slate-900 pointer-events-none" />
      <div className="absolute top-0 right-12 w-px h-full bg-gradient-to-b from-slate-900 via-blue-500/5 to-slate-900 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-mono uppercase tracking-widest mb-4">
            <Sparkles size={11} className="animate-pulse" />
            <span>THE CREATIVE Z DIFFERENCE</span>
          </div>
          <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight text-white leading-none mb-4">
            WHY LEADING BRANDS <br className="hidden sm:inline"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
              TRUST OUR WORK
            </span>
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Gamification is more than putting points on a screen. It is an intricate craft balancing high-fidelity engagement, rigorous mechanics, and memorable learning outcomes.
          </p>
        </motion.div>

        {/* 3x2 Grid of Strengths */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {strengths.map((strength, index) => {
            const Icon = strength.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, margin: "-100px" }}
                transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
                className="group relative bg-slate-900/30 backdrop-blur-sm hover:bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/60 rounded-2xl p-6 text-left transition-all duration-300 flex flex-col justify-between"
                style={{
                  boxShadow: `0 0 20px -5px transparent`
                }}
                whileHover={{
                  y: -5,
                  boxShadow: `0 10px 30px -10px ${strength.glowColor}`
                }}
              >
                {/* Accent glow corner */}
                <div 
                  className="absolute top-0 right-0 w-24 h-24 rounded-tr-2xl rounded-bl-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: `radial-gradient(circle at top right, ${strength.glowColor}, transparent 70%)`
                  }}
                />

                <div>
                  {/* Icon Block */}
                  <div className={`inline-flex p-3 rounded-xl bg-slate-950 border ${strength.accent} mb-5 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={18} />
                  </div>

                  {/* Text Details */}
                  <h3 className="font-display font-extrabold text-lg text-white leading-tight mb-2 tracking-tight group-hover:text-purple-300 transition-colors duration-200">
                    {strength.title}
                  </h3>
                  <p className="font-mono text-[9px] font-bold tracking-widest text-slate-500 uppercase mb-3">
                    {strength.subtitle}
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {strength.desc}
                  </p>
                </div>

                {/* Bottom line anchor */}
                <div className="mt-6 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  <span className="font-mono text-[8px] text-purple-400 tracking-widest uppercase">VERIFIED EXCELLENCE</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
