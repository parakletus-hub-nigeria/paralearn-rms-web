"use client";

import { Header } from "@/components/RMS/header";
import { apiFetch } from "@/lib/interceptor";
import { Plus, Clock, Eye } from "lucide-react";
import { GraduationCap, Users, Book, BookImage, TrendingUp } from "lucide-react";
import { AddStudentDialog, AddTeacherDialog } from "@/components/RMS/dialogs";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/reduxToolKit/store";
import { fetchAllUsers } from "@/reduxToolKit/user/userThunks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const DashboardPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { studentCount, teacherCount } = useSelector(
    (state: RootState) => state.user
  );
  const [SubjectCount, setSubjectCount] = useState(0);
  const [AssessmentCount, setAssessmentCount] = useState(0);
  const [upcomingExams, setUpcomingExams] = useState<any[]>([]);

  useEffect(() => {
    // Fetch users using Redux
    dispatch(fetchAllUsers());
    
    async function fetchDashboardData() {
      // Fetch subjects count
      try {
        const subjectResp = await apiFetch("/api/proxy/subjects", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const subjectResult = await subjectResp.json();
        setSubjectCount(subjectResult.data?.length || 0);
      } catch (error: any) {
        console.warn("Failed to fetch subjects:", error?.message);
        setSubjectCount(0);
        // Don't show toast for subjects as it's not critical
      }

      // Fetch assessments count - handle gracefully if endpoint doesn't exist
      try {
        const assessmentResp = await apiFetch("/api/proxy/assessments", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        
        // Check if response is ok before parsing
        if (assessmentResp.ok) {
          const assessmentResult = await assessmentResp.json();
          setAssessmentCount(assessmentResult.data?.length || 0);
        } else if (assessmentResp.status === 404) {
          // Endpoint doesn't exist yet, set to 0 silently
          setAssessmentCount(0);
        } else {
          // Other error, set to 0
          setAssessmentCount(0);
        }
      } catch (error: any) {
        // Silently handle errors for assessments endpoint (might not be implemented)
        setAssessmentCount(0);
      }
    }
    fetchDashboardData();
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

  const upcomingExamsData = [
    {
      id: 1,
      subject: "Biology",
      studentCount: 28,
      questionCount: 50,
      date: "01/08/22",
      time: "08:00 am",
    },
    {
      id: 2,
      subject: "Mathematics",
      studentCount: 28,
      questionCount: 50,
      date: "01/08/22",
      time: "08:00 am",
    },
    {
      id: 3,
      subject: "English",
      studentCount: 28,
      questionCount: 50,
      date: "01/08/22",
      time: "08:00 am",
    },
  ];

  const tableData = [
    {
      id: "S-101",
      name: "John Doe",
      class: "1 South",
      lastUpdated: "01/01/2001",
      contact: "+234567890456",
      status: "Published",
    },
    {
      id: "S-101",
      name: "John Doe",
      class: "1 South",
      lastUpdated: "01/01/2001",
      contact: "+234567890456",
      status: "Draft",
    },
    {
      id: "S-101",
      name: "John Doe",
      class: "1 South",
      lastUpdated: "01/01/2001",
      contact: "+234567890456",
      status: "Draft",
    },
    {
      id: "S-101",
      name: "John Doe",
      class: "1 South",
      lastUpdated: "01/01/2001",
      contact: "+234567890456",
      status: "Published",
    },
    {
      id: "S-101",
      name: "John Doe",
      class: "1 North",
      lastUpdated: "01/01/2001",
      contact: "+234567890456",
      status: "Published",
    },
    {
      id: "S-101",
      name: "John Doe",
      class: "1 East",
      lastUpdated: "01/01/2001",
      contact: "+234567890456",
      status: "Published",
    },
    {
      id: "S-101",
      name: "John Doe",
      class: "1 South",
      lastUpdated: "01/01/2001",
      contact: "+234567890456",
      status: "Draft",
    },
  ];

  return (
    <div className="w-full space-y-6 pb-8">
      {/* Header Section */}
      <Header schoolLogo="https://arua.org/wp-content/themes/yootheme/cache/d8/UI-logo-d8a68d3e.webp" />

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-4 lg:px-0">
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

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3 px-4 lg:px-0">
        <AddStudentDialog>
          <Button className="bg-[#9747FF] hover:bg-[#8538E0] text-white shadow-md hover:shadow-lg transition-all">
            <Plus className="w-4 h-4 mr-2" />
            Add Student
          </Button>
        </AddStudentDialog>
        <AddTeacherDialog>
          <Button
            variant="outline"
            className="border-[#9747FF] text-[#9747FF] hover:bg-[#9747FF] hover:text-white shadow-sm hover:shadow-md transition-all"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Teacher
          </Button>
        </AddTeacherDialog>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 lg:px-0">
        {/* Upcoming Exams Section */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Upcoming Exams</h2>
          </div>
          <div className="space-y-3">
            {upcomingExamsData.map((item: any, index: number) => (
              <Card
                key={index}
                className="border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
              >
                <div className="flex">
                  <div className="w-2 bg-gradient-to-b from-[#641BC4] to-[#8538E0]"></div>
                  <CardContent className="flex-1 p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-slate-900 text-base">
                        {item.subject}
                      </h3>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 px-3 text-[#641BC4] hover:bg-[#641BC4] hover:text-white"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                    </div>
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <span className="font-medium">
                          {item.studentCount} Students
                        </span>
                        <span className="font-medium">
                          {item.questionCount} Questions
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Clock className="w-3 h-3" />
                        <span>{item.date}</span>
                        <span>•</span>
                        <span>{item.time}</span>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Report Cards Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-slate-900">Report Cards</h2>
            <Button className="bg-[#9747FF] hover:bg-[#8538E0] text-white shadow-md hover:shadow-lg transition-all w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Generate Report Cards
            </Button>
          </div>

          {/* Responsive Table Container */}
          <Card className="border border-slate-200 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-[#AD8ED6] to-[#9747FF]">
                    {tableData.length > 0 &&
                      Object.keys(tableData[0]).map((key, idx) => (
                        <th
                          key={key}
                          className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider first:rounded-tl-lg last:rounded-tr-lg"
                        >
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tableData.map((row, index) => (
                    <tr
                      key={index}
                      className={`hover:bg-slate-50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                      }`}
                    >
                      {Object.entries(row).map(([key, value], cellIndex) => (
                        <td
                          key={cellIndex}
                          className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap"
                        >
                          {key === "status" ? (
                            <Badge
                              variant={
                                value === "Published"
                                  ? "default"
                                  : "secondary"
                              }
                              className={
                                value === "Published"
                                  ? "bg-green-100 text-green-800 hover:bg-green-100"
                                  : "bg-slate-100 text-slate-800 hover:bg-slate-100"
                              }
                            >
                              {value}
                            </Badge>
                          ) : (
                            value
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
