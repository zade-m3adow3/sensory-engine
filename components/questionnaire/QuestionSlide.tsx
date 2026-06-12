"use client";

import { motion } from "framer-motion";
import RippleWrapper from "@/components/ui/RippleWrapper";
import MultiChoice from "./QuestionTypes/MultiChoice";
import MultiSelect from "./QuestionTypes/MultiSelect";
import SliderInput from "./QuestionTypes/SliderInput";
import TextInput from "./QuestionTypes/TextInput";
import { QuestionData } from "@/types/questionnaire";

interface Props {
  question: QuestionData;
  value: any;
  onChange: (val: any) => void;
  onNext: () => void;
  onBack?: () => void;
  isLast: boolean;
  colorTheme: string;
}

export default function QuestionSlide({ question, value, onChange, onNext, onBack, isLast, colorTheme }: Props) {
  return (
    <motion.div
      className="glass-panel w-full max-w-2xl mx-auto p-8 md:p-12 flex flex-col items-center justify-center min-h-[60vh] relative"
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -100, opacity: 0 }}
      transition={{ ease: "easeInOut", duration: 0.35 }}
    >
      <h2 className="text-2xl md:text-3xl font-space-grotesk text-center mb-10 text-white leading-relaxed">
        {question.prompt}
      </h2>

      <div className="w-full flex-grow flex items-center justify-center">
        {question.type === "MultiChoice" && (
          <MultiChoice options={question.options!} selected={value} onSelect={onChange} colorTheme={colorTheme} />
        )}
        {question.type === "MultiSelect" && (
          <MultiSelect options={question.options!} selected={value || []} onSelect={onChange} colorTheme={colorTheme} />
        )}
        {question.type === "Slider" && (
          <SliderInput value={value || 5} min={1} max={10} onChange={onChange} colorTheme={colorTheme} />
        )}
        {question.type === "TextInput" && (
          <TextInput value={value || ""} onChange={onChange} isLong={question.isLong} colorTheme={colorTheme} />
        )}
      </div>

      <div className="w-full flex justify-between mt-12">
        {onBack ? (
          <RippleWrapper
            as="button"
            onClick={onBack}
            className="px-6 py-3 rounded-full border border-white/20 text-white/70 hover:bg-white/10 transition-colors"
          >
            Back
          </RippleWrapper>
        ) : <div />}

        <RippleWrapper
          as="button"
          onClick={onNext}
          disabled={value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)}
          className={`
            px-8 py-3 rounded-full text-white font-medium transition-all
            ${value ? 'bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.5)] hover:bg-indigo-500' : 'bg-white/10 text-white/50 cursor-not-allowed'}
          `}
        >
          {isLast ? "Finish" : "Next"}
        </RippleWrapper>
      </div>
    </motion.div>
  );
}
