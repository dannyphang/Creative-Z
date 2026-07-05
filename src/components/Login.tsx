import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, Shield, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';

export default function Login() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Password is required');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        // Calculate expiry to 5 hours from now
        const expiry = new Date().getTime() + 5 * 60 * 60 * 1000;
        localStorage.setItem('admin_token', data.token);
        localStorage.setItem('admin_token_expiry', expiry.toString());
        navigate('/link-admin');
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('Network error during authentication');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans flex items-center justify-center p-4">
      {/* Background gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-600/10 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-slate-900/50 backdrop-blur-md border border-purple-500/20 rounded-2xl p-8 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-indigo-600" />
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30 flex items-center justify-center mb-4 text-purple-400">
            <Shield size={32} />
          </div>
          <h2 className="text-2xl font-display font-bold uppercase tracking-widest text-white">
            System Auth
          </h2>
          <p className="text-xs font-mono text-slate-500 mt-2 uppercase tracking-widest text-center">
            Link Administrator Portal
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-mono flex items-start gap-2"
            >
              <AlertTriangle size={15} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          <div className="space-y-2">
            <label htmlFor="password" className="block text-[10px] font-mono uppercase tracking-widest text-slate-400">
              Master Decryption Key
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-purple-500/50">
                <Lock size={16} />
              </div>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full bg-slate-950/80 border border-purple-500/15 focus:border-purple-500 focus:outline-none rounded-xl pl-10 pr-4 py-3 text-slate-200 placeholder-slate-700 font-mono text-sm transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold font-display uppercase tracking-widest rounded-xl transition cursor-pointer shadow-lg shadow-purple-500/20"
          >
            {isLoading ? (
              <span className="font-mono text-xs animate-pulse">Authenticating...</span>
            ) : (
              <>
                <ArrowRight size={16} />
                Access Terminal
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
