import React from 'react';
import Link from 'next/link';
import { StarField } from '@/components/ui/StarField';

export default function PrivacyPolicy() {
  return (
    <div className="relative min-h-screen w-full bg-[radial-gradient(circle_at_center,_#0a0f2e_0%,_#000000_100%)] text-white overflow-hidden selection:bg-indigo-500/30">
      <StarField count={100} />
      
      <div className="relative z-10 max-w-3xl mx-auto px-6 py-20 font-inter">
        <Link href="/login" className="inline-block mb-8 text-indigo-400 hover:text-indigo-300 transition-colors text-sm">
          ← Back to Login
        </Link>
        
        <div className="p-8 md:p-12 bg-white/[0.02] backdrop-blur-[24px] border border-white/10 rounded-3xl shadow-[0_0_60px_rgba(99,102,241,0.1)]">
          <h1 className="text-4xl font-space-grotesk font-bold mb-2">Privacy Policy</h1>
          <p className="text-white/50 text-sm mb-10">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="space-y-8 text-white/80 leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-white mb-4 font-space-grotesk">1. Introduction</h2>
              <p>Welcome to Sensory Engine ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This privacy policy describes how we collect, use, and protect your data when you use our personalized relationship tree website and AI services.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4 font-space-grotesk">2. Information We Collect</h2>
              <p>We collect personal information that you voluntarily provide to us when you register on the website, express an interest in obtaining information about us or our products, or otherwise contact us. The personal information that we collect depends on the context of your interactions with us and the website, and includes:</p>
              <ul className="list-disc pl-5 mt-3 space-y-2 text-white/70">
                <li><strong>Account Data:</strong> Gmail address, passwords, and nicknames.</li>
                <li><strong>Relationship Data:</strong> Your specified relationship type (e.g., Parent, Friend, Partner).</li>
                <li><strong>Personal Details:</strong> Birthdates, inside jokes, memory timelines, and media/audio files uploaded to your profile.</li>
                <li><strong>AI Chat Interactions:</strong> Messages sent to our AI assistant to provide you with personalized responses.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4 font-space-grotesk">3. How We Use Your Information</h2>
              <p>We use personal information collected via our website for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.</p>
              <ul className="list-disc pl-5 mt-3 space-y-2 text-white/70">
                <li><strong>Personalization:</strong> Generating your customized 3D relationship tree and calculating priority scores for visual representation.</li>
                <li><strong>AI Assistance:</strong> Using your provided memories and inside jokes as context for our AI chat features via Google AI Studio and Upstash caching.</li>
                <li><strong>Notifications:</strong> Sending automated email reminders for birthdays or special events via Vercel Cron.</li>
                <li><strong>Authentication:</strong> Managing your account and keeping your data secure using Supabase Auth.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4 font-space-grotesk">4. How We Share Your Information</h2>
              <p>We only share information with the following third parties to operate our services:</p>
              <ul className="list-disc pl-5 mt-3 space-y-2 text-white/70">
                <li><strong>Supabase:</strong> For database hosting, authentication, and secure file storage.</li>
                <li><strong>Google AI Studio:</strong> For processing chat inputs to generate AI responses.</li>
                <li><strong>Upstash:</strong> For rate-limiting API requests to prevent abuse.</li>
                <li><strong>Vercel & Sentry:</strong> For website hosting, cron jobs, and performance/error monitoring.</li>
              </ul>
              <p className="mt-3">We do not sell, rent, or trade your personal information to third parties.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4 font-space-grotesk">5. Data Security</h2>
              <p>We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. All data in transit is encrypted, and database access is strictly governed by Row Level Security (RLS) policies ensuring you can only access your own private data.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4 font-space-grotesk">6. Your Privacy Rights</h2>
              <p>Depending on your location, you may have the right to request access to the personal information we collect from you, change that information, or delete it in some circumstances. To request to review, update, or delete your personal information, please contact the site administrator.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
