"use client";

import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/reduxToolKit/store";
import { fetchMyAssessments, Assessment, fetchAssessmentDetail } from "@/reduxToolKit/teacher/teacherThunks";
import { TeacherHeader } from "./TeacherHeader";
import { updateTeacherAssessment, publishAssessment } from "@/reduxToolKit/teacher/teacherThunks";
import { generateQuestions, GeneratedQuestion } from "@/lib/geminiService";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Sparkles, 
  Send, 
  Plus, 
  Trash2, 
  Save, 
  CheckCircle,
  AlertCircle,
  Copy,
  ChevronRight,
  Loader2,
  FileQuestion,
  History
} from "lucide-react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";

export function QuestionDraftingPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const assessmentIdFromUrl = searchParams.get("assessmentId");

  const { assessments, loading } = useSelector((s: RootState) => s.teacher);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>(assessmentIdFromUrl || "");
  const [isSaving, setIsSaving] = useState(false);

  // AI State
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedHistory, setGeneratedHistory] = useState<{prompt: string, questions: GeneratedQuestion[]}[]>([]);

  // Draft State
  const [draftQuestions, setDraftQuestions] = useState<any[]>([]);

  // Load assessments on mount
  useEffect(() => {
    dispatch(fetchMyAssessments());
  }, [dispatch]);

  // Sync selectedAssessmentId with URL
  useEffect(() => {
    if (assessmentIdFromUrl) {
      setSelectedAssessmentId(assessmentIdFromUrl);
    }
  }, [assessmentIdFromUrl]);

  // Load questions when assessment changes - fetch from backend first, then localStorage
  useEffect(() => {
    const loadQuestions = async () => {
      if (!selectedAssessmentId) return;

      try {
        // First, try to fetch existing questions from the backend
        const result = await dispatch(fetchAssessmentDetail(selectedAssessmentId)).unwrap();
        
        if (result?.questions && result.questions.length > 0) {
          console.log("[QuestionDrafting] Loaded questions from backend:", result.questions);
          
          // Transform backend questions to draft format
          const transformedQuestions = result.questions.map((q: any, index: number) => ({
            id: Date.now() + index,
            questionText: q.prompt || q.questionText || "",
            questionType: q.type || q.questionType || "MCQ",
            marks: q.marks || 1,
            options: (q.choices || q.options || []).map((opt: any) => ({
              text: opt.text || "",
              isCorrect: opt.isCorrect || false
            })),
            correctAnswer: q.correctAnswer || "",
            explanation: q.explanation || ""
          }));
          
          setDraftQuestions(transformedQuestions);
          return; // Exit early if we loaded from backend
        }
      } catch (error) {
        console.log("[QuestionDrafting] No questions in backend, checking localStorage");
      }

      // Fallback: Load from localStorage if no backend questions
      const saved = localStorage.getItem(`draft_questions_${selectedAssessmentId}`);
      if (saved) {
        console.log("[QuestionDrafting] Loaded questions from localStorage");
        setDraftQuestions(JSON.parse(saved));
      } else {
        console.log("[QuestionDrafting] No questions found");
        setDraftQuestions([]);
      }
    };

    loadQuestions();
  }, [selectedAssessmentId, dispatch]);

  // Save draft to local storage whenever it changes
  useEffect(() => {
    if (selectedAssessmentId && draftQuestions.length > 0) {
      localStorage.setItem(`draft_questions_${selectedAssessmentId}`, JSON.stringify(draftQuestions));
    }
  }, [draftQuestions, selectedAssessmentId]);

  const onlineAssessments = useMemo(() => {
    console.log("===== DEBUGGING ASSESSMENTS =====");
    console.log("Total assessments:", assessments.length);
    console.log("All assessments:", assessments);
    
    // Log each assessment to see structure
    assessments.forEach((a: any, idx: number) => {
      console.log(`Assessment ${idx}:`, {
        id: a.id,
        title: a.title,
        isOnline: a.isOnline,
        assessmentType: a.assessmentType,
        status: a.status,
        rawObject: a
      });
    });
    
    const filtered = assessments.filter((a: any) => a.isOnline === true && a.status !== "ended");
    console.log("Filtered online assessments:", filtered.length);
    console.log("Filtered online assessments data:", filtered);
    console.log("=================================");
    
    return filtered;
  }, [assessments]);

  const handleSave = async (shouldPublish = false) => {
    if (!selectedAssessmentId) return;
    if (draftQuestions.length === 0) return toast.error("No questions to save");

    setIsSaving(true);
    try {
      // Transform draft questions to API format
      const formattedQuestions = draftQuestions.map(q => ({
        prompt: q.questionText,
        type: q.questionType,
        marks: q.marks || 1,
        choices: (q.options || []).map((o: any) => ({
          text: o.text,
          isCorrect: o.isCorrect
        })),
        correctAnswer: q.correctAnswer,
        explanation: q.explanation
      }));

      // First, save the questions
      await dispatch(
        updateTeacherAssessment({
          id: selectedAssessmentId,
          data: { questions: formattedQuestions }
        })
      ).unwrap();

      // Then, if shouldPublish is true, publish the assessment
      if (shouldPublish) {
        await dispatch(
          publishAssessment({
            assessmentId: selectedAssessmentId,
            publish: true
          })
        ).unwrap();
        toast.success("Questions saved and assessment published!");
      } else {
        toast.success("Questions saved successfully!");
      }

      localStorage.removeItem(`draft_questions_${selectedAssessmentId}`);
      dispatch(fetchMyAssessments());
      router.push('/teacher/assessments');
    } catch (error: any) {
      toast.error(error || "Failed to save questions");
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerate = async () => {
    const apiKey = localStorage.getItem("gemini_api_key");
    if (!apiKey) return toast.error("Gemini API Key not found in local storage.");
    if (!prompt.trim()) return toast.error("Please enter a prompt.");

    setIsGenerating(true);
    try {
      const questions = await generateQuestions(apiKey, prompt);
      setGeneratedHistory(prev => [{ prompt, questions }, ...prev]);
      setPrompt("");
      toast.success(`Generated ${questions.length} questions!`);
    } catch (error: any) {
      toast.error(error.message || "Failed to generate questions");
    } finally {
      setIsGenerating(false);
    }
  };

  const addQuestionToDraft = (q: GeneratedQuestion) => {
    setDraftQuestions(prev => [...prev, { ...q, id: Date.now() + Math.random() }]);
    toast.success("Question added to draft");
  };

  const addManualQuestion = () => {
    setDraftQuestions(prev => [
      ...prev,
      {
        id: Date.now(),
        questionText: "",
        questionType: "MCQ",
        marks: 1,
        options: [
          { text: "Option 1", isCorrect: true },
          { text: "Option 2", isCorrect: false },
          { text: "Option 3", isCorrect: false },
          { text: "Option 4", isCorrect: false }
        ]
      }
    ]);
  };

  const updateDraftQuestion = (id: number, field: string, value: any) => {
    setDraftQuestions(prev => prev.map(q => q.id === id ? { ...q, [field]: value } : q));
  };
  
  const updateOption = (qId: number, oIdx: number, field: string, value: any) => {
    setDraftQuestions(prev => prev.map(q => {
      if (q.id !== qId) return q;
      const newOptions = [...q.options];
      newOptions[oIdx] = { ...newOptions[oIdx], [field]: value };
      
      // Ensure specific logic for single correct answer in MCQ
      if (field === "isCorrect" && value === true && q.questionType === "MCQ") {
         newOptions.forEach((o, i) => {
             if (i !== oIdx) o.isCorrect = false;
         });
      }
      
      return { ...q, options: newOptions };
    }));
  };

  const removeQuestion = (id: number) => {
    setDraftQuestions(prev => prev.filter(q => q.id !== id));
  };

  const clearDraft = () => {
    if (confirm("Are you sure you want to clear all questions?")) {
      setDraftQuestions([]);
      localStorage.removeItem(`draft_questions_${selectedAssessmentId}`);
    }
  };
    
  const selectedAssessment = assessments.find((a: any) => a.id === selectedAssessmentId);

  return (
    <div className="w-full min-h-screen bg-slate-50">
      <TeacherHeader />
      
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 pb-20">
        {/* Top Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
           <div className="flex-1 w-full flex items-center gap-3">
             <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => router.back()} 
                className="h-12 w-12 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-50"
             >
                <ChevronRight className="w-5 h-5 rotate-180" />
             </Button>
             <div className="flex-1 relative">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2 block pl-1 font-outfit">
                    Active Assessment
                </label>
                <Select value={selectedAssessmentId} onValueChange={setSelectedAssessmentId}>
               <SelectTrigger className="h-12 bg-white border-slate-200 rounded-xl text-base font-medium shadow-sm">
                 <SelectValue placeholder="Select an assessment..." />
               </SelectTrigger>
               <SelectContent>
                 {onlineAssessments.length === 0 ? (
                    <SelectItem value="none" disabled>No online assessments found</SelectItem>
                 ) : (
                    onlineAssessments.map((a: any) => (
                        <SelectItem key={a.id} value={a.id}>{a.title} ({a.questions?.length || 0} questions)</SelectItem>
                    ))
                 )}
               </SelectContent>
             </Select>
             </div>
           </div>
           
           <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => handleSave(false)}
                className="h-12 px-6 rounded-xl border-slate-200 bg-white text-slate-700 font-bold shadow-sm"
                disabled={!selectedAssessmentId || draftQuestions.length === 0 || isSaving}
              >
                 {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                 Save Draft
              </Button>
              <Button 
                onClick={() => handleSave(true)}
                className="h-12 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold shadow-lg shadow-indigo-200"
                disabled={!selectedAssessmentId || draftQuestions.length === 0 || isSaving}
              >
                 {isSaving ? (
                   <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Publishing...</>
                 ) : (
                   <><Send className="w-4 h-4 mr-2" /> Save & Publish</>
                 )}
              </Button>
           </div>
        </div>

        {selectedAssessmentId ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-220px)] min-h-[600px]">
            
            {/* Left Sidebar - AI Builder */}
            <div className="lg:col-span-4 flex flex-col gap-4 h-full overflow-hidden">
                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 flex-1 flex flex-col overflow-hidden">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-900 font-coolvetica text-xl tracking-tight">AI Builder</h2>
                            <p className="text-sm text-slate-500">Smart question generation</p>
                        </div>
                    </div>
                    
                    <div className="space-y-6 flex-1 flex flex-col overflow-hidden">
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">AI Prompt</label>
                            <div className="relative group">
                                <Textarea 
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="e.g. Generate 5 MCQ questions about Photosynthesis..."
                                    className="min-h-[120px] bg-slate-50 border-slate-100 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50 rounded-2xl p-4 text-sm transition-all resize-none"
                                />
                                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                                    <Button 
                                        size="sm"
                                        onClick={handleGenerate}
                                        disabled={isGenerating || !prompt.trim()}
                                        className="h-9 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-md transition-all active:scale-95"
                                    >
                                        {isGenerating ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <><Send className="w-4 h-4 mr-2" /> Generate</>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col overflow-hidden">
                            <div className="flex items-center justify-between mb-4 px-1">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <History className="w-3.5 h-3.5" />
                                    Recent Generations
                                </h3>
                                {generatedHistory.length > 0 && (
                                    <span className="bg-indigo-50 text-indigo-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                        {generatedHistory.length}
                                    </span>
                                )}
                            </div>
                            
                            <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                                {generatedHistory.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-100 rounded-3xl opacity-60">
                                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                                            <Sparkles className="w-6 h-6 text-slate-300" />
                                        </div>
                                        <p className="text-xs font-medium text-slate-500">No questions generated yet.</p>
                                        <p className="text-[10px] text-slate-400 mt-1">Enter a prompt above to use AI.</p>
                                    </div>
                                ) : (
                                    generatedHistory.map((gen, idx) => (
                                        <div key={idx} className="bg-slate-50 rounded-2xl p-4 border border-slate-100 hover:border-indigo-200 transition-all group">
                                            <p className="text-[10px] font-bold text-slate-400 mb-2 truncate">"{gen.prompt}"</p>
                                            <div className="space-y-2">
                                                {gen.questions.slice(0, 3).map((q, qIdx) => (
                                                    <div key={qIdx} className="flex items-start gap-2 bg-white rounded-xl p-2.5 border border-slate-100 shadow-sm relative overflow-hidden group/item">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-1.5 mb-1">
                                                                <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-tighter bg-indigo-50 px-1 rounded">
                                                                    {q.questionType}
                                                                </span>
                                                            </div>
                                                            <p className="text-[11px] text-slate-600 line-clamp-1 pr-6 font-medium">{q.questionText}</p>
                                                        </div>
                                                        <button 
                                                            onClick={() => addQuestionToDraft(q)}
                                                            className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-600 text-white rounded-lg opacity-0 group-hover/item:opacity-100 transition-all hover:bg-indigo-700 shadow-lg shadow-indigo-100"
                                                        >
                                                            <Plus className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                ))}
                                                {gen.questions.length > 3 && (
                                                    <p className="text-[9px] text-center text-slate-400 font-medium">+{gen.questions.length - 3} more questions</p>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100">
                             <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-md">
                                        <CheckCircle className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest">Draft Ready</p>
                                        <p className="text-xl font-bold text-emerald-900 leading-none">{draftQuestions.length}</p>
                                    </div>
                                </div>
                                <Button 
                                    onClick={addManualQuestion}
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-8 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-bold uppercase tracking-wider"
                                >
                                    <Plus className="w-3 h-3 mr-1" /> Add Manual
                                </Button>
                             </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Content - Drafting Table */}
            <div className="lg:col-span-8 flex flex-col gap-4 h-full overflow-hidden"> 
                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 h-full flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="font-bold text-slate-900 font-outfit text-2xl tracking-tight">Drafting Table</h2>
                            <p className="text-sm text-slate-500">Fine-tune your generated content</p>
                        </div>
                        <div className="flex gap-3">
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-10 rounded-xl px-4 text-red-500 hover:bg-red-50 font-bold text-xs uppercase tracking-widest"
                                onClick={clearDraft}
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Reset Draft
                            </Button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-6 pr-2 pb-20">
                        {draftQuestions.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                                <FileQuestion className="w-16 h-16 mb-4 stroke-1" />
                                <p className="text-sm font-medium">Your draft is empty</p>
                                <p className="text-xs">Generate questions with AI or add them manually.</p>
                            </div>
                        ) : (
                            draftQuestions.map((q, idx) => (
                                <div key={q.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm transition-all hover:shadow-md hover:border-indigo-100 group">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <span className="w-6 h-6 rounded flex items-center justify-center bg-slate-100 text-xs font-bold text-slate-500">
                                                Q{idx + 1}
                                            </span>
                                            <span className="px-2 py-1 rounded bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider">
                                                {q.questionType}
                                            </span>
                                        </div>
                                        <button 
                                            onClick={() => removeQuestion(q.id)}
                                            className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="mb-4">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Question Text</label>
                                        <Textarea 
                                            value={q.questionText}
                                            onChange={(e) => updateDraftQuestion(q.id, "questionText", e.target.value)}
                                            className="font-medium text-slate-900 border-slate-200 bg-slate-50/50 focus:bg-white resize-none min-h-[60px]"
                                            placeholder="Type your question here..."
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Options</label>
                                        {q.options?.map((opt: any, oIdx: number) => (
                                            <div 
                                                key={oIdx} 
                                                className={`flex items-center gap-3 p-2 rounded-xl border transition-all ${
                                                    opt.isCorrect ? "bg-emerald-50 border-emerald-200 ring-1 ring-emerald-200" : "bg-white border-slate-100"
                                                }`}
                                            >
                                                <button 
                                                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                                                        opt.isCorrect 
                                                            ? "bg-emerald-500 border-emerald-500 text-white" 
                                                            : "border-slate-300 hover:border-emerald-400"
                                                    }`}
                                                    onClick={() => updateOption(q.id, oIdx, "isCorrect", !opt.isCorrect)}
                                                    title={opt.isCorrect ? "Correct Answer" : "Mark as Correct"}
                                                >
                                                    {opt.isCorrect && <CheckCircle className="w-3 h-3" />}
                                                </button>
                                                
                                                <input 
                                                    type="text"
                                                    value={opt.text}
                                                    onChange={(e) => updateOption(q.id, oIdx, "text", e.target.value)}
                                                    className="flex-1 bg-transparent border-none text-sm font-medium text-slate-700 placeholder:text-slate-300 focus:ring-0 p-0"
                                                    placeholder={`Option ${oIdx + 1}`}
                                                />
                                                
                                                {opt.isCorrect && (
                                                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mr-2">
                                                        Correct Answer
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="mt-4 flex justify-end items-center gap-3">
                                         <div className="flex items-center gap-2">
                                            <span className="text-xs text-slate-500 font-medium">Marks:</span>
                                            <Input 
                                                type="number" 
                                                className="w-16 h-8 text-center" 
                                                value={q.marks}
                                                onChange={(e) => updateDraftQuestion(q.id, "marks", parseInt(e.target.value) || 1)}
                                            />
                                         </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
            
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center p-20 text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                    <Sparkles className="w-10 h-10 text-indigo-500" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2 font-coolvetica">Start Drafting</h2>
                <p className="text-slate-500 max-w-md mx-auto mb-8">
                    Select an online assessment from the dropdown above to start creating questions with our AI Builder.
                </p>
                <Button className="h-12 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold" disabled>
                    Select an Assessment to Begin
                </Button>
            </div>
        )}
      </div>
    </div>
  );
}
