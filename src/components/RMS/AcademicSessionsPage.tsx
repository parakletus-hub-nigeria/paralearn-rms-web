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
import { getTenantInfo } from "@/reduxToolKit/user/userThunks";
import { Header } from "@/components/RMS/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, CheckCircle2, AlertCircle, Clock, ArrowRight, Lock, MoreVertical, Edit2 } from "lucide-react";
import { toast } from "react-toastify";
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

export const AcademicSessionsPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { sessions, currentSession, loading } = useSelector(
    (state: RootState) => state.setUp
  );
  const { tenantInfo } = useSelector((state: RootState) => state.user);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newSession, setNewSession] = useState({
    session: "2025/2026",
    startsAt: "2025-09-01",
    endsAt: "2026-07-31",
    terms: [
      { id: "1", term: "Term 1", startsAt: "2025-09-01", endsAt: "2025-12-15" },
      { id: "2", term: "Term 2", startsAt: "2026-01-10", endsAt: "2026-04-10" },
      { id: "3", term: "Term 3", startsAt: "2026-04-25", endsAt: "2026-07-20" },
    ],
  });

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updateSessionData, setUpdateSessionData] = useState<any>(null);

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
        <Header 
          schoolLogo={tenantInfo?.logoUrl} 
          schoolName={tenantInfo?.name || "ParaLearn School"}
        />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 mt-2">
          <div className="flex-1 min-w-0">
             <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 font-coolvetica truncate">
                Academic Management
              </h1>
            <p className="text-sm sm:text-base text-slate-500 font-medium line-clamp-1 font-coolvetica">
              Manage sessions, terms, and academic calendars
            </p>
          </div>

          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="w-full md:w-auto bg-[#641BC4] hover:bg-[#5217a1] text-white shadow-[0_10px_20px_rgba(100,27,196,0.2)] transition-all duration-300 gap-2 h-11 sm:h-12 px-6 sm:px-8 rounded-xl sm:rounded-2xl active:scale-95 font-bold">
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3px]" />
                Create New Session
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border-none shadow-2xl p-0 overflow-hidden">
               <div className="bg-gradient-to-r from-[#641BC4] to-[#8538E0] p-8 text-white">
                <DialogTitle className="text-2xl font-black font-coolvetica">Create Academic Session</DialogTitle>
                <DialogDescription className="text-purple-100 font-medium mt-1">
                  Establish a new academic cycle for your institution
                </DialogDescription>
              </div>
              
              <div className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-bold">Academic Year</Label>
                    <Select 
                      value={newSession.session} 
                      onValueChange={(v) => setNewSession({...newSession, session: v})}
                    >
                      <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:ring-purple-200">
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                        <SelectItem value="2024/2025">2024/2025</SelectItem>
                        <SelectItem value="2025/2026">2025/2026</SelectItem>
                        <SelectItem value="2026/2027">2026/2027</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-bold">Start Date</Label>
                    <Input 
                      type="date" 
                      className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:ring-purple-200"
                      value={newSession.startsAt} 
                      onChange={(e) => setNewSession({...newSession, startsAt: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-bold">End Date</Label>
                    <Input 
                      type="date" 
                      className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:ring-purple-200"
                      value={newSession.endsAt} 
                      onChange={(e) => setNewSession({...newSession, endsAt: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-slate-800 tracking-tight">Terms Configuration</h3>
                    <Badge variant="outline" className="rounded-full px-4 text-[10px] font-black uppercase tracking-widest text-[#641BC4] border-[#641BC4]/20 bg-purple-50">3 Terms Default</Badge>
                  </div>
                  
                  <div className="space-y-4">
                    {newSession.terms.map((term, index) => (
                      <div key={term.id} className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-4 transition-all hover:border-purple-200 hover:shadow-md">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-[#641BC4] font-black text-xs">
                              {index + 1}
                            </div>
                            <span className="font-bold text-slate-800">{term.term}</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Start Date</Label>
                            <Input 
                              type="date" 
                              className="h-10 rounded-lg border-slate-100 bg-slate-50/30 focus:bg-white"
                              value={term.startsAt}
                              onChange={(e) => {
                                const updated = [...newSession.terms];
                                updated[index].startsAt = e.target.value;
                                setNewSession({...newSession, terms: updated});
                              }}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">End Date</Label>
                            <Input 
                              type="date" 
                              className="h-10 rounded-lg border-slate-100 bg-slate-50/30 focus:bg-white"
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
              
              <div className="p-8 bg-slate-50 flex justify-end gap-3 border-t border-slate-100">
                <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)} className="rounded-xl font-bold text-slate-500 hover:bg-slate-200/50">Cancel</Button>
                <Button 
                  onClick={handleCreateSession}
                  className="bg-[#641BC4] hover:bg-[#5217a1] rounded-xl px-8 font-bold shadow-lg shadow-purple-200"
                >
                  Confirm & Create
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Update Session Modal */}
          <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border-none shadow-2xl p-0 overflow-hidden">
               <div className="bg-gradient-to-r from-[#641BC4] to-[#8538E0] p-8 text-white">
                <DialogTitle className="text-2xl font-black font-coolvetica">Update Academic Session</DialogTitle>
                <DialogDescription className="text-purple-100 font-medium mt-1">
                  Modify the current academic cycle schedule
                </DialogDescription>
              </div>
              
              {updateSessionData && (
                <div className="p-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label className="text-slate-700 font-bold">Academic Year</Label>
                      <Input 
                        value={updateSessionData.session} 
                        disabled
                        className="h-12 rounded-xl border-slate-200 bg-slate-100 text-slate-500 font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-700 font-bold">Start Date</Label>
                      <Input 
                        type="date" 
                        className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:ring-purple-200"
                        value={updateSessionData.startsAt} 
                        onChange={(e) => setUpdateSessionData({...updateSessionData, startsAt: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-700 font-bold">End Date</Label>
                      <Input 
                        type="date" 
                        className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:ring-purple-200"
                        value={updateSessionData.endsAt} 
                        onChange={(e) => setUpdateSessionData({...updateSessionData, endsAt: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h3 className="font-bold text-slate-800 tracking-tight">Terms Configuration</h3>
                    </div>
                    
                    <div className="space-y-4">
                      {updateSessionData.terms.map((term: any, index: number) => (
                        <div key={index} className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-4 transition-all hover:border-purple-200 hover:shadow-md">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-[#641BC4] font-black text-xs">
                                {index + 1}
                              </div>
                              <span className="font-bold text-slate-800">{term.term}</span>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <Label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Start Date</Label>
                              <Input 
                                type="date" 
                                className="h-10 rounded-lg border-slate-100 bg-slate-50/30 focus:bg-white"
                                value={term.startsAt}
                                onChange={(e) => {
                                  const updatedTerms = [...updateSessionData.terms];
                                  updatedTerms[index].startsAt = e.target.value;
                                  setUpdateSessionData({...updateSessionData, terms: updatedTerms});
                                }}
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">End Date</Label>
                              <Input 
                                type="date" 
                                className="h-10 rounded-lg border-slate-100 bg-slate-50/30 focus:bg-white"
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
              
              <div className="p-8 bg-slate-50 flex justify-end gap-3 border-t border-slate-100">
                <Button variant="ghost" onClick={() => setIsUpdateModalOpen(false)} className="rounded-xl font-bold text-slate-500 hover:bg-slate-200/50">Cancel</Button>
                <Button 
                  onClick={handleUpdateSession}
                  className="bg-[#641BC4] hover:bg-[#5217a1] rounded-xl px-8 font-bold shadow-lg shadow-purple-200"
                >
                  Save Changes
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Current Session Progress */}
        {currentSession && (
          <Card className="rounded-[2.5rem] border-slate-100 bg-white shadow-sm mb-12 overflow-hidden">
             <div className="p-8 pb-4">
                 <div className="flex justify-between items-center mb-6">
                     <div>
                        <h2 className="text-xl font-bold text-slate-900">Current Session Progress</h2>
                        <p className="text-slate-500 text-sm mt-1">Visual timeline for {currentSession.session}</p>
                     </div>
                     <Badge className="bg-[#EDE9FE] text-[#641BC4] hover:bg-[#EDE9FE] border-none px-4 py-1.5 rounded-full font-bold">
                        {currentSession.session} Session
                     </Badge>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                     {/* Timeline connector visual (desktop) */}
                    <div className="hidden md:block absolute top-[28px] left-[10%] right-[10%] h-[2px] bg-slate-100 -z-0" />
                    
                    {currentSession.sessionDetails.terms.map((term: any) => {
                        const status = getTermStatus(term, currentSession.termDetails.id === term.id);
                        const progress = calculateProgress(term.startsAt, term.endsAt);
                        const weekInfo = getWeekInfo(term.startsAt, term.endsAt);

                        return (
                            <div key={term.id} className={`relative flex flex-col ${status === 'active' ? 'z-10' : 'z-0'}`}>
                                <div className={`p-6 rounded-2xl border-2 transition-all duration-300 h-full flex flex-col ${
                                    status === 'active' 
                                    ? 'border-[#641BC4] bg-[#FDFDFF] shadow-lg shadow-purple-500/5 ring-4 ring-purple-50' 
                                    : status === 'completed'
                                    ? 'border-emerald-100 bg-emerald-50/30'
                                    : 'border-slate-100 bg-white opacity-80'
                                }`}>
                                   
                                   <div className="flex justify-between items-start mb-4">
                                       <div className="flex items-center gap-3">
                                           <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                                               status === 'completed' ? 'bg-emerald-100 text-emerald-600' :
                                               status === 'active' ? 'bg-[#641BC4] text-white shadow-lg shadow-purple-500/30' :
                                               'bg-slate-100 text-slate-400'
                                           }`}>
                                               {status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> :
                                                status === 'pending' ? <Lock className="w-4 h-4" /> :
                                                <Clock className="w-5 h-5 animate-pulse" />}
                                           </div>
                                           <div>
                                               <h3 className={`font-bold ${status === 'active' ? 'text-slate-900' : 'text-slate-500'}`}>{term.term}</h3>
                                               <Badge variant="outline" className={`mt-1 border-none px-2 py-0.5 text-[10px] uppercase font-black tracking-wider ${
                                                   status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                                   status === 'active' ? 'bg-[#641BC4] text-white' :
                                                   'bg-slate-100 text-slate-400'
                                               }`}>
                                                   {status === 'active' ? 'Active' : status}
                                               </Badge>
                                           </div>
                                       </div>
                                   </div>

                                   {status === 'active' ? (
                                       <div className="mt-auto space-y-3">
                                           <div className="flex justify-between text-xs font-bold text-slate-500">
                                               <span>{weekInfo}</span>
                                               <span className="text-[#641BC4]">{Math.round(progress)}%</span>
                                           </div>
                                           <Progress value={progress} className="h-2 bg-purple-100" />
                                            <div className="flex justify-between text-[10px] font-medium text-slate-400 pt-2">
                                                <span>{new Date(term.startsAt).toLocaleDateString(undefined, {month:'short', day:'numeric'})}</span>
                                                <span>{new Date(term.endsAt).toLocaleDateString(undefined, {month:'short', day:'numeric', year:'numeric'})}</span>
                                            </div>
                                       </div>
                                   ) : (
                                       <div className="mt-auto pt-6 border-t border-dashed border-slate-200/50">
                                            <div className="flex justify-between text-[11px] font-medium text-slate-400">
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

        <Tabs defaultValue="active" className="w-full">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 rounded-lg text-[#641BC4]">
                        <Calendar className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">Session & Terms Management</h2>
                </div>
                <TabsList className="bg-white p-1 rounded-xl border border-slate-100 shadow-sm">
                    <TabsTrigger value="active" className="rounded-lg data-[state=active]:bg-[#641BC4] data-[state=active]:text-white">Active</TabsTrigger>
                    <TabsTrigger value="archive" className="rounded-lg data-[state=active]:bg-slate-900 data-[state=active]:text-white">Archive</TabsTrigger>
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
    </div>
  );
};
