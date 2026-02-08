"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/lib/store";
import quizBank from "@/features/onboarding/quiz-bank.json";

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation?: string; // Optional, if your data includes it
}

const JLPT_QUIZ_BANK: Record<string, QuizQuestion[]> = quizBank;

export function OnboardingWizard() {
  const router = useRouter();
  const setJlptLevel = useUserStore((state) => state.setJlptLevel);

  const [step, setStep] = useState(1);
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
    if (step === 1) return 0;
    if (step === 2) return 15;
    if (step === 2.2) return 30;
    if (step === 2.5) return 30 + currentQuizIndex * 12;
    if (step === 3) return 100;
    return 0;
  };

  const handleComplete = () => {
    
    router.push("/dashboard");
  };

  const nextStep = () => {
    console.log("Step:", step);
    if (step === 1) setStep(2);
    else if (step === 2) setStep(2.2);
    else if (step === 2.2) setStep(2.5);
    else if (step === 2.5) {
      const questions = JLPT_QUIZ_BANK[currentLevel!];
      if (selectedAnswer === questions[currentQuizIndex].correct) {
        setQuizScore((prev) => prev + 1);
        console.log("New quiz score:", quizScore);
      }

      setSelectedAnswer(null);

      console.log(currentQuizIndex, "of", questions.length);

      if (currentQuizIndex < questions.length - 1) {
        setCurrentQuizIndex((prev) => prev + 1);
      } else {
        if (currentLevel) {
          const levelInt = parseInt(currentLevel.replace("N", ""), 10);
          setJlptLevel(levelInt);
        }
        console.log("Proficiency Level:", currentLevel);
        console.log("Quiz Score:", quizScore);
        setStep(3);
      }
    } else {
      handleComplete();
    }
  };

  // const isVerified =
  //   currentLevel && quizScore / JLPT_QUIZ_BANK[currentLevel].length > 0.5;

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-background antialiased">
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-100 shrink-0 z-50">
        <div
          className="h-full bg-emerald-500 transition-all duration-500 ease-out shadow-[0_0_8px_rgba(16,185,129,0.5)]"
          style={{ width: `${calculateProgress()}%` }}
        />
      </div>

      <header className="p-6 shrink-0">
        <div className="text-emerald-900 font-bold text-xl tracking-tight">
          whisk
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 flex justify-center">
        <div
          className={cn(
            "w-full max-w-xl py-4 flex flex-col",
            step === 1 || step === 2.2 || step === 3
              ? "justify-center items-center text-center"
              : "justify-start"
          )}
        >
          <div
            className={cn(
              "mb-8 min-h-[120px] flex flex-col w-full",
              step === 1 || step === 2.2 || step === 3
                ? "items-center text-center"
                : "justify-center text-left"
            )}
          >
            {step === 1 && (
              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h1 className="text-4xl font-black text-emerald-900 leading-tight">
                  Welcome to <br />
                  whisk!
                </h1>
                <p className="text-lg text-emerald-800/70 leading-relaxed font-medium">
                  The most effective way to master Japanese through immersion.
                </p>
              </div>
            )}

            {step === 2 && (
              <h3 className="text-2xl font-bold text-emerald-950 animate-in fade-in duration-500">
                How much Japanese do you know?
              </h3>
            )}

            {step === 2.2 && (
              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h3 className="text-3xl font-bold text-emerald-900">
                  Let&apos;s find the best place to start.
                </h3>
                <p className="text-lg text-emerald-800/70 leading-relaxed font-medium">
                  We&apos;re going to take you through a short quiz to confirm
                  your level.
                </p>
              </div>
            )}

            {step === 2.5 && currentLevel && (
              <div className="space-y-2 animate-in fade-in duration-500 w-full">
                <p className="text-emerald-600 font-bold text-sm uppercase tracking-wider">
                  Question {currentQuizIndex + 1}/5
                </p>
                <h3 className="text-2xl font-bold text-emerald-950 leading-tight">
                  {JLPT_QUIZ_BANK[currentLevel][currentQuizIndex].question}
                </h3>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h3 className="text-4xl font-black text-emerald-900 leading-tight">
                  All set!
                </h3>
                <p className="text-lg text-emerald-800/70 leading-relaxed max-w-md font-medium">
                  Based on your answers, you are {currentLevel} level! Your
                  personalized experience is ready.
                </p>
              </div>
            )}
          </div>

          <div className="space-y-3 pb-32 w-full">
            {step === 2 &&
              proficiencyOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setCurrentLevel(opt.id)}
                  className={cn(
                    "w-full p-5 text-left border-2 rounded-2xl transition-all duration-200 shadow-sm font-bold",
                    currentLevel === opt.id
                      ? "bg-emerald-600 border-emerald-600 text-white"
                      : "bg-white border-white text-emerald-900 hover:border-emerald-100"
                  )}
                >
                  {opt.desc}
                </button>
              ))}

            {step === 2.5 &&
              currentLevel &&
              JLPT_QUIZ_BANK[currentLevel][currentQuizIndex].options.map(
                (opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedAnswer(idx)}
                    className={cn(
                      "w-full p-5 text-left border-2 rounded-2xl transition-all duration-200 shadow-sm font-bold",
                      selectedAnswer === idx
                        ? "bg-emerald-600 border-emerald-600 text-white"
                        : "bg-white border-white text-emerald-900 hover:border-emerald-100"
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
              (step === 2 && !currentLevel) ||
              (step === 2.5 && selectedAnswer === null)
            }
            className={cn(
              "w-full h-16 text-lg font-bold rounded-2xl transition-all duration-300 shadow-xl",
              (step === 2 && !currentLevel) ||
                (step === 2.5 && selectedAnswer === null)
                ? "bg-emerald-100 text-emerald-300 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-700 text-white active:scale-[0.98]"
            )}
          >
            {step === 3 ? "Start Learning" : "Continue"}
          </Button>
        </div>
      </footer>
    </div>
  );
}
