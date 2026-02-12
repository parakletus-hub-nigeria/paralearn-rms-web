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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, CheckCircle2, AlertCircle, Clock, ArrowRight } from "lucide-react";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";

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

  // Update Session State
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updateSessionData, setUpdateSessionData] = useState<any>(null);

  useEffect(() => {
    if (currentSession && isUpdateModalOpen) {
      setUpdateSessionData({
        id: currentSession.sessionDetails.id,
        session: currentSession.session,
        startsAt: currentSession.sessionDetails.startsAt.split('T')[0],
        endsAt: currentSession.sessionDetails.endsAt.split('T')[0],
        terms: currentSession.sessionDetails.terms.map(t => ({
          id: t.id,
          term: t.term,
          startsAt: t.startsAt.split('T')[0],
          endsAt: t.endsAt.split('T')[0]
        }))
      });
    }
  }, [currentSession, isUpdateModalOpen]);

  useEffect(() => {
    dispatch(fetchAllSessions());
    dispatch(fetchCurrentSession());
    dispatch(getTenantInfo());
  }, [dispatch]);

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

  return (
    <div className="w-full min-h-screen pb-12 bg-[#FDFDFF]">
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 pt-4 md:pt-8">
        <Header 
          schoolLogo={tenantInfo?.logoUrl} 
          schoolName={tenantInfo?.name || "ParaLearn School"}
        />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 mt-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-purple-100/50 text-[#641BC4] shrink-0">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 font-coolvetica truncate">
                Academic Sessions
              </h1>
            </div>
            <p className="text-sm sm:text-base text-slate-500 font-medium line-clamp-1">
              Oversee and manage your school's structural timeline
            </p>
          </div>

          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="w-full md:w-auto bg-[#641BC4] hover:bg-[#5217a1] text-white shadow-[0_10px_20px_rgba(100,27,196,0.2)] transition-all duration-300 gap-2 h-11 sm:h-12 px-6 sm:px-8 rounded-xl sm:rounded-2xl active:scale-95 font-bold">
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3px]" />
                New Academic Year
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

        {/* Current Active Banner */}
        {currentSession && (
          <div className="relative mb-12">
             {/* Decorative Elements */}
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-purple-300/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-indigo-300/20 rounded-full blur-3xl" />
            
            <Card className="overflow-hidden border-none shadow-2xl rounded-[2.5rem] bg-gradient-to-br from-[#641BC4] to-[#8538E0] relative z-10 group">
              {/* Subtle mesh/pattern overlay */}
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none" />
              
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row relative">
                  <div className="p-6 sm:p-8 md:p-12 flex-1 relative z-10">
                    <div className="flex items-center gap-3 mb-4 sm:mb-6">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                        <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-purple-200/80 leading-none mb-1">
                          Operational System
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-white tracking-wide">
                          Current Active Term
                        </span>
                      </div>
                    </div>
                    
                    <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 font-coolvetica tracking-tight leading-[1.1]">
                      {currentSession.session} <span className="text-white/40 block sm:inline-block sm:mx-1">—</span> {currentSession.term}
                    </h2>
                    
                    <div className="flex flex-col xs:flex-row flex-wrap gap-3 sm:gap-4 mt-8">
                      <div className="flex items-center gap-3 bg-black/10 backdrop-blur-md px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl border border-white/10">
                        <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-200" />
                        <span className="text-xs sm:text-sm font-bold text-white tracking-tight">Ends: {new Date(currentSession.sessionDetails.endsAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric'})}</span>
                      </div>
                      <Button 
                        onClick={() => setIsUpdateModalOpen(true)}
                        className="bg-white/20 hover:bg-white/30 text-white border border-white/20 backdrop-blur-md px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl font-bold h-auto shadow-lg"
                      >
                        Edit Schedule
                      </Button>
                      <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl border border-white/10">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-xs sm:text-sm font-bold text-white tracking-tight">Online & Processing</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/5 backdrop-blur-xl p-6 sm:p-8 md:p-12 flex flex-col justify-center items-start sm:items-center md:items-end border-t md:border-t-0 md:border-l border-white/10 min-w-0 md:min-w-[280px]">
                    <div className="inline-flex items-center gap-2 bg-emerald-400/20 backdrop-blur-md text-emerald-300 border border-emerald-400/30 px-5 sm:px-6 py-1.5 sm:py-2 rounded-full font-black text-[10px] uppercase tracking-[0.15em] mb-3 sm:mb-4">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                      System Active
                    </div>
                    <p className="text-[11px] sm:text-xs text-purple-100 font-medium text-left sm:text-center md:text-right max-w-full sm:max-w-[200px] leading-relaxed opacity-80">
                      Settings automatically applied to all new assessments and student records.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Sessions List */}
        <div className="space-y-6 sm:space-y-8 animate-load-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-coolvetica tracking-tight">Academic Year History</h2>
            <div className="text-[10px] sm:text-sm font-bold text-slate-400 px-3 sm:px-4 py-1 sm:py-1.5 bg-slate-100 rounded-full border border-slate-200/50 self-start sm:self-auto">
              {sessions.length} Recorded Sessions
            </div>
          </div>
          
          {sessions.length === 0 && !loading ? (
            <div className="text-center py-24 bg-white rounded-[2rem] border-2 border-dashed border-slate-100 shadow-sm flex flex-col items-center">
               <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center mb-6">
                <AlertCircle className="w-10 h-10 text-slate-200" />
               </div>
               <h3 className="text-xl font-bold text-slate-900">No session archives found</h3>
               <p className="text-slate-500 max-w-[280px] mt-2 font-medium">Initial system state detected. Please create your first academic session to proceed.</p>
               <Button 
                variant="outline" 
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-8 border-[#641BC4]/20 text-[#641BC4] hover:bg-[#641BC4]/5 font-bold rounded-xl"
               >
                 Create Session Now
               </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-10">
              {sessions.map((session) => (
                <div key={session.id} className="relative group">
                  <Card className="overflow-hidden border-none shadow-[0_15px_60px_rgba(0,0,0,0.03)] bg-white rounded-2xl sm:rounded-[2rem] transition-all duration-500">
                    <CardHeader className="flex flex-col xs:flex-row items-center justify-between bg-slate-50/80 backdrop-blur-sm py-5 sm:py-6 px-5 sm:px-8 border-b border-slate-100 gap-4">
                      <div className="flex items-center gap-3 sm:gap-5 w-full xs:w-auto">
                        <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-lg shadow-slate-200/40 transition-transform group-hover:scale-110 duration-500 shrink-0">
                          <Calendar className="w-5 h-5 sm:w-7 sm:h-7 text-[#641BC4]" />
                        </div>
                        <div className="min-w-0">
                          <CardTitle className="text-base sm:text-xl font-black text-slate-900 font-coolvetica tracking-tight leading-none mb-1 truncate">Academic Session {session.session}</CardTitle>
                          <CardDescription className="text-[10px] sm:text-xs font-bold text-[#641BC4]/60 uppercase tracking-widest flex items-center gap-2 truncate">
                            <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            {new Date(session.startsAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric'})} — {new Date(session.endsAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric'})}
                          </CardDescription>
                        </div>
                      </div>
                      {session.isActive && (
                        <div className="relative self-start xs:self-auto ml-13 xs:ml-0">
                          <div className="absolute inset-0 bg-purple-400 blur-lg opacity-40 animate-pulse" />
                          <Badge className="bg-[#641BC4] text-white hover:bg-[#641BC4] px-4 sm:px-6 py-1.5 sm:py-2 rounded-full font-black text-[9px] sm:text-[10px] uppercase tracking-widest border-none relative z-10 shadow-xl shadow-purple-500/20 whitespace-nowrap">
                            Current Session
                          </Badge>
                        </div>
                      )}
                    </CardHeader>
                    <CardContent className="p-5 sm:p-8">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                        {session.terms.map((term, tIdx) => {
                          const isCurrentTerm = currentSession?.termDetails?.id === term.id;
                          return (
                            <div 
                              key={term.id} 
                              className={`relative p-6 sm:p-8 rounded-2xl sm:rounded-[2rem] border-2 transition-all duration-500 flex flex-col ${
                                isCurrentTerm 
                                  ? "border-[#641BC4] bg-[#F9F5FF] shadow-2xl shadow-purple-500/10" 
                                  : "border-slate-50 bg-white hover:border-purple-200/50 hover:shadow-xl hover:shadow-slate-200/30"
                              }`}
                            >
                               {/* Background number for premium look */}
                              <div className={`absolute top-4 right-6 sm:right-8 font-black text-4xl sm:text-5xl leading-none select-none pointer-events-none transition-all duration-500 ${isCurrentTerm ? 'text-[#641BC4]/10' : 'text-slate-100'}`}>
                                {tIdx + 1}
                              </div>

                              <div className="flex justify-between items-start mb-4 sm:mb-6 relative z-10">
                                <h4 className={`text-lg sm:text-xl font-black font-coolvetica tracking-tight ${isCurrentTerm ? 'text-[#641BC4]' : 'text-slate-900'}`}>{term.term}</h4>
                              </div>

                              <div className="space-y-4 mb-6 sm:mb-8 relative z-10">
                                <div className="flex items-center gap-3">
                                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl flex items-center justify-center transition-colors ${isCurrentTerm ? 'bg-[#641BC4]/10 text-[#641BC4]' : 'bg-slate-50 text-slate-400'}`}>
                                    <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-[9px] sm:text-[10px] uppercase font-black text-slate-400 tracking-wider leading-none mb-1">Duration</span>
                                    <span className={`text-[11px] sm:text-xs font-bold leading-none ${isCurrentTerm ? 'text-[#641BC4]/80' : 'text-slate-600'}`}>
                                      {new Date(term.startsAt).toLocaleDateString()} — {new Date(term.endsAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="mt-auto relative z-10">
                                {!isCurrentTerm ? (
                                  <Button 
                                    size="lg" 
                                    variant="outline" 
                                    className="w-full h-10 sm:h-12 rounded-xl sm:rounded-2xl border-slate-200 text-slate-600 font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all hover:bg-[#641BC4] hover:text-white hover:border-[#641BC4] hover:shadow-lg hover:shadow-purple-500/20 active:scale-95"
                                    onClick={() => handleActivateTerm(session.id, term.id)}
                                  >
                                    Activate Term
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                  </Button>
                                ) : (
                                  <div className="flex flex-col items-center gap-2 py-2">
                                    <div className="flex items-center gap-2 text-[#641BC4] font-black text-xs uppercase tracking-[0.15em]">
                                       <div className="w-1.5 h-1.5 rounded-full bg-[#641BC4] animate-ping" />
                                       Active Context
                                    </div>
                                    <div className="h-1 w-12 bg-[#641BC4]/20 rounded-full overflow-hidden">
                                       <div className="h-full bg-[#641BC4] overflow-hidden" style={{ width: '60%' }} />
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
