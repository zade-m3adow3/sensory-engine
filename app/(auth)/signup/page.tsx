'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { GlassInput } from '@/components/ui/GlassInput';
import { GlassButton } from '@/components/ui/GlassButton';
import Link from 'next/link';

const RELATIONSHIPS = [
  { id: 'parent', label: '👨‍👩‍👧 Parent', color: 'bg-amber-500/20 border-amber-500/50' },
  { id: 'relative', label: '👨‍👩‍👦‍👦 Relative', color: 'bg-amber-600/20 border-amber-600/50' },
  { id: 'cousin', label: '🤝 Cousin', color: 'bg-amber-600/20 border-amber-600/50' },
  { id: 'friend', label: '🧑‍🤝‍🧑 Friend', color: 'bg-blue-500/20 border-blue-500/50' },
  { id: 'romantic_partner', label: '💑 Partner', color: 'bg-rose-500/20 border-rose-500/50' },
];

export default function SignupPage() {
  const [relationship, setRelationship] = useState('');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const supabase = createClientComponentClient();
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!relationship) return setError('Please select a relationship type.');
    if (!nickname) return setError('Please provide a nickname.');
    if (password !== confirmPassword) return setError('Passwords do not match.');

    setLoading(true);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nickname,
          relationship_type: relationship,
        }
      }
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      router.push('/onboarding/questionnaire');
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
        <span className="text-4xl animate-bounce">✨</span>
      </motion.div>
    );
  }

  return (
    <motion.form 
      onSubmit={handleSignup}
      className="flex flex-col w-full"
      animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
      transition={{ duration: 0.4 }}
    >
      <h1 className="text-[28px] font-space-grotesk font-bold text-white mb-1">Create your space</h1>
      <p className="text-[14px] font-inter text-white/50 mb-8">Tell me a little about yourself</p>

      {/* Relationship Selector */}
      <div className="flex overflow-x-auto gap-2 pb-4 mb-4 no-scrollbar">
        {RELATIONSHIPS.map((rel) => (
          <button
            key={rel.id}
            type="button"
            onClick={() => setRelationship(rel.id)}
            className={`whitespace-nowrap px-4 py-2 rounded-full border text-sm transition-all duration-300 ${
              relationship === rel.id 
                ? rel.color + ' text-white shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
            }`}
          >
            {rel.label}
          </button>
        ))}
      </div>

      <div className="space-y-4 mb-8">
        <GlassInput 
          placeholder="What should I call you?" 
          value={nickname} 
          onChange={(e) => setNickname(e.target.value)} 
        />
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
        <GlassInput 
          placeholder="Confirm Password" 
          type="password"
          value={confirmPassword} 
          onChange={(e) => setConfirmPassword(e.target.value)} 
        />
      </div>

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

      {/* Casting to any to avoid strict typing issues with custom components mapping down if not perfectly typed */}
      <GlassButton 
        type="submit" 
        disabled={loading}
        className="w-full bg-indigo-600/80 hover:bg-indigo-500/80 border-indigo-400/50 shadow-[0_0_20px_rgba(79,70,229,0.4)] py-3"
      >
        {loading ? 'Creating...' : 'Create Account'}
      </GlassButton>

      <div className="mt-6 text-center">
        <Link href="/login" className="text-white/50 hover:text-white transition-colors text-sm font-inter">
          Already have an account? Sign in
        </Link>
      </div>
    </motion.form>
  );
}
