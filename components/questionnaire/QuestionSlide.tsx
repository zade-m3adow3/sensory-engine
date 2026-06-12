'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MultiChoice } from './QuestionTypes/MultiChoice';
import { SliderInput } from './QuestionTypes/SliderInput';
import { TextInput } from './QuestionTypes/TextInput';

interface QuestionSlideProps {
  question: any;
  answer: any;
  setAnswer: (val: any) => void;
  direction: number;
}

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0
  })
};

export const QuestionSlide: React.FC<QuestionSlideProps> = ({ question, answer, setAnswer, direction }) => {
  return (
    <motion.div
      custom={direction}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
      className="absolute w-full max-w-2xl mx-auto inset-0 flex flex-col justify-center"
    >
      <div className="glass-panel p-10 backdrop-blur-2xl bg-black/20">
        <h2 className="text-3xl font-heading font-bold text-white mb-2 leading-tight">
          {question.text}
        </h2>
        
        <div className="mt-8">
          {question.type === 'multiChoice' && (
            <MultiChoice 
              options={question.options} 
              value={answer || ''} 
              onChange={setAnswer} 
            />
          )}
          {question.type === 'multiSelect' && (
            <MultiChoice 
              options={question.options} 
              value="" 
              onChange={() => {}} 
              multiSelect
              selectedValues={answer || []}
              onMultiChange={setAnswer}
            />
          )}
          {question.type === 'slider' && (
            <SliderInput 
              min={question.min} 
              max={question.max} 
              value={answer || (question.min + Math.floor((question.max - question.min)/2))} 
              onChange={setAnswer} 
              labels={question.labels}
            />
          )}
          {question.type === 'text' && (
            <TextInput 
              value={answer || ''} 
              onChange={setAnswer} 
              placeholder={question.placeholder}
              isLong={question.isLong}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
};
