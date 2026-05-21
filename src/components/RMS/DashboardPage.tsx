"use client";

import { Header } from "@/components/RMS/header";
import { apiFetch } from "@/lib/interceptor";
import { Plus, Clock, Eye, ArrowRight } from "lucide-react";
import { GraduationCap, Users, Book, BookImage, TrendingUp, Calendar } from "lucide-react";
import { AddStudentDialog, AddTeacherDialog } from "@/components/RMS/dialogs";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/reduxToolKit/store";
import { selectDashboardUserData, selectCurrentSession } from "@/reduxToolKit/selectors";
import { fetchAllUsers, getTenantInfo } from "@/reduxToolKit/user/userThunks";
import { fetchCurrentSession } from "@/reduxToolKit/setUp/setUpSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { routespath } from "@/lib/routepath";
import Link from "next/link";
import { ProductTour } from "@/components/common/ProductTour";

const adminTourSteps = [
  {
    target: '.rms-header-greeting',
    title: "Welcome to ParaLearn!",
    content: "This is your central command center. From here, you can monitor school performance, manage staff and students, and oversee all academic activities.",
    disableBeacon: true,
  },
  {
    target: '.dashboard-academic-banner',
    title: "Current Term Status",
    content: "This banner displays your active academic Session and Term. Keeping this updated ensures accurate reporting across the school.",
  },
  {
    target: '.dashboard-stats-grid',
    title: "Quick Statistics",
    content: "Get an instant count of your students, teachers, subjects, and assessments to ensure everyone is properly enrolled and active.",
  },
  {
    target: '.dashboard-recent-assessments',
    title: "Recent Academic Activity",
    content: "Track the latest exams and assignments created by teachers in real-time to monitor curriculum progress.",
  },
];

export const DashboardPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { studentCount, teacherCount, tenantInfo } = useSelector(selectDashboardUserData);
  const { users } = useSelector((state: RootState) => state.user);
  const currentSession = useSelector(selectCurrentSession);
  const [SubjectCount, setSubjectCount] = useState(0);
  const [AssessmentCount, setAssessmentCount] = useState(0);
  const [recentAssessments, setRecentAssessments] = useState<any[]>([]);
  const [recentReportCards, setRecentReportCards] = useState<any[]>([]);

  useEffect(() => {
    dispatch(fetchCurrentSession());
    dispatch(getTenantInfo());

    async function fetchDashboardData() {
      const fetchJson = async (url: string) => {
        const res = await apiFetch(url, { method: "GET", headers: { "Content-Type": "application/json" } });
        return res.ok ? res.json() : null;
      };

      const fetchAssessmentStatus = async (status: string) => {
        try {
          const data = await fetchJson(`/api/proxy/assessments/${status}`);
          return Array.isArray(data) ? data : [];
        } catch {
          try {
            const data = await fetchJson(`/api/proxy/assessments?status=${status}`);
            return Array.isArray(data) ? data : [];
          } catch {
            return [];
          }
        }
      };

      // All fetches run in parallel — users via Redux (populates state), rest via direct fetch
      const [
        usersResult,
        subjectResult,
        assessStarted,
        assessEnded,
        assessNotStarted,
        reportResult,
      ] = await Promise.all([
        dispatch(fetchAllUsers()).unwrap().catch(() => ({ users: [] as any[] })),
        fetchJson("/api/proxy/subjects").catch(() => null),
        fetchAssessmentStatus("started"),
        fetchAssessmentStatus("ended"),
        fetchAssessmentStatus("not_started"),
        fetchJson("/api/proxy/reports/report-cards?limit=10").catch(() => null),
      ]);

      // Subjects count
      const subjectsArray = subjectResult?.data || subjectResult?.subjects || subjectResult;
      setSubjectCount(Array.isArray(subjectsArray) ? subjectsArray.length : 0);

      // Assessments
      const allAssessments = [...assessStarted, ...assessEnded, ...assessNotStarted];
      setAssessmentCount(allAssessments.length);
      const recentAssess = [...allAssessments]
        .sort((a, b) => new Date(b.createdAt || b.startsAt || 0).getTime() - new Date(a.createdAt || a.startsAt || 0).getTime())
        .slice(0, 5);
      setRecentAssessments(recentAssess);

      // Report cards — enrich with user data from the Redux result
      const usersData: any[] = usersResult?.users || [];
      if (reportResult) {
        const studentsArray = reportResult?.data || reportResult || [];
        const allReports: any[] = [];

        if (Array.isArray(studentsArray)) {
          studentsArray.forEach((student: any) => {
            (student.reportCardsAsStudent || []).forEach((reportCard: any) => {
              allReports.push({ ...reportCard, studentId: reportCard.studentId });
            });
          });
        }

        const enrichedReports = allReports.map((report) => {
          const matchingStudent = usersData.find((u: any) => u.id === report.studentId);
          let studentClass = null;
          if (matchingStudent?.enrollments && Array.isArray(matchingStudent.enrollments)) {
            const activeEnrollment = matchingStudent.enrollments.find((e: any) => e.status === "active");
            studentClass = (activeEnrollment || matchingStudent.enrollments[0])?.class;
          }
          return {
            ...report,
            student: matchingStudent
              ? { id: matchingStudent.id, code: matchingStudent.studentId || matchingStudent.id, firstName: matchingStudent.firstName, lastName: matchingStudent.lastName, class: studentClass }
              : null,
          };
        });

        const recentCards = enrichedReports
          .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
          .slice(0, 10);
        setRecentReportCards(recentCards);
      } else {
        setRecentReportCards([]);
      }
    }

    fetchDashboardData().catch((err) => console.error("[Dashboard] fetchDashboardData error:", err));
  }, [dispatch]);

  const vv = [
    {
      title: "Students",
      icon: GraduationCap,
      figure: studentCount,
      bg_color: "#F0E5FF",
      icon_color: "#9747FF",
    },
    {
      title: "Teachers",
      icon: Users,
      figure: teacherCount,
      bg_color: "#DFF9D8",
      icon_color: "#3AC13A",
    },
    {
      title: "Subjects",
      icon: Book,
      figure: SubjectCount,
      bg_color: "#DBE9FF",
      icon_color: "#2A64F6",
    },
    {
      title: "Assessments",
      icon: BookImage,
      figure: AssessmentCount,
      bg_color: "#FFE9CC",
      icon_color: "#F28C1F",
    },
  ];

  return (
    <div className="w-full space-y-6 pb-8">
      <ProductTour tourKey="admin_dashboard" steps={adminTourSteps} />
      
      {/* Header Section */}
      <Header 
        schoolLogo={tenantInfo?.logoUrl} 
        schoolName={tenantInfo?.name || "ParaLearn School"}
        showGreeting={true}
      />

      {/* Current Academic Session Banner */}
      {currentSession && (
        <div className="mb-6">
          <div className="dashboard-academic-banner relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#641BC4] to-[#8538E0] p-4 sm:p-6 text-white shadow-lg">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Calendar className="w-24 h-24" />
            </div>
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-white text-xs font-bold uppercase tracking-wider mb-1">
                  Active Academic Period
                </p>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  {currentSession.session} — {currentSession.term}
                </h2>
              </div>
              <Link href={routespath.ACADEMIC}>
                <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-md">
                  Manage Sessions
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards Grid */}
      <div className="dashboard-stats-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {vv.map((item, index) => (
          <Card
            key={index}
            className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            style={{ backgroundColor: item.bg_color }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-600 mb-1">
                    {item.title}
                  </p>
                  <p className="text-3xl font-bold text-slate-900">
                    {item.figure.toLocaleString()}
                  </p>
                </div>
                <div
                  className="rounded-full p-3 shadow-sm"
                  style={{ backgroundColor: item.icon_color }}
                >
                  <item.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Assessments Section */}
        <div className="dashboard-recent-assessments lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 font-coolvetica">Recent Assessments</h2>
            <Link href={routespath.ASSESSMENTS}>
              <Button
                size="sm"
                variant="ghost"
                className="text-[#641BC4] hover:bg-[#641BC4] hover:text-white text-xs font-semibold font-coolvetica"
              >
                View All
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {recentAssessments.length === 0 ? (
              <Card className="border border-slate-200 shadow-sm">
                <CardContent className="p-6 text-center">
                  <p className="text-sm text-slate-500 font-coolvetica">No assessments yet</p>
                </CardContent>
              </Card>
            ) : (
              recentAssessments.map((item: any, index: number) => (
                <Card
                  key={item.id || index}
                  className="border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                >
                  <div className="flex">
                    <div className="w-2 bg-gradient-to-b from-[#641BC4] to-[#8538E0]"></div>
                    <CardContent className="flex-1 p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900 text-base line-clamp-1 font-coolvetica">
                            {item.title || item.subject?.name || "Untitled Assessment"}
                          </h3>
                          <p className="text-xs text-slate-500 mt-1 font-coolvetica">
                            {item.subject?.name || "Subject"}
                          </p>
                        </div>
                        <Badge
                          variant={item.status === "started" ? "default" : "secondary"}
                          className={
                            item.status === "started"
                              ? "bg-green-100 text-green-800 hover:bg-green-100 ml-2"
                              : item.status === "ended"
                              ? "bg-amber-100 text-amber-800 hover:bg-amber-100 ml-2"
                              : "bg-slate-100 text-slate-800 hover:bg-slate-100 ml-2"
                          }
                        >
                          {item.status === "started" ? "Active" : item.status === "ended" ? "Ended" : "Draft"}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-4 text-xs text-slate-600 font-coolvetica">
                          <span className="font-medium">
                            {item.totalMarks || 100} Marks
                          </span>
                          {item.duration && (
                            <span className="font-medium">
                              {item.duration} mins
                            </span>
                          )}
                        </div>
                        {item.startsAt && (
                          <div className="flex items-center gap-2 text-xs text-slate-500 font-coolvetica">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(item.startsAt).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Report Cards Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-slate-900 font-coolvetica">Recent Report Cards</h2>
            <Link href={routespath.REPORT}>
              <Button className="bg-[#9747FF] hover:bg-[#8538E0] text-white shadow-md hover:shadow-lg transition-all w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Generate Report Cards
              </Button>
            </Link>
          </div>

          {/* Responsive Table Container */}
          <Card className="border border-slate-200 shadow-sm">
            {recentReportCards.length === 0 ? (
              <CardContent className="p-8 text-center">
                <p className="text-sm text-slate-500">No report cards generated yet</p>
              </CardContent>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-[#AD8ED6] to-[#9747FF]">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider rounded-tl-lg">
                        Student ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                        Class
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                        Session/Term
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider rounded-tr-lg">
                        Created
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentReportCards.map((report: any, index: number) => (
                      <tr
                        key={report.id || index}
                        className={`hover:bg-slate-50 transition-colors ${
                          index % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                        }`}
                      >
                        <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">
                          {report.student?.code || report.studentId || "—"}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700">
                          {report.student?.firstName || ""} {report.student?.lastName || report.studentName || "—"}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">
                          {report.student?.class?.name || report.className || "—"}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">
                          {report.session || "—"} / {report.term || "—"}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">
                          <Badge
                            variant={report.status === "published" ? "default" : "secondary"}
                            className={
                              report.status === "published"
                                ? "bg-green-100 text-green-800 hover:bg-green-100"
                                : "bg-slate-100 text-slate-800 hover:bg-slate-100"
                            }
                          >
                            {report.status === "published" ? "Published" : "Draft"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">
                          {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
