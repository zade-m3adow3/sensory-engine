'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { GlassInput } from '@/components/ui/GlassInput';
import { GlassButton } from '@/components/ui/GlassButton';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showAdminToggle, setShowAdminToggle] = useState(false);
  const [isAdminLogin, setIsAdminLogin] = useState(false);

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
        setShowAdminToggle(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    if (isAdminLogin && data.user) {
      await supabase.from('profiles').update({ is_superadmin: true }).eq('id', data.user.id);
    }

    setSuccess(true);
    setTimeout(() => {
      router.push('/tree');
    }, 1500);
  };

  if (success) {
    return (
      <motion.div 
        initial={{ opacity: 1, scale: 1 }}
        animate={{ opacity: 0, scale: 1.2, filter: 'blur(10px)' }}
        transition={{ duration: 1.5 }}
        className="flex flex-col items-center justify-center h-64"
      >
        <span className="text-4xl animate-bounce">🚀</span>
      </motion.div>
    );
  }

  return (
    <motion.form 
      onSubmit={handleLogin}
      className="flex flex-col w-full"
      animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
      transition={{ duration: 0.4 }}
    >
      <h1 className="text-[28px] font-space-grotesk font-bold text-white mb-1">Welcome back</h1>
      <p className="text-[14px] font-inter text-white/50 mb-8">Access your personalized space</p>

      <div className="space-y-4 mb-8">
        <GlassInput 
          placeholder="Your Gmail address" 
          type="email"
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
        />
        <GlassInput 
          placeholder="Password" 
          type="password"
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
        />
      </div>

      <AnimatePresence>
        {showAdminToggle && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 mb-6"
          >
            <input 
              type="checkbox" 
              id="admin" 
              checked={isAdminLogin} 
              onChange={(e) => setIsAdminLogin(e.target.checked)}
              className="accent-indigo-500 w-4 h-4 rounded cursor-pointer"
            />
            <label htmlFor="admin" className="text-xs text-indigo-300 font-inter cursor-pointer">Superadmin Login (Override)</label>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0 }}
            className="bg-red-500/20 border border-red-500/50 text-red-200 text-sm px-4 py-2 rounded-full mb-6 text-center"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <GlassButton 
        type="submit" 
        disabled={loading}
        className="w-full bg-indigo-600/80 hover:bg-indigo-500/80 border-indigo-400/50 shadow-[0_0_20px_rgba(79,70,229,0.4)] py-3"
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </GlassButton>

      <div className="mt-6 text-center">
        <Link href="/signup" className="text-white/50 hover:text-white transition-colors text-sm font-inter">
          First time here? Create an account
        </Link>
      </div>
    </motion.form>
  );
}
