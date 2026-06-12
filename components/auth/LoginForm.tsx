"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useUserStore } from "@/stores/userStore";
import RippleWrapper from "../ui/RippleWrapper";
import { motion } from "framer-motion";
import Link from "next/link";

export default function LoginForm() {
  const router = useRouter();
  const setProfile = useUserStore((state) => state.setProfile);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    const supabase = createClient();
    
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError("That doesn't look right. Try again.");
      setIsSubmitting(false);
      return;
    }

    if (data.user) {
      // Fetch profile data
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
        
      if (profileData) {
        setProfile(profileData);
      }
      
      router.push("/tree");
    }
  };

  return (
    <motion.div 
      className="glass-panel w-full max-w-md mx-auto p-8 relative shadow-[0_0_40px_rgba(79,70,229,0.08)]"
      animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
      transition={{ duration: 0.4 }}
    >
      <div className="absolute inset-0 rounded-2xl ring-1 ring-indigo-500/20 pointer-events-none" />
      
      {error && (
        <div className="absolute -top-12 left-0 right-0 glass-panel bg-red-500/20 border-red-500/50 text-white text-center py-2 px-4 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      <div className="mb-8 text-center">
        <h2 className="text-2xl font-space-grotesk font-bold text-white mb-2">Welcome Back</h2>
        <p className="text-white/60 text-sm">Enter your credentials to access your world.</p>
      </div>

      <form onSubmit={handleLogin} className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <div className="relative group">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500/50 peer transition-all"
              placeholder="Your Gmail address"
            />
            <label className="absolute left-4 top-3 text-white/50 text-sm transition-all peer-focus:-top-6 peer-focus:text-xs peer-focus:text-indigo-400 peer-valid:-top-6 peer-valid:text-xs peer-valid:text-white/70 pointer-events-none">
              Your Gmail address
            </label>
          </div>

          <div className="relative group mt-2">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500/50 peer transition-all"
              placeholder="Password"
            />
            <label className="absolute left-4 top-3 text-white/50 text-sm transition-all peer-focus:-top-6 peer-focus:text-xs peer-focus:text-indigo-400 peer-valid:-top-6 peer-valid:text-xs peer-valid:text-white/70 pointer-events-none">
              Password
            </label>
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-3 text-white/50 hover:text-white/80 text-sm"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <RippleWrapper
          as="button"
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 rounded-xl bg-indigo-600/80 hover:bg-indigo-500 text-white font-medium shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] transition-all mt-4 disabled:opacity-50 animate-[pulse_3s_ease-in-out_infinite]"
        >
          {isSubmitting ? "Signing in..." : "Sign In"}
        </RippleWrapper>

        <p className="text-center text-white/50 text-sm mt-4">
          Don't have an account? <Link href="/signup" className="text-white/80 hover:text-white underline underline-offset-4">Sign up</Link>
        </p>
      </form>
    </motion.div>
  );
}
