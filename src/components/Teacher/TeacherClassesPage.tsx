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
import { toast } from "sonner";
import { ProductTour } from "@/components/common/ProductTour";

const teacherClassesTourSteps = [
  {
    target: '.teacher-classes-stats',
    content: "These two cards show how many classes you're a homeroom teacher for and how many individual subjects you teach. Click on any class card to see its full roster.",
    disableBeacon: true,
  },
  {
    target: '.teacher-classes-tabs',
    content: "Switch between 'My Classes' to see your assigned classes, and 'My Subjects' to see the specific subjects you teach — including which class each subject belongs to.",
  },
  {
    target: '.teacher-classes-quick-actions',
    content: "These quick-action buttons let you jump straight to attendance or score-recording for your selected class without navigating away from this page.",
  },
];

type TabType = "classes" | "subjects";

const getThemeColor = (index: number) => {
  const themes = [
    { primary: "var(--violet-ink)", tint: "var(--violet-tint)", signal: "var(--violet-ink)" },
    { primary: "var(--emerald-signal)", tint: "var(--emerald-tint)", signal: "var(--emerald-signal)" },
    { primary: "var(--crimson-signal)", tint: "var(--crimson-tint)", signal: "var(--crimson-signal)" },
    { primary: "var(--cobalt-signal)", tint: "var(--cobalt-tint)", signal: "var(--cobalt-signal)" },
  ];
  return themes[index % themes.length];
};

export function TeacherClassesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { teacherClasses, academicCurrent, loading } = useSelector((s: RootState) => s.teacher);
  const { user } = useSelector((s: RootState) => s.user);
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
      const studentCount = item.class?.studentCount || item.class?.enrollmentCount || item.class?.currentEnrollment ||
                          item.studentCount || item.enrollmentCount || item.currentEnrollment || 0;
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
    <div className="w-full min-h-screen pb-20">
      <TeacherHeader />
      <ProductTour tourKey="teacher_classes" steps={teacherClassesTourSteps} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-8">

        {/* Welcome & Stats Header Section */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: "var(--foreground)", fontFamily: "var(--font-manrope)" }}>
                Good day, {(user as any)?.firstName || "Teacher"}!
              </h1>
              <p className="mt-1" style={{ color: "var(--foreground-muted)" }}>Manage your class mastery and student progress.</p>
            </div>
            <div className="flex gap-3 teacher-classes-quick-actions">
              <Link href={routespath.TEACHER_ATTENDANCE}>
                <button
                  className="flex items-center gap-2 h-10 px-4 font-semibold text-sm"
                  style={{ borderRadius: "var(--radius-lg)", border: "1px solid var(--border-fine)", background: "white", color: "var(--foreground)" }}
                >
                  <CalendarDays className="w-4 h-4" style={{ color: "var(--foreground-muted)" }} />
                  Start Attendance
                </button>
              </Link>
              <Link href={routespath.TEACHER_SCORES}>
                <button
                  className="flex items-center gap-2 h-10 px-4 font-semibold text-sm text-white"
                  style={{ borderRadius: "var(--radius-lg)", background: "var(--violet-ink)" }}
                >
                  <BarChart3 className="w-4 h-4" />
                  Record Scores
                </button>
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="teacher-classes-stats grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-6 flex items-center gap-5" style={{ borderRadius: "var(--radius-xl)", border: "1px solid var(--border-fine)", boxShadow: "var(--shadow-card)" }}>
              <div className="w-16 h-16 flex items-center justify-center shrink-0" style={{ borderRadius: "var(--radius-xl)", background: "var(--violet-tint)" }}>
                <GraduationCap className="w-8 h-8" style={{ color: "var(--violet-ink)" }} />
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-wide" style={{ color: "var(--foreground-muted)" }}>Total Classes</p>
                <p className="text-4xl font-black" style={{ color: "var(--foreground)" }}>{stats.totalClasses}</p>
              </div>
            </div>
            <div className="bg-white p-6 flex items-center gap-5" style={{ borderRadius: "var(--radius-xl)", border: "1px solid var(--border-fine)", boxShadow: "var(--shadow-card)" }}>
              <div className="w-16 h-16 flex items-center justify-center shrink-0" style={{ borderRadius: "var(--radius-xl)", background: "var(--cobalt-tint)" }}>
                <BookOpen className="w-8 h-8" style={{ color: "var(--cobalt-signal)" }} />
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-wide" style={{ color: "var(--foreground-muted)" }}>Total Subjects</p>
                <p className="text-4xl font-black" style={{ color: "var(--foreground)" }}>{stats.totalSubjects}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation & Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4">
          {/* Pill Tabs */}
          <div className="teacher-classes-tabs flex p-1.5 self-start" style={{ borderRadius: "9999px", background: "var(--surface-muted)" }}>
            <button
              onClick={() => setActiveTab("classes")}
              className="flex items-center gap-2 px-6 py-2.5 font-bold text-sm transition-all"
              style={{
                borderRadius: "9999px",
                background: activeTab === "classes" ? "white" : "transparent",
                color: activeTab === "classes" ? "var(--violet-ink)" : "var(--foreground-muted)",
                boxShadow: activeTab === "classes" ? "var(--shadow-card)" : "none",
              }}
            >
              <GraduationCap className="w-4 h-4" />
              My Classes
            </button>
            <button
              onClick={() => setActiveTab("subjects")}
              className="flex items-center gap-2 px-6 py-2.5 font-bold text-sm transition-all"
              style={{
                borderRadius: "9999px",
                background: activeTab === "subjects" ? "white" : "transparent",
                color: activeTab === "subjects" ? "var(--violet-ink)" : "var(--foreground-muted)",
                boxShadow: activeTab === "subjects" ? "var(--shadow-card)" : "none",
              }}
            >
              <BookOpen className="w-4 h-4" />
              My Subjects <span className="opacity-60 text-xs ml-1">({stats.totalSubjects})</span>
            </button>
          </div>

          <div className="flex gap-3 flex-1 md:justify-end">
            <div className="relative flex-1 md:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--foreground-muted)" }} />
              <Input
                placeholder="Search for a class or subject..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-11 bg-white"
                style={{ borderRadius: "var(--radius-lg)", borderColor: "var(--border-fine)" }}
              />
            </div>
            <div className="flex p-1" style={{ borderRadius: "var(--radius-lg)", border: "1px solid var(--border-fine)", background: "white" }}>
              <button
                onClick={() => setViewMode("grid")}
                className="p-2 transition-all"
                style={{ borderRadius: "var(--radius-md)", background: viewMode === "grid" ? "var(--surface-muted)" : "", color: viewMode === "grid" ? "var(--foreground)" : "var(--foreground-muted)" }}
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className="p-2 transition-all"
                style={{ borderRadius: "var(--radius-md)", background: viewMode === "list" ? "var(--surface-muted)" : "", color: viewMode === "list" ? "var(--foreground)" : "var(--foreground-muted)" }}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-12 w-12 rounded-full" style={{ border: "4px solid var(--border-fine)", borderTopColor: "var(--violet-ink)", animation: "spin 0.6s linear infinite" }} />
          </div>
        ) : activeTab === "classes" ? (
          filteredClassAssignments.length === 0 ? (
            <div className="text-center py-20 bg-white border border-dashed" style={{ borderRadius: "var(--radius-xl)", borderColor: "var(--border-medium)", color: "var(--foreground-muted)" }}>
              <p className="font-medium">No classes found.</p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClassAssignments.map((cls: any, idx: number) => {
                const theme = getThemeColor(idx);
                const subjects = cls.subjects || [];
                return (
                  <div
                    key={cls.id}
                    className="p-6 flex flex-col h-full transition-all duration-200"
                    style={{ borderRadius: "var(--radius-xl)", background: theme.tint, border: `1px solid color-mix(in oklch, ${theme.primary} 15%, transparent)`, boxShadow: "var(--shadow-card)" }}
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-2xl font-black tracking-tight" style={{ color: "var(--foreground)" }}>{cls.className}</h3>
                        <div className="inline-flex items-center px-2 py-0.5 mt-1 rounded-md text-[10px] uppercase font-bold tracking-wider" style={{ background: "rgba(255,255,255,0.7)", color: theme.primary }}>
                          Class Teacher
                        </div>
                      </div>
                      <div className="flex flex-col items-center justify-center w-14 h-14 bg-white rounded-full" style={{ boxShadow: "var(--shadow-card)" }}>
                        <span className="text-lg font-black" style={{ color: theme.primary }}>{cls.studentCount}</span>
                        <span className="text-[9px] font-bold uppercase -mt-1" style={{ color: "var(--foreground-muted)" }}>Students</span>
                      </div>
                    </div>

                    <div className="flex-1 mb-6">
                      <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--foreground-muted)" }}>Assigned Subjects</p>
                      <div className="space-y-2.5">
                        {subjects.slice(0, 3).map((s: any, i: number) => (
                          <div key={i} className="flex items-center gap-2.5">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ background: theme.primary }} />
                            <span className="text-sm font-bold" style={{ color: "var(--foreground)" }}>{s.name}</span>
                          </div>
                        ))}
                        {subjects.length > 3 && (
                          <span className="text-xs font-bold ml-4" style={{ color: "var(--foreground-muted)" }}>+{subjects.length - 3} more subjects</span>
                        )}
                        {subjects.length === 0 && <span className="text-sm italic" style={{ color: "var(--foreground-muted)" }}>No subjects assigned</span>}
                      </div>
                    </div>

                    <div className="pt-4 flex items-center justify-between gap-2 mt-auto" style={{ borderTop: `1px solid color-mix(in oklch, ${theme.primary} 10%, transparent)` }}>
                      <div className="flex items-center gap-2">
                        <span
                          onClick={() => openStudentsModal(cls.classId)}
                          className="cursor-pointer text-xs font-bold transition-colors"
                          style={{ color: "var(--foreground-muted)" }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = theme.primary)}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--foreground-muted)")}
                        >
                          View Class Details
                        </span>
                        <ChevronRight className="w-3 h-3" style={{ color: "var(--foreground-muted)" }} />
                      </div>
                      <div className="flex bg-white p-1 ml-auto" style={{ borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-card)" }}>
                        <button onClick={() => openStudentsModal(cls.classId)} className="p-2 transition-colors" style={{ borderRadius: "var(--radius-sm)", color: "var(--foreground-muted)" }} onMouseEnter={(e) => (e.currentTarget.style.color = theme.primary)} onMouseLeave={(e) => (e.currentTarget.style.color = "var(--foreground-muted)")} title="Students">
                          <Users className="w-4 h-4" />
                        </button>
                        <Link href={`${routespath.TEACHER_ASSESSMENTS}?classId=${cls.classId}`}>
                          <button className="p-2 transition-colors" style={{ borderRadius: "var(--radius-sm)", color: "var(--foreground-muted)" }} onMouseEnter={(e) => (e.currentTarget.style.color = theme.primary)} onMouseLeave={(e) => (e.currentTarget.style.color = "var(--foreground-muted)")} title="Assessments">
                            <ClipboardList className="w-4 h-4" />
                          </button>
                        </Link>
                        <Link href={`${routespath.TEACHER_SCORES}?classId=${cls.classId}`}>
                          <button className="p-2 transition-colors" style={{ borderRadius: "var(--radius-sm)", color: "var(--foreground-muted)" }} onMouseEnter={(e) => (e.currentTarget.style.color = "var(--emerald-signal)")} onMouseLeave={(e) => (e.currentTarget.style.color = "var(--foreground-muted)")} title="Scores">
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
            <div className="bg-white overflow-hidden" style={{ borderRadius: "var(--radius-xl)", border: "1px solid var(--border-fine)", boxShadow: "var(--shadow-card)" }}>
              <table className="w-full text-left">
                <thead style={{ background: "var(--surface-muted)", borderBottom: "1px solid var(--border-fine)" }}>
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold uppercase" style={{ color: "var(--foreground-muted)" }}>Class</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase" style={{ color: "var(--foreground-muted)" }}>Students</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-right" style={{ color: "var(--foreground-muted)" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClassAssignments.map((cls: any) => (
                    <tr
                      key={cls.id}
                      style={{ borderBottom: "1px solid var(--border-fine)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-muted)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                    >
                      <td className="px-6 py-4 font-bold" style={{ color: "var(--foreground)" }}>{cls.className}</td>
                      <td className="px-6 py-4 font-bold" style={{ color: "var(--foreground-muted)" }}>{cls.studentCount}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="ghost" onClick={() => openStudentsModal(cls.classId)}><Users className="w-4 h-4" /></Button>
                          <Link href={`${routespath.TEACHER_SCORES}?classId=${cls.classId}`}><Button size="sm" variant="ghost"><BarChart3 className="w-4 h-4" /></Button></Link>
                        </div>
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
            <div className="text-center py-20 bg-white border border-dashed" style={{ borderRadius: "var(--radius-xl)", borderColor: "var(--border-medium)", color: "var(--foreground-muted)" }}>
              <p className="font-medium">No subjects found.</p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="space-y-10">
              {Array.from(subjectsByClass.entries()).map(([classId, subjects]: [string, any[]], idx: number) => {
                const first = subjects[0];
                const theme = getThemeColor(idx);
                return (
                  <div key={classId}>
                    <div className="flex items-center gap-3 mb-4 ml-1">
                      <div className="w-1.5 h-6 rounded-full" style={{ background: theme.primary }} />
                      <h3 className="text-xl font-bold" style={{ color: "var(--foreground)" }}>{first.className}</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {subjects.map((subj: any) => (
                        <div
                          key={subj.id}
                          className="bg-white p-6 relative overflow-hidden transition-all"
                          style={{ borderRadius: "var(--radius-xl)", border: "1px solid var(--border-fine)", boxShadow: "var(--shadow-card)" }}
                          onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)")}
                          onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "var(--shadow-card)")}
                        >
                          <div className="absolute top-0 left-0 w-1 h-full" style={{ background: theme.primary }} />
                          <div className="flex justify-between items-start mb-4 pl-3">
                            <div>
                              <h4 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>{subj.subjectName}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <Users className="w-3 h-3" style={{ color: "var(--foreground-muted)" }} />
                                <span className="text-xs font-bold" style={{ color: "var(--foreground-muted)" }}>{subj.studentCount} Students</span>
                              </div>
                            </div>
                            <div className="p-2" style={{ borderRadius: "var(--radius-md)", background: theme.tint }}>
                              <BookOpen className="w-4 h-4" style={{ color: theme.primary }} />
                            </div>
                          </div>
                          <div className="flex items-center justify-end gap-2 mt-6 pt-4" style={{ borderTop: "1px solid var(--border-fine)" }}>
                            <button className="w-8 h-8 flex items-center justify-center transition-colors" style={{ borderRadius: "var(--radius-md)", color: "var(--foreground-muted)" }} onClick={() => openStudentsModal(subj.classId)} onMouseEnter={(e) => (e.currentTarget.style.color = theme.primary)} onMouseLeave={(e) => (e.currentTarget.style.color = "var(--foreground-muted)")}>
                              <Users className="w-4 h-4" />
                            </button>
                            <Link href={`${routespath.TEACHER_ASSESSMENTS}?classId=${subj.classId}&subjectId=${subj.subjectId}`}>
                              <button className="w-8 h-8 flex items-center justify-center transition-colors" style={{ borderRadius: "var(--radius-md)", color: "var(--foreground-muted)" }} onMouseEnter={(e) => (e.currentTarget.style.color = theme.primary)} onMouseLeave={(e) => (e.currentTarget.style.color = "var(--foreground-muted)")}>
                                <ClipboardList className="w-4 h-4" />
                              </button>
                            </Link>
                            <Link href={`${routespath.TEACHER_SCORES}?classId=${subj.classId}&subjectId=${subj.subjectId}`}>
                              <button className="w-8 h-8 flex items-center justify-center transition-colors" style={{ borderRadius: "var(--radius-md)", color: "var(--foreground-muted)" }} onMouseEnter={(e) => (e.currentTarget.style.color = "var(--emerald-signal)")} onMouseLeave={(e) => (e.currentTarget.style.color = "var(--foreground-muted)")}>
                                <BarChart3 className="w-4 h-4" />
                              </button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ color: "var(--foreground-muted)" }} className="text-center py-8">Switch to grid view for subjects.</div>
          )
        )}
      </div>

      {/* Student Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(15,23,42,0.5)" }} onClick={() => setShowModal(false)}>
          <div className="bg-white w-full max-w-2xl m-4 max-h-[80vh] flex flex-col overflow-hidden" style={{ borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-dialog)" }} onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 flex justify-between items-center" style={{ borderBottom: "1px solid var(--border-fine)" }}>
              <h3 className="font-bold text-lg" style={{ color: "var(--foreground)" }}>{selectedClassData?.name} Students</h3>
              <button onClick={() => setShowModal(false)} style={{ color: "var(--foreground-muted)" }}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4" style={{ background: "var(--surface-muted)" }}>
              <Input placeholder="Search students..." value={studentSearch} onChange={e => setStudentSearch(e.target.value)} className="bg-white" style={{ borderColor: "var(--border-fine)" }} />
            </div>
            <div className="overflow-y-auto flex-1">
              {loadingStudents ? (
                <div className="p-10 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full" style={{ border: "3px solid var(--border-fine)", borderTopColor: "var(--violet-ink)", animation: "spin 0.6s linear infinite" }} />
                </div>
              ) : filteredStudents.map((s: any, i: number) => (
                <div
                  key={i}
                  className="px-6 py-3 flex items-center gap-3 transition-colors"
                  style={{ borderBottom: "1px solid var(--border-fine)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-muted)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "var(--violet-tint)", color: "var(--violet-ink)" }}>
                    {getInitials(s.firstName, s.lastName)}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm" style={{ color: "var(--foreground)" }}>{s.firstName} {s.lastName}</p>
                    <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>{s.studentId}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
