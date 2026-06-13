"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useUserStore, RelationshipType } from "@/stores/userStore";
import RelationshipSelector from "./RelationshipSelector";
import RippleWrapper from "../ui/RippleWrapper";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface Props {
  onSuccess?: () => void;
}

export default function SignupForm({ onSuccess }: Props) {
  const router = useRouter();
  const setProfile = useUserStore((state) => state.setProfile);

  const [relationship, setRelationship] = useState<RelationshipType | null>(null);
  const [nickname, setNickname]         = useState("");
  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword]       = useState(false);
  const [isSuperadmin, setIsSuperadmin]       = useState(false);
  const [showAdminToggle, setShowAdminToggle] = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getPasswordStrength = () => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8)          score++;
    if (/\d/.test(password))           score++;
    if (/[a-zA-Z]/.test(password))     score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    return score;
  };
  const strength = getPasswordStrength();
  const strengthLabel = ["Weak", "Fair", "Good", "Strong"];
  const strengthColor  = ["bg-red-500", "bg-orange-400", "bg-amber-400", "bg-emerald-400"];

  // FIXED: e.code === "KeyA" — works regardless of caps lock or browser intercepts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.code === "KeyA") {
        e.preventDefault();
        setShowAdminToggle((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const isValidGmail = (v: string) => v.endsWith("@gmail.com") && v.length > 10;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!relationship && !isSuperadmin) return setError("Please select your relationship.");
    if (!isValidGmail(email))       return setError("Please use a valid Gmail address.");
    if (password.length < 8)        return setError("Password must be at least 8 characters.");
    if (!/\d/.test(password))       return setError("Password must contain at least one number.");
    if (password !== confirmPassword) return setError("Passwords do not match.");
    if (!nickname.trim())           return setError("Please enter a nickname.");

    setIsSubmitting(true);
    const supabase = createClient();
    
    // Default relationship for superadmin if they skip the selector
    const finalRelationship = isSuperadmin && !relationship ? "friend" : relationship;

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nickname, relationship_type: finalRelationship, is_superadmin: isSuperadmin },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setIsSubmitting(false);
      return;
    }

    if (data.user) {
      setProfile({
        id: data.user.id,
        nickname,
        relationship_type: finalRelationship as RelationshipType,
        is_superadmin: isSuperadmin,
        onboarding_complete: isSuperadmin, // bypass if superadmin
        priority_score: 0,
      });
      
      // If superadmin, mark onboarding complete immediately
      if (isSuperadmin) {
        await supabase.from("profiles").update({ onboarding_complete: true }).eq("id", data.user.id);
      }

      onSuccess?.();
      setTimeout(() => router.push(isSuperadmin ? "/tree" : "/questionnaire"), 1800);
    }
  };

  return (
    <motion.div
      className="glass-panel w-full max-w-md mx-auto p-8 relative"
      style={{ boxShadow: "0 0 70px rgba(99,102,241,0.1), 0 0 0 1px rgba(99,102,241,0.12)" }}
      animate={error ? { x: [-8, 8, -8, 8, 0] } : {}}
      transition={{ duration: 0.38 }}
    >
      {/* Subtle inner glow */}
      <div
        className="absolute inset-0 rounded-[20px] pointer-events-none"
        style={{ boxShadow: "inset 0 0 35px rgba(99,102,241,0.07)" }}
      />

      {/* Error banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-5 px-4 py-3 rounded-xl text-sm text-red-300 font-medium text-center"
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.28)" }}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSignup} className="flex flex-col gap-5">
        {/* Relationship */}
        <div>
          <label
            className="block mb-3 text-white/50"
            style={{ fontFamily: "Orbitron, monospace", fontSize: "0.6rem", letterSpacing: "0.3em", textTransform: "uppercase" }}
          >
            Who are you to Rounak?
          </label>
          <RelationshipSelector selected={relationship} onSelect={setRelationship} />
        </div>

        <div className="flex flex-col gap-3 mt-1">
          {/* Nickname */}
          <input
            id="signup-nickname"
            type="text"
            required
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="What should Rounak call you?"
            className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-indigo-500/55 focus:bg-white/[0.06] transition-all"
          />

          {/* Gmail */}
          <input
            id="signup-email"
            type="email"
            required
            value={email}
            onChange={(e) => { setEmail(e.target.value); if (error?.includes("Gmail")) setError(null); }}
            onBlur={() => { if (email && !isValidGmail(email)) setError("Must be a @gmail.com address."); }}
            placeholder="Your Gmail address"
            className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-indigo-500/55 focus:bg-white/[0.06] transition-all"
          />

          {/* Password */}
          <div className="relative">
            <input
              id="signup-password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (min. 8 chars + number)"
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3.5 pr-16 text-white text-sm placeholder-white/20 focus:outline-none focus:border-indigo-500/55 focus:bg-white/[0.06] transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/35 hover:text-white/65 transition-colors"
              style={{ fontFamily: "Orbitron, monospace", fontSize: "0.58rem", letterSpacing: "0.1em" }}
            >
              {showPassword ? "HIDE" : "SHOW"}
            </button>
            {password.length > 0 && (
              <div className="mt-2 flex items-center gap-2 px-1">
                <div className="flex gap-1 flex-1">
                  {[1, 2, 3, 4].map((l) => (
                    <div
                      key={l}
                      className={`h-[3px] flex-1 rounded-full transition-all duration-300 ${
                        strength >= l ? strengthColor[strength - 1] : "bg-white/10"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-white/35">{strengthLabel[strength - 1] ?? ""}</span>
              </div>
            )}
          </div>

          {/* Confirm password */}
          <div className="relative">
            <input
              id="signup-confirm"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              className={`w-full bg-white/[0.04] border rounded-xl px-4 py-3.5 text-white text-sm placeholder-white/20 focus:outline-none transition-all ${
                confirmPassword && password !== confirmPassword
                  ? "border-red-500/45 focus:border-red-500/65"
                  : "border-white/10 focus:border-indigo-500/55 focus:bg-white/[0.06]"
              }`}
            />
            {confirmPassword && password !== confirmPassword && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-red-400 text-xs">
                Doesn't match
              </span>
            )}
          </div>

          {/* Hidden admin toggle */}
          <AnimatePresence>
            {showAdminToggle && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)" }}
              >
                <input
                  type="checkbox"
                  id="adminToggle"
                  checked={isSuperadmin}
                  onChange={(e) => setIsSuperadmin(e.target.checked)}
                  className="w-4 h-4 rounded accent-indigo-500"
                />
                <label htmlFor="adminToggle" className="text-indigo-300 text-sm cursor-pointer">
                  Admin access
                </label>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Submit */}
        <RippleWrapper
          as="button"
          id="signup-submit"
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 rounded-xl text-white font-semibold text-sm tracking-wide disabled:opacity-45 mt-1 transition-all"
          style={{
            background: "linear-gradient(135deg, #6366f1, #4f46e5)",
            boxShadow: isSubmitting ? "none" : "0 0 35px rgba(99,102,241,0.5), 0 4px 20px rgba(99,102,241,0.28)",
          }}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Creating...
            </span>
          ) : (
            "Create Account"
          )}
        </RippleWrapper>

        <p className="text-center text-white/28 text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4 transition-colors">
            Sign in
          </Link>
        </p>
      </form>
    </motion.div>
  );
}
