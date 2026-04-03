"use client";

import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/reduxToolKit/store";
import { fetchCurricula, generateLesson, fetchWallet } from "@/reduxToolKit/lessonGenerator/lessonGeneratorThunks";
import { useRouter } from "next/navigation";
import { routespath } from "@/lib/routepath";
import {
  Sparkles, ArrowLeft, ChevronDown, BookOpen, GraduationCap,
  Layers, Calendar, Clock, Zap, CheckCircle2, AlertCircle, Loader2, Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { clearError, clearCurrentLesson } from "@/reduxToolKit/lessonGenerator/lessonGeneratorSlice";

/** Derive subject category from grade string */
function getSubjectCategory(grade: string): "PRIMARY" | "JSS" | "SSS" | null {
  if (!grade) return null;
  if (grade.startsWith("Primary")) return "PRIMARY";
  if (grade.startsWith("JSS")) return "JSS";
  if (grade.startsWith("SSS")) return "SSS";
  return null;
}

export function LessonGeneratorForm() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { curricula, generating, error, wallet } = useSelector((s: RootState) => s.lessonGenerator);
  const { schoolSettings } = useSelector((s: RootState) => s.admin);
  const primaryColor = schoolSettings?.primaryColor || "#641BC4";

  const [formData, setFormData] = useState({
    subject: "",
    grade: "",
    topic: "",
    term: "First" as "First" | "Second" | "Third",
    week: 1,
    duration: 40,
    curriculum: "NERDC",
  });

  const [step, setStep] = useState(1);

  useEffect(() => {
    dispatch(fetchCurricula());
    dispatch(fetchWallet());
    dispatch(clearError());
    dispatch(clearCurrentLesson());
  }, [dispatch]);

  // Find selected curriculum by id (e.g. "NERDC")
  const selectedCurriculum = useMemo(
    () => curricula.find((c: any) => c.id === formData.curriculum),
    [curricula, formData.curriculum]
  );

  // Grade levels is a flat string array: ["Primary 1", "JSS 1", "SSS 1", ...]
  const gradeLevels: string[] = useMemo(
    () => selectedCurriculum?.gradeLevels ?? [],
    [selectedCurriculum]
  );

  // Subjects depend on which category the selected grade falls into
  const subjects: string[] = useMemo(() => {
    const category = getSubjectCategory(formData.grade);
    if (!category || !selectedCurriculum) return [];
    return selectedCurriculum.subjects?.[category] ?? [];
  }, [selectedCurriculum, formData.grade]);

  const isZeroBalance = wallet.balance !== null && wallet.balance === 0;
  const canGenerate = !isZeroBalance && !!formData.subject && !!formData.grade && !!formData.topic;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canGenerate) {
      if (isZeroBalance) {
        toast.error("Your $Parats balance is 0. Please top up to generate.");
      } else {
        toast.error("Please fill in all required fields");
      }
      return;
    }

    try {
      const resultAction = await dispatch(generateLesson(formData));
      if (generateLesson.fulfilled.match(resultAction)) {
        const payload = resultAction.payload;
        if (payload.demo) {
          // Unauthenticated demo — note stored inline (shouldn't happen in RMS but handle gracefully)
          toast.info(payload.message || "Demo generation complete. Sign up to save your notes.");
          return;
        }
        toast.success("Lesson note generated!");
        router.push(routespath.LESSON_GENERATOR_DETAILS.replace(":id", payload.id));
      } else if (generateLesson.rejected.match(resultAction)) {
        const errMsg = resultAction.payload as string;
        // 500 errors mean $Parats were auto-refunded
        if (errMsg?.toLowerCase().includes("generation failed") || errMsg?.toLowerCase().includes("500")) {
          toast.error("Generation failed. Your $Parats have been refunded.");
        } else {
          toast.error(errMsg || "Generation failed");
        }
        dispatch(fetchWallet()); // Refresh balance after error
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (generating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-in fade-in duration-1000">
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-4 border-purple-100 border-t-purple-600 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-purple-600 animate-pulse" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">AI is building your lesson note…</h2>
          <p className="text-slate-500 max-w-xs mx-auto text-sm leading-relaxed">
            We're building structured objectives, teaching points, and assessments tailored to your topic.
          </p>
        </div>
        <div className="flex flex-col gap-2 w-full max-w-xs">
          {[
            "Applying Bloom's Taxonomy…",
            "Contextualising for Nigerian Curriculum…",
            "Structuring formative assessments…",
            "Preparing resource recommendations…",
          ].map((text, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-lg border border-slate-100 text-xs font-medium text-slate-600">
              <Loader2 className="w-3 h-3 animate-spin text-purple-500" />
              {text}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-medium transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </button>

        {/* Wallet balance */}
        <div className="flex items-center gap-2">
          {wallet.balance !== null ? (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold border ${
              isZeroBalance
                ? "bg-red-50 text-red-700 border-red-200"
                : wallet.isLowBalance
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-purple-50 text-purple-700 border-purple-100"
            }`}>
              <Wallet className="w-4 h-4" />
              {wallet.balance} Parats
            </div>
          ) : null}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-sm font-bold border border-slate-100">
            <Zap className="w-4 h-4 text-purple-500 fill-purple-500" />
            Cost: 5 Parats
          </div>
        </div>
      </div>

      {/* Low balance alert */}
      {wallet.alert && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm font-medium">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
          {wallet.alert}
        </div>
      )}

      {/* Zero balance — block generation */}
      {isZeroBalance && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm font-medium">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          Your $Parats balance is 0. Top up your wallet to generate lesson notes.
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="p-8 md:p-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-200">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 leading-tight">Create Lesson Note</h1>
              <p className="text-slate-500 text-sm">Fill in the details below to generate a new note.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Step Indicators */}
            <div className="flex items-center gap-4">
              {[
                { n: 1, label: "Context" },
                { n: 2, label: "Specifics" },
              ].map((s) => (
                <div key={s.n} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    step === s.n ? "bg-purple-600 text-white" : step > s.n ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"
                  }`}>
                    {step > s.n ? <CheckCircle2 className="w-5 h-5" /> : s.n}
                  </div>
                  <span className={`text-sm font-bold ${step === s.n ? "text-slate-900" : "text-slate-400"}`}>{s.label}</span>
                  {s.n === 1 && <div className="w-8 h-[2px] bg-slate-100" />}
                </div>
              ))}
            </div>

            {step === 1 ? (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Grade */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Grade Level</label>
                    <div className="relative group">
                      <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-purple-600 transition-colors" />
                      <select
                        value={formData.grade}
                        onChange={(e) => setFormData({ ...formData, grade: e.target.value, subject: "" })}
                        className="w-full pl-12 pr-10 py-4 bg-slate-50 border-2 border-transparent focus:border-purple-600 focus:bg-white rounded-2xl outline-none appearance-none transition-all font-medium text-slate-900"
                        required
                      >
                        <option value="">Select Grade</option>
                        {gradeLevels.map((g) => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Subject — cascades from grade */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Subject</label>
                    <div className="relative group">
                      <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-purple-600 transition-colors" />
                      <select
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full pl-12 pr-10 py-4 bg-slate-50 border-2 border-transparent focus:border-purple-600 focus:bg-white rounded-2xl outline-none appearance-none transition-all font-medium text-slate-900 disabled:opacity-50"
                        disabled={!formData.grade || subjects.length === 0}
                        required
                      >
                        <option value="">
                          {!formData.grade ? "Select a grade first" : "Select Subject"}
                        </option>
                        {subjects.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Curriculum selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Curriculum Framework</label>
                  <div className="grid grid-cols-3 gap-4">
                    {["NERDC", "British", "American"].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setFormData({ ...formData, curriculum: c, grade: "", subject: "" })}
                        className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all font-bold ${
                          formData.curriculum === c
                            ? "border-purple-600 bg-purple-50 text-purple-700"
                            : "border-slate-100 bg-slate-50 text-slate-400 opacity-50 cursor-not-allowed"
                        }`}
                        disabled={c !== "NERDC"}
                      >
                        {c}
                        {formData.curriculum === c && <CheckCircle2 className="w-5 h-5" />}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium italic">* Only NERDC supported in beta.</p>
                </div>

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={!formData.grade || !formData.subject}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                  >
                    Next Step
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                {/* Topic */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Topic</label>
                  <div className="relative group">
                    <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-purple-600 transition-colors" />
                    <input
                      type="text"
                      placeholder="e.g. Simultaneous Equations, Plant Growth…"
                      value={formData.topic}
                      onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-purple-600 focus:bg-white rounded-2xl outline-none transition-all font-medium text-slate-900"
                      required
                    />
                  </div>
                </div>

                {/* Term + Week */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Academic Term</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["First", "Second", "Third"] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setFormData({ ...formData, term: t })}
                          className={`py-3 rounded-xl border-2 text-xs font-bold transition-all ${
                            formData.term === t
                              ? "border-purple-600 bg-purple-50 text-purple-700"
                              : "border-slate-100 bg-slate-50 text-slate-500 hover:bg-slate-100"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Week Number (1–13)</label>
                    <div className="relative group">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-purple-600 transition-colors" />
                      <input
                        type="number"
                        min="1"
                        max="13"
                        value={formData.week}
                        onChange={(e) => setFormData({ ...formData, week: Math.max(1, Math.min(13, parseInt(e.target.value) || 1)) })}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-purple-600 focus:bg-white rounded-2xl outline-none transition-all font-medium text-slate-900"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Duration */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Lesson Duration</label>
                  <div className="relative group">
                    <input
                      type="range"
                      min="30"
                      max="120"
                      step="5"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                      className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-purple-600 mt-2"
                    />
                    <div className="flex justify-between mt-2 text-xs font-bold text-slate-400">
                      <span>30m</span>
                      <span className="text-purple-600 px-2 py-1 bg-purple-50 rounded-lg flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {formData.duration} min
                      </span>
                      <span>120m</span>
                    </div>
                  </div>
                </div>

                {/* Error display */}
                {error && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-center gap-3 text-red-600 text-sm font-medium">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    {typeof error === "string" ? error : "An error occurred during generation."}
                  </div>
                )}

                <div className="pt-4 flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all active:scale-95"
                  >
                    Previous
                  </button>
                  <button
                    type="submit"
                    disabled={!canGenerate}
                    className="flex-[2] py-4 bg-purple-600 text-white rounded-2xl font-bold hover:bg-purple-700 transition-all active:scale-95 shadow-lg shadow-purple-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Sparkles className="w-5 h-5" />
                    Generate Lesson Note
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
