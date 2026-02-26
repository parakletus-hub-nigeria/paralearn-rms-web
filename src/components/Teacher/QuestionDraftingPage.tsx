"use client";

import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/reduxToolKit/store";
import { fetchMyAssessments, fetchAssessmentDetail, updateTeacherAssessment, publishAssessment } from "@/reduxToolKit/teacher/teacherThunks";
import { generateQuestions, GeneratedQuestion } from "@/lib/geminiService";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Sparkles, Plus, Trash2, CheckCircle, Loader2, History, Lightbulb, 
  Eye, Settings, Menu, X, GripVertical, BookOpen, CloudUpload, Edit3, Save, Check, ChevronDown
} from "lucide-react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import Link from "next/link";

export function QuestionDraftingPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const assessmentIdFromUrl = searchParams.get("assessmentId");

  const { assessments, loading } = useSelector((s: RootState) => s.teacher);
  const user = useSelector((s: RootState) => s.user.user);
  
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>(assessmentIdFromUrl || "");
  const [isSaving, setIsSaving] = useState(false);

  // AI State
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedHistory, setGeneratedHistory] = useState<{prompt: string, questions: GeneratedQuestion[]}[]>([]);

  // Draft State
  const [draftQuestions, setDraftQuestions] = useState<any[]>([]);
  const [activeQuestionId, setActiveQuestionId] = useState<number | null>(null);

  // Mobile Layout State
  const [isStackOpen, setIsStackOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);

  // Load assessments
  useEffect(() => {
    dispatch(fetchMyAssessments());
  }, [dispatch]);

  // Sync URL
  useEffect(() => {
    if (assessmentIdFromUrl) setSelectedAssessmentId(assessmentIdFromUrl);
  }, [assessmentIdFromUrl]);

  // Load questions
  useEffect(() => {
    const loadQuestions = async () => {
      if (!selectedAssessmentId) return;

      try {
        const result = await dispatch(fetchAssessmentDetail(selectedAssessmentId)).unwrap();
        if (result?.questions && result.questions.length > 0) {
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
          if(transformedQuestions.length > 0) setActiveQuestionId(transformedQuestions[0].id);
          return;
        }
      } catch (error) {
        console.log("[QuestionDrafting] No questions in backend, checking localStorage");
      }

      const saved = localStorage.getItem(`draft_questions_${selectedAssessmentId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        setDraftQuestions(parsed);
        if(parsed.length > 0) setActiveQuestionId(parsed[0].id);
      } else {
        setDraftQuestions([]);
        setActiveQuestionId(null);
      }
    };
    loadQuestions();
  }, [selectedAssessmentId, dispatch]);

  useEffect(() => {
    if (draftQuestions.length > 0 && !activeQuestionId) setActiveQuestionId(draftQuestions[0].id);
  }, [draftQuestions, activeQuestionId]);

  useEffect(() => {
    if (selectedAssessmentId && draftQuestions.length > 0) {
      localStorage.setItem(`draft_questions_${selectedAssessmentId}`, JSON.stringify(draftQuestions));
    }
  }, [draftQuestions, selectedAssessmentId]);

  const onlineAssessments = useMemo(() => assessments.filter((a: any) => a.isOnline === true && a.status !== "ended"), [assessments]);
  const selectedAssessment = assessments.find((a: any) => a.id === selectedAssessmentId);
  const activeQ = draftQuestions.find(q => q.id === activeQuestionId) || null;

  const handleSave = async (shouldPublish = false) => {
    if (!selectedAssessmentId) return toast.error("Select an assessment first.");
    if (draftQuestions.length === 0) return toast.error("No questions to save");

    setIsSaving(true);
    try {
      const formattedQuestions = draftQuestions.map(q => ({
        prompt: q.questionText,
        type: q.questionType,
        marks: q.marks || 1,
        choices: (q.options || []).map((o: any) => ({ text: o.text, isCorrect: o.isCorrect })),
        correctAnswer: q.correctAnswer,
        explanation: q.explanation
      }));

      await dispatch(
        updateTeacherAssessment({
          id: selectedAssessmentId,
          data: { questions: formattedQuestions }
        })
      ).unwrap();

      if (shouldPublish) {
        await dispatch(publishAssessment({ assessmentId: selectedAssessmentId, publish: true })).unwrap();
        toast.success("Questions saved and assessment published!");
      } else {
        toast.success("Questions saved successfully!");
      }

      localStorage.removeItem(`draft_questions_${selectedAssessmentId}`);
      if(shouldPublish) router.push('/teacher/assessments');
    } catch (error: any) {
      toast.error(error || "Failed to save questions");
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedAssessmentId) return toast.error("Select an assessment first.");
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
    if (!apiKey) return toast.error("API Key missing.");
    if (!prompt.trim()) return toast.error("Enter a prompt.");

    setIsGenerating(true);
    try {
      const questions = await generateQuestions(apiKey, prompt);
      setGeneratedHistory(prev => [{ prompt, questions }, ...prev]);
      setPrompt("");
      toast.success(`Generated ${questions.length} questions!`);
      setIsAIOpen(true); // Ensure AI panel is open on mobile to see results
    } catch (error: any) {
      toast.error(error.message || "Failed to generate questions");
    } finally {
      setIsGenerating(false);
    }
  };

  const addQuestionToDraft = (q: GeneratedQuestion) => {
    const newId = Date.now() + Math.random();
    setDraftQuestions(prev => [...prev, { ...q, id: newId }]);
    setActiveQuestionId(newId);
    toast.success("Question added to draft");
  };

  const addAllQuestionsFromGen = (idx: number) => {
    const gen = generatedHistory[idx];
    if (!gen) return;
    
    const newQuestions = gen.questions.map(q => ({ ...q, id: Date.now() + Math.random() }));
    setDraftQuestions(prev => [...prev, ...newQuestions]);
    setActiveQuestionId(newQuestions[0].id);
    toast.success(`Added ${newQuestions.length} questions`);
  };

  const addManualQuestion = () => {
    if (!selectedAssessmentId) return toast.error("Select an assessment first.");
    const newId = Date.now();
    setDraftQuestions(prev => [
      ...prev,
      {
        id: newId,
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
    setActiveQuestionId(newId);
    if(window.innerWidth < 1024) setIsStackOpen(false);
  };

  const updateDraftQuestion = (id: number, field: string, value: any) => {
    setDraftQuestions(prev => prev.map(q => q.id === id ? { ...q, [field]: value } : q));
  };
  
  const updateOption = (qId: number, oIdx: number, field: string, value: any) => {
    setDraftQuestions(prev => prev.map(q => {
      if (q.id !== qId) return q;
      const newOptions = [...q.options];
      newOptions[oIdx] = { ...newOptions[oIdx], [field]: value };
      
      if (field === "isCorrect" && value === true && q.questionType === "MCQ") {
         newOptions.forEach((o, i) => { if (i !== oIdx) o.isCorrect = false; });
      }
      return { ...q, options: newOptions };
    }));
  };

  const addOption = (qId: number) => {
    setDraftQuestions(prev => prev.map(q => {
        if(q.id !== qId) return q;
        return {
            ...q,
            options: [...(q.options || []), { text: `New Option ${(q.options?.length || 0) + 1}`, isCorrect: false }]
        }
    }));
  };

  const removeOption = (qId: number, oIdx: number) => {
    setDraftQuestions(prev => prev.map(q => {
        if(q.id !== qId) return q;
        const newOptions = [...q.options];
        newOptions.splice(oIdx, 1);
        return { ...q, options: newOptions };
    }));
  };

  const removeQuestion = (id: number, e?: React.MouseEvent) => {
    if(e) e.stopPropagation();
    setDraftQuestions(prev => {
        const filtered = prev.filter(q => q.id !== id);
        if(activeQuestionId === id) {
            setActiveQuestionId(filtered.length > 0 ? filtered[0].id : null);
        }
        return filtered;
    });
  };

  const clearDraft = () => {
    if (confirm("Are you sure you want to clear all questions?")) {
      setDraftQuestions([]);
      setActiveQuestionId(null);
      localStorage.removeItem(`draft_questions_${selectedAssessmentId}`);
    }
  };

  // The custom layout matching the provided HTML mockup
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50 font-sans text-slate-900 w-full fixed inset-0 z-50">

        {/* Top Navigation */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6 shrink-0 z-10">
            <div className="flex items-center gap-2 md:gap-4 min-w-0">
                <button onClick={() => setIsStackOpen(true)} className="lg:hidden p-1.5 -ml-1 text-slate-500 hover:text-[#7f0df2] shrink-0">
                    <Menu className="w-5 h-5" />
                </button>
                <div className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-lg bg-[#7f0df2] text-white shrink-0">
                    <BookOpen className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <div className="flex flex-col justify-center min-w-0">
                    <h1 className="text-[13px] md:text-lg font-bold tracking-tight hidden sm:block leading-tight">ParaLearn Editor</h1>
                    <div className="flex items-center gap-1 relative">
                        {selectedAssessment ? (
                            <span className="truncate max-w-[120px] md:max-w-[200px] text-[11px] md:text-xs font-semibold text-[#7f0df2]">{selectedAssessment.title}</span>
                        ) : (
                            <select 
                                value={selectedAssessmentId}
                                onChange={(e) => setSelectedAssessmentId(e.target.value)}
                                className="bg-transparent border-none p-0 pr-4 text-[11px] md:text-xs font-semibold text-[#7f0df2] focus:ring-0 w-auto min-w-[100px] max-w-[130px] md:w-48 appearance-none cursor-pointer truncate rounded-none"
                            >
                                <option value="" disabled>Select...</option>
                                {onlineAssessments.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
                            </select>
                        )}
                        {!selectedAssessment && <ChevronDown className="w-3 h-3 text-[#7f0df2] pointer-events-none absolute right-0 top-1/2 -translate-y-1/2" />}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4 md:gap-6">
                <nav className="hidden md:flex items-center gap-6 h-16">
                    <Link href="/teacher/dashboard" className="text-sm font-medium hover:text-[#7f0df2] text-slate-500 transition-colors">Dashboard</Link>
                    <span className="text-sm font-medium text-[#7f0df2] border-b-2 border-[#7f0df2] h-full flex items-center">Editor</span>
                    <Link href="/teacher/assessments" className="text-sm font-medium hover:text-[#7f0df2] text-slate-500 transition-colors">Bank</Link>
                </nav>
                <div className="hidden md:block h-8 w-px bg-slate-200" />
                <div className="flex items-center gap-3">
                    <Button 
                        onClick={() => handleSave(true)}
                        disabled={!selectedAssessmentId || draftQuestions.length === 0 || isSaving}
                        variant="outline"
                        className="flex h-9 md:h-10 items-center gap-2 rounded-lg border-slate-200 px-3 md:px-4 text-xs md:text-sm font-semibold hover:bg-slate-50 hover:text-[#7f0df2] hover:border-[#7f0df2]/30"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin"/> : <CloudUpload className="w-4 h-4 md:w-5 md:h-5"/>}
                        <span className="hidden sm:inline">Publish</span>
                    </Button>
                    {(user as any)?.school?.logoUrl ? (
                         <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-slate-200 overflow-hidden border border-slate-200">
                             <img alt="Profile" className="h-full w-full object-cover" src={(user as any).school.logoUrl} />
                         </div>
                    ) : (
                        <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs md:text-sm border border-indigo-200">
                            {user?.firstName?.charAt(0) || "T"}
                        </div>
                    )}
                </div>
            </div>
        </header>

        <main className="flex flex-1 overflow-hidden relative">
            
            {/* Overlay for mobile menus */}
            {(isStackOpen || isAIOpen) && (
                <div 
                    className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[40] lg:hidden"
                    onClick={() => {setIsStackOpen(false); setIsAIOpen(false);}}
                />
            )}

            {/* Left Sidebar: Question Stack */}
            <aside className={`w-72 border-r border-slate-200 bg-white flex flex-col shrink-0 lg:relative absolute inset-y-0 left-0 transition-transform duration-300 z-[50] ${isStackOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}`}>
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                    <h2 className="text-[11px] md:text-xs font-bold uppercase tracking-wider text-slate-500">Question Stack</h2>
                    <span className="text-[10px] font-semibold bg-[#7f0df2]/10 text-[#7f0df2] px-2 py-1 rounded">{draftQuestions.length} Total</span>
                    <button className="lg:hidden text-slate-400 hover:text-slate-600 ml-2" onClick={() => setIsStackOpen(false)}>
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
                    {draftQuestions.length === 0 ? (
                        <div className="text-center p-6 text-slate-400 text-sm">
                            No questions yet.
                        </div>
                    ) : (
                        draftQuestions.map((q, idx) => {
                            const isActive = q.id === activeQuestionId;
                            return (
                                <div 
                                    key={q.id}
                                    onClick={() => {setActiveQuestionId(q.id); if(window.innerWidth < 1024) setIsStackOpen(false);}}
                                    className={`group relative flex items-start gap-3 rounded-xl p-3 cursor-pointer transition-all border ${
                                        isActive 
                                            ? "bg-[#7f0df2]/5 border-[#7f0df2]/20 shadow-sm" 
                                            : "border-transparent hover:bg-slate-50 hover:border-slate-100"
                                    }`}
                                >
                                    <div className={`font-bold text-sm mt-0.5 ${isActive ? "text-[#7f0df2]" : "text-slate-400"}`}>
                                        Q{idx + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm truncate ${isActive ? "font-semibold text-slate-900" : "font-medium text-slate-600"}`}>
                                            {q.questionText || "Empty Question"}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded tracking-wide ${isActive ? "bg-[#7f0df2]/10 text-[#7f0df2]" : "bg-slate-100 text-slate-500"}`}>
                                                {q.questionType}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-medium">{q.marks} Mark{q.marks !== 1 ? 's' : ''}</span>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={(e) => removeQuestion(q.id, e)}
                                        className={`absolute right-2 top-2 p-1.5 rounded-md text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            )
                        })
                    )}
                </div>

                <div className="p-4 bg-slate-50/50 border-t border-slate-100">
                    <button 
                        onClick={addManualQuestion}
                        disabled={!selectedAssessmentId}
                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#7f0df2] text-white rounded-lg font-bold text-sm shadow-md shadow-[#7f0df2]/20 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Plus className="w-4 h-4" /> New Question
                    </button>
                </div>
            </aside>

            {/* Center Editor */}
            <section className="flex-1 bg-white overflow-y-auto relative custom-scrollbar scroll-smooth" onClick={() => { setIsStackOpen(false); setIsAIOpen(false); }}>
                {!selectedAssessmentId ? (
                    <div className="max-w-3xl mx-auto py-20 px-6 flex flex-col items-center justify-center h-full opacity-70 text-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                            <BookOpen className="w-10 h-10 text-slate-300" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 mb-2">No Assessment Selected</h2>
                        <p className="text-sm text-slate-500 max-w-sm mb-6">Please select an assessment from the top navigation dropdown to start drafting questions.</p>
                    </div>
                ) : !activeQ ? (
                    <div className="max-w-3xl mx-auto py-20 px-6 flex flex-col items-center justify-center h-full opacity-70 text-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                            <BookOpen className="w-10 h-10 text-slate-300" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 mb-2">No Question Selected</h2>
                        <p className="text-sm text-slate-500 max-w-sm mb-6">Select a question from the stack on the left, or create a new one to start drafting.</p>
                        <Button 
                            onClick={addManualQuestion} 
                            className="bg-[#7f0df2] hover:bg-[#6b09cc] text-white rounded-xl h-10 px-6 font-bold shadow-sm"
                        >
                            <Plus className="w-4 h-4 mr-2" /> Blank Question
                        </Button>
                    </div>
                ) : (
                    <div className="max-w-3xl mx-auto py-10 lg:py-16 px-6 lg:px-10">
                        <div className="mb-10 lg:mb-12">
                            <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                                <div className="flex items-center gap-2 text-[#7f0df2] font-bold">
                                    <Edit3 className="w-4 h-4" />
                                    <span className="uppercase tracking-widest text-[10px] md:text-xs">
                                        Editing Question {String(draftQuestions.findIndex(q => q.id === activeQuestionId) + 1).padStart(2, '0')}
                                    </span>
                                </div>
                                <div className="lg:hidden flex gap-2">
                                     <button onClick={(e) => { e.stopPropagation(); setIsStackOpen(true); }} className="px-3 py-1.5 text-xs font-bold bg-slate-100 text-slate-600 rounded-md">Stack</button>
                                     <button onClick={(e) => { e.stopPropagation(); setIsAIOpen(true); }} className="px-3 py-1.5 text-xs font-bold bg-indigo-50 text-[#7f0df2] rounded-md flex items-center gap-1"><Sparkles className="w-3 h-3"/> AI</button>
                                </div>
                            </div>
                            
                            <div className="relative group/title">
                                <textarea
                                    value={activeQ.questionText}
                                    onChange={(e) => updateDraftQuestion(activeQ.id, "questionText", e.target.value)}
                                    placeholder="Type your question prompt here..."
                                    className="w-full text-2xl md:text-3xl font-bold leading-tight md:leading-snug outline-none border-b-2 border-transparent focus:border-[#7f0df2]/30 pb-4 transition-colors resize-none bg-transparent overflow-hidden text-slate-900 focus:ring-0 px-0 m-0"
                                    rows={Math.max(1, activeQ.questionText.split('\n').length)}
                                />
                                <div className="absolute -left-10 top-2 opacity-0 group-hover/title:opacity-100 transition-opacity text-slate-300 hidden md:flex items-center justify-center p-1 rounded hover:bg-slate-100">
                                    <GripVertical className="w-5 h-5 pointer-events-none" />
                                </div>
                            </div>
                            <p className="mt-4 text-slate-400 text-xs italic">Click any text block to start editing directly.</p>
                        </div>

                        {/* Options Area */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-5 lg:mb-6">Answer Options</h3>
                            
                            <div className="flex flex-col gap-3">
                                {activeQ.options?.map((opt: any, oIdx: number) => (
                                    <div 
                                        key={oIdx} 
                                        className={`group flex items-start sm:items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl border transition-all ${
                                            opt.isCorrect 
                                                ? "border-emerald-500/30 bg-emerald-50/30 md:bg-emerald-50/20 shadow-[0_2px_10px_-4px_rgba(16,185,129,0.2)]" 
                                                : "border-slate-100 bg-slate-50/50 hover:border-[#7f0df2]/30 hover:bg-white"
                                        }`}
                                    >
                                        <div className={`shrink-0 flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-lg shadow-sm font-bold text-xs md:text-sm transition-colors mt-0.5 sm:mt-0 ${
                                            opt.isCorrect ? "bg-emerald-500 text-white shadow-emerald-200" : "bg-white text-slate-400 group-hover:text-[#7f0df2] border border-slate-100"
                                        }`}>
                                            {String.fromCharCode(65 + oIdx)}
                                        </div>
                                        
                                        <textarea 
                                            value={opt.text}
                                            onChange={(e) => updateOption(activeQ.id, oIdx, "text", e.target.value)}
                                            className={`flex-1 text-sm md:text-base outline-none bg-transparent resize-none overflow-hidden m-0 p-0 focus:ring-0 border-none ${opt.isCorrect ? "font-medium text-emerald-950" : "text-slate-700"}`}
                                            placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                                            rows={Math.max(1, opt.text.split('\n').length)}
                                        />
                                        
                                        <div className="flex items-center gap-2 shrink-0">
                                            <button 
                                                onClick={() => removeOption(activeQ.id, oIdx)}
                                                className="sm:opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 sm:text-slate-300 hover:text-red-500 transition-all rounded-md hover:bg-red-50 flex items-center justify-center shrink-0"
                                                title="Remove option"
                                            >
                                                <X className="w-4 h-4 md:w-4 md:h-4" />
                                            </button>
                                            <button 
                                                onClick={() => updateOption(activeQ.id, oIdx, "isCorrect", !opt.isCorrect)}
                                                className={`flex h-7 w-12 md:h-8 md:w-14 items-center rounded-full p-1 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7f0df2] focus-visible:ring-offset-2 ${
                                                    opt.isCorrect ? "bg-emerald-500 shadow-lg shadow-emerald-500/20 justify-end" : "bg-slate-200 justify-start"
                                                }`}
                                            >
                                                <div className={`h-5 w-5 md:h-6 md:w-6 rounded-full bg-white shadow-sm flex items-center justify-center transition-transform ${opt.isCorrect ? "text-emerald-500" : "text-transparent"}`}>
                                                    {opt.isCorrect && <Check className="w-3.5 h-3.5" />}
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button 
                                onClick={() => addOption(activeQ.id)}
                                className="w-full mt-4 py-4 md:py-5 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center gap-2 text-slate-400 hover:text-[#7f0df2] hover:border-[#7f0df2]/40 hover:bg-[#7f0df2]/5 transition-all outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#7f0df2]"
                            >
                                <Plus className="w-5 h-5 opacity-70" />
                                <span className="font-bold text-sm">Add Option</span>
                            </button>
                        </div>
                    </div>
                )}
            </section>

            {/* Right Panel: AI & Settings */}
            <aside className={`w-80 border-l border-slate-200 bg-white flex flex-col shrink-0 overflow-y-auto custom-scrollbar z-[50] transition-transform lg:relative fixed inset-y-0 right-0 ${isAIOpen ? 'translate-x-0 shadow-2xl' : 'translate-x-full lg:translate-x-0'}`}>
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10 lg:hidden">
                    <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Settings & AI</h2>
                    <button className="text-slate-400 hover:text-slate-600" onClick={() => setIsAIOpen(false)}>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* AI Assistant Section */}
                <div className="p-4 border-b border-slate-100 relative">
                    <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-[#7f0df2]" />
                        <h3 className="font-bold text-xs md:text-sm uppercase tracking-wider text-slate-800">AI Builder</h3>
                    </div>
                    
                    <div className="space-y-3">
                        <div className="bg-slate-50 rounded-xl p-2.5 md:p-3 border border-slate-100 focus-within:ring-2 focus-within:ring-[#7f0df2]/20 focus-within:border-[#7f0df2]/40 transition-all shadow-inner relative">
                            <label className="block text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">AI Prompt</label>
                            <Textarea 
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="eg. Create 5 hard MCQs on quantum physics..."
                                className="w-full bg-transparent border-0 p-0 text-slate-700 placeholder:text-slate-400 focus:ring-0 resize-none text-xs md:text-sm leading-relaxed min-h-[60px]"
                            />
                            <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-200/80">
                                <span className="text-[9px] md:text-[10px] text-slate-400 font-semibold">{prompt.length} chars</span>
                                <Button 
                                    size="sm"
                                    onClick={handleGenerate}
                                    disabled={isGenerating || !prompt.trim()}
                                    className="h-7 md:h-8 px-3 rounded-lg bg-[#7f0df2] hover:bg-[#6b09cc] text-white text-[10px] md:text-xs font-bold shadow-md shadow-[#7f0df2]/20 transition-all active:scale-95"
                                >
                                    {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><CloudUpload className="w-3.5 h-3.5 mr-1" /> Generate</>}
                                </Button>
                            </div>
                        </div>

                        {generatedHistory.length > 0 && (
                            <div className="p-4 bg-[#7f0df2]/5 object-cover rounded-xl border border-[#7f0df2]/10 relative group/ai">
                                <h4 className="text-[10px] uppercase font-bold text-[#7f0df2] mb-1.5 tracking-wider">AI Generations</h4>
                                <p className="text-xs text-slate-600 mb-4 leading-relaxed font-medium">
                                    <span className="font-bold text-[#7f0df2]">{generatedHistory.reduce((acc, curr) => acc + curr.questions.length, 0)}</span> generated questions ready.
                                </p>
                                
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm" className="w-full bg-white border-[#7f0df2]/30 text-[#7f0df2] hover:bg-[#7f0df2]/10 h-9 font-bold text-xs shadow-sm">
                                            <Eye className="w-3.5 h-3.5 mr-1.5" /> Review & Add
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-5xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden bg-slate-50 border-0 shadow-2xl rounded-2xl">
                                        <DialogHeader className="p-6 md:p-8 bg-white border-b border-slate-100 shadow-sm shrink-0">
                                            <div className="flex items-start md:items-center justify-between flex-col md:flex-row gap-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-[#7f0df2] flex items-center justify-center text-white shadow-lg shadow-[#7f0df2]/30 shrink-0">
                                                        <Sparkles className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <DialogTitle className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">AI Generated Drafts</DialogTitle>
                                                        <DialogDescription className="text-slate-500 mt-1 text-sm md:text-base">Review the AI outputs below. Click 'Add' to move a question to your draft.</DialogDescription>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 self-end md:self-auto">
                                                    <Button 
                                                        variant="outline"
                                                        onClick={() => { if(confirm("Clear generations?")) setGeneratedHistory([]); }}
                                                        className="bg-white border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 h-10 px-4 rounded-xl shadow-sm"
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-2" /> Clear All
                                                    </Button>
                                                </div>
                                            </div>
                                        </DialogHeader>

                                        <div className="overflow-y-auto p-4 md:p-8 space-y-6 md:space-y-8 flex-1 custom-scrollbar scroll-smooth">
                                            {generatedHistory.map((gen, idx) => (
                                                <div key={idx} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-[#7f0df2]/30 transition-all overflow-hidden group/container">
                                                    <div className="bg-slate-50 md:p-5 p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-start justify-between gap-4">
                                                        <div className="flex items-start gap-3 flex-1">
                                                            <div className="p-2 bg-[#7f0df2]/10 rounded-lg shrink-0 mt-0.5">
                                                                <History className="w-5 h-5 text-[#7f0df2]" />
                                                            </div>
                                                            <div>
                                                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                                                    Prompt <span className="w-1 h-1 rounded-full bg-slate-300"></span> <span className="text-[#7f0df2]">{gen.questions.length} Results</span>
                                                                </h4>
                                                                <p className="text-sm md:text-base font-medium text-slate-700 leading-relaxed border-l-2 border-[#7f0df2]/30 pl-3 py-0.5">{gen.prompt}</p>
                                                            </div>
                                                        </div>
                                                        <Button 
                                                            onClick={() => addAllQuestionsFromGen(idx)}
                                                            className="shrink-0 bg-[#7f0df2]/5 text-[#7f0df2] hover:bg-[#7f0df2] hover:text-white border border-[#7f0df2]/20 rounded-xl transition-all shadow-sm"
                                                        >
                                                            <Plus className="w-4 h-4 mr-1.5" /> Add All {gen.questions.length}
                                                        </Button>
                                                    </div>
                                                    <div className="p-4 md:p-5 space-y-4">
                                                        {gen.questions.map((q, qIdx) => (
                                                            <div key={qIdx} className="flex flex-col md:flex-row items-start gap-4 md:gap-6 bg-white rounded-xl p-4 md:p-5 border border-slate-200 relative transition-all hover:border-[#7f0df2]/40 hover:shadow-md">
                                                                <div className="flex flex-col items-center gap-2 shrink-0 pt-1 hidden md:flex">
                                                                    <span className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-sm border border-slate-200">{qIdx + 1}</span>
                                                                </div>
                                                                <div className="flex-1 min-w-0 w-full md:pr-24">
                                                                    <div className="flex flex-wrap items-center justify-between md:justify-start gap-2 mb-3">
                                                                        <div className="flex gap-2">
                                                                            <span className="text-[10px] font-bold text-[#7f0df2] uppercase tracking-wider bg-[#7f0df2]/10 px-2.5 py-1 rounded-md border border-[#7f0df2]/20">{q.questionType}</span>
                                                                            {q.marks && <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">{q.marks} Mark{q.marks > 1 ? 's' : ''}</span>}
                                                                        </div>
                                                                        <Button 
                                                                            size="sm"
                                                                            onClick={() => addQuestionToDraft(q)}
                                                                            className="md:hidden bg-white text-[#7f0df2] border border-[#7f0df2]/20 rounded-lg h-9"
                                                                        >
                                                                            <Plus className="w-4 h-4 mr-1" /> Add
                                                                        </Button>
                                                                    </div>
                                                                    <h3 className="text-sm md:text-base text-slate-900 font-bold leading-relaxed mb-4">{q.questionText}</h3>
                                                                    {q.options && q.options.length > 0 && (
                                                                        <div className="grid grid-cols-1 gap-2 mt-4">
                                                                            {q.options.map((opt: any, optIdx: number) => (
                                                                                <div key={optIdx} className={`flex items-start gap-3 p-2.5 md:p-3 rounded-lg border transition-all ${opt.isCorrect ? "bg-emerald-50/50 border-emerald-200 shadow-sm" : "bg-slate-50 border-slate-100"}`}>
                                                                                    <div className={`shrink-0 w-4 h-4 md:w-5 md:h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${opt.isCorrect ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300 bg-white"}`}>
                                                                                        {opt.isCorrect && <CheckCircle className="w-2.5 h-2.5 md:w-3 md:h-3" />}
                                                                                    </div>
                                                                                    <span className={`text-xs md:text-sm leading-relaxed ${opt.isCorrect ? "font-semibold text-emerald-900" : "text-slate-600"}`}>{opt.text}</span>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <Button 
                                                                    onClick={() => addQuestionToDraft(q)}
                                                                    className="hidden md:flex absolute right-5 top-1/2 -translate-y-1/2 shrink-0 bg-white hover:bg-[#7f0df2] text-[#7f0df2] hover:text-white border-2 border-[#7f0df2]/20 hover:border-[#7f0df2] shadow-sm transition-all shadow-[#7f0df2]/10 rounded-xl h-12 px-6 items-center justify-center"
                                                                >
                                                                    <Plus className="w-5 h-5 mr-2" />
                                                                    <span className="font-bold text-sm">Add</span>
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        )}
                    </div>
                </div>

                {/* Settings Section */}
                <div className="p-4 relative">
                    <div className="flex items-center gap-2 mb-4">
                        <Settings className="w-4 h-4 md:w-5 md:h-5 text-slate-400" />
                        <h3 className="font-bold text-xs md:text-sm uppercase tracking-wider text-slate-800">Question Settings</h3>
                    </div>
                    
                    {!activeQ ? (
                        <div className="text-center py-4">
                            <p className="text-[10px] md:text-xs text-slate-400">Select a question to edit settings.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[9px] md:text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest">Question Type</label>
                                <Select value={activeQ?.questionType} onValueChange={(val) => updateDraftQuestion(activeQ.id, "questionType", val)}>
                                    <SelectTrigger className="h-9 text-xs font-semibold rounded-lg bg-slate-50 border-slate-200">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MCQ" className="text-xs">Multiple Choice MCQ</SelectItem>
                                        <SelectItem value="TEXT" className="text-xs">Short Answer / Text</SelectItem>
                                        <SelectItem value="ESSAY" className="text-xs">Essay</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="block text-[9px] md:text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest">Marks Allocation</label>
                                <div className="flex items-center gap-3">
                                    <input 
                                        type="number" 
                                        min="1"
                                        value={activeQ?.marks || 1}
                                        onChange={(e) => updateDraftQuestion(activeQ.id, "marks", parseInt(e.target.value) || 1)}
                                        className="w-16 h-9 rounded-lg border-slate-200 bg-slate-50 text-center font-bold text-sm focus:ring-[#7f0df2] focus:border-[#7f0df2]" 
                                    />
                                    <span className="text-[10px] md:text-xs font-medium text-slate-500">Points awarded</span>
                                </div>
                            </div>
                            
                            <div className="pt-3 mt-4 border-t border-slate-100 flex justify-end">
                                <button 
                                    onClick={() => {
                                        if(confirm("Are you sure you want to delete this specific question?")) removeQuestion(activeQ.id);
                                    }}
                                    className="text-[10px] md:text-[11px] font-bold text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                                >
                                    <Trash2 className="w-3.5 h-3.5" /> Delete Question
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </aside>

            {/* Mobile AI Trigger FAB */}
            <button
                onClick={() => setIsAIOpen(true)}
                className="lg:hidden fixed left-4 bottom-24 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-[#7f0df2] to-[#6b09cc] text-white shadow-xl shadow-[#7f0df2]/40 hover:scale-105 active:scale-95 transition-all"
                title="Open AI Builder"
            >
                <Sparkles className="w-6 h-6" />
            </button>
        </main>

        {/* Footer Bar: Minimalist Sticky */}
        <footer className="h-16 md:h-[72px] border-t border-slate-200 bg-white flex items-center justify-between px-4 md:px-6 shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] z-40 relative">
            <div className="flex items-center gap-4 md:gap-6">
                <Button variant="ghost" className="flex items-center gap-2 text-slate-500 hover:text-[#7f0df2] font-semibold text-xs md:text-sm px-2 md:px-4" onClick={() => handleSave(false)} disabled={isSaving || draftQuestions.length === 0}>
                    {isSaving ? <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" /> : <Save className="w-4 h-4 md:w-5 md:h-5" />}
                    <span className="hidden sm:inline">Save Draft</span>
                </Button>
                <div className="hidden sm:block h-4 w-px bg-slate-200" />
                <Button variant="ghost" className="hidden sm:flex items-center gap-2 text-slate-500 hover:text-[#7f0df2] font-semibold text-xs md:text-sm px-4" onClick={clearDraft} disabled={draftQuestions.length === 0}>
                    <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                    Reset All
                </Button>
            </div>
            <div className="flex items-center gap-4">
                <span className="hidden md:inline text-xs text-slate-400 font-medium italic mr-2 text-right">
                    {draftQuestions.length} Questions <br/> in Draft
                </span>
                <button 
                    onClick={addManualQuestion}
                    disabled={!selectedAssessmentId}
                    className="flex h-10 md:h-11 items-center justify-center gap-2 rounded-xl bg-[#7f0df2] px-4 md:px-6 font-bold text-white shadow-lg shadow-[#7f0df2]/30 hover:bg-[#6b09cc] active:scale-95 transition-all text-xs md:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Plus className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="hidden sm:inline">New Question</span>
                    <span className="sm:hidden">Add</span>
                </button>
            </div>
        </footer>
    </div>
  );
}
