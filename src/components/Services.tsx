import React, { useState } from 'react';
import { Trophy, Calendar, Sparkles, Sword, Play, Layers, Puzzle } from 'lucide-react';
import { motion } from 'motion/react';

interface ServiceItem {
  id: number;
  icon: React.ElementType;
  title: string;
  description: string;
  tag: string;
  accentClass: string;
  glowClass: string;
  specs: {
    players: string;
    duration: string;
    delivery: string;
    materials: string;
  };
}

const SERVICES_DATA: ServiceItem[] = [
  {
    id: 1,
    icon: Trophy,
    title: "Custom Team building & Gamified Training",
    description: "We design and run end-to-end team building and training experiences for corporate teams, turning key leadership, communications, and teamwork concepts into deep-immersion learning sessions.",
    tag: "HRDF CLAIMABLE",
    accentClass: "text-purple-400 bg-purple-500/10 border-purple-500/30",
    glowClass: "hover:shadow-purple-500/10 group-hover:border-purple-500/40",
    specs: {
      players: "12 - 250+ Pax",
      duration: "Half-Day / Full-Day",
      delivery: "Facilitated Live",
      materials: "Bespoke Game Kits Included"
    }
  },
  {
    id: 2,
    icon: Sword, // Represents a chess piece/strategy theme
    title: "Bespoke Board Game Design",
    description: "We design and manufacture premium custom board games that organizations can reuse internally for employee training, product onboarding, core values workshops, or executive alignment.",
    tag: "CORPORATE TRAINING",
    accentClass: "text-blue-400 bg-blue-500/10 border-blue-500/30",
    glowClass: "hover:shadow-blue-500/10 group-hover:border-blue-500/40",
    specs: {
      players: "4 - 8 per Box",
      duration: "60 - 120 Minutes",
      delivery: "Self-Facilitated / Train-the-Trainer",
      materials: "Printed Boards, Wooden Dice, Custom Decks"
    }
  },
  {
    id: 3,
    icon: Puzzle, // Represents a crystal ball / gamification theme
    title: "Gamification Strategy",
    description: "We support organizations in gamifying their existing static training decks or LMS syllabi by restructuring dry topics into interactive quests, point systems, and problem-solving formats.",
    tag: "LEARNING DESIGN",
    accentClass: "text-pink-400 bg-pink-500/10 border-pink-500/30",
    glowClass: "hover:shadow-pink-500/10 group-hover:border-pink-500/40",
    specs: {
      players: "Any Team Size",
      duration: "Ongoing Syllabi",
      delivery: "Consultancy & Design",
      materials: "Interactive Templates & System Blueprints"
    }
  }
];

export default function Services() {
  const [activeService, setActiveService] = useState<number | null>(null);

  return (
    <section id="services" className="relative py-24 bg-transparent overflow-hidden">
      {/* Background blueprint elements */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-slate-950 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />

      {/* Decorative colored glow orbs */}
      <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header (Centered) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="font-mono text-xs font-bold tracking-widest text-purple-400 uppercase bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
            // WHAT WE DO
          </span>
          <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight mt-4">
            OUR CORE SERVICES
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto my-5 rounded-full" />
          <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
            Helping teams learn by doing through purpose-built game systems tailored to your organisation's context, culture, and training goals.
          </p>
        </motion.div>

        {/* 3-Column Service Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {SERVICES_DATA.map((service, index) => {
            const Icon = service.icon;
            const isExpanded = activeService === service.id;

            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, margin: "-100px" }}
                transition={{ duration: 0.6, delay: index * 0.15, ease: "easeOut" }}
                onMouseEnter={() => setActiveService(service.id)}
                onMouseLeave={() => setActiveService(null)}
                className={`group flex flex-col bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-800/80 p-6 md:p-8 transition-all duration-300 relative overflow-hidden h-full cursor-pointer hover:bg-slate-900/70 hover:scale-[1.02] ${service.glowClass}`}
              >
                {/* Structural corner lines */}
                <span className="absolute top-0 left-0 w-4 h-px bg-slate-800 group-hover:bg-purple-500/50 transition-colors" />
                <span className="absolute top-0 left-0 h-4 w-px bg-slate-800 group-hover:bg-purple-500/50 transition-colors" />
                <span className="absolute bottom-0 right-0 w-4 h-px bg-slate-800 group-hover:bg-purple-500/50 transition-colors" />
                <span className="absolute bottom-0 right-0 h-4 w-px bg-slate-800 group-hover:bg-purple-500/50 transition-colors" />

                {/* Top: Icon & Tag */}
                <div className="flex items-center justify-between mb-6">
                  <div className={`p-3 rounded-xl border ${service.accentClass} transition-transform duration-300 group-hover:rotate-6`}>
                    <Icon size={22} />
                  </div>
                  <span className="font-mono text-[9px] font-extrabold tracking-wider text-slate-500 border border-slate-800 px-2 py-1 rounded bg-slate-950/40 uppercase">
                    SYS-REFS: {`0${service.id}`}
                  </span>
                </div>

                {/* Middle: Title & Description */}
                <div className="flex-grow">
                  <h3 className="font-display font-bold text-xl text-white mb-3 group-hover:text-purple-300 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-6">
                    {service.description}
                  </p>
                </div>

                {/* Spec Sheet Terminal Section (Interactive details toggles on hover) */}
                <div className="bg-slate-950/80 border border-slate-800/60 rounded-xl p-4 mb-6 font-mono text-[10px] space-y-2.5">
                  <div className="flex justify-between border-b border-slate-900 pb-1.5">
                    <span className="text-slate-500 uppercase font-semibold">PLAYERS:</span>
                    <span className="text-slate-300">{service.specs.players}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-900 pb-1.5">
                    <span className="text-slate-500 uppercase font-semibold">DURATION:</span>
                    <span className="text-slate-300">{service.specs.duration}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-900 pb-1.5">
                    <span className="text-slate-500 uppercase font-semibold">DELIVERY:</span>
                    <span className="text-purple-400">{service.specs.delivery}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 uppercase font-semibold">MATERIALS:</span>
                    <span className="text-blue-400">{service.specs.materials.split(',')[0]}</span>
                  </div>
                </div>

                {/* Bottom Pill Tag */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
                  <span className="font-mono text-[10px] font-extrabold tracking-widest text-slate-400 bg-slate-900 border border-slate-800/80 rounded-full px-3 py-1 text-center select-none uppercase">
                    {service.tag}
                  </span>
                  
                  <span className="text-[10px] font-mono text-purple-400 tracking-wider font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1">
                    DEPLOY NOW ➔
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
