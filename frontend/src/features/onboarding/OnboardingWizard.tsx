"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    yearsStudied: "",
    proficiencyLevel: "",
  });

  const handleNext = (data: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setStep((prev) => prev + 1);
  };

  const handleComplete = () => {
    // TODO: Save formData to backend
    console.log("Onboarding complete:", formData);
    router.push("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome! Let&apos;s get started</CardTitle>
          <CardDescription>Step {step} of 3</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-semibold">
                How long have you been studying?
              </h3>
              <div className="space-y-2">
                {["Less than 1 year", "1-2 years", "3-5 years", "5+ years"].map(
                  (option) => (
                    <button
                      key={option}
                      onClick={() => handleNext({ yearsStudied: option })}
                      className="w-full p-3 text-left border rounded-md hover:bg-accent transition-colors"
                    >
                      {option}
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-semibold">
                What&apos;s your proficiency level?
              </h3>
              <div className="space-y-2">
                {["Beginner", "Intermediate", "Advanced", "Native"].map(
                  (option) => (
                    <button
                      key={option}
                      onClick={() => handleNext({ proficiencyLevel: option })}
                      className="w-full p-3 text-left border rounded-md hover:bg-accent transition-colors"
                    >
                      {option}
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 text-center">
              <div className="text-6xl">✨</div>
              <h3 className="font-semibold text-xl">
                Setting up your profile...
              </h3>
              <p className="text-sm text-muted-foreground">
                We&apos;re preparing your personalized learning experience
              </p>
              <Button onClick={handleComplete} className="w-full mt-4">
                Get Started
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
