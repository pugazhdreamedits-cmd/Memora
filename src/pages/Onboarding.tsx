import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ArrowRight, ArrowLeft } from "lucide-react";
import { ProfileStore } from "@/lib/storage";
import { getSession } from "@/lib/auth";
import { DEFAULT_SUBJECTS, AGE_RANGES, ACADEMIC_LEVELS } from "@/constants";
import type { StudentProfile, AcademicLevel } from "@/types";
import { cn } from "@/lib/utils";
import NeuralBackground from "@/components/features/NeuralBackground";

interface FormData {
  age: string;
  academicLevel: AcademicLevel;
  subjects: string[];
  preferredStudyDuration: number;
  learningDifficulty: number;
}

export default function Onboarding() {
  const navigate = useNavigate();
  const session = getSession();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>({
    age: "",
    academicLevel: "Undergraduate",
    subjects: [],
    preferredStudyDuration: 45,
    learningDifficulty: 3,
  });

  const steps = [
    { title: "About You", subtitle: "Help us personalize your memory profile" },
    { title: "Your Subjects", subtitle: "What topics do you study?" },
    { title: "Study Preferences", subtitle: "How do you prefer to study?" },
  ];

  const toggleSubject = (s: string) => {
    setForm(f => ({
      ...f,
      subjects: f.subjects.includes(s) ? f.subjects.filter(x => x !== s) : [...f.subjects, s],
    }));
  };

  const handleComplete = () => {
    if (!session) { navigate("/auth"); return; }
    const profile: StudentProfile = {
      userId: session.userId,
      age: form.age,
      academicLevel: form.academicLevel,
      subjects: form.subjects.length > 0 ? form.subjects : ["General"],
      preferredStudyDuration: form.preferredStudyDuration,
      learningDifficulty: form.learningDifficulty,
      onboardingCompleted: true,
      createdAt: new Date().toISOString(),
    };
    ProfileStore.save(profile);
    navigate("/dashboard");
  };

  const canProceed = () => {
    if (step === 0) return form.age && form.academicLevel;
    if (step === 1) return form.subjects.length > 0;
    return true;
  };

  return (
    <div className="relative min-h-screen bg-bg-base flex items-center justify-center p-4">
      <NeuralBackground intensity={0.25} />
      <div className="absolute inset-0 bg-hero-gradient pointer-events-none" />

      <div className="relative w-full max-w-lg z-10">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            {steps.map((s, i) => (
              <React.Fragment key={i}>
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all",
                  i < step ? "bg-brand-primary border-brand-primary text-white" :
                  i === step ? "border-brand-primary text-brand-primary-light bg-brand-primary/10" :
                  "border-border-default text-text-muted"
                )}>
                  {i < step ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                {i < steps.length - 1 && (
                  <div className={cn("flex-1 h-0.5 transition-all", i < step ? "bg-brand-primary" : "bg-border-default")} />
                )}
              </React.Fragment>
            ))}
          </div>
          <h2 className="text-2xl font-bold text-text-primary">{steps[step].title}</h2>
          <p className="text-text-secondary mt-1">{steps[step].subtitle}</p>
        </div>

        <div className="glass-elevated rounded-2xl p-8">
          {/* Step 0 */}
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Age Range</label>
                <div className="grid grid-cols-3 gap-2">
                  {AGE_RANGES.map(a => (
                    <button key={a} onClick={() => setForm(f => ({ ...f, age: a }))}
                      className={cn("py-2.5 rounded-xl text-sm font-medium border transition-all",
                        form.age === a ? "bg-brand-primary/20 border-brand-primary/50 text-brand-primary-light" :
                        "border-border-default text-text-secondary hover:border-border-strong hover:text-text-primary")}>
                      {a}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Academic Level</label>
                <div className="grid grid-cols-2 gap-2">
                  {ACADEMIC_LEVELS.map(l => (
                    <button key={l} onClick={() => setForm(f => ({ ...f, academicLevel: l as AcademicLevel }))}
                      className={cn("py-2.5 rounded-xl text-sm font-medium border transition-all",
                        form.academicLevel === l ? "bg-brand-primary/20 border-brand-primary/50 text-brand-primary-light" :
                        "border-border-default text-text-secondary hover:border-border-strong hover:text-text-primary")}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 1 */}
          {step === 1 && (
            <div>
              <p className="text-sm text-text-muted mb-3">Select all that apply</p>
              <div className="grid grid-cols-2 gap-2">
                {DEFAULT_SUBJECTS.map(s => (
                  <button key={s} onClick={() => toggleSubject(s)}
                    className={cn("py-2.5 px-3 rounded-xl text-sm font-medium border transition-all text-left",
                      form.subjects.includes(s) ? "bg-brand-primary/20 border-brand-primary/50 text-brand-primary-light" :
                      "border-border-default text-text-secondary hover:border-border-strong hover:text-text-primary")}>
                    {form.subjects.includes(s) && <Check className="w-3 h-3 inline mr-1.5" />}
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-3">
                  Preferred Study Duration: <span className="text-brand-primary-light font-mono">{form.preferredStudyDuration} min</span>
                </label>
                <input type="range" min={15} max={120} step={5} value={form.preferredStudyDuration}
                  onChange={e => setForm(f => ({ ...f, preferredStudyDuration: parseInt(e.target.value) }))}
                  className="w-full accent-brand-primary" />
                <div className="flex justify-between text-xs text-text-muted mt-1"><span>15 min</span><span>120 min</span></div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-3">
                  Self-rated Learning Difficulty: <span className="text-brand-primary-light font-mono">{form.learningDifficulty}/5</span>
                </label>
                <div className="flex gap-3">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n} onClick={() => setForm(f => ({ ...f, learningDifficulty: n }))}
                      className={cn(
                        "flex-1 h-12 rounded-xl font-bold text-sm border transition-all",
                        form.learningDifficulty === n ? "bg-brand-primary border-brand-primary text-white" :
                        form.learningDifficulty >= n ? "bg-brand-primary/20 border-brand-primary/40 text-brand-primary-light" :
                        "border-border-default text-text-muted hover:border-border-strong"
                      )}>
                      {n}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-text-muted mt-1"><span>Easy</span><span>Very Hard</span></div>
              </div>

              <div className="p-4 rounded-xl bg-brand-primary/5 border border-brand-primary/20">
                <p className="text-sm font-medium text-brand-primary-light mb-1">Your initial profile</p>
                <p className="text-xs text-text-secondary">
                  {form.age} · {form.academicLevel} · {form.subjects.length} subject{form.subjects.length !== 1 ? "s" : ""}
                </p>
                <p className="text-xs text-text-muted mt-1">
                  MEMORA will refine this as you complete more study sessions.
                </p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-6">
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)} className="btn-secondary flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            )}
            <button
              onClick={() => step < 2 ? setStep(s => s + 1) : handleComplete()}
              disabled={!canProceed()}
              className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {step < 2 ? "Continue" : "Build My Memory Profile"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
