'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { BirthdayOverlay } from './BirthdayOverlay';
// Assuming InsideJokesSection was built previously
import { InsideJokesSection } from './InsideJokesSection';

interface ProfileModalProps {
  userId: string;
  onClose: () => void;
}

type TabType = 'Messages' | 'Memories' | 'Inside Jokes' | 'Chat with AI';

export function ProfileModal({ userId, onClose }: ProfileModalProps) {
  const [profile, setProfile] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [memories, setMemories] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('Messages');
  const [isBirthday, setIsBirthday] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const supabase = createClient();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      
      // 1. Fetch current logged-in user to check ownership and admin rights
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: currProfile } = await supabase.from('profiles').select('is_superadmin').eq('id', user.id).single();
        setCurrentUser({ id: user.id, isSuperAdmin: currProfile?.is_superadmin });
      }

      // 2. Fetch the target profile data
      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      setProfile(prof);

      // 3. Birthday Check
      if (prof?.birthdate) {
        const today = new Date();
        const bday = new Date(prof.birthdate);
        if (today.getMonth() === bday.getMonth() && today.getDate() === bday.getDate()) {
          setIsBirthday(true);
        }
      }

      // 4. Fetch profile messages
      const { data: msgs } = await supabase
        .from('profile_messages')
        .select('*')
        .eq('author_id', userId)
        .order('created_at', { ascending: false });
      setMessages(msgs || []);

      // 5. Fetch memory timeline
      const { data: mems } = await supabase
        .from('memory_timeline')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });
      setMemories(mems || []);

      setLoading(false);
    }
    
    loadData();
  }, [userId, supabase]);

  // Audio handling (Theme song)
  useEffect(() => {
    if (!profile) return;
    
    if (isBirthday) {
      // Handled by BirthdayOverlay
    } else if (profile.song_url) {
      audioRef.current = new Audio(profile.song_url);
      audioRef.current.play().catch(e => console.warn('Audio play blocked:', e));
    }

    return () => {
      // Fade out audio on modal close
      if (audioRef.current) {
        const audio = audioRef.current;
        const fadeOut = setInterval(() => {
          if (audio.volume > 0.1) {
            audio.volume -= 0.1;
          } else {
            audio.pause();
            clearInterval(fadeOut);
          }
        }, 100);
      }
    };
  }, [profile, isBirthday]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUser) return;
    
    const { data, error } = await supabase
      .from('profile_messages')
      .insert({
        author_id: currentUser.id,
        content: newMessage,
        is_private: false
      })
      .select()
      .single();

    if (data && !error) {
      setMessages([data, ...messages]);
      setNewMessage('');
    }
  };

  const requestPhoto = async () => {
    // Only visible to superadmins
    alert(`Photo request sent to ${profile?.nickname}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full max-w-4xl h-[85vh] bg-[#0a0f2e]/80 backdrop-blur-2xl border border-white/10 rounded-3xl">
        <span className="text-white font-space-grotesk animate-pulse">Loading Profile...</span>
      </div>
    );
  }

  if (!profile) return null;

  const isOwnerOrAdmin = currentUser?.id === userId || currentUser?.isSuperAdmin;

  const getGlowColor = (type: string) => {
    switch(type) {
      case 'parent': return 'shadow-[0_0_30px_rgba(245,158,11,0.6)] border-amber-500';
      case 'relative':
      case 'cousin': return 'shadow-[0_0_30px_rgba(217,119,6,0.6)] border-amber-600';
      case 'romantic_partner': return 'shadow-[0_0_30px_rgba(244,63,94,0.6)] border-rose-500';
      case 'friend':
      default: return 'shadow-[0_0_30px_rgba(59,130,246,0.6)] border-blue-500';
    }
  };

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-4xl h-[85vh] bg-[#0a0f2e]/90 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col pointer-events-auto"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/20 transition-colors z-20 text-white"
        >
          ✕
        </button>

        {/* Header Section */}
        <div className="flex flex-col items-center pt-10 pb-6 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent relative shrink-0">
          <div className={`w-[120px] h-[120px] rounded-full overflow-hidden border-2 mb-4 transition-all duration-500 ${getGlowColor(profile.relationship_type)}`}>
            <img 
              src={profile.avatar_url || '/placeholder-avatar.png'} 
              alt={profile.nickname}
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-3xl font-space-grotesk font-bold text-white mb-1">{profile.nickname}</h1>
          <p className="text-sm font-inter text-blue-300 uppercase tracking-widest">{profile.relationship_type.replace('_', ' ')}</p>
          
          {currentUser?.isSuperAdmin && (
            <button onClick={requestPhoto} className="absolute top-4 left-4 text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors text-white border border-white/10">
              📸 Request Photo
            </button>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex w-full overflow-x-auto border-b border-white/10 no-scrollbar shrink-0">
          {(['Messages', 'Memories', 'Inside Jokes', 'Chat with AI'] as TabType[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 min-w-[120px] py-4 text-sm font-space-grotesk transition-colors border-b-2 ${
                activeTab === tab ? 'border-blue-400 text-blue-400' : 'border-transparent text-white/50 hover:text-white/80'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 scroll-smooth">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Messages Tab */}
              {activeTab === 'Messages' && (
                <div className="space-y-6">
                  {isOwnerOrAdmin && (
                    <div className="flex gap-4">
                      <input 
                        type="text" 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Write a message..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                      />
                      <button 
                        onClick={handleSendMessage}
                        className="bg-blue-600/80 hover:bg-blue-500/80 text-white px-6 py-3 rounded-xl backdrop-blur-md transition-colors font-medium"
                      >
                        Send
                      </button>
                    </div>
                  )}
                  <div className="space-y-4">
                    {messages.length === 0 ? (
                      <p className="text-white/40 text-center py-10 font-inter">No messages yet.</p>
                    ) : (
                      messages.map(msg => (
                        <div key={msg.id} className="p-5 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-md hover:bg-white/10 transition-colors">
                          <p className="text-white font-inter text-sm mb-3 leading-relaxed">{msg.content}</p>
                          <span className="text-xs text-white/30 tracking-wide">{new Date(msg.created_at).toLocaleString()}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Memories Timeline Tab */}
              {activeTab === 'Memories' && (
                <div className="relative border-l border-white/10 ml-4 space-y-10 pb-10">
                  {memories.length === 0 ? (
                    <p className="text-white/40 text-center py-10 font-inter ml-[-1rem]">No memory timeline entries yet.</p>
                  ) : (
                    memories.map((mem, idx) => (
                      <div key={mem.id || idx} className="relative pl-8 group">
                        {/* Timeline dot */}
                        <div className="absolute w-4 h-4 bg-blue-500 rounded-full -left-[8.5px] top-1 shadow-[0_0_15px_rgba(59,130,246,0.8)] ring-4 ring-[#0a0f2e] group-hover:scale-125 transition-transform" />
                        
                        <span className="text-xs text-blue-300 font-inter mb-1 block tracking-wider uppercase">
                          {new Date(mem.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                        <h3 className="text-xl font-space-grotesk text-white mb-2">{mem.title}</h3>
                        <p className="text-sm font-inter text-white/70 mb-4 leading-relaxed">{mem.description}</p>
                        
                        {mem.media_url && (
                          <div className="w-full max-w-md rounded-xl overflow-hidden border border-white/10 shadow-lg">
                            <img src={mem.media_url} alt="Memory media" className="w-full object-cover max-h-64 hover:scale-105 transition-transform duration-500" />
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Inside Jokes Tab */}
              {activeTab === 'Inside Jokes' && (
                <InsideJokesSection profileUserId={userId} />
              )}

              {/* AI Chat Tab */}
              {activeTab === 'Chat with AI' && (
                <div className="h-[400px] flex items-center justify-center border border-white/5 rounded-2xl bg-white/[0.02]">
                  <p className="text-white/50 font-inter">AI Chat functionality coming soon...</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Birthday Overlay Injection */}
      {isBirthday && (
        <BirthdayOverlay nickname={profile.nickname} onDismiss={() => setIsBirthday(false)} />
      )}
    </>
  );
}
