import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Zap, Coins, Users, ShieldAlert, Sparkles, RefreshCw, Trophy, Info, Plus } from 'lucide-react';
import { gameService, GameState } from '../services/game.service';

export default function GameBoard() {
  const [gameState, setGameState] = useState<GameState>(gameService.getState());

  // Subscribe to reactive service state
  useEffect(() => {
    const subscription = gameService.state$.subscribe((state) => {
      setGameState(state);
    });
    return () => subscription.unsubscribe();
  }, []);

  const { round, availablePoints, fields, health, gameOver, accidentModalOpen, gameOverModalOpen, history } = gameState;

  return (
    <div className="w-full bg-slate-900/75 backdrop-blur-md rounded-2xl border border-slate-800 p-5 md:p-6 shadow-2xl relative overflow-hidden group" id="game-board-container">
      {/* Glow Backdrops */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse" />
          <h3 className="font-mono text-[10px] md:text-xs uppercase tracking-widest text-purple-400">FOCUS MATRIX SIMULATOR v2.0</h3>
        </div>
        <button 
          onClick={() => gameService.reset()}
          className="text-slate-500 hover:text-white transition-colors duration-200 p-1 rounded hover:bg-slate-800/50"
          title="Reset Simulation"
          id="btn-reset-simulation"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Main Panel Stats & Resource Pools */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {/* Health Panel */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex flex-col justify-between">
          <span className="font-mono text-[9px] uppercase tracking-wider text-slate-500 block mb-1">HEALTH & RESILIENCE</span>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">Hearts</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((h) => (
                <Heart 
                  key={h} 
                  size={16} 
                  className={h <= health ? "fill-rose-500 text-rose-500 animate-pulse" : "text-slate-800"} 
                />
              ))}
            </div>
          </div>
        </div>

        {/* Action Points Pool */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex flex-col justify-between">
          <span className="font-mono text-[9px] uppercase tracking-wider text-slate-500 block mb-1">ENERGY FOR ROUND {round}/5</span>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">Action Points</span>
            <div className="flex items-center gap-1">
              {[1, 2].map((p) => (
                <Zap 
                  key={p} 
                  size={15} 
                  className={p <= availablePoints ? "fill-amber-400 text-amber-400" : "text-slate-800"} 
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 5x3 Round History Matrix Dashboard */}
      <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800/80 mb-5 relative">
        <span className="font-mono text-[9px] uppercase tracking-wider text-purple-400 block mb-3 text-left">5x3 STRATEGY MATRIX (ROUNDS & TARGETS)</span>
        
        <div className="grid grid-cols-4 gap-2 text-[10px] font-mono">
          {/* Table Header */}
          <div className="text-slate-600 font-bold uppercase">Round</div>
          <div className="text-purple-400 text-center font-bold uppercase flex items-center justify-center gap-1">
            <Coins size={10} /> Money
          </div>
          <div className="text-pink-400 text-center font-bold uppercase flex items-center justify-center gap-1">
            <Heart size={10} className="fill-pink-500/20" /> Family
          </div>
          <div className="text-blue-400 text-center font-bold uppercase flex items-center justify-center gap-1">
            <Users size={10} /> Friends
          </div>

          {/* Matrix Rows (1 to 5) */}
          {[1, 2, 3, 4, 5].map((r) => {
            const isPast = r < round;
            const isCurrent = r === round;
            
            // Extract history point or use current if live
            const roundData = history.find(h => h.round === r) || (isCurrent ? fields : null);
            
            return (
              <React.Fragment key={r}>
                {/* Round indicator column */}
                <div className={`py-1 rounded flex items-center gap-1 transition-all ${isCurrent ? 'text-purple-300 font-bold' : isPast ? 'text-slate-500' : 'text-slate-700'}`}>
                  <span>R{r}</span>
                  {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />}
                </div>

                {/* Money column cell */}
                <div className={`text-center py-1.5 rounded border transition-all duration-300 ${
                  isCurrent ? 'bg-purple-950/30 border-purple-500/40 text-purple-300 font-bold shadow-sm shadow-purple-500/10' :
                  isPast ? 'bg-slate-900/50 border-slate-800/80 text-slate-300' : 'bg-slate-950/20 border-slate-950/10 text-slate-800'
                }`}>
                  {roundData ? `${roundData.money}/5` : '-'}
                </div>

                {/* Family column cell */}
                <div className={`text-center py-1.5 rounded border transition-all duration-300 ${
                  isCurrent ? 'bg-pink-950/30 border-pink-500/40 text-pink-300 font-bold shadow-sm shadow-pink-500/10' :
                  isPast ? 'bg-slate-900/50 border-slate-800/80 text-slate-300' : 'bg-slate-950/20 border-slate-950/10 text-slate-800'
                }`}>
                  {roundData ? `${roundData.family}/5` : '-'}
                </div>

                {/* Friends column cell */}
                <div className={`text-center py-1.5 rounded border transition-all duration-300 ${
                  isCurrent ? 'bg-blue-950/30 border-blue-500/40 text-blue-300 font-bold shadow-sm shadow-blue-500/10' :
                  isPast ? 'bg-slate-900/50 border-slate-800/80 text-slate-300' : 'bg-slate-950/20 border-slate-950/10 text-slate-800'
                }`}>
                  {roundData ? `${roundData.friends}/5` : '-'}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Allocation Action Controls */}
      <div className="bg-slate-950/90 border border-slate-800/80 rounded-xl p-4 text-left mb-4">
        <span className="font-mono text-[9px] uppercase tracking-wider text-slate-500 block mb-3">ALLOCATE ACTION POINTS</span>
        
        <div className="space-y-3">
          {/* Money field */}
          <div className="flex items-center justify-between bg-slate-900/50 p-2.5 rounded-lg border border-slate-800/60">
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <Coins size={14} />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Money Field</span>
                <span className="text-[10px] font-mono text-slate-500">Business / Career wealth</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-purple-400">{fields.money} / 5</span>
              </div>
              <button
                onClick={() => gameService.allocatePoint('money')}
                disabled={gameOver || availablePoints <= 0 || fields.money >= 5}
                className="p-1.5 rounded bg-purple-500 hover:bg-purple-400 text-white disabled:opacity-30 disabled:hover:bg-purple-500 transition-all cursor-pointer"
                title="Add 1 Point to Money"
                id="btn-allocate-money"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Family field */}
          <div className="flex items-center justify-between bg-slate-900/50 p-2.5 rounded-lg border border-slate-800/60">
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded bg-pink-500/10 border border-pink-500/20 text-pink-400">
                <Heart size={14} className="fill-pink-500/10" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Family Field</span>
                <span className="text-[10px] font-mono text-slate-500">Home life & core bonds</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-pink-400">{fields.family} / 5</span>
              </div>
              <button
                onClick={() => gameService.allocatePoint('family')}
                disabled={gameOver || availablePoints <= 0 || fields.family >= 5}
                className="p-1.5 rounded bg-pink-500 hover:bg-pink-400 text-white disabled:opacity-30 disabled:hover:bg-pink-500 transition-all cursor-pointer"
                title="Add 1 Point to Family"
                id="btn-allocate-family"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Friends field */}
          <div className="flex items-center justify-between bg-slate-900/50 p-2.5 rounded-lg border border-slate-800/60">
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <Users size={14} />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Friends Field</span>
                <span className="text-[10px] font-mono text-slate-500">Social matrix & networks</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-blue-400">{fields.friends} / 5</span>
              </div>
              <button
                onClick={() => gameService.allocatePoint('friends')}
                disabled={gameOver || availablePoints <= 0 || fields.friends >= 5}
                className="p-1.5 rounded bg-blue-500 hover:bg-blue-400 text-white disabled:opacity-30 disabled:hover:bg-blue-500 transition-all cursor-pointer"
                title="Add 1 Point to Friends"
                id="btn-allocate-friends"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <p className="text-[10px] text-slate-500 mt-2 font-mono text-center">
        {gameOver 
          ? "Simulation complete. Reset to try another strategy." 
          : `Allocate ${availablePoints} points this turn. Maximize stats to prepare for crises!`
        }
      </p>

      {/* Mini Game Copyright Declaration */}
      <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[8px] font-mono text-slate-600">
        <span>© {new Date().getFullYear()} Creative Z. All Rights Reserved.</span>
        <span className="tracking-widest uppercase">Proprietary Simulation IP</span>
      </div>

      {/* MODALS */}
      <AnimatePresence>
        {/* Accident Trigger Modal */}
        {accidentModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" id="accident-modal">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
              onClick={() => gameService.closeAccidentModal()}
            />
            
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="bg-slate-900 border border-rose-500/50 rounded-2xl p-6 max-w-md w-full relative z-10 shadow-2xl text-left"
            >
              <div className="flex items-center gap-3 mb-4 text-rose-400">
                <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
                  <ShieldAlert size={24} className="animate-bounce" />
                </div>
                <div>
                  <h4 className="font-mono text-xs uppercase tracking-widest text-rose-500">CRISIS REPORT</h4>
                  <h3 className="font-display font-black text-lg text-white">UNEXPECTED ACCIDENT!</h3>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                <p className="font-bold text-white">
                  "An unexpected accident occurred! You lacked the focused resources to handle it perfectly."
                </p>
                <p>
                  You tried to balance your stats. But because you didn't focus 100% of your energy on a single category, none of them reached the critical limit of 5 points to build resilience.
                </p>
                <p className="p-2.5 rounded bg-slate-950 border border-slate-800 text-rose-400 font-mono text-[11px]">
                  💥 HEALTH IMPACT: -2 Hearts
                </p>
              </div>

              <button
                onClick={() => gameService.closeAccidentModal()}
                className="mt-6 w-full py-3 px-5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-display font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-rose-500/20"
                id="btn-close-accident-modal"
              >
                Acknowledge Lesson & Continue
              </button>
            </motion.div>
          </div>
        )}

        {/* Game Over / Lesson Modal */}
        {gameOverModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" id="game-over-modal">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/85 backdrop-blur-lg"
            />
            
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="bg-slate-900 border border-purple-500/40 rounded-2xl p-6 max-w-md w-full relative z-10 shadow-2xl text-left"
            >
              <div className="flex items-center gap-3 mb-4 text-purple-400">
                <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <Trophy size={24} className="text-purple-400" />
                </div>
                <div>
                  <h4 className="font-mono text-xs uppercase tracking-widest text-purple-400">SIMULATION WRAP-UP</h4>
                  <h3 className="font-display font-black text-lg text-white">FINAL OUTCOME ACHIEVED</h3>
                </div>
              </div>

              {/* Stats Review */}
              <div className="grid grid-cols-4 gap-2 mb-5 text-center font-mono">
                <div className="bg-slate-950/60 p-2 rounded border border-slate-800/80">
                  <span className="text-[9px] text-slate-500 block uppercase">Money</span>
                  <span className="text-sm font-bold text-purple-400">{fields.money}</span>
                </div>
                <div className="bg-slate-950/60 p-2 rounded border border-slate-800/80">
                  <span className="text-[9px] text-slate-500 block uppercase">Family</span>
                  <span className="text-sm font-bold text-pink-400">{fields.family}</span>
                </div>
                <div className="bg-slate-950/60 p-2 rounded border border-slate-800/80">
                  <span className="text-[9px] text-slate-500 block uppercase">Friends</span>
                  <span className="text-sm font-bold text-blue-400">{fields.friends}</span>
                </div>
                <div className="bg-slate-950/60 p-2 rounded border border-slate-800/80">
                  <span className="text-[9px] text-slate-500 block uppercase">Health</span>
                  <span className="text-sm font-bold text-rose-500">{health}/3</span>
                </div>
              </div>

              <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
                <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/20 text-purple-200">
                  <p className="font-bold text-white mb-1.5 flex items-center gap-1.5">
                    <Info size={13} className="text-purple-400" /> Philosophical Lesson:
                  </p>
                  <p className="italic">
                    "Lesson: Focus on one field or target, but not all. Humans are not perfect and cannot master everything."
                  </p>
                </div>
                
                <p>
                  Trying to build everything simultaneously spreads you thin and leaves you vulnerable. When designed with corporate focus, game systems from <strong>Creative Z</strong> highlight precise, strategic trade-offs that build long-term group alignment.
                </p>
              </div>

              <button
                onClick={() => {
                  gameService.reset();
                }}
                className="mt-6 w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-display font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
                id="btn-reset-simulation-modal"
              >
                <RefreshCw size={12} />
                <span>Reset Simulation</span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
