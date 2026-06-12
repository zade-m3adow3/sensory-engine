'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassInput } from '@/components/ui/GlassInput';
import TextInput from '@/components/questionnaire/QuestionTypes/TextInput';

interface InsideJoke {
  id: string;
  title: string;
  story: string;
  created_at: string;
}

interface Props {
  profileUserId: string;
}

export const InsideJokesSection: React.FC<Props> = ({ profileUserId }) => {
  const supabase = createClient();
  const [jokes, setJokes] = useState<InsideJoke[]>([]);
  const [canAdd, setCanAdd] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newStory, setNewStory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      // Fetch jokes
      const { data } = await supabase
        .from('inside_jokes')
        .select('*')
        .eq('user_id', profileUserId)
        .order('created_at', { ascending: false });
      
      if (data) setJokes(data);

      // Check permissions
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        if (user.id === profileUserId) {
          setCanAdd(true);
        } else {
          const { data: myProfile } = await supabase.from('profiles').select('is_superadmin').eq('id', user.id).single();
          if (myProfile?.is_superadmin) setCanAdd(true);
        }
      }
      setLoading(false);
    };
    init();
  }, [profileUserId, supabase]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newStory) return;

    const tempJoke = {
      id: Math.random().toString(),
      title: newTitle,
      story: newStory,
      created_at: new Date().toISOString()
    };

    // Optimistic UI Update
    setJokes([tempJoke, ...jokes]);
    setIsAdding(false);
    setNewTitle('');
    setNewStory('');

    await supabase.from('inside_jokes').insert({
      user_id: profileUserId,
      title: tempJoke.title,
      story: tempJoke.story
    });
  };

  if (loading) return <div className="text-white/50 text-center py-8">Loading jokes...</div>;

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <h3 className="font-heading italic text-2xl text-white relative inline-block">
          Things only we would understand 😂
          <span className="absolute -bottom-2 left-0 w-full h-1 bg-blue-500/50 blur-[4px] rounded-full"></span>
          <span className="absolute -bottom-2 left-0 w-full h-[2px] bg-blue-400 rounded-full"></span>
        </h3>
        
        {canAdd && !isAdding && (
          <GlassButton className="py-2 px-4 text-sm" onClick={() => setIsAdding(true)}>
            + Add Joke
          </GlassButton>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleAddSubmit} className="glass-panel p-6 mb-8 animate-in fade-in slide-in-from-top-4">
          <h4 className="font-heading text-lg text-white mb-4">New Inside Joke</h4>
          <GlassInput 
            placeholder="Title / Context" 
            value={newTitle} 
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTitle(e.target.value)} 
            className="mb-4"
          />
          <TextInput 
            placeholder="The full story..." 
            value={newStory} 
            onChange={(val: string) => setNewStory(val)} 
            isLong
            colorTheme="Friend"
          />
          <div className="flex justify-end gap-3 mt-4">
            <GlassButton type="button" onClick={() => setIsAdding(false)} className="py-2 px-4 text-sm bg-white/5 hover:bg-white/10">
              Cancel
            </GlassButton>
            <GlassButton type="submit" className="py-2 px-4 text-sm bg-blue-500/20 hover:bg-blue-500/30">
              Save Joke
            </GlassButton>
          </div>
        </form>
      )}

      {jokes.length === 0 && !isAdding ? (
        <div className="glass-panel p-10 flex flex-col items-center justify-center text-center border-dashed border-2 border-white/20 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
          <p className="text-xl text-white/80 font-heading mb-2">No inside jokes yet...</p>
          <p className="text-white/50 text-sm">Start building the lore 🧩</p>
        </div>
      ) : (
        <div className="columns-1 md:columns-2 gap-6 space-y-6">
          {jokes.map((joke) => (
            <JokeCard key={joke.id} joke={joke} />
          ))}
        </div>
      )}
    </div>
  );
};

const JokeCard = ({ joke }: { joke: InsideJoke }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div 
      className="glass-panel p-6 break-inside-avoid cursor-pointer group transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:shadow-blue-500/10"
      onClick={() => setExpanded(!expanded)}
    >
      <h4 className="font-heading text-xl text-white mb-2 leading-tight">
        {joke.title.match(/^[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/) ? joke.title : `😂 ${joke.title}`}
      </h4>
      <p className={`text-sm text-white/70 font-sans whitespace-pre-wrap transition-all duration-300 ${!expanded ? 'line-clamp-3' : ''}`}>
        {joke.story}
      </p>
      <div className="mt-4 text-xs text-white/30 font-sans opacity-0 group-hover:opacity-100 transition-opacity">
        {new Date(joke.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
      </div>
    </div>
  );
};
