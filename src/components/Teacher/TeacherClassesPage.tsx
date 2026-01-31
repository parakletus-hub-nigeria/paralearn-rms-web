"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/reduxToolKit/store";
import {
  fetchTeacherClasses,
  fetchClassStudents,
  fetchAcademicCurrent,
} from "@/reduxToolKit/teacher/teacherThunks";
import { TeacherHeader } from "./TeacherHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { routespath } from "@/lib/routepath";
import {
  Search,
  Grid3X3,
  List,
  Users,
  BookOpen,
  GraduationCap,
  BarChart3,
  ChevronRight,
  X,
  Mail,
  Phone,
  ClipboardList,
  CalendarDays,
  LayoutDashboard,
} from "lucide-react";
import { toast } from "react-toastify";

const DEFAULT_PRIMARY = "#641BC4";

type TabType = "classes" | "subjects";

// Helper to get color theme based on index
const getThemeColor = (index: number) => {
  const themes = [
    { 
      primary: "#8B5CF6", // Purple
      bg: "bg-[#F3E8FF]", 
      border: "border-purple-100",
      text: "text-purple-900",
      badge: "bg-purple-100 text-purple-700"
    }, 
    { 
      primary: "#10B981", // Emerald
      bg: "bg-[#ECFDF5]", 
      border: "border-emerald-100",
      text: "text-emerald-900",
      badge: "bg-emerald-100 text-emerald-700"
    }, 
    { 
      primary: "#F43F5E", // Rose
      bg: "bg-[#FFF1F2]", 
      border: "border-rose-100",
      text: "text-rose-900",
      badge: "bg-rose-100 text-rose-700"
    }, 
    { 
      primary: "#3B82F6", // Blue
      bg: "bg-[#EFF6FF]", 
      border: "border-blue-100",
      text: "text-blue-900",
      badge: "bg-blue-100 text-blue-700"
    }, 
  ];
  return themes[index % themes.length];
};

export function TeacherClassesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { teacherClasses, academicCurrent, loading } = useSelector((s: RootState) => s.teacher);
  const { user } = useSelector((s: RootState) => s.user);
  const schoolSettings = useSelector((s: RootState) => s.admin.schoolSettings);
  const primaryColor = schoolSettings?.primaryColor || DEFAULT_PRIMARY;

  const [activeTab, setActiveTab] = useState<TabType>("classes");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [classStudents, setClassStudents] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");

  useEffect(() => {
    dispatch(fetchAcademicCurrent());
    const teacherId = (user as any)?.id || (user as any)?.teacherId;
    if (teacherId) {
      dispatch(fetchTeacherClasses({ teacherId }));
    }
  }, [dispatch, user]);

  // Separate assignments & Calculate Stats
  const { classAssignments, subjectAssignments, allUniqueClasses, stats } = useMemo(() => {
    const classes: any[] = [];
    const subjects: any[] = [];
    const classMap = new Map<string, any>();

    (teacherClasses || []).forEach((item: any) => {
      const classId = item.class?.id || item.classId;
      const className = item.class?.name || item.className || "Unknown Class";
      const studentCount = item.class?.studentCount || item.class?.enrollmentCount || 
                          item.studentCount || item.enrollmentCount || 0;
      const classSubjects = item.class?.subjects || [];

      if (classId && !classMap.has(classId)) {
        classMap.set(classId, {
          id: classId,
          name: className,
          studentCount,
        });
      }

      if (item.type === "class_assignment") {
        classes.push({ ...item, classId, className, studentCount, subjects: classSubjects });
      } else if (item.type === "subject_assignment") {
        subjects.push({
          ...item,
          classId,
          className,
          studentCount,
          subjectId: item.subject?.id || item.subjectId,
          subjectName: item.subject?.name || item.subjectName,
        });
      }
    });

    return {
      classAssignments: classes,
      subjectAssignments: subjects,
      allUniqueClasses: Array.from(classMap.values()),
      stats: {
        totalClasses: classMap.size,
        totalSubjects: subjects.length,
      }
    };
  }, [teacherClasses]);

  // Filters
  const filteredClassAssignments = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return classAssignments;
    return classAssignments.filter((c: any) => c.className.toLowerCase().includes(term));
  }, [classAssignments, search]);

  const filteredSubjectAssignments = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return subjectAssignments;
    return subjectAssignments.filter((s: any) =>
      s.subjectName.toLowerCase().includes(term) || s.className.toLowerCase().includes(term)
    );
  }, [subjectAssignments, search]);

  const subjectsByClass = useMemo(() => {
    const grouped = new Map<string, any[]>();
    subjectAssignments.forEach((subj: any) => {
      const classId = subj.classId;
      if (!grouped.has(classId)) grouped.set(classId, []);
      grouped.get(classId)!.push(subj);
    });
    return grouped;
  }, [subjectAssignments]);

  const filteredStudents = useMemo(() => {
    if (!studentSearch.trim()) return classStudents;
    const q = studentSearch.toLowerCase();
    return classStudents.filter((s) => `${s.firstName} ${s.lastName}`.toLowerCase().includes(q));
  }, [classStudents, studentSearch]);

  const openStudentsModal = async (classId: string) => {
    setSelectedClassId(classId);
    setShowModal(true);
    setLoadingStudents(true);
    setStudentSearch("");
    try {
      const students = await dispatch(fetchClassStudents(classId)).unwrap();
      setClassStudents(students || []);
    } catch (e) {
      toast.error("Failed to load students");
      setClassStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  const selectedClassData = allUniqueClasses.find((c) => c.id === selectedClassId);
  const getInitials = (f?: string, l?: string) => `${(f||"")[0]||""}${(l||"")[0]||""}`.toUpperCase() || "?";

  return (
    <div className="w-full min-h-screen pb-20 bg-slate-50/30">
      <TeacherHeader /> {/* Standard Top Bar */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        
        {/* Welcome & Stats Header Section */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Good day, {(user as any)?.firstName || "Teacher"}!</h1>
              <p className="text-slate-500 mt-1">Manage your class mastery and student progress.</p>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="h-10 border-slate-200 bg-white text-slate-700 font-bold shadow-sm"
                onClick={() => toast.info("Attendance module coming soon for Teachers!")}
              >
                <CalendarDays className="w-4 h-4 mr-2 text-slate-400" />
                Start Attendance
              </Button>
              <Link href={routespath.TEACHER_SCORES}>
                <Button className="h-10 font-bold shadow-md bg-[#641BC4] hover:bg-[#5215a3] text-white">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Record Scores
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center">
                 <GraduationCap className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wide">Total Classes</p>
                <p className="text-4xl font-black text-slate-900">{stats.totalClasses}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
                 <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wide">Total Subjects</p>
                <p className="text-4xl font-black text-slate-900">{stats.totalSubjects}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation & Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4">
           {/* Pill Tabs */}
           <div className="flex bg-slate-100 rounded-full p-1.5 self-start shadow-inner">
              <button
                onClick={() => setActiveTab("classes")}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm transition-all ${
                  activeTab === "classes" 
                    ? "bg-white text-purple-700 shadow-sm" 
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <GraduationCap className={`w-4 h-4 ${activeTab === "classes" ? "text-purple-600" : ""}`} />
                My Classes
              </button>
              <button
                onClick={() => setActiveTab("subjects")}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm transition-all ${
                  activeTab === "subjects" 
                    ? "bg-white text-purple-700 shadow-sm" 
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <BookOpen className={`w-4 h-4 ${activeTab === "subjects" ? "text-purple-600" : ""}`} />
                My Subjects <span className="opacity-60 text-xs ml-1">({stats.totalSubjects})</span>
              </button>
           </div>

           <div className="flex gap-3 flex-1 md:justify-end">
              <div className="relative flex-1 md:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search for a class or subject..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 h-11 rounded-xl border-slate-200 bg-white focus:bg-white transition-all shadow-sm"
                />
              </div>
              <div className="flex bg-white rounded-xl border border-slate-200 p-1 shadow-sm">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-slate-100 text-slate-900" : "text-slate-400 hover:text-slate-600"}`}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-slate-100 text-slate-900" : "text-slate-400 hover:text-slate-600"}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
           </div>
        </div>

        {/* Content */}
        {loading ? (
           <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-purple-600"/></div>
        ) : activeTab === "classes" ? (
           filteredClassAssignments.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                <p className="text-slate-400 font-medium">No classes found.</p>
              </div>
           ) : viewMode === "grid" ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {filteredClassAssignments.map((cls: any, idx: number) => {
                 const theme = getThemeColor(idx);
                 const subjects = cls.subjects || [];
                 return (
                   <div key={cls.id} className={`rounded-3xl p-6 ${theme.bg} border ${theme.border} flex flex-col h-full hover:shadow-lg transition-all duration-300 relative group`}>
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h3 className={`text-2xl font-black ${theme.text} tracking-tight`}>{cls.className}</h3>
                          <div className={`inline-flex items-center px-2 py-0.5 mt-1 rounded-md text-[10px] uppercase font-bold tracking-wider ${theme.badge}`}>
                             Class Teacher
                          </div>
                        </div>
                        {/* Student Count Badge (replaces Circular Progress) */}
                        <div className="flex flex-col items-center justify-center w-14 h-14 bg-white rounded-full shadow-sm ring-4 ring-white/50">
                           <span className={`text-lg font-black ${theme.text}`}>{cls.studentCount}</span>
                           <span className="text-[9px] text-slate-400 font-bold uppercase -mt-1">Students</span>
                        </div>
                      </div>

                      <div className="flex-1 mb-6">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Assigned Subjects</p>
                        <div className="space-y-2.5">
                          {subjects.slice(0, 3).map((s: any, i:number) => (
                            <div key={i} className="flex items-center gap-2.5">
                               <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.primary }} />
                               <span className="text-sm text-slate-700 font-bold">{s.name}</span>
                            </div>
                          ))}
                          {subjects.length > 3 && (
                             <span className="text-xs font-bold text-slate-400 ml-4">+{subjects.length - 3} more subjects</span>
                          )}
                          {subjects.length === 0 && <span className="text-sm italic text-slate-400">No subjects assigned</span>}
                        </div>
                      </div>

                      <div className="border-t border-slate-200/50 pt-4 flex items-center justify-between gap-2 mt-auto">
                         <div className="flex items-center gap-2">
                            <span 
                               onClick={() => openStudentsModal(cls.classId)}
                               className="cursor-pointer text-xs font-bold text-slate-500 hover:text-purple-600 transition-colors"
                            >
                               View Class Details
                            </span>
                            <ChevronRight className="w-3 h-3 text-slate-400" />
                         </div>
                         
                         {/* Action Icons Panel */}
                         <div className="flex bg-white rounded-lg shadow-sm p-1 ml-auto">
                            <button onClick={() => openStudentsModal(cls.classId)} className="p-2 rounded-md hover:bg-slate-50 text-slate-400 hover:text-purple-600 tooltip" title="Students">
                              <Users className="w-4 h-4" />
                            </button>
                            <Link href={`${routespath.TEACHER_ASSESSMENTS}?classId=${cls.classId}`}>
                              <button className="p-2 rounded-md hover:bg-slate-50 text-slate-400 hover:text-purple-600" title="Assessments">
                                <ClipboardList className="w-4 h-4" />
                              </button>
                            </Link>
                            <Link href={`${routespath.TEACHER_SCORES}?classId=${cls.classId}`}>
                              <button className="p-2 rounded-md hover:bg-slate-50 text-slate-400 hover:text-emerald-600" title="Scores">
                                <BarChart3 className="w-4 h-4" />
                              </button>
                            </Link>
                         </div>
                      </div>
                   </div>
                 );
               })}
             </div>
           ) : (
             <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                {/* List View Implementation (Table) */}
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50 border-b border-slate-100">
                    <tr><th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Class</th><th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Students</th><th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase text-right">Actions</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredClassAssignments.map((cls:any) => (
                      <tr key={cls.id} className="hover:bg-slate-50/50">
                         <td className="px-6 py-4 font-bold text-slate-700">{cls.className}</td>
                         <td className="px-6 py-4 font-bold text-slate-500">{cls.studentCount}</td>
                         <td className="px-6 py-4 text-right flex justify-end gap-2">
                            <Button size="sm" variant="ghost" onClick={() => openStudentsModal(cls.classId)}><Users className="w-4 h-4"/></Button>
                            <Link href={`${routespath.TEACHER_SCORES}?classId=${cls.classId}`}><Button size="sm" variant="ghost"><BarChart3 className="w-4 h-4"/></Button></Link>
                         </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
           )
        ) : (
           // SUBJECTS TAB
           filteredSubjectAssignments.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                <p className="text-slate-400 font-medium">No subjects found.</p>
              </div>
           ) : viewMode === "grid" ? (
             <div className="space-y-10">
               {Array.from(subjectsByClass.entries()).map(([classId, subjects]: [string, any[]], idx: number) => {
                 const first = subjects[0];
                 const theme = getThemeColor(idx);
                 return (
                   <div key={classId}>
                      <div className="flex items-center gap-3 mb-4 ml-1">
                        <div className={`w-1.5 h-6 rounded-full`} style={{backgroundColor: theme.primary}}/>
                        <h3 className="text-xl font-bold text-slate-800">{first.className}</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {subjects.map((subj:any) => (
                          <div key={subj.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden">
                             <div className={`absolute top-0 left-0 w-1 h-full`} style={{backgroundColor: theme.primary}}/>
                             <div className="flex justify-between items-start mb-4 pl-3">
                                <div>
                                  <h4 className="text-lg font-bold text-slate-900">{subj.subjectName}</h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Users className="w-3 h-3 text-slate-400"/>
                                    <span className="text-xs font-bold text-slate-500">{subj.studentCount} Students</span>
                                  </div>
                                </div>
                                <div className={`p-2 rounded-xl ${theme.bg}`}>
                                  <BookOpen className="w-4 h-4" style={{ color: theme.primary }}/>
                                </div>
                             </div>
                             <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-slate-50">
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openStudentsModal(subj.classId)}><Users className="w-4 h-4 text-slate-400 hover:text-purple-600"/></Button>
                                <Link href={`${routespath.TEACHER_ASSESSMENTS}?classId=${subj.classId}&subjectId=${subj.subjectId}`}><Button variant="ghost" size="sm" className="h-8 w-8 p-0"><ClipboardList className="w-4 h-4 text-slate-400 hover:text-purple-600"/></Button></Link>
                                <Link href={`${routespath.TEACHER_SCORES}?classId=${subj.classId}&subjectId=${subj.subjectId}`}><Button variant="ghost" size="sm" className="h-8 w-8 p-0"><BarChart3 className="w-4 h-4 text-slate-400 hover:text-emerald-600"/></Button></Link>
                             </div>
                          </div>
                        ))}
                      </div>
                   </div>
                 )
               })}
             </div>
           ) : (
             <div>{/* List View similar to above */}</div>
           )
        )}
      </div>

      {/* Reused Student Modal (simplified for brevity) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)}>
           <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden m-4 max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                 <h3 className="font-bold text-lg text-slate-900">{selectedClassData?.name} Students</h3>
                 <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-slate-400"/></button>
              </div>
              <div className="p-4 bg-slate-50"><Input placeholder="Search students..." value={studentSearch} onChange={e=>setStudentSearch(e.target.value)} className="bg-white"/></div>
              <div className="overflow-y-auto flex-1 p-0">
                 {loadingStudents ? <div className="p-10 text-center">Loading...</div> : 
                   filteredStudents.map((s:any, i:number) => (
                     <div key={i} className="px-6 py-3 border-b border-slate-50 flex items-center gap-3 hover:bg-slate-50">
                        <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold">{getInitials(s.firstName, s.lastName)}</div>
                        <div className="flex-1"><p className="font-bold text-sm text-slate-800">{s.firstName} {s.lastName}</p><p className="text-xs text-slate-500">{s.studentId}</p></div>
                     </div>
                   ))
                 }
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
