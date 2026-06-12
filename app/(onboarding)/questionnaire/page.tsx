'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { createClient } from '../../../lib/supabase/client';
import { parentQuestions, relativeQuestions, friendQuestions, romanticQuestions } from '../../../lib/questionnaire/questions';
import { QuestionSlide } from '../../../components/questionnaire/QuestionSlide';
import { SlideProgress } from '../../../components/questionnaire/SlideProgress';
import { GlassButton } from '../../../components/ui/GlassButton';

export default function QuestionnairePage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [direction, setDirection] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [superadminName, setSuperadminName] = useState('Alex'); // Fallback

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase.from('profiles').select('relationship_type').eq('id', user.id).single();
      
      const relType = profile?.relationship_type || 'friend';
      let qSet: any[] = [];
      if (relType === 'parent') qSet = parentQuestions;
      else if (relType === 'relative' || relType === 'cousin') qSet = relativeQuestions;
      else if (relType === 'romantic_partner') qSet = romanticQuestions;
      else qSet = friendQuestions;

      // Ideally fetch superadmin name from somewhere, hardcoding for now
      setQuestions(qSet.map(q => ({ ...q, text: q.text.replace("[superadmin's name]", superadminName) })));
      setLoading(false);
    };
    init();
  }, [supabase, router, superadminName]);

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      setDirection(1);
      setCurrentIndex(prev => prev + 1);
    } else {
      setSubmitting(true);
      
      // Submit all answers
      const payload = Object.entries(answers).map(([questionId, answer]) => {
        const q = questions.find(q => q.id === questionId);
        return {
          questionId,
          questionText: q?.text || '',
          answer
        };
      });

      try {
        const res = await fetch('/api/questionnaire', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ responses: payload })
        });
        
        if (res.ok) {
          router.push('/tree');
        } else {
          console.error("Submission failed");
          setSubmitting(false);
        }
      } catch (e) {
        console.error(e);
        setSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(prev => prev - 1);
    }
  };

  const setAnswer = (val: any) => {
    setAnswers(prev => ({ ...prev, [questions[currentIndex].id]: val }));
  };

  if (loading) return <div className="h-screen w-screen flex items-center justify-center text-white">Loading...</div>;

  const currentQ = questions[currentIndex];
  const canProceed = answers[currentQ?.id] !== undefined && answers[currentQ?.id] !== '';

  return (
    <div className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden pt-12 pb-24 px-4">
      <SlideProgress current={currentIndex + 1} total={questions.length} />
      
      <div className="relative w-full max-w-2xl h-[400px]">
        <AnimatePresence initial={false} custom={direction}>
          <QuestionSlide 
            key={currentIndex}
            question={currentQ}
            answer={answers[currentQ.id]}
            setAnswer={setAnswer}
            direction={direction}
          />
        </AnimatePresence>
      </div>

      <div className="absolute bottom-12 w-full max-w-2xl px-4 flex justify-between">
        <GlassButton 
          onClick={handleBack} 
          disabled={currentIndex === 0 || submitting}
          className={`px-8 py-3 rounded-full ${currentIndex === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        >
          Back
        </GlassButton>
        <GlassButton 
          onClick={handleNext}
          disabled={!canProceed || submitting}
          className={`px-8 py-3 rounded-full ${(!canProceed || submitting) ? 'opacity-50 cursor-not-allowed' : ''} ${submitting ? 'animate-pulse' : ''}`}
        >
          {submitting ? 'Saving...' : (currentIndex === questions.length - 1 ? 'Finish' : 'Next')}
        </GlassButton>
      </div>
    </div>
  );
}
