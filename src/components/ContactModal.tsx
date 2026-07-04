import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Send, Sparkles, Hexagon, Terminal } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    interest: 'team-building',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate sending data to server
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1200);
  };

  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      interest: 'team-building',
      message: ''
    });
    setIsSuccess(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          
          {/* Backdrop blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg relative overflow-hidden shadow-2xl z-10"
          >
            {/* Background glowing design items */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-950/50">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-purple-500/15 border border-purple-500/30">
                  <Hexagon size={16} className="text-purple-400" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-white">PROJECT BRIEFING INTAKE</h3>
                  <p className="text-[10px] font-mono text-slate-500 uppercase leading-none mt-0.5">LAUNCH CHANNELS // CREATIVE Z</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-950 text-slate-400 hover:text-white transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content area */}
            <div className="p-6">
              {!isSuccess ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                      YOUR NAME *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Zhi Kuan"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500/70 transition-colors"
                    />
                  </div>

                  {/* Company & Phone Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                        ORGANIZATION *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        placeholder="Creative Z Studio"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500/70 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                        PHONE NUMBER *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="018-7720802"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500/70 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                      EMAIL ADDRESS *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="hello@creativez.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500/70 transition-colors"
                    />
                  </div>

                  {/* Interest Choice */}
                  <div>
                    <label className="block font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                      INTERESTED SPECIFICATION
                    </label>
                    <select
                      value={formData.interest}
                      onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-purple-500/70 transition-colors cursor-pointer"
                    >
                      <option value="team-building">Custom Team building & Training Experiences</option>
                      <option value="board-game">Bespoke Corporate Board Game Design</option>
                      <option value="strategy">Gamification Consultancy & Redesign</option>
                      <option value="other">General Partnership / Exploration</option>
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                      BRIEF OBJECTIVES / TIMELINE
                    </label>
                    <textarea
                      rows={3}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us about your learning objectives, audience size, and target date..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500/70 transition-colors resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3.5 rounded-xl font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 ${
                      isSubmitting
                        ? 'bg-purple-950/20 text-purple-400 border border-purple-900/40 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 border border-purple-500/30 hover:shadow-lg shadow-purple-500/20'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                        <span>Transmitting Brief...</span>
                      </>
                    ) : (
                      <>
                        <Send size={14} />
                        <span>SEND BRIEFING DATA</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* Success screen */
                <div className="text-center py-6">
                  {/* Neon success shield */}
                  <div className="w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/50 flex items-center justify-center mx-auto mb-6 glow-purple">
                    <Check size={28} className="text-purple-400 animate-bounce" />
                  </div>

                  <h4 className="font-display font-extrabold text-xl text-white mb-2">
                    BRIEF SECURELY DEPLOYED!
                  </h4>
                  <p className="text-sm text-slate-400 max-w-sm mx-auto mb-6">
                    Your learning objectives have been locked in. Zhi Kuan (Z) and the design team will reach back within 24 operational hours.
                  </p>

                  {/* Simulated Terminal Receipt */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-[10px] text-left text-slate-400 relative mb-6">
                    <div className="flex items-center gap-1.5 text-purple-400 mb-2 border-b border-slate-900 pb-2">
                      <Terminal size={12} />
                      <span>SECURE CONSOLE RECEIPT</span>
                    </div>
                    <div className="space-y-1.5">
                      <p><span className="text-slate-600">CLIENT:</span> {formData.name}</p>
                      <p><span className="text-slate-600">COMPANY:</span> {formData.company}</p>
                      <p><span className="text-slate-600">SPEC_ID:</span> CZ-{Math.floor(1000 + Math.random() * 9000)}</p>
                      <p><span className="text-slate-600">STATUS:</span> TRANSMITTED_SECURE_OK</p>
                    </div>
                  </div>

                  <button
                    onClick={handleReset}
                    className="font-mono text-[10px] font-bold tracking-widest text-slate-500 hover:text-white transition-colors uppercase"
                  >
                    [ SUBMIT ANOTHER INQUIRY ]
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
