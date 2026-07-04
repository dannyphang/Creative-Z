import React from 'react';
import { Lightbulb, Layers, Users, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';

interface ProcessStep {
  number: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  shadow: string;
}

const STEPS: ProcessStep[] = [
  {
    number: "01",
    title: "UNDERSTAND",
    description: "Understand your objectives and context. We analyze your core training modules, challenges, and team dynamics to formulate the underlying business rules.",
    icon: Lightbulb,
    color: "from-blue-500 to-indigo-500",
    shadow: "shadow-blue-500/20 text-blue-400"
  },
  {
    number: "02",
    title: "DESIGN",
    description: "Design the game experience. Our designers map out complete rulesets, prototype elegant mechanics, draft board designs, and playtest game actions.",
    icon: Layers,
    color: "from-purple-500 to-fuchsia-500",
    shadow: "shadow-purple-500/20 text-purple-400"
  },
  {
    number: "03",
    title: "DELIVER",
    description: "Facilitate or deliver the programme. We run high-energy corporate game sessions or manufacture physical bespoke board games ready for internal distribution.",
    icon: Users,
    color: "from-pink-500 to-rose-500",
    shadow: "shadow-pink-500/20 text-pink-400"
  },
  {
    number: "04",
    title: "REVIEW",
    description: "Review and improve based on feedback. We conduct structured debrief loops, evaluate performance analytics, and optimize the game setup for maximum impact.",
    icon: TrendingUp,
    color: "from-emerald-500 to-teal-500",
    shadow: "shadow-emerald-500/20 text-emerald-400"
  }
];

export default function Process() {
  return (
    <section id="about" className="relative py-24 bg-transparent overflow-hidden border-t border-slate-900/60">
      {/* Background visual graphics */}
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <span className="font-mono text-xs font-bold tracking-widest text-blue-400 uppercase bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
            // OUR PROCESS
          </span>
          <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight mt-4">
            HOW WE WORK
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto my-5 rounded-full" />
        </motion.div>

        {/* 4-Step Process Stepper Timeline */}
        <div className="relative">
          
          {/* Horizontal connecting dotted line for Desktop */}
          <div className="hidden lg:block absolute top-[50px] left-[12%] right-[12%] h-0.5 border-t border-dashed border-slate-800 pointer-events-none z-0" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: index * 0.15, ease: "easeOut" }}
                  className="group text-center flex flex-col items-center"
                >
                  
                  {/* Step Badge Container */}
                  <div className="relative mb-6">
                    {/* Glowing outer drop-shadow wrapper */}
                    <div className="absolute inset-0 bg-slate-950 rounded-full blur-sm" />
                    
                    <div className="relative w-24 h-24 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center transition-all duration-300 group-hover:border-purple-500/50 group-hover:scale-105 shadow-xl glow-purple">
                      {/* Step Number Badge */}
                      <span className={`absolute -top-1 -right-1 font-mono text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-gradient-to-br ${step.color} text-white shadow-md`}>
                        {step.number}
                      </span>
                      
                      {/* Process Stage Icon */}
                      <div className={`transition-transform duration-300 group-hover:rotate-6 ${step.shadow}`}>
                        <Icon size={32} />
                      </div>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-display font-extrabold text-lg text-white mb-3 group-hover:text-purple-300 transition-colors uppercase tracking-wider">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-slate-400 text-sm leading-relaxed max-w-xs group-hover:text-slate-300 transition-colors">
                    {step.description}
                  </p>

                  {/* Visual bullet counter helper */}
                  <div className="mt-5 w-2 h-2 rounded-full bg-slate-800 group-hover:bg-purple-500 transition-colors duration-300" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
