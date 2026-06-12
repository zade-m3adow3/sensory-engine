"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useUserStore, RelationshipType } from "@/stores/userStore";
import RelationshipSelector from "./RelationshipSelector";
import RippleWrapper from "../ui/RippleWrapper";
import { motion } from "framer-motion";
import Link from "next/link";

export default function SignupForm() {
  const router = useRouter();
  const setProfile = useUserStore((state) => state.setProfile);
  
  const [relationship, setRelationship] = useState<RelationshipType | null>(null);
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [isSuperadmin, setIsSuperadmin] = useState(false);
  const [showAdminToggle, setShowAdminToggle] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ctrl+Shift+A secret admin toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "a") {
        setShowAdminToggle((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const isValidGmail = (email: string) => {
    return email.endsWith("@gmail.com") && email.length > 10;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!relationship) return setError("Please select your relationship.");
    if (!isValidGmail(email)) return setError("Please use a valid Gmail address.");
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== confirmPassword) return setError("Passwords do not match.");
    if (!nickname.trim()) return setError("Please enter a nickname.");

    setIsSubmitting(true);
    const supabase = createClient();
    
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nickname,
          relationship_type: relationship,
          is_superadmin: isSuperadmin,
        }
      }
    });

    if (signUpError) {
      setError(signUpError.message);
      setIsSubmitting(false);
      return;
    }

    // Success transition handled in parent or here
    if (data.user) {
      setProfile({
        id: data.user.id,
        nickname,
        relationship_type: relationship,
        is_superadmin: isSuperadmin,
        onboarding_complete: false,
        priority_score: 0,
      });
      router.push("/questionnaire");
    }
  };

  return (
    <motion.div 
      className="glass-panel w-full max-w-md mx-auto p-8 relative"
      animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
      transition={{ duration: 0.4 }}
    >
      <div className="absolute inset-0 rounded-2xl ring-1 ring-indigo-500/20 pointer-events-none" />
      
      {error && (
        <div className="absolute -top-12 left-0 right-0 glass-panel bg-red-500/20 border-red-500/50 text-white text-center py-2 px-4 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSignup} className="flex flex-col gap-6">
        <div>
          <label className="block text-white/70 text-sm font-medium mb-3">Who are you to me?</label>
          <RelationshipSelector selected={relationship} onSelect={setRelationship} />
        </div>

        <div className="flex flex-col gap-4">
          <div className="relative group">
            <input
              type="text"
              required
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500/50 peer transition-all"
              placeholder="What should I call you?"
            />
            <label className="absolute left-4 top-3 text-white/50 text-sm transition-all peer-focus:-top-6 peer-focus:text-xs peer-focus:text-indigo-400 peer-valid:-top-6 peer-valid:text-xs peer-valid:text-white/70 pointer-events-none">
              What should I call you?
            </label>
          </div>

          <div className="relative group mt-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => {
                if (email && !isValidGmail(email)) setError("Must be a @gmail.com address.");
              }}
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

          <div className="relative group mt-2">
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white placeholder-transparent focus:outline-none focus:ring-2 peer transition-all
                ${confirmPassword && password !== confirmPassword ? 'border-red-500/50 focus:ring-red-500/50' : 'border-white/10 focus:ring-indigo-500/50'}
              `}
              placeholder="Confirm password"
            />
            <label className="absolute left-4 top-3 text-white/50 text-sm transition-all peer-focus:-top-6 peer-focus:text-xs peer-focus:text-indigo-400 peer-valid:-top-6 peer-valid:text-xs peer-valid:text-white/70 pointer-events-none">
              Confirm password
            </label>
            {confirmPassword && password !== confirmPassword && (
              <span className="absolute right-4 top-3 text-red-400 text-xs font-medium">Doesn't match yet</span>
            )}
          </div>

          {showAdminToggle && (
            <div className="flex items-center gap-3 mt-2 px-2">
              <input
                type="checkbox"
                id="adminToggle"
                checked={isSuperadmin}
                onChange={(e) => setIsSuperadmin(e.target.checked)}
                className="w-4 h-4 rounded bg-white/10 border-white/20 text-indigo-500 focus:ring-indigo-500/50"
              />
              <label htmlFor="adminToggle" className="text-white/70 text-sm">Admin access</label>
            </div>
          )}
        </div>

        <RippleWrapper
          as="button"
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 rounded-xl bg-indigo-600/80 hover:bg-indigo-500 text-white font-medium shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all mt-4 disabled:opacity-50"
        >
          {isSubmitting ? "Creating..." : "Create Account"}
        </RippleWrapper>

        <p className="text-center text-white/50 text-sm mt-4">
          Already have an account? <Link href="/login" className="text-white/80 hover:text-white underline underline-offset-4">Sign in</Link>
        </p>
      </form>
    </motion.div>
  );
}
