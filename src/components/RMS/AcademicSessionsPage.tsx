"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/reduxToolKit/store";
import {
  fetchAllSessions,
  fetchCurrentSession,
  activateTerm,
  createAcademicSession,
  updateCurrentSession,
} from "@/reduxToolKit/setUp/setUpSlice";
import { useCreateTermMutation } from "@/reduxToolKit/api/endpoints/academic";
import { getTenantInfo } from "@/reduxToolKit/user/userThunks";
import { Header } from "@/components/RMS/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, CheckCircle2, AlertCircle, Clock, ArrowRight, Lock, MoreVertical, Edit2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { differenceInWeeks, isAfter, isBefore, isWithinInterval } from "date-fns";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ProductTour } from "@/components/common/ProductTour";

const academicTourSteps = [
  {
    target: '.academic-create-session-btn',
    content: "Click here to start a brand new academic year, including all three terms and their date ranges. This must be set up before teachers can create assessments.",
    disableBeacon: true,
  },
  {
    target: '.academic-current-progress',
    content: "This visual timeline shows the current academic year's progress at a glance — which term is active, how far along you are, and when each term starts and ends.",
  },
  {
    target: '.academic-sessions-tabs',
    content: "Switch between 'Active' to manage your live sessions and 'Archive' to view historical records. Each term row has a 'Set Active' button to switch the running term.",
  },
];

export const AcademicSessionsPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { sessions, currentSession, loading } = useSelector(
    (state: RootState) => state.setUp
  );
  const { tenantInfo } = useSelector((state: RootState) => state.user);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Generate dynamic academic years (current year to 3 years ahead)
  const academicYearOptions = Array.from({ length: 4 }, (_, i) => {
    const startYear = new Date().getFullYear() + i;
    return `${startYear}/${startYear + 1}`;
  });

  const [newSession, setNewSession] = useState({
    session: academicYearOptions[0],
    startsAt: `${new Date().getFullYear()}-09-01`,
    endsAt: `${new Date().getFullYear() + 1}-07-31`,
    terms: [
      { id: "1", term: "Term 1", startsAt: `${new Date().getFullYear()}-09-01`, endsAt: `${new Date().getFullYear()}-12-15` },
      { id: "2", term: "Term 2", startsAt: `${new Date().getFullYear() + 1}-01-10`, endsAt: `${new Date().getFullYear() + 1}-04-10` },
      { id: "3", term: "Term 3", startsAt: `${new Date().getFullYear() + 1}-04-25`, endsAt: `${new Date().getFullYear() + 1}-07-20` },
    ],
  });

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updateSessionData, setUpdateSessionData] = useState<any>(null);

  // Add Term
  const [createTerm, { isLoading: creatingTerm }] = useCreateTermMutation();
  const [addTermDialog, setAddTermDialog] = useState<{ open: boolean; sessionId: string; sessionLabel: string }>({
    open: false, sessionId: "", sessionLabel: "",
  });
  const [termForm, setTermForm] = useState({ term: "", startsAt: "", endsAt: "" });

  const openAddTerm = (sessionId: string, sessionLabel: string) => {
    setTermForm({ term: "", startsAt: "", endsAt: "" });
    setAddTermDialog({ open: true, sessionId, sessionLabel });
  };

  const handleCreateTerm = async () => {
    if (!termForm.term.trim() || !termForm.startsAt || !termForm.endsAt) {
      toast.error("Fill in all term fields");
      return;
    }
    if (new Date(termForm.startsAt) >= new Date(termForm.endsAt)) {
      toast.error("Start date must be before end date");
      return;
    }
    try {
      await createTerm({
        sessionId: addTermDialog.sessionId,
        term: termForm.term.trim(),
        startsAt: `${termForm.startsAt}T00:00:00.000Z`,
        endsAt: `${termForm.endsAt}T23:59:59.000Z`,
      }).unwrap();
      toast.success(`Term "${termForm.term}" created successfully!`);
      setAddTermDialog({ open: false, sessionId: "", sessionLabel: "" });
      dispatch(fetchAllSessions());
    } catch (e: any) {
      toast.error(e?.data?.message || "Failed to create term");
    }
  };

  useEffect(() => {
    dispatch(fetchAllSessions());
    dispatch(fetchCurrentSession());
    dispatch(getTenantInfo());
  }, [dispatch]);

  // Handle opening update modal for a specific term/session
  const openUpdateModal = (session: any) => {
    setUpdateSessionData({
        id: session.id,
        session: session.session,
        startsAt: session.startsAt.split('T')[0],
        endsAt: session.endsAt.split('T')[0],
        terms: session.terms.map((t: any) => ({
          id: t.id,
          term: t.term,
          startsAt: t.startsAt.split('T')[0],
          endsAt: t.endsAt.split('T')[0]
        }))
      });
      setIsUpdateModalOpen(true);
  };

  const handleActivateTerm = async (sessionId: string, termId: string) => {
    try {
      await dispatch(activateTerm({ sessionId, termId })).unwrap();
      toast.success("Term activated successfully!");
      dispatch(fetchCurrentSession());
      dispatch(fetchAllSessions());
    } catch (error: any) {
      toast.error(error || "Failed to activate term");
    }
  };

  const handleCreateSession = async () => {
    try {
      const formatStartDate = (dateStr: string) => `${dateStr}T00:00:00.000Z`;
      const formatEndDate = (dateStr: string) => `${dateStr}T23:59:59.000Z`;

      const sessionData = {
        session: newSession.session,
        startsAt: formatStartDate(newSession.startsAt),
        endsAt: formatEndDate(newSession.endsAt),
        terms: newSession.terms.map((t) => ({
          term: t.term,
          startsAt: formatStartDate(t.startsAt),
          endsAt: formatEndDate(t.endsAt),
        })),
      };

      await dispatch(createAcademicSession(sessionData)).unwrap();
      toast.success("New academic session created!");
      setIsCreateModalOpen(false);
      dispatch(fetchAllSessions());
    } catch (error: any) {
      toast.error(error || "Failed to create session");
    }
  };

  const handleUpdateSession = async () => {
    try {
      if (!updateSessionData) return;

      const formatStartDate = (dateStr: string) => `${dateStr}T00:00:00.000Z`;
      const formatEndDate = (dateStr: string) => `${dateStr}T23:59:59.000Z`;

      const payload = {
        id: updateSessionData.id,
        session: updateSessionData.session,
        startsAt: formatStartDate(updateSessionData.startsAt),
        endsAt: formatEndDate(updateSessionData.endsAt),
        terms: updateSessionData.terms.map((t: any) => ({
          id: t.id,
          term: t.term,
          startsAt: formatStartDate(t.startsAt),
          endsAt: formatEndDate(t.endsAt),
        })),
      };

      await dispatch(updateCurrentSession(payload)).unwrap();
      toast.success("Academic session updated successfully!");
      setIsUpdateModalOpen(false);
      dispatch(fetchCurrentSession());
      dispatch(fetchAllSessions());
    } catch (error: any) {
      toast.error(error || "Failed to update session");
    }
  };

  // Helper to determine term status and progress
  const getTermStatus = (term: any, isActiveTerm: boolean) => {
    const now = new Date();
    const start = new Date(term.startsAt);
    const end = new Date(term.endsAt);

    if (isActiveTerm) return "active";
    if (isAfter(now, end)) return "completed";
    return "pending";
  };

  const calculateProgress = (startStr: string, endStr: string) => {
    const now = new Date();
    const start = new Date(startStr);
    const end = new Date(endStr);
    
    if (isBefore(now, start)) return 0;
    if (isAfter(now, end)) return 100;

    const totalDuration = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    return Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);
  };

  const getWeekInfo = (startStr: string, endStr: string) => {
     const now = new Date();
     const start = new Date(startStr);
     const end = new Date(endStr);

     const totalWeeks = Math.max(1, differenceInWeeks(end, start));
     const currentWeek = Math.max(1, differenceInWeeks(now, start));
     
     if (isBefore(now, start)) return `Starts in ${differenceInWeeks(start, now)} weeks`;
     if (isAfter(now, end)) return `Ended ${differenceInWeeks(now, end)} weeks ago`;
     
     return `Week ${currentWeek} of ${totalWeeks}`;
  };

  const activeSessions = sessions.filter(s => s.isActive || new Date(s.endsAt) >= new Date());
  const archivedSessions = sessions.filter(s => !s.isActive && new Date(s.endsAt) < new Date());

  return (
    <div className="w-full min-h-screen pb-12 bg-[#FDFDFF]">
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 pt-2">
        <ProductTour tourKey="admin_academic" steps={academicTourSteps} />
        <Header 
          schoolLogo={tenantInfo?.logoUrl} 
          schoolName={tenantInfo?.name || "ParaLearn School"}
        />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 mt-2">
          <div className="flex-1 min-w-0">
             <h1 className="text-2xl sm:text-3xl font-black tracking-tight truncate" style={{ color: "var(--foreground)" }}>
                Academic Management
              </h1>
            <p className="text-sm sm:text-base font-medium line-clamp-1" style={{ color: "var(--foreground-muted)" }}>
              Manage sessions, terms, and academic calendars
            </p>
          </div>

          <button
            className="academic-create-session-btn w-full md:w-auto transition-all duration-300 gap-2 h-11 sm:h-12 px-6 sm:px-8 rounded-xl sm:rounded-2xl active:scale-95 font-bold flex items-center justify-center"
            style={{ backgroundColor: "var(--violet-ink)", color: "#fff", boxShadow: "0 10px 20px rgba(100,27,196,0.2)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "color-mix(in srgb, var(--violet-ink) 85%, #000)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "var(--violet-ink)")}
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3px]" />
            Create New Session
          </button>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild className="hidden"><span /></DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border-none shadow-2xl p-0">
               <div className="p-8 text-white" style={{ backgroundColor: "var(--violet-ink)" }}>
                <DialogTitle className="text-2xl font-black">Create Academic Session</DialogTitle>
                <DialogDescription className="font-medium mt-1" style={{ color: "rgba(255,255,255,0.8)" }}>
                  Establish a new academic cycle for your institution
                </DialogDescription>
              </div>
              
              <div className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className="font-bold" style={{ color: "var(--foreground-muted)" }}>Academic Year</Label>
                    <Select
                      value={newSession.session}
                      onValueChange={(v) => setNewSession({...newSession, session: v})}
                    >
                      <SelectTrigger className="h-12 rounded-xl" style={{ borderColor: "var(--border-medium)", backgroundColor: "var(--surface-muted)" }}>
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl shadow-xl" style={{ borderColor: "var(--border-fine)" }}>
                        {academicYearOptions.map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold" style={{ color: "var(--foreground-muted)" }}>Start Date</Label>
                    <Input
                      type="date"
                      className="h-12 rounded-xl"
                      style={{ borderColor: "var(--border-medium)", backgroundColor: "var(--surface-muted)" }}
                      value={newSession.startsAt}
                      onChange={(e) => setNewSession({...newSession, startsAt: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold" style={{ color: "var(--foreground-muted)" }}>End Date</Label>
                    <Input
                      type="date"
                      className="h-12 rounded-xl"
                      style={{ borderColor: "var(--border-medium)", backgroundColor: "var(--surface-muted)" }}
                      value={newSession.endsAt}
                      onChange={(e) => setNewSession({...newSession, endsAt: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="flex items-center justify-between pb-3" style={{ borderBottom: "1px solid var(--border-fine)" }}>
                    <h3 className="font-bold tracking-tight" style={{ color: "var(--foreground)" }}>Terms Configuration</h3>
                    <Badge variant="outline" className="rounded-full px-4 text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--violet-ink)", borderColor: "color-mix(in srgb, var(--violet-ink) 20%, transparent)", backgroundColor: "var(--violet-tint)" }}>3 Terms Default</Badge>
                  </div>

                  <div className="space-y-4">
                    {newSession.terms.map((term, index) => (
                      <div key={term.id} className="p-5 bg-white rounded-2xl shadow-sm space-y-4 transition-all hover:shadow-md" style={{ border: "1px solid var(--border-fine)" }}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-xs" style={{ backgroundColor: "var(--violet-tint)", color: "var(--violet-ink)" }}>
                              {index + 1}
                            </div>
                            <span className="font-bold" style={{ color: "var(--foreground)" }}>{term.term}</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label className="text-[11px] font-black uppercase tracking-wider" style={{ color: "var(--foreground-muted)" }}>Start Date</Label>
                            <Input
                              type="date"
                              className="h-10 rounded-lg"
                              style={{ borderColor: "var(--border-fine)", backgroundColor: "var(--surface-muted)" }}
                              value={term.startsAt}
                              onChange={(e) => {
                                const updated = [...newSession.terms];
                                updated[index].startsAt = e.target.value;
                                setNewSession({...newSession, terms: updated});
                              }}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-[11px] font-black uppercase tracking-wider" style={{ color: "var(--foreground-muted)" }}>End Date</Label>
                            <Input
                              type="date"
                              className="h-10 rounded-lg"
                              style={{ borderColor: "var(--border-fine)", backgroundColor: "var(--surface-muted)" }}
                              value={term.endsAt}
                              onChange={(e) => {
                                const updated = [...newSession.terms];
                                updated[index].endsAt = e.target.value;
                                setNewSession({...newSession, terms: updated});
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-8 flex justify-end gap-3" style={{ backgroundColor: "var(--surface-muted)", borderTop: "1px solid var(--border-fine)" }}>
                <button onClick={() => setIsCreateModalOpen(false)} className="rounded-xl font-bold px-4 py-2" style={{ color: "var(--foreground-muted)" }} onMouseEnter={(e) => (e.currentTarget.style.background = "var(--border-fine)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>Cancel</button>
                <button
                  onClick={handleCreateSession}
                  className="rounded-xl px-8 font-bold text-white"
                  style={{ backgroundColor: "var(--violet-ink)", boxShadow: "0 4px 12px color-mix(in srgb, var(--violet-ink) 30%, transparent)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "color-mix(in srgb, var(--violet-ink) 85%, #000)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "var(--violet-ink)")}
                >
                  Confirm & Create
                </button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Update Session Modal */}
          <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border-none shadow-2xl p-0">
               <div className="p-8 text-white" style={{ backgroundColor: "var(--violet-ink)" }}>
                <DialogTitle className="text-2xl font-black">Update Academic Session</DialogTitle>
                <DialogDescription className="font-medium mt-1" style={{ color: "rgba(255,255,255,0.8)" }}>
                  Modify the current academic cycle schedule
                </DialogDescription>
              </div>
              
              {updateSessionData && (
                <div className="p-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label className="font-bold" style={{ color: "var(--foreground-muted)" }}>Academic Year</Label>
                      <Input
                        value={updateSessionData.session}
                        disabled
                        className="h-12 rounded-xl font-medium"
                        style={{ borderColor: "var(--border-medium)", backgroundColor: "var(--surface-muted)", color: "var(--foreground-muted)" }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold" style={{ color: "var(--foreground-muted)" }}>Start Date</Label>
                      <Input
                        type="date"
                        className="h-12 rounded-xl"
                        style={{ borderColor: "var(--border-medium)", backgroundColor: "var(--surface-muted)" }}
                        value={updateSessionData.startsAt}
                        onChange={(e) => setUpdateSessionData({...updateSessionData, startsAt: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold" style={{ color: "var(--foreground-muted)" }}>End Date</Label>
                      <Input
                        type="date"
                        className="h-12 rounded-xl"
                        style={{ borderColor: "var(--border-medium)", backgroundColor: "var(--surface-muted)" }}
                        value={updateSessionData.endsAt}
                        onChange={(e) => setUpdateSessionData({...updateSessionData, endsAt: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="flex items-center justify-between pb-3" style={{ borderBottom: "1px solid var(--border-fine)" }}>
                      <h3 className="font-bold tracking-tight" style={{ color: "var(--foreground)" }}>Terms Configuration</h3>
                    </div>

                    <div className="space-y-4">
                      {updateSessionData.terms.map((term: any, index: number) => (
                        <div key={index} className="p-5 bg-white rounded-2xl shadow-sm space-y-4 transition-all hover:shadow-md" style={{ border: "1px solid var(--border-fine)" }}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-xs" style={{ backgroundColor: "var(--violet-tint)", color: "var(--violet-ink)" }}>
                                {index + 1}
                              </div>
                              <span className="font-bold" style={{ color: "var(--foreground)" }}>{term.term}</span>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <Label className="text-[11px] font-black uppercase tracking-wider" style={{ color: "var(--foreground-muted)" }}>Start Date</Label>
                              <Input
                                type="date"
                                className="h-10 rounded-lg"
                                style={{ borderColor: "var(--border-fine)", backgroundColor: "var(--surface-muted)" }}
                                value={term.startsAt}
                                onChange={(e) => {
                                  const updatedTerms = [...updateSessionData.terms];
                                  updatedTerms[index].startsAt = e.target.value;
                                  setUpdateSessionData({...updateSessionData, terms: updatedTerms});
                                }}
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-[11px] font-black uppercase tracking-wider" style={{ color: "var(--foreground-muted)" }}>End Date</Label>
                              <Input
                                type="date"
                                className="h-10 rounded-lg"
                                style={{ borderColor: "var(--border-fine)", backgroundColor: "var(--surface-muted)" }}
                                value={term.endsAt}
                                onChange={(e) => {
                                  const updatedTerms = [...updateSessionData.terms];
                                  updatedTerms[index].endsAt = e.target.value;
                                  setUpdateSessionData({...updateSessionData, terms: updatedTerms});
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="p-8 flex justify-end gap-3" style={{ backgroundColor: "var(--surface-muted)", borderTop: "1px solid var(--border-fine)" }}>
                <button onClick={() => setIsUpdateModalOpen(false)} className="rounded-xl font-bold px-4 py-2" style={{ color: "var(--foreground-muted)" }} onMouseEnter={(e) => (e.currentTarget.style.background = "var(--border-fine)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>Cancel</button>
                <button
                  onClick={handleUpdateSession}
                  className="rounded-xl px-8 font-bold text-white"
                  style={{ backgroundColor: "var(--violet-ink)", boxShadow: "0 4px 12px color-mix(in srgb, var(--violet-ink) 30%, transparent)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "color-mix(in srgb, var(--violet-ink) 85%, #000)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "var(--violet-ink)")}
                >
                  Save Changes
                </button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Current Session Progress */}
        {currentSession && (
          <Card className="academic-current-progress rounded-[2.5rem] bg-white shadow-sm mb-12 overflow-hidden" style={{ borderColor: "var(--border-fine)" }}>
             <div className="p-8 pb-4">
                 <div className="flex justify-between items-center mb-6">
                     <div>
                        <h2 className="text-xl font-bold" style={{ color: "var(--foreground)" }}>Current Session Progress</h2>
                        <p className="text-sm mt-1" style={{ color: "var(--foreground-muted)" }}>Visual timeline for {currentSession.session}</p>
                     </div>
                     <Badge className="border-none px-4 py-1.5 rounded-full font-bold" style={{ backgroundColor: "var(--violet-tint)", color: "var(--violet-ink)" }}>
                        {currentSession.session} Session
                     </Badge>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                     {/* Timeline connector visual (desktop) */}
                    <div className="hidden md:block absolute top-[28px] left-[10%] right-[10%] h-[2px] -z-0" style={{ backgroundColor: "var(--border-fine)" }} />
                    
                    {currentSession.sessionDetails.terms.map((term: any) => {
                        const status = getTermStatus(term, currentSession.termDetails.id === term.id);
                        const progress = calculateProgress(term.startsAt, term.endsAt);
                        const weekInfo = getWeekInfo(term.startsAt, term.endsAt);

                        return (
                            <div key={term.id} className={`relative flex flex-col ${status === 'active' ? 'z-10' : 'z-0'}`}>
                                <div
                                  className="p-6 rounded-2xl border-2 transition-all duration-300 h-full flex flex-col"
                                  style={
                                    status === 'active'
                                      ? { borderColor: "var(--violet-ink)", backgroundColor: "#FDFDFF", boxShadow: "0 8px 24px color-mix(in srgb, var(--violet-ink) 5%, transparent)" }
                                      : status === 'completed'
                                      ? { borderColor: "color-mix(in srgb, var(--emerald-signal) 20%, transparent)", backgroundColor: "color-mix(in srgb, var(--emerald-tint) 30%, #fff)" }
                                      : { borderColor: "var(--border-fine)", backgroundColor: "#fff", opacity: 0.8 }
                                  }
                                >
                                   
                                   <div className="flex justify-between items-start mb-4">
                                       <div className="flex items-center gap-3">
                                           <div
                                             className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                                             style={
                                               status === 'completed'
                                                 ? { backgroundColor: "var(--emerald-tint)", color: "var(--emerald-signal)" }
                                                 : status === 'active'
                                                 ? { backgroundColor: "var(--violet-ink)", color: "#fff", boxShadow: "0 4px 12px color-mix(in srgb, var(--violet-ink) 30%, transparent)" }
                                                 : { backgroundColor: "var(--surface-muted)", color: "var(--foreground-muted)" }
                                             }
                                           >
                                               {status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> :
                                                status === 'pending' ? <Lock className="w-4 h-4" /> :
                                                <Clock className="w-5 h-5 animate-pulse" />}
                                           </div>
                                           <div>
                                               <h3 className="font-bold" style={{ color: status === 'active' ? "var(--foreground)" : "var(--foreground-muted)" }}>{term.term}</h3>
                                               <Badge
                                                 variant="outline"
                                                 className="mt-1 border-none px-2 py-0.5 text-[10px] uppercase font-black tracking-wider"
                                                 style={
                                                   status === 'completed'
                                                     ? { backgroundColor: "var(--emerald-tint)", color: "var(--emerald-signal)" }
                                                     : status === 'active'
                                                     ? { backgroundColor: "var(--violet-ink)", color: "#fff" }
                                                     : { backgroundColor: "var(--surface-muted)", color: "var(--foreground-muted)" }
                                                 }
                                               >
                                                   {status === 'active' ? 'Active' : status}
                                               </Badge>
                                           </div>
                                       </div>
                                   </div>

                                   {status === 'active' ? (
                                       <div className="mt-auto space-y-3">
                                           <div className="flex justify-between text-xs font-bold" style={{ color: "var(--foreground-muted)" }}>
                                               <span>{weekInfo}</span>
                                               <span style={{ color: "var(--violet-ink)" }}>{Math.round(progress)}%</span>
                                           </div>
                                           <Progress value={progress} className="h-2" style={{ backgroundColor: "var(--violet-tint)" }} />
                                            <div className="flex justify-between text-[10px] font-medium pt-2" style={{ color: "var(--foreground-muted)" }}>
                                                <span>{new Date(term.startsAt).toLocaleDateString(undefined, {month:'short', day:'numeric'})}</span>
                                                <span>{new Date(term.endsAt).toLocaleDateString(undefined, {month:'short', day:'numeric', year:'numeric'})}</span>
                                            </div>
                                       </div>
                                   ) : (
                                       <div className="mt-auto pt-6 border-t border-dashed" style={{ borderColor: "color-mix(in srgb, var(--border-medium) 50%, transparent)" }}>
                                            <div className="flex justify-between text-[11px] font-medium" style={{ color: "var(--foreground-muted)" }}>
                                                <span>{new Date(term.startsAt).toLocaleDateString(undefined, {month:'short', day:'numeric', year: 'numeric'})}</span>
                                            </div>
                                       </div>
                                   )}
                                </div>
                            </div>
                        )
                    })}
                 </div>
             </div>
          </Card>
        )}

        <Tabs defaultValue="active" className="academic-sessions-tabs w-full">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: "var(--violet-tint)", color: "var(--violet-ink)" }}>
                        <Calendar className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold" style={{ color: "var(--foreground)" }}>Session & Terms Management</h2>
                </div>
                <TabsList className="bg-white p-1 rounded-xl shadow-sm" style={{ border: "1px solid var(--border-fine)" }}>
                    <TabsTrigger value="active" className="rounded-lg data-[state=active]:bg-[--violet-ink] data-[state=active]:text-white" style={{ "--violet-ink": "var(--violet-ink)" } as React.CSSProperties}>Active</TabsTrigger>
                    <TabsTrigger value="archive" className="rounded-lg" style={{ "--tw-bg-opacity": "1" } as React.CSSProperties}>Archive</TabsTrigger>
                </TabsList>
            </div>

            <TabsContent value="active" className="space-y-6">
                {activeSessions.map((session) => (
                    <Card key={session.id} className="border-slate-100 shadow-sm rounded-2xl overflow-hidden bg-white">
                        <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#641BC4] flex items-center justify-center text-white font-bold text-sm shadow-md shadow-purple-500/20">
                                    '{session.session.slice(2,4)}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">{session.session} Academic Session</h3>
                                    <p className="text-xs text-slate-500 font-medium">Current Active Session • Started {new Date(session.startsAt).toLocaleDateString(undefined, {month:'short', day:'numeric', year:'numeric'})}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none px-3 py-1 font-bold">IN PROGRESS</Badge>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openAddTerm(session.id, session.session)}
                                  className="gap-1.5 h-8 text-xs font-bold border-purple-200 text-purple-700 hover:bg-purple-50 rounded-lg"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  Add Term
                                </Button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900">
                                            <MoreVertical className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => openUpdateModal(session)}>Edit Session</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                        <div className="divide-y divide-slate-50">
                            {session.terms.map((term: any) => {
                                 const status = getTermStatus(term, currentSession?.termDetails?.id === term.id);
                                 const duration = differenceInWeeks(new Date(term.endsAt), new Date(term.startsAt));
                                 
                                 return (
                                     <div key={term.id} className="p-6 hover:bg-slate-50/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                                         <div className="flex items-center gap-4">
                                             <div className="min-w-[120px]">
                                                 <span className="font-bold text-slate-900 block">{term.term}</span>
                                                 {status === 'completed' && <Badge variant="secondary" className="mt-1 bg-slate-100 text-slate-500 border-none text-[10px]">Completed</Badge>}
                                                 {status === 'active' && <Badge className="mt-1 bg-[#641BC4] text-white hover:bg-[#641BC4] border-none text-[10px]">ACTIVE</Badge>}
                                                 {status === 'pending' && <Badge variant="outline" className="mt-1 text-slate-400 border-slate-200 text-[10px]">Pending</Badge>}
                                             </div>
                                             <div className="h-8 w-[1px] bg-slate-100 hidden md:block" />
                                             <div className="text-sm text-slate-500 font-medium flex items-center gap-2">
                                                 <Calendar className="w-3.5 h-3.5" />
                                                 {new Date(term.startsAt).toLocaleDateString()} - {new Date(term.endsAt).toLocaleDateString()}
                                             </div>
                                             <div className="h-8 w-[1px] bg-slate-100 hidden md:block" />
                                             <div className="text-sm text-slate-500 font-medium flex items-center gap-2">
                                                 <Clock className="w-3.5 h-3.5" />
                                                 {duration} Weeks
                                             </div>
                                         </div>
                                         
                                         <div className="flex items-center gap-3">
                                             {status === 'active' ? (
                                                 <Button className="bg-[#641BC4] hover:bg-[#5217a1] text-white font-bold h-9 px-4 rounded-lg text-xs shadow-md shadow-purple-500/20">
                                                     <Edit2 className="w-3 h-3 mr-2" />
                                                     Manage
                                                 </Button>
                                             ) : (
                                                 status === 'pending' && (
                                                     <Button 
                                                        variant="outline" 
                                                        className="h-9 px-4 text-xs font-bold text-slate-500 border-slate-200 rounded-lg"
                                                        onClick={() => handleActivateTerm(session.id, term.id)}
                                                     >
                                                         Set Active
                                                     </Button>
                                                 )
                                             )}
                                             <Button 
                                                variant="outline" 
                                                className="h-9 px-4 text-xs font-medium text-slate-500 border-slate-200 rounded-lg hover:text-slate-900"
                                                onClick={() => openUpdateModal(session)}
                                             >
                                                 Edit Dates
                                             </Button>
                                         </div>
                                     </div>
                                 )
                            })}
                        </div>
                    </Card>
                ))}
                {activeSessions.length === 0 && <div className="text-center py-10 text-slate-500">No active sessions found.</div>}
            </TabsContent>

            <TabsContent value="archive" className="space-y-6">
                {archivedSessions.map((session) => (
                    <Card key={session.id} className="border-slate-100 shadow-sm rounded-2xl overflow-hidden bg-white opacity-80 hover:opacity-100 transition-opacity">
                         <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-sm">
                                    '{session.session.slice(2,4)}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">{session.session} Academic Session</h3>
                                    <p className="text-xs text-slate-500 font-medium">Concluded Session • Ended {new Date(session.endsAt).toLocaleDateString(undefined, {month:'short', day:'numeric', year:'numeric'})}</p>
                                </div>
                            </div>
                            <Badge variant="secondary" className="bg-slate-100 text-slate-500 font-bold">ARCHIVED</Badge>
                        </div>
                         {/* Minimized view for archives, maybe just summary */}
                         <div className="p-6">
                            <p className="text-sm text-slate-500">Session archived. Use the active tab to manage current academic activities.</p>
                         </div>
                    </Card>
                ))}
                {archivedSessions.length === 0 && <div className="text-center py-10 text-slate-500">No archived sessions found.</div>}
            </TabsContent>
        </Tabs>
      </div>

      {/* Add Term Dialog */}
      <Dialog open={addTermDialog.open} onOpenChange={(v) => setAddTermDialog((p) => ({ ...p, open: v }))}>
        <DialogContent className="max-w-sm rounded-3xl border-none shadow-2xl p-0">
          <div className="bg-gradient-to-r from-[#641BC4] to-[#8538E0] p-6 text-white rounded-t-3xl">
            <DialogTitle className="text-xl font-black font-coolvetica">Add Term</DialogTitle>
            <DialogDescription className="text-purple-100 font-medium mt-0.5 text-sm">
              {addTermDialog.sessionLabel} session
            </DialogDescription>
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-700 font-bold">Term Name</Label>
              <Input
                placeholder="e.g. Second Term"
                value={termForm.term}
                onChange={(e) => setTermForm((p) => ({ ...p, term: e.target.value }))}
                className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:ring-purple-200"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700 font-bold">Start Date</Label>
              <Input
                type="date"
                value={termForm.startsAt}
                onChange={(e) => setTermForm((p) => ({ ...p, startsAt: e.target.value }))}
                className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:ring-purple-200"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700 font-bold">End Date</Label>
              <Input
                type="date"
                value={termForm.endsAt}
                onChange={(e) => setTermForm((p) => ({ ...p, endsAt: e.target.value }))}
                className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:ring-purple-200"
              />
            </div>
          </div>
          <div className="p-6 pt-0 flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => setAddTermDialog((p) => ({ ...p, open: false }))}
              className="rounded-xl font-bold text-slate-500 hover:bg-slate-100"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateTerm}
              disabled={creatingTerm}
              className="bg-[#641BC4] hover:bg-[#5217a1] rounded-xl px-6 font-bold shadow-lg shadow-purple-200 gap-2"
            >
              {creatingTerm ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Create Term
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
