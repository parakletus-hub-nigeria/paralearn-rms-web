"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Header } from "@/components/RMS/header";
import {
  useGetSubmissionQuery,
  useGradeSubmissionMutation,
} from "@/reduxToolKit/uniFeatures/assessmentsApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  GraduationCap,
  Save,
  User,
  BookOpen,
  PieChart,
} from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/reduxToolKit/store";

interface Props {
  assessmentId: string;
  submissionId: string;
}

export default function LecturerGradeSubmissionPage({ assessmentId, submissionId }: Props) {
  const router = useRouter();
  const { tenantInfo } = useSelector((s: RootState) => s.user);

  const { data: submission, isLoading, isError } = useGetSubmissionQuery(
    submissionId,
    { skip: !submissionId },
  );
  const [gradeSubmission, { isLoading: isGrading }] =
    useGradeSubmissionMutation();

  const [essayScores, setEssayScores] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState("");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
      </div>
    );
  }

  if (isError || !submission) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-slate-500">
        <p className="font-bold text-lg">Submission not found.</p>
        <Button variant="outline" onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  const handleScoreChange = (
    questionId: string,
    score: number,
    max: number,
  ) => {
    if (score > max) score = max;
    if (score < 0) score = 0;
    setEssayScores((prev) => ({ ...prev, [questionId]: score }));
  };

  const calculateTotal = () => {
    if (!submission) return 0;
    // Auto-calculating MCQ points if available, plus manual essay points
    const mcqPoints = submission.studentAnswers
      .filter((a: any) => a.question.type === "MCQ")
      .reduce((acc: number, a: any) => {
        return acc + (a.selectedOption?.isCorrect ? a.question.points : 0);
      }, 0);

    const essayPoints = Object.values(essayScores).reduce(
      (acc, s) => acc + s,
      0,
    );
    return mcqPoints + essayPoints;
  };

  const handleSave = async () => {
    try {
      const totalScore = calculateTotal();
      await gradeSubmission({
        id: submissionId as string,
        score: totalScore,
      }).unwrap();
      toast.success("Submission graded successfully!");
      router.back();
    } catch (e: any) {
      toast.error(e?.data?.message || "Failed to save grades");
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 pb-20">
      <Header
        schoolLogo={tenantInfo?.logoUrl}
        schoolName={tenantInfo?.name || "ParaLearn University"}
      />

      <div className="max-w-5xl mx-auto px-6 pt-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 hover:bg-slate-100 -ml-2 text-slate-600"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Results
        </Button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <User className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                {submission?.student?.firstName} {submission?.student?.lastName}
              </h1>
              <p className="text-slate-500 font-medium flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                {submission?.assessment?.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                Total Score
              </span>
              <span className="text-2xl font-black text-purple-600">
                {calculateTotal()} / {submission?.assessment?.totalMarks}
              </span>
            </div>
            <Button
              onClick={handleSave}
              disabled={isGrading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-14 px-8 rounded-2xl shadow-lg hover:shadow-emerald-100 transition-all gap-2"
            >
              <Save className="w-5 h-5" />
              Save Grades
            </Button>
          </div>
        </div>

        <div className="space-y-8">
          {submission?.studentAnswers?.map((answer: any, idx: number) => (
            <div
              key={answer.id}
              className="bg-white rounded-[2.5rem] border border-slate-200 p-8 md:p-10 shadow-sm"
            >
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center font-bold border border-slate-100">
                    {idx + 1}
                  </div>
                  <div>
                    <Badge
                      variant="outline"
                      className="h-6 border-slate-200 text-slate-500 bg-slate-50"
                    >
                      {answer.question.type}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">
                    Max Points
                  </span>
                  <span className="font-bold text-lg text-slate-900">
                    {answer.question.points}
                  </span>
                </div>
              </div>

              <h3 className="text-xl font-bold text-slate-900 leading-snug mb-8">
                {answer.question.content}
              </h3>

              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest block mb-3">
                  Student's Response
                </span>

                {answer.question.type === "MCQ" ? (
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-3 rounded-xl border ${
                        answer.selectedOption?.isCorrect
                          ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                          : "bg-red-50 border-red-200 text-red-700"
                      }`}
                    >
                      <span className="font-bold text-lg">
                        {answer.selectedOption?.content || "No Option Selected"}
                      </span>
                    </div>
                    {answer.selectedOption?.isCorrect ? (
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0">
                        Correct
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-0">
                        Incorrect
                      </Badge>
                    )}
                  </div>
                ) : (
                  <p className="text-slate-700 text-lg leading-relaxed whitespace-pre-wrap">
                    {answer.textAnswer || (
                      <span className="text-slate-400 italic">
                        No response provided.
                      </span>
                    )}
                  </p>
                )}
              </div>

              {answer.question.type === "ESSAY" && (
                <div className="mt-8 flex items-center gap-6 p-6 border-2 border-dashed border-purple-100 rounded-3xl bg-purple-50/30">
                  <div className="flex items-center gap-3">
                    <GraduationCap className="w-5 h-5 text-purple-600" />
                    <span className="font-bold text-slate-700">
                      Assign Score
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      className="w-24 h-11 rounded-xl font-bold text-center border-purple-200 focus:ring-purple-600"
                      placeholder="0"
                      value={essayScores[answer.question.id] || ""}
                      onChange={(e) =>
                        handleScoreChange(
                          answer.question.id,
                          Number(e.target.value),
                          answer.question.points,
                        )
                      }
                    />
                    <span className="text-slate-400 font-bold">
                      / {answer.question.points}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
