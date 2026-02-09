"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/lib/store";
import quizBank from "@/features/onboarding/quiz-bank.json";
import whisk from "@/assets/whisk.png";

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
}

const JLPT_QUIZ_BANK: Record<string, QuizQuestion[]> = quizBank;
const JLPT_LEVELS = ["N5", "N4", "N3", "N2", "N1"] as const;
const STEPS = {
  WELCOME: 1,
  PROFICIENCY: 2,
  QUIZ_INTRO: 3,
  QUIZ: 4,
  DONE: 5,
} as const;

function adjustLevel(
  base: string,
  score: number,
  total: number
): (typeof JLPT_LEVELS)[number] {
  const pct = total > 0 ? score / total : 0;
  let delta = 0;
  if (pct >= 0.8) delta = 1;
  else if (pct <= 0.4) delta = -1;

  const idx = JLPT_LEVELS.indexOf(base as (typeof JLPT_LEVELS)[number]);
  const nextIdx = Math.min(JLPT_LEVELS.length - 1, Math.max(0, idx + delta));
  return JLPT_LEVELS[nextIdx];
}

export function OnboardingWizard() {
  const router = useRouter();
  const setJlptLevel = useUserStore((state) => state.setJlptLevel);

  const [step, setStep] = useState<(typeof STEPS)[keyof typeof STEPS]>(
    STEPS.WELCOME
  );
  const [currentLevel, setCurrentLevel] = useState<string | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const proficiencyOptions = [
    { id: "N5", desc: "I'm new to Japanese" },
    { id: "N4", desc: "I know some common words" },
    { id: "N3", desc: "I can have basic conversations" },
    { id: "N2", desc: "I can talk about various topics" },
    { id: "N1", desc: "I can discuss most topics in detail" },
  ];

  const calculateProgress = () => {
    if (step === STEPS.WELCOME) return 0;
    if (step === STEPS.PROFICIENCY) return 15;
    if (step === STEPS.QUIZ_INTRO) return 30;
    if (step === STEPS.QUIZ) return 30 + currentQuizIndex * 12;
    if (step === STEPS.DONE) return 100;
    return 0;
  };

  const nextStep = () => {
    if (step === STEPS.WELCOME) setStep(STEPS.PROFICIENCY);
    else if (step === STEPS.PROFICIENCY) setStep(STEPS.QUIZ_INTRO);
    else if (step === STEPS.QUIZ_INTRO) setStep(STEPS.QUIZ);
    else if (step === STEPS.QUIZ) {
      const questions = JLPT_QUIZ_BANK[currentLevel!];
      const isCorrect = selectedAnswer === questions[currentQuizIndex].correct;
      const nextScore = quizScore + (isCorrect ? 1 : 0);

      setSelectedAnswer(null);

      if (currentQuizIndex < questions.length - 1) {
        setQuizScore(nextScore);
        setCurrentQuizIndex((prev) => prev + 1);
      } else {
        if (currentLevel) {
          const finalLevel = adjustLevel(
            currentLevel,
            nextScore,
            questions.length
          );
          setCurrentLevel(finalLevel);
          const levelInt = parseInt(finalLevel.replace("N", ""), 10);
          setJlptLevel(levelInt);
        }
        setQuizScore(nextScore);
        setStep(STEPS.DONE);
      }
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-background antialiased">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-mint-100 shrink-0 z-50">
        <div
          className="h-full bg-mint-400 transition-all duration-500 ease-out shadow-[0_0_8px_rgba(16,185,129,0.5)]"
          style={{ width: `${calculateProgress()}%` }}
        />
      </div>

      <header className="p-6 shrink-0">
        <div className="flex items-center gap-2">
            <img src={whisk.src} alt="Whisk logo" className="h-8 w-8" />
            <span className="text-mint-800 font-bold text-xl tracking-tight">
                whisk
            </span>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 flex justify-center">
        <div
          className={cn(
            "w-full max-w-xl py-4 flex flex-col",
            ([STEPS.WELCOME, STEPS.QUIZ_INTRO, STEPS.DONE] as number[]).includes(step)
              ? "justify-center items-center text-center"
              : "justify-start"
          )}
        >
          <div
            className={cn(
              "mb-8 min-h-[120px] flex flex-col w-full",
              ([STEPS.WELCOME, STEPS.QUIZ_INTRO, STEPS.DONE] as number[]).includes(step)
                ? "items-center text-center"
                : "justify-center text-left"
            )}
          >
            {step === STEPS.WELCOME && (
              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h1 className="text-4xl font-bold text-neutral-900 leading-tight">
                  welcome to whisk!
                </h1>
                <p className="text-lg text-neutral-400 leading-relaxed font-medium">
                  The most effective way to master Japanese through immersion.
                </p>
              </div>
            )}

            {step === STEPS.PROFICIENCY && (
              <h3 className="text-2xl font-bold text-neutral-900 animate-in fade-in duration-500">
                How much Japanese do you know?
              </h3>
            )}

            {step === STEPS.QUIZ_INTRO && (
              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h3 className="text-3xl font-bold text-neutral-900">
                  let&apos;s find the best place to start.
                </h3>
                <p className="text-lg text-neutral-400 leading-relaxed font-medium">
                  We&apos;re going to take you through a short quiz to confirm
                  your level.
                </p>
              </div>
            )}

            {step === STEPS.QUIZ && currentLevel && (
              <div className="space-y-2 animate-in fade-in duration-500 w-full">
                <p className="text-neutral-400 font-bold text-sm uppercase tracking-wider">
                  Question {currentQuizIndex + 1}/5
                </p>
                <h3 className="text-2xl font-bold text-neutral-900 leading-tight">
                  {JLPT_QUIZ_BANK[currentLevel][currentQuizIndex].question}
                </h3>
              </div>
            )}

            {step === STEPS.DONE && (
              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h3 className="text-4xl font-bold text-neutral-900 leading-tight">
                  all set!
                </h3>
                <p className="text-lg text-neutral-400 leading-relaxed max-w-md font-medium">
                  Based on your answers, you are {currentLevel} level! <br />
                  Your personalized experience is ready.
                </p>
              </div>
            )}
          </div>

          <div className="space-y-3 pb-32 w-full">
            {step === STEPS.PROFICIENCY &&
              proficiencyOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setCurrentLevel(opt.id)}
                  className={cn(
                    "w-full p-5 text-left border-2 rounded-2xl transition-all duration-200 shadow-sm font-medium",
                    currentLevel === opt.id
                      ? "bg-mint-400 border-mint-400 text-white"
                      : "bg-white border-white text-neutral-400 hover:border-mint-400"
                  )}
                >
                  {opt.desc}
                </button>
              ))}

            {step === STEPS.QUIZ &&
              currentLevel &&
              JLPT_QUIZ_BANK[currentLevel][currentQuizIndex].options.map(
                (opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedAnswer(idx)}
                    className={cn(
                      "w-full p-5 text-left border-2 rounded-2xl transition-all duration-200 shadow-sm font-bold",
                      selectedAnswer === idx
                        ? "bg-mint-400 border-mint-400 text-white"
                        : "bg-white border-white text-neutral-900 hover:border-mint-400"
                    )}
                  >
                    {opt}
                  </button>
                )
              )}
          </div>
        </div>
      </main>

      <footer className="shrink-0 p-8 flex justify-center items-center bg-gradient-to-t from-background via-background to-transparent">
        <div className="w-full max-w-xl">
          <Button
            onClick={nextStep}
            disabled={
              (step === STEPS.PROFICIENCY && !currentLevel) ||
              (step === STEPS.QUIZ && selectedAnswer === null)
            }
            className={cn(
              "w-full h-16 text-lg font-bold rounded-2xl transition-all duration-300 shadow-xl",
              (step === STEPS.PROFICIENCY && !currentLevel) ||
                (step === STEPS.QUIZ && selectedAnswer === null)
                ? "bg-emerald-100 text-emerald-300 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-700 text-white active:scale-[0.98]"
            )}
          >
            {step === STEPS.DONE ? "Start Learning" : "Continue"}
          </Button>
        </div>
      </footer>
    </div>
  );
}