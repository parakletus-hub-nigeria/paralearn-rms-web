"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { RootState } from "@/reduxToolKit/store";
import { Header } from "@/components/RMS/header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  Plus,
  Trash2,
  Save,
  Clock,
  BookOpen,
  HelpCircle,
  FileText,
} from "lucide-react";
import { useCreateUniAssessmentMutation } from "@/reduxToolKit/uniFeatures/assessmentsApi";
import { useGetLecturerTimetableQuery } from "@/reduxToolKit/uniFeatures/timetableApi";

const DEFAULT_PRIMARY = "#641BC4";

export default function LecturerCreateAssessmentPage() {
  const router = useRouter();
  const { tenantInfo } = useSelector((s: RootState) => s.user);
  const primaryColor = DEFAULT_PRIMARY;

  const [createAssessment, { isLoading: isCreating }] =
    useCreateUniAssessmentMutation();
  const { data: timetableResponse } = useGetLecturerTimetableQuery();

  const timetableEntries = Array.isArray(timetableResponse?.data)
    ? timetableResponse.data
    : Array.isArray(timetableResponse)
      ? timetableResponse
      : [];

  // Metadata Form
  const [form, setForm] = useState({
    title: "",
    timetableId: "",
    durationMins: "60",
    totalMarks: "100",
    passMark: "40",
    type: "MCQ", // MCQ, ESSAY, MIXED
    instructions: "",
  });

  // Questions State
  const [questions, setQuestions] = useState<any[]>([
    {
      id: Date.now(),
      text: "",
      type: "MCQ",
      points: 5,
      options: [
        { id: "A", content: "", isCorrect: false },
        { id: "B", content: "", isCorrect: false },
      ],
    },
  ]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: Date.now(),
        text: "",
        type: form.type === "MIXED" ? "MCQ" : form.type,
        points: 5,
        options: [
          { id: "A", content: "", isCorrect: false },
          { id: "B", content: "", isCorrect: false },
        ],
      },
    ]);
  };

  const removeQuestion = (id: number) => {
    if (questions.length === 1)
      return toast.error("At least one question is required");
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const updateQuestion = (id: number, updates: any) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, ...updates } : q)),
    );
  };

  const addOption = (qId: number) => {
    const q = questions.find((q) => q.id === qId);
    if (q.options.length >= 5) return toast.error("Maximum 5 options allowed");
    const nextLetter = String.fromCharCode(65 + q.options.length);
    const newOptions = [
      ...q.options,
      { id: nextLetter, content: "", isCorrect: false },
    ];
    updateQuestion(qId, { options: newOptions });
  };

  const removeOption = (qId: number, optId: string) => {
    const q = questions.find((q) => q.id === qId);
    if (q.options.length <= 2) return toast.error("Minimum 2 options required");
    const newOptions = q.options.filter((o: any) => o.id !== optId);
    updateQuestion(qId, { options: newOptions });
  };

  const handleSubmit = async () => {
    try {
      if (!form.title) return toast.error("Title is required");
      if (!form.timetableId) return toast.error("Please select a course slot");

      // Validate questions
      for (const q of questions) {
        if (!q.text) return toast.error("All questions must have text");
        if (q.type === "MCQ") {
          const hasCorrect = q.options.some((o: any) => o.isCorrect);
          if (!hasCorrect)
            return toast.error(
              `Question "${q.text.substring(0, 20)}..." has no correct answer selected`,
            );
          if (q.options.some((o: any) => !o.content))
            return toast.error(
              `All options for "${q.text.substring(0, 20)}..." must have content`,
            );
        }
      }

      const payload = {
        ...form,
        durationMins: Number(form.durationMins),
        totalMarks: Number(form.totalMarks),
        passMark: Number(form.passMark),
        questions: questions.map((q) => ({
          text: q.text,
          type: q.type,
          points: Number(q.points),
          options: q.type === "MCQ" ? q.options : null,
        })),
      };

      await createAssessment(payload).unwrap();
      toast.success("Assessment created successfully!");
      router.push("/uni-lecturer/assessments");
    } catch (e: any) {
      toast.error(
        e?.data?.message || e?.message || "Failed to create assessment",
      );
    }
  };

  return (
    <div className="w-full">
      <Header
        schoolLogo={tenantInfo?.logoUrl}
        schoolName={tenantInfo?.name || "ParaLearn University"}
      />

      <div className="p-6 md:p-8 max-w-5xl mx-auto">
        {/* Top Navigation */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-slate-500 hover:text-slate-900 gap-2"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </Button>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleSubmit}
              disabled={isCreating}
              className="h-11 px-6 rounded-xl text-white gap-2 font-semibold shadow-lg shadow-purple-200"
              style={{ backgroundColor: primaryColor }}
            >
              <Save className="w-4 h-4" />
              {isCreating ? "Creating..." : "Save Assessment"}
            </Button>
          </div>
        </div>

        {/* Page Title */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900 font-coolvetica">
            Create New Assessment
          </h1>
          <p className="text-slate-500 mt-1">
            Design your CBT exam or mixed assessment for your students.
          </p>
        </div>

        {/* Form Sections */}
        <div className="space-y-8">
          {/* Metadata Section */}
          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" />
              Assessment Metadata
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-slate-700">
                  Assessment Title
                </label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. MEE 301 Midterm Exam"
                  className="mt-2 h-12 rounded-xl border-slate-200"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Course Slot
                </label>
                <Select
                  value={form.timetableId}
                  onValueChange={(val) =>
                    setForm({ ...form, timetableId: val })
                  }
                >
                  <SelectTrigger className="mt-2 h-12 rounded-xl border-slate-200 bg-white">
                    <SelectValue placeholder="Select course from timetable" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {timetableEntries.map((entry: any) => (
                      <SelectItem key={entry.id} value={entry.id}>
                        {entry.course?.code} - {entry.course?.title} (
                        {entry.dayOfWeek})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Assessment Type
                </label>
                <Select
                  value={form.type}
                  onValueChange={(val) => {
                    setForm({ ...form, type: val });
                    // If switching from MCQ to ESSAY, update existing questions if they were default
                    if (val !== "MIXED") {
                      setQuestions(questions.map((q) => ({ ...q, type: val })));
                    }
                  }}
                >
                  <SelectTrigger className="mt-2 h-12 rounded-xl border-slate-200 bg-white">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="MCQ">CBT (Only MCQ)</SelectItem>
                    <SelectItem value="ESSAY">Essay Only</SelectItem>
                    <SelectItem value="MIXED">Mixed (MCQ + Essay)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-3 gap-4 md:col-span-2">
                <div>
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Duration (Mins)
                  </label>
                  <Input
                    type="number"
                    value={form.durationMins}
                    onChange={(e) =>
                      setForm({ ...form, durationMins: e.target.value })
                    }
                    className="mt-2 h-12 rounded-xl border-slate-200"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Total Marks
                  </label>
                  <Input
                    type="number"
                    value={form.totalMarks}
                    onChange={(e) =>
                      setForm({ ...form, totalMarks: e.target.value })
                    }
                    className="mt-2 h-12 rounded-xl border-slate-200"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Pass Mark
                  </label>
                  <Input
                    type="number"
                    value={form.passMark}
                    onChange={(e) =>
                      setForm({ ...form, passMark: e.target.value })
                    }
                    className="mt-2 h-12 rounded-xl border-slate-200"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-slate-700">
                  Instructions
                </label>
                <Textarea
                  value={form.instructions}
                  onChange={(e) =>
                    setForm({ ...form, instructions: e.target.value })
                  }
                  placeholder="Enter exam instructions for students..."
                  className="mt-2 rounded-xl border-slate-200 min-h-[100px]"
                />
              </div>
            </div>
          </section>

          {/* Question Builder Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-purple-600" />
                Questions ({questions.length})
              </h2>
              <Button
                onClick={addQuestion}
                variant="outline"
                className="rounded-xl border-purple-100 bg-purple-50 text-purple-700 hover:bg-purple-100 gap-2"
              >
                <Plus className="w-4 h-4" /> Add Question
              </Button>
            </div>

            {questions.map((q, qIdx) => (
              <div
                key={q.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
              >
                <div className="bg-slate-50 px-6 py-3 border-b border-slate-100 flex items-center justify-between">
                  <span className="font-bold text-slate-700">
                    Question {qIdx + 1}
                  </span>
                  <div className="flex items-center gap-4">
                    {form.type === "MIXED" && (
                      <Select
                        value={q.type}
                        onValueChange={(val) =>
                          updateQuestion(q.id, { type: val })
                        }
                      >
                        <SelectTrigger className="h-8 w-28 text-xs rounded-lg border-slate-200 bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-lg">
                          <SelectItem value="MCQ">MCQ</SelectItem>
                          <SelectItem value="ESSAY">Essay</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-semibold text-slate-500">
                        Points:
                      </label>
                      <Input
                        type="number"
                        value={q.points}
                        onChange={(e) =>
                          updateQuestion(q.id, { points: e.target.value })
                        }
                        className="h-8 w-16 text-center text-xs rounded-lg border-slate-200"
                      />
                    </div>
                    <button
                      onClick={() => removeQuestion(q.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <Textarea
                    value={q.text}
                    onChange={(e) =>
                      updateQuestion(q.id, { text: e.target.value })
                    }
                    placeholder="Enter question text..."
                    className="rounded-xl border-slate-200 min-h-[80px] mb-4"
                  />

                  {q.type === "MCQ" && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          Options
                        </p>
                        <p className="text-xs text-slate-400">
                          Click{" "}
                          <span className="font-semibold text-emerald-600">
                            ✓ Mark Correct
                          </span>{" "}
                          to set the right answer
                        </p>
                      </div>
                      {q.options.map((opt: any) => (
                        <div
                          key={opt.id}
                          className={`flex items-center gap-3 p-2 rounded-xl border-2 transition-all ${
                            opt.isCorrect
                              ? "border-emerald-400 bg-emerald-50"
                              : "border-slate-100 bg-slate-50/40"
                          }`}
                        >
                          <span className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-black text-slate-600 shrink-0">
                            {opt.id}
                          </span>
                          <Input
                            value={opt.content}
                            onChange={(e) => {
                              const newOpts = q.options.map((o: any) =>
                                o.id === opt.id
                                  ? { ...o, content: e.target.value }
                                  : o,
                              );
                              updateQuestion(q.id, { options: newOpts });
                            }}
                            placeholder={`Option ${opt.id}...`}
                            className={`h-9 rounded-lg flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 ${opt.isCorrect ? "font-semibold text-emerald-800" : ""}`}
                          />
                          <button
                            onClick={() => {
                              const newOpts = q.options.map((o: any) => ({
                                ...o,
                                isCorrect: o.id === opt.id,
                              }));
                              updateQuestion(q.id, { options: newOpts });
                            }}
                            className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              opt.isCorrect
                                ? "bg-emerald-500 text-white shadow-sm"
                                : "bg-white border border-slate-200 text-slate-400 hover:border-emerald-400 hover:text-emerald-600"
                            }`}
                          >
                            {opt.isCorrect ? "✓ Correct" : "Mark Correct"}
                          </button>
                          <button
                            onClick={() => removeOption(q.id, opt.id)}
                            className="p-1.5 text-slate-300 hover:text-red-500 transition-colors shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => addOption(q.id)}
                        className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 gap-2 mt-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Option
                      </Button>
                    </div>
                  )}

                  {q.type === "ESSAY" && (
                    <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 flex items-start gap-3">
                      <HelpCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-sm text-amber-800">
                        Essay questions will be submitted as text by students
                        and will require manual grading after the exam.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}

            <Button
              onClick={addQuestion}
              variant="outline"
              className="w-full h-16 rounded-2xl border-dashed border-slate-200 text-slate-500 hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50 transition-all font-semibold gap-2 border-2"
            >
              <Plus className="w-5 h-5" /> Add Another Question
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
