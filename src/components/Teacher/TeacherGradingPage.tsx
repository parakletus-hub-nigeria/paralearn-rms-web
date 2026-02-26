"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { AppDispatch, RootState } from "@/reduxToolKit/store";
import { fetchAssessmentDetail, fetchAssessmentSubmissions } from "@/reduxToolKit/teacher/teacherThunks";
import { useGradeAnswerMutation } from "@/reduxToolKit/api/endpoints/assessments";
import { TeacherHeader } from "./TeacherHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function TeacherGradingPage() {
  const params = useParams<{ assessmentId: string; submissionId: string }>();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const { selectedAssessment, submissions, loading } = useSelector((s: RootState) => s.teacher);
  const [gradeAnswer, { isLoading: isGrading }] = useGradeAnswerMutation();

  const assessmentId = params?.assessmentId as string;
  const submissionId = params?.submissionId as string;

  // Local state to track active edits before saving
  const [gradingState, setGradingState] = useState<Record<string, { marksAwarded: string; comment: string }>>({});

  useEffect(() => {
    if (!assessmentId) return;
    dispatch(fetchAssessmentDetail(assessmentId));
    dispatch(fetchAssessmentSubmissions(assessmentId));
  }, [dispatch, assessmentId]);

  const submission: any = useMemo(() => {
    return submissions.find((s: any) => s.id === submissionId);
  }, [submissions, submissionId]);

  // Initialize grading state from existing submission data
  useEffect(() => {
    if (submission && submission.answers) {
      const initialState: Record<string, { marksAwarded: string; comment: string }> = {};
      submission.answers.forEach((ans: any) => {
        initialState[ans.id] = {
          marksAwarded: ans.marksAwarded?.toString() || ans.score?.toString() || "",
          comment: ans.comment || "",
        };
      });
      setGradingState(initialState);
    }
  }, [submission]);

  const handleSaveGrade = async (answerId: string) => {
    const data = gradingState[answerId];
    if (!data || !data.marksAwarded) {
      toast.error("Please enter marks to award.");
      return;
    }

    try {
      await gradeAnswer({
        submissionId,
        answerId,
        marksAwarded: Number(data.marksAwarded),
        comment: data.comment,
      }).unwrap();

      toast.success("Grade saved successfully");
      // Refetch submissions to update the central state
      dispatch(fetchAssessmentSubmissions(assessmentId));
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Failed to save grade");
    }
  };

  if (loading && !selectedAssessment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcfcfc]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#641BC4]" />
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="w-full">
        <TeacherHeader />
        <div className="p-8 text-center text-slate-500">
          Submission not found or still loading...
        </div>
      </div>
    );
  }

  const studentName = submission.student?.firstName
    ? `${submission.student.firstName} ${submission.student.lastName}`
    : `Student ID: ${submission.studentId || "Unknown"}`;

  return (
    <div className="w-full bg-[#fcfcfc] min-h-screen pb-20">
      <TeacherHeader />

      <div className="px-4 md:px-8 py-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="h-11 rounded-xl border-slate-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Assessment
          </Button>
        </div>

        <Card className="p-6 md:p-8 rounded-2xl border-slate-100 shadow-sm mb-8 bg-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Reviewing Submission
              </h2>
              <p className="text-slate-500 mt-1">
                Student: <span className="font-semibold text-slate-800">{studentName}</span>
              </p>
              {submission.student?.matricNumber && (
                <p className="text-slate-400 text-sm">
                   Matric: {submission.student.matricNumber}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Score</p>
              <p className="text-4xl font-black text-[#641BC4]">
                {submission.score ?? submission.marksAwarded ?? 0}
                <span className="text-xl text-slate-400"> / {selectedAssessment?.totalMarks || 100}</span>
              </p>
            </div>
          </div>
        </Card>

        <div className="space-y-8">
          <h3 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2">Answers</h3>
          
          {(selectedAssessment?.questions || []).map((question: any, idx: number) => {
            // Find the student's answer for this question
            const answerDoc = submission.answers?.find((a: any) => a.questionId === question.id);
            const answerId = answerDoc?.id;
            
            // Format answer display
            let displayAnswer = "No answer provided";
            const rawValue = answerDoc?.value || answerDoc?.answer;
            if (rawValue) {
               // Safely parse if it's a JSON string like '{"choiceId":"..."}' or '{"selected":"..."}'
               let parsedValue = rawValue;
               if (typeof rawValue === 'string') {
                  try {
                    parsedValue = JSON.parse(rawValue);
                  } catch (e) {
                    // Not JSON, keep as string
                  }
               }

               if (typeof parsedValue === 'string') {
                 // It's a plain essay string OR an option ID.
                 const choice = (question.choices || question.options || []).find((c: any) => c.id === parsedValue || c.text === parsedValue);
                 displayAnswer = choice ? choice.text : parsedValue;
               } else if (parsedValue && typeof parsedValue === 'object') {
                 // Format: { selected: "optionId" } or { choiceId: "optionId" }
                 const selectedId = parsedValue.selected || parsedValue.choiceId;
                 if (selectedId) {
                   const choice = (question.choices || question.options || []).find((c: any) => c.id === selectedId);
                   displayAnswer = choice ? choice.text : selectedId;
                 } else {
                   displayAnswer = JSON.stringify(parsedValue);
                 }
               } else {
                 displayAnswer = JSON.stringify(rawValue);
               }
            }

            const state = gradingState[answerId as string] || { marksAwarded: "", comment: "" };

            return (
              <Card key={question.id || idx} className="p-6 rounded-2xl border-slate-200 shadow-sm bg-white">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">
                      Question {idx + 1} • {question.type || question.questionType || "General"}
                    </span>
                    <h4 className="text-lg font-medium text-slate-900">
                      {question.prompt || question.questionText}
                    </h4>
                  </div>
                  <Badge className="bg-slate-100 text-slate-600 rounded-lg">
                    {question.marks || 1} Marks
                  </Badge>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">
                    Student's Answer
                  </span>
                  <p className="text-slate-800 whitespace-pre-wrap">{displayAnswer}</p>
                </div>

                {answerId ? (
                  <div className="bg-[#fcfcfc] p-4 rounded-xl border border-slate-200/60">
                     <h5 className="text-sm font-semibold text-slate-700 mb-3 border-b border-slate-100 pb-2">Grade Assignment</h5>
                     <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                       <div className="md:col-span-3">
                         <label className="text-xs font-medium text-slate-500 mb-1 block">Marks Awarded</label>
                         <Input 
                           type="number"
                           step="0.5"
                           min="0"
                           max={question.marks || 1}
                           value={state.marksAwarded}
                           onChange={(e) => setGradingState(p => ({
                             ...p,
                             [answerId]: { ...p[answerId], marksAwarded: e.target.value }
                           }))}
                           className="h-10 text-lg font-semibold border-slate-300"
                           placeholder="0.0"
                         />
                       </div>
                       <div className="md:col-span-6">
                         <label className="text-xs font-medium text-slate-500 mb-1 block">Teacher Comment (Optional)</label>
                         <Input 
                           type="text"
                           value={state.comment}
                           onChange={(e) => setGradingState(p => ({
                             ...p,
                             [answerId]: { ...p[answerId], comment: e.target.value }
                           }))}
                           className="h-10 border-slate-300"
                           placeholder="Good job, but missed X..."
                         />
                       </div>
                       <div className="md:col-span-3">
                         <Button 
                           onClick={() => handleSaveGrade(answerId)}
                           disabled={isGrading}
                           className="w-full h-10 bg-[#641BC4] hover:bg-[#641BC4]/90 text-white rounded-lg"
                         >
                           <Save className="w-4 h-4 mr-2" />
                           Save Grade
                         </Button>
                       </div>
                     </div>
                  </div>
                ) : (
                  <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-100 flex items-center">
                    <span className="font-semibold">Notice:</span> &nbsp;The student did not submit an answer for this question, so it cannot be manually graded.
                  </div>
                )}
              </Card>
            );
          })}
          
          {selectedAssessment?.questions?.length === 0 && (
            <div className="text-center py-12 text-slate-500 bg-white rounded-2xl border border-slate-100">
               No questions found in this assessment.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
