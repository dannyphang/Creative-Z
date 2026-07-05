import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft, Save, LogOut, Check, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';

export default function Settings() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All fields are required');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setSuccess('Password updated successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError(data.error || 'Failed to update password');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_token_expiry');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans p-4 md:p-8">
      {/* Background gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/10 blur-[120px]" />
      </div>

      <div className="max-w-xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between bg-slate-900/50 backdrop-blur-md border border-purple-500/20 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/link-admin')}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition cursor-pointer"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-xl font-display font-bold uppercase tracking-widest text-white flex items-center gap-2">
                <Shield size={20} className="text-purple-400" /> System Settings
              </h1>
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-1">
                Security & Authentication Configuration
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-xs uppercase tracking-widest font-bold transition flex items-center gap-2 cursor-pointer"
          >
            <LogOut size={14} /> Log Out
          </button>
        </div>

        {/* Change Password Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/50 backdrop-blur-md border border-purple-500/20 rounded-2xl p-6 shadow-xl space-y-6"
        >
          <div className="border-b border-purple-500/10 pb-4">
            <h2 className="text-sm font-mono uppercase tracking-widest text-purple-300 font-bold">
              Change Master Password
            </h2>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-mono flex items-start gap-2">
                <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            
            {success && (
              <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-emerald-400 text-xs font-mono flex items-start gap-2">
                <Check size={15} className="shrink-0 mt-0.5" />
                <span>{success}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-400">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-slate-950/80 border border-purple-500/15 focus:border-purple-500 focus:outline-none rounded-xl px-4 py-2.5 text-slate-200 font-mono text-xs transition"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-400">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-slate-950/80 border border-purple-500/15 focus:border-purple-500 focus:outline-none rounded-xl px-4 py-2.5 text-slate-200 font-mono text-xs transition"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-400">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-950/80 border border-purple-500/15 focus:border-purple-500 focus:outline-none rounded-xl px-4 py-2.5 text-slate-200 font-mono text-xs transition"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold font-display uppercase tracking-widest rounded-xl transition cursor-pointer shadow-lg mt-2"
            >
              {isLoading ? 'Saving...' : <><Save size={16} /> Update Password</>}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
