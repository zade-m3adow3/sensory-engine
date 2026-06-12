"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useUserStore } from "@/stores/userStore";
import SlideProgress from "@/components/questionnaire/SlideProgress";
import QuestionSlide from "@/components/questionnaire/QuestionSlide";
import { QuestionData } from "@/types/questionnaire";

const QUESTIONS: Record<string, QuestionData[]> = {
  Parent: [
    { id: "q1", prompt: "How have you watched me grow?", type: "TextInput", isLong: true },
    { id: "q2", prompt: "What's your favorite memory of us?", type: "TextInput", isLong: true },
    { id: "q3", prompt: "How much do you worry about me?", type: "Slider" },
    { id: "q4", prompt: "What's something you wish I'd do more of?", type: "TextInput" },
  ],
  Relative: [
    { id: "q1", prompt: "What is my most iconic trait at family gatherings?", type: "MultiChoice", options: ["Always late", "The quiet observer", "Loudest in the room", "Always eating"] },
    { id: "q2", prompt: "What's the funniest shared memory we have?", type: "TextInput", isLong: true },
  ],
  Friend: [
    { id: "q1", prompt: "How did we actually meet?", type: "TextInput" },
    { id: "q2", prompt: "What's the most chaotic thing we've done together?", type: "TextInput", isLong: true },
    { id: "q3", prompt: "What is our friendship energy?", type: "MultiChoice", options: ["Chaos duo", "Chill homies", "Emotional support pillars", "Braincells shared: 1"] },
    { id: "q4", prompt: "What's one inside joke that never gets old?", type: "TextInput" },
  ],
  Partner: [
    { id: "q1", prompt: "Tell me the origin story. How did this begin?", type: "TextInput", isLong: true },
    { id: "q2", prompt: "What did you first notice about me?", type: "TextInput" },
    { id: "q3", prompt: "Pick three words to describe me.", type: "MultiSelect", options: ["Kind", "Chaotic", "Brilliant", "Stubborn", "Warm", "Funny"] },
    { id: "q4", prompt: "What is 'our' song?", type: "TextInput" },
    { id: "q5", prompt: "Leave a short message for me here on the tree.", type: "TextInput", isLong: true },
  ]
};

export default function QuestionnairePage() {
  const router = useRouter();
  const profile = useUserStore((state) => state.profile);
  const setProfile = useUserStore((state) => state.setProfile);

  const relationship = profile?.relationship_type || "Friend";
  const questions: QuestionData[] = QUESTIONS[relationship as keyof typeof QUESTIONS] || QUESTIONS.Friend;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(curr => curr + 1);
    } else {
      setIsSubmitting(true);
      // Submit logic here
      try {
        const res = await fetch("/api/questionnaire", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers })
        });
        if (res.ok) {
          setProfile(profile ? { ...profile, onboarding_complete: true } : null);
          router.push("/tree");
        } else {
          console.error("Submission failed");
          setIsSubmitting(false);
        }
      } catch (err) {
        console.error(err);
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) setCurrentIndex(curr => curr - 1);
  };

  if (isSubmitting) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-2xl font-space-grotesk text-white"
        >
          Planting your roots...
        </motion.div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <main className="min-h-screen flex flex-col items-center justify-center overflow-hidden">
      <SlideProgress current={currentIndex} total={questions.length} colorTheme={relationship} />
      
      <div className="w-full relative h-[70vh] flex items-center justify-center">
        <AnimatePresence mode="wait">
          <QuestionSlide
            key={currentQuestion.id}
            question={currentQuestion}
            value={answers[currentQuestion.id]}
            onChange={(val) => setAnswers({ ...answers, [currentQuestion.id]: val })}
            onNext={handleNext}
            onBack={currentIndex > 0 ? handleBack : undefined}
            isLast={currentIndex === questions.length - 1}
            colorTheme={relationship}
          />
        </AnimatePresence>
      </div>
    </main>
  );
}
