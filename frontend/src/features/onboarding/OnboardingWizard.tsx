"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/lib/store";
import quizBank from "@/features/onboarding/quiz-bank.json";

interface QuizQuestion {
  question: string;
  questionEn?: string;
  options: string[];
  optionsHiragana?: string[];
  correct: number;
  explanation?: string; // Optional, if your data includes it
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
const QUIZ_LEVEL_RULES = [
  "80%+ correct: level up 1 step",
  "41–79% correct: keep your level",
  "40% or less correct: level down 1 step",
] as const;

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
  const nextIdx = Math.min(
    JLPT_LEVELS.length - 1,
    Math.max(0, idx + delta)
  );
  return JLPT_LEVELS[nextIdx];
}

function applyBeginnerMode(
  level: (typeof JLPT_LEVELS)[number],
  enabled: boolean
): (typeof JLPT_LEVELS)[number] {
  if (!enabled) return level;
  const idx = JLPT_LEVELS.indexOf(level);
  const nextIdx = Math.min(JLPT_LEVELS.length - 1, idx + 1);
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
  const [beginnerMode, setBeginnerMode] = useState(false);

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

  const handleComplete = () => {
    
    router.push("/dashboard");
  };

  const nextStep = () => {
    console.log("Step:", step);
    if (step === STEPS.WELCOME) setStep(STEPS.PROFICIENCY);
    else if (step === STEPS.PROFICIENCY) setStep(STEPS.QUIZ_INTRO);
    else if (step === STEPS.QUIZ_INTRO) setStep(STEPS.QUIZ);
    else if (step === STEPS.QUIZ) {
      const questions = JLPT_QUIZ_BANK[currentLevel!];
      const isCorrect =
        selectedAnswer === questions[currentQuizIndex].correct;
      const nextScore = quizScore + (isCorrect ? 1 : 0);

      setSelectedAnswer(null);

      console.log(currentQuizIndex, "of", questions.length);

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
          const adjustedForBeginner = applyBeginnerMode(
            finalLevel,
            beginnerMode
          );
          setCurrentLevel(adjustedForBeginner);
          const levelInt = parseInt(adjustedForBeginner.replace("N", ""), 10);
          setJlptLevel(levelInt);
          console.log("Proficiency Level:", adjustedForBeginner);
        }
        console.log("Quiz Score:", nextScore);
        setQuizScore(nextScore);
        setStep(STEPS.DONE);
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
            step === STEPS.WELCOME ||
            step === STEPS.QUIZ_INTRO ||
            step === STEPS.DONE
              ? "justify-center items-center text-center"
              : "justify-start"
          )}
        >
          <div
            className={cn(
              "mb-8 min-h-[120px] flex flex-col w-full",
              step === STEPS.WELCOME ||
                step === STEPS.QUIZ_INTRO ||
                step === STEPS.DONE
                ? "items-center text-center"
                : "justify-center text-left"
            )}
          >
            {step === STEPS.WELCOME && (
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

            {step === STEPS.PROFICIENCY && (
              <h3 className="text-2xl font-bold text-emerald-950 animate-in fade-in duration-500">
                How much Japanese do you know?
              </h3>
            )}

            {step === STEPS.QUIZ_INTRO && (
              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h3 className="text-3xl font-bold text-emerald-900">
                  Let&apos;s find the best place to start.
                </h3>
                <p className="text-lg text-emerald-800/70 leading-relaxed font-medium">
                  We&apos;re going to take you through a short quiz to confirm
                  your level.
                </p>
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-left shadow-sm">
                  <p className="text-emerald-900 font-bold text-sm uppercase tracking-wider">
                    Beginner Mode
                  </p>
                  <p className="mt-1 text-sm text-emerald-800/80">
                    When on, questions are shown in English and options show
                    hiragana. Your final level is adjusted down by 1 step.
                  </p>
                  <button
                    type="button"
                    aria-pressed={beginnerMode}
                    onClick={() => setBeginnerMode((prev) => !prev)}
                    className={cn(
                      "mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-bold transition-colors",
                      beginnerMode
                        ? "bg-emerald-600 border-emerald-600 text-white"
                        : "bg-white border-emerald-200 text-emerald-900"
                    )}
                  >
                    {beginnerMode ? "Beginner Mode: ON" : "Beginner Mode: OFF"}
                  </button>
                </div>
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-left shadow-sm">
                  <p className="text-emerald-900 font-bold text-sm uppercase tracking-wider">
                    How we adjust your level
                  </p>
                  <ul className="mt-2 text-sm text-emerald-800/80 space-y-1">
                    {QUIZ_LEVEL_RULES.map((rule) => (
                      <li key={rule}>{rule}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {step === STEPS.QUIZ && currentLevel && (
              <div className="space-y-2 animate-in fade-in duration-500 w-full">
                <p className="text-emerald-600 font-bold text-sm uppercase tracking-wider">
                  Question {currentQuizIndex + 1}/5
                </p>
                <h3 className="text-2xl font-bold text-emerald-950 leading-tight">
                  {beginnerMode &&
                  JLPT_QUIZ_BANK[currentLevel][currentQuizIndex].questionEn
                    ? JLPT_QUIZ_BANK[currentLevel][currentQuizIndex].questionEn
                    : JLPT_QUIZ_BANK[currentLevel][currentQuizIndex].question}
                </h3>
              </div>
            )}

            {step === STEPS.DONE && (
              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h3 className="text-4xl font-black text-emerald-900 leading-tight">
                  All set!
                </h3>
                <p className="text-lg text-emerald-800/70 leading-relaxed max-w-md font-medium">
                  Based on your answers, you are {currentLevel} level! Your
                  personalized experience is ready.
                </p>
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-left shadow-sm">
                  <p className="text-emerald-900 font-bold text-sm uppercase tracking-wider">
                    Level adjustment rules
                  </p>
                  <ul className="mt-2 text-sm text-emerald-800/80 space-y-1">
                    {QUIZ_LEVEL_RULES.map((rule) => (
                      <li key={rule}>{rule}</li>
                    ))}
                  </ul>
                </div>
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
                    "w-full p-5 text-left border-2 rounded-2xl transition-all duration-200 shadow-sm font-bold",
                    currentLevel === opt.id
                      ? "bg-emerald-600 border-emerald-600 text-white"
                      : "bg-white border-white text-emerald-900 hover:border-emerald-100"
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
                        ? "bg-emerald-600 border-emerald-600 text-white"
                        : "bg-white border-white text-emerald-900 hover:border-emerald-100"
                    )}
                  >
                    <div>{opt}</div>
                    {beginnerMode &&
                      JLPT_QUIZ_BANK[currentLevel][currentQuizIndex]
                        .optionsHiragana &&
                      JLPT_QUIZ_BANK[currentLevel][currentQuizIndex]
                        .optionsHiragana![idx] && (
                        <div
                          className={cn(
                            "mt-1 text-sm font-semibold",
                            selectedAnswer === idx
                              ? "text-emerald-100/90"
                              : "text-emerald-700/80"
                          )}
                        >
                          {
                            JLPT_QUIZ_BANK[currentLevel][currentQuizIndex]
                              .optionsHiragana![idx]
                          }
                        </div>
                      )}
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
