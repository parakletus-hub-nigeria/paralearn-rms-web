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
  History,
  Lightbulb,
  GripVertical
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

  // Mobile View State
  const [activeMobileTab, setActiveMobileTab] = useState<"drafts" | "builder">("drafts");

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
    // The API key should be securely set in the .env.local file as:
    // NEXT_PUBLIC_GEMINI_API_KEY=your_key_here
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
    
    if (!apiKey) {
      return toast.error("Gemini API Key is missing. Please add NEXT_PUBLIC_GEMINI_API_KEY to your .env.local file.");
    }
    
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

  const renderAIBuilderContent = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-sm">
                <Sparkles className="w-5 h-5" />
            </div>
            <div>
                <h2 className="font-bold text-slate-900 text-lg">AI Builder</h2>
                <p className="text-xs text-slate-500">Smart question generation</p>
            </div>
        </div>
        
        <div className="space-y-4 flex-1 flex flex-col overflow-hidden">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all shadow-inner">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">AI Prompt</label>
                <Textarea 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g. Generate 5 MCQ questions about Photosynthesis..."
                    className="w-full bg-transparent border-0 p-0 text-slate-700 placeholder:text-slate-400 focus:ring-0 resize-none text-sm leading-relaxed min-h-[100px]"
                />
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-200">
                    <span className="text-xs text-slate-400 font-medium">{prompt.length}/500</span>
                    <Button 
                        size="sm"
                        onClick={handleGenerate}
                        disabled={isGenerating || !prompt.trim()}
                        className="h-8 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all active:scale-95"
                    >
                        {isGenerating ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <><Sparkles className="w-3.5 h-3.5 mr-1.5" /> Generate</>
                        )}
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recent Generations</h3>
                    {generatedHistory.length > 0 && (
                       <button 
                          onClick={() => setGeneratedHistory([])} 
                          className="text-[10px] text-indigo-600 hover:underline font-bold"
                       >
                           Clear
                       </button>
                    )}
                </div>
                
                {generatedHistory.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-100 rounded-xl opacity-60">
                        <Sparkles className="w-8 h-8 text-slate-300 mb-2" />
                        <p className="text-xs font-medium text-slate-500">No questions generated</p>
                    </div>
                ) : (
                    generatedHistory.map((gen, idx) => (
                        <div key={idx} className="bg-white rounded-xl p-3 border border-slate-100 hover:border-indigo-200 transition-all shadow-sm">
                            <div className="flex items-start gap-2 mb-2">
                                <History className="w-4 h-4 text-indigo-400 mt-0.5" />
                                <div>
                                    <p className="text-xs font-medium text-slate-700 line-clamp-2 leading-relaxed">{gen.prompt}</p>
                                    <p className="text-[10px] text-slate-400 mt-1">{gen.questions.length} Questions generated</p>
                                </div>
                            </div>
                            <div className="space-y-2 mt-3">
                                {gen.questions.slice(0, 3).map((q, qIdx) => (
                                    <div key={qIdx} className="flex items-start gap-2 bg-slate-50 rounded-lg p-2 border border-slate-100 relative group/item">
                                        <div className="flex-1 min-w-0">
                                            <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-tighter bg-indigo-50 px-1 rounded mb-1 inline-block">
                                                {q.questionType}
                                            </span>
                                            <p className="text-[10px] text-slate-600 line-clamp-1 pr-6">{q.questionText}</p>
                                        </div>
                                        <button 
                                            onClick={() => addQuestionToDraft(q)}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-white border border-slate-200 text-indigo-600 rounded opacity-0 group-hover/item:opacity-100 transition-all hover:border-indigo-600 shadow-sm"
                                            title="Add to draft"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="mt-auto pt-2">
                 <div className="bg-blue-50/80 rounded-xl p-3 border border-blue-100 flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-blue-800 leading-relaxed">
                        <strong>Pro Tip:</strong> Be specific about grade level and difficulty constraints to get the most accurate AI responses.
                    </p>
                 </div>
            </div>
        </div>
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-slate-50">
      <TeacherHeader />
      
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 pb-32 lg:pb-20">
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
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start relative">
            
            {/* Desktop Layout - AI Builder Left Sidebar */}
            <div className="hidden lg:flex lg:col-span-4 sticky top-[100px] h-[calc(100vh-120px)] flex-col gap-4 z-10 box-border">
                {renderAIBuilderContent()}
            </div>

            {/* Mobile View - AI Builder Overlay Bottom Sheet */}
            <div className={`
                lg:hidden fixed inset-x-0 bottom-20 top-[60px] bg-slate-50/60 backdrop-blur-sm z-40 transform transition-transform duration-300 flex flex-col p-4 shadow-2xl
                ${activeMobileTab === 'builder' ? 'translate-y-0' : 'translate-y-full opacity-0 pointer-events-none'}
            `}>
                {renderAIBuilderContent()}
            </div>

            {/* Right Content - Drafting Table */}
            <div className="lg:col-span-8 flex flex-col gap-6 w-full max-w-full"> 
                <div className="flex items-end justify-between">
                    <div>
                        <h1 className="text-xl lg:text-2xl font-bold text-slate-900 mb-1">Drafting Table</h1>
                        <p className="text-slate-500 text-xs lg:text-sm">Fine-tune your generated content before publishing.</p>
                    </div>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 hidden lg:flex"
                        onClick={clearDraft}
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Reset Draft
                    </Button>
                </div>

                <div className="space-y-6">
                    {draftQuestions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
                            <div className="w-20 h-20 lg:w-24 lg:h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                                <FileQuestion className="w-8 h-8 lg:w-10 lg:h-10 text-slate-300" />
                            </div>
                            <h3 className="text-base lg:text-lg font-bold text-slate-900 mb-2">Your draft is empty</h3>
                            <p className="text-slate-500 max-w-sm mb-8 text-xs lg:text-sm">
                                Generate questions with the AI Builder or add them manually to get started.
                            </p>
                        </div>
                    ) : (
                        draftQuestions.map((q, idx) => (
                            <div key={q.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 lg:p-6 group transition-all hover:shadow-md hover:border-indigo-200 relative">
                                <div className="absolute left-2 lg:left-3 top-1/2 -translate-y-1/2 cursor-grab text-slate-300 hover:text-slate-500 hidden lg:block opacity-0 group-hover:opacity-100 transition-opacity">
                                    <GripVertical className="w-5 h-5" />
                                </div>
                                <div className="lg:pl-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex flex-wrap items-center gap-2 lg:gap-3">
                                            <span className="bg-slate-100 text-slate-500 font-mono text-[10px] lg:text-xs font-bold px-2 py-0.5 lg:py-1 rounded border border-slate-200">
                                                Q{idx + 1}
                                            </span>
                                            <span className="px-2 py-0.5 rounded text-[10px] lg:text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
                                                {q.questionType}
                                            </span>
                                            <div className="flex items-center gap-1 border-l pl-2 lg:pl-3 ml-0 lg:ml-1 border-slate-200">
                                                <Input 
                                                    type="number" 
                                                    className="w-12 lg:w-14 h-6 text-[10px] lg:text-xs text-center px-1 font-medium bg-slate-50 border-transparent hover:border-slate-200 focus:bg-white" 
                                                    value={q.marks}
                                                    onChange={(e) => updateDraftQuestion(q.id, "marks", parseInt(e.target.value) || 1)}
                                                />
                                                <span className="text-[10px] lg:text-xs font-medium text-slate-500">Marks</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => removeQuestion(q.id)}
                                                className="p-1.5 lg:p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mb-4 lg:mb-5">
                                        <Textarea 
                                            value={q.questionText}
                                            onChange={(e) => updateDraftQuestion(q.id, "questionText", e.target.value)}
                                            className="font-medium text-slate-900 border-transparent hover:border-slate-200 bg-transparent focus:bg-white resize-none min-h-[40px] p-2 -ml-2 text-sm lg:text-base leading-relaxed"
                                            placeholder="Type your question here..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 lg:gap-3">
                                        {q.options?.map((opt: any, oIdx: number) => (
                                            <div 
                                                key={oIdx} 
                                                className={`flex items-center gap-3 p-2.5 lg:p-3 rounded-xl lg:rounded-lg border transition-all cursor-pointer ${
                                                    opt.isCorrect 
                                                        ? "border-emerald-500/30 bg-emerald-50/50" 
                                                        : "border-slate-200 bg-slate-50/50 hover:bg-slate-100"
                                                }`}
                                            >
                                                <button 
                                                    className={`shrink-0 w-5 h-5 lg:w-6 lg:h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                                                        opt.isCorrect 
                                                            ? "bg-emerald-500 border-emerald-500 text-white" 
                                                            : "border-slate-300 hover:border-emerald-400"
                                                    }`}
                                                    onClick={() => updateOption(q.id, oIdx, "isCorrect", !opt.isCorrect)}
                                                    title={opt.isCorrect ? "Correct Answer" : "Mark as Correct"}
                                                >
                                                    {opt.isCorrect && <CheckCircle className="w-3 h-3 lg:w-3.5 lg:h-3.5" />}
                                                </button>
                                                
                                                <input 
                                                    type="text"
                                                    value={opt.text}
                                                    onChange={(e) => updateOption(q.id, oIdx, "text", e.target.value)}
                                                    className={`flex-1 bg-transparent border-none text-xs lg:text-sm focus:ring-0 p-0 ${opt.isCorrect ? "font-medium text-slate-900" : "text-slate-700"}`}
                                                    placeholder={`Option ${oIdx + 1}`}
                                                />
                                                
                                                {opt.isCorrect && (
                                                    <span className="text-[9px] lg:text-[10px] font-bold text-emerald-600 uppercase tracking-wider mr-1">
                                                        Correct
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                    
                    <button 
                         onClick={addManualQuestion}
                         className="w-full py-5 lg:py-6 rounded-2xl border-2 border-dashed border-slate-200 hover:border-indigo-300 text-slate-400 hover:text-indigo-600 transition-all flex hidden lg:flex col items-center justify-center gap-2 bg-transparent hover:bg-indigo-50/50"
                    >
                         <Plus className="w-6 h-6 lg:w-8 lg:h-8" />
                         <span className="font-medium text-sm">Add Question Manually</span>
                    </button>
                </div>
            </div>
            
            {/* Mobile Nav & FAB Elements */}
            <button 
                aria-label="Add Question Manually" 
                onClick={addManualQuestion}
                className="fixed bottom-24 right-4 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-xl shadow-indigo-200 flex flex-col items-center justify-center z-30 transition-transform active:scale-95 lg:hidden"
            >
                <Plus className="w-6 h-6" />
            </button>

            <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 h-20 px-6 pb-2 z-50 flex justify-center gap-12 items-center text-[10px] font-bold tracking-wider uppercase lg:hidden shadow-[0_-4px_15px_-3px_rgba(0,0,0,0.05)]">
                <button 
                    onClick={() => setActiveMobileTab('drafts')}
                    className={`flex flex-col items-center justify-center gap-1 w-16 group transition-colors ${activeMobileTab === 'drafts' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <div className={`p-1.5 rounded-full transition-colors ${activeMobileTab === 'drafts' ? 'bg-indigo-50 text-indigo-600' : 'group-hover:bg-slate-50 text-slate-400'}`}>
                        <FileQuestion className="w-6 h-6" />
                    </div>
                    <span>Drafts</span>
                </button>
                <button 
                    onClick={() => setActiveMobileTab('builder')}
                    className={`flex flex-col items-center justify-center gap-1 w-16 transition-colors ${activeMobileTab === 'builder' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <div className={`p-1.5 rounded-full transition-colors ${activeMobileTab === 'builder' ? 'bg-indigo-50 text-indigo-600' : 'group-hover:bg-slate-50 text-slate-400'}`}>
                        <Sparkles className="w-6 h-6" />
                    </div>
                    <span>Builder</span>
                </button>
            </nav>

            </div>
        ) : (
            <div className="flex flex-col items-center justify-center p-12 lg:p-20 text-center bg-white rounded-3xl border border-slate-200 shadow-sm mt-8">
                <div className="w-16 h-16 lg:w-20 lg:h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                    <Sparkles className="w-8 h-8 lg:w-10 lg:h-10 text-indigo-500" />
                </div>
                <h2 className="text-xl lg:text-2xl font-bold text-slate-900 mb-2 font-coolvetica">Start Drafting</h2>
                <p className="text-slate-500 max-w-sm lg:max-w-md mx-auto mb-8 text-sm lg:text-base">
                    Select an online assessment from the dropdown above to start creating questions with our AI Builder.
                </p>
                <Button className="h-10 lg:h-12 px-6 lg:px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold" disabled>
                    Select an Assessment to Begin
                </Button>
            </div>
        )}
      </div>
    </div>
  );
}
