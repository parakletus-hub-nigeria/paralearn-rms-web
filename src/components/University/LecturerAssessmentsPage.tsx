"use client";

import { Header } from "@/components/RMS/header";
import { Button } from "@/components/ui/button";
import {
  BarChart2,
  Plus,
  FileText,
  Calendar,
  Clock,
  MoreVertical,
  Trash2,
  BookOpen,
} from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/reduxToolKit/store";
import { useGetLecturerTimetableQuery } from "@/reduxToolKit/uniFeatures/timetableApi";
import {
  useGetUniAssessmentsQuery,
  useDeleteUniAssessmentMutation,
} from "@/reduxToolKit/uniFeatures/assessmentsApi";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const DEFAULT_PRIMARY = "#641BC4";

export function LecturerAssessmentsPage() {
  const { tenantInfo } = useSelector((s: RootState) => s.user);
  const primaryColor = DEFAULT_PRIMARY;
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"courses" | "assessments">(
    "courses",
  );

  const { data: timetableResponse, isLoading: loadingTimetable } =
    useGetLecturerTimetableQuery();

  const { data: assessmentsResponse, isLoading: loadingAssessments } =
    useGetUniAssessmentsQuery();

  const [deleteAssessment] = useDeleteUniAssessmentMutation();

  const timetableEntries = Array.isArray(timetableResponse?.data)
    ? timetableResponse.data
    : Array.isArray(timetableResponse)
      ? timetableResponse
      : [];

  const assessments = Array.isArray(assessmentsResponse?.data)
    ? assessmentsResponse.data
    : Array.isArray(assessmentsResponse)
      ? assessmentsResponse
      : [];

  const handleViewResults = () => {
    setActiveTab("assessments");
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this assessment?")) {
      try {
        await deleteAssessment(id).unwrap();
        toast.success("Assessment deleted");
      } catch (e: any) {
        toast.error("Failed to delete assessment");
      }
    }
  };

  return (
    <div className="w-full">
      <Header
        schoolLogo={tenantInfo?.logoUrl}
        schoolName={tenantInfo?.name || "ParaLearn University"}
      />

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 font-coolvetica">
              Academic Management
            </h1>
            <p className="text-slate-500 text-sm mt-1 font-coolvetica">
              Manage your course timetable and assessments.
            </p>
          </div>

          <Button
            onClick={() =>
              router.push("/uni-lecturer/assessments/create-assessment")
            }
            className="h-11 px-6 rounded-xl text-white gap-2 font-semibold shadow-lg shadow-purple-200"
            style={{ backgroundColor: primaryColor }}
          >
            <Plus className="w-4 h-4" />
            Create Assessment
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit mb-8">
          <button
            onClick={() => setActiveTab("courses")}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === "courses"
                ? "bg-white text-purple-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            My Courses
          </button>
          <button
            onClick={() => setActiveTab("assessments")}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === "assessments"
                ? "bg-white text-purple-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Created Assessments
          </button>
        </div>

        {activeTab === "courses" ? (
          <div className="space-y-6">
            {loadingTimetable ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-100 overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="text-left text-slate-500 font-semibold text-xs uppercase tracking-wider py-4 px-5">
                        Course
                      </th>
                      <th className="text-left text-slate-500 font-semibold text-xs uppercase tracking-wider py-4 px-3">
                        Day / Time
                      </th>
                      <th className="text-left text-slate-500 font-semibold text-xs uppercase tracking-wider py-4 px-3">
                        Hall
                      </th>
                      <th className="text-center text-slate-500 font-semibold text-xs uppercase tracking-wider py-4 px-3">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {timetableEntries.map((entry: any, idx: number) => (
                      <tr
                        key={entry.id || idx}
                        className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="py-4 px-5">
                          <span className="font-mono bg-purple-50 text-purple-700 px-2 py-0.5 rounded text-[10px] font-bold mb-1 inline-block">
                            {entry.course?.code || "COURSE"}
                          </span>
                          <span className="font-semibold text-slate-900 block">
                            {entry.course?.title ||
                              entry.course?.name ||
                              "Course Title"}
                          </span>
                        </td>
                        <td className="py-4 px-3">
                          <div className="flex items-center gap-2 text-slate-700 font-medium text-sm">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {entry.dayOfWeek || "—"}
                          </div>
                          <div className="flex items-center gap-2 text-slate-500 text-xs mt-0.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {entry.startTime && entry.endTime
                              ? `${entry.startTime} – ${entry.endTime}`
                              : "—"}
                          </div>
                        </td>
                        <td className="py-4 px-3 text-slate-600 text-sm">
                          {entry.hall?.name || "TBD"}
                        </td>
                        <td className="py-4 px-3 text-center">
                          <Button
                            onClick={() => handleViewResults()}
                            variant="outline"
                            className="h-9 px-4 rounded-lg gap-2 text-xs font-semibold border-purple-100 text-purple-600 hover:bg-purple-50"
                          >
                            <BarChart2 className="w-3.5 h-3.5" />
                            Results
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {timetableEntries.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="py-16 text-center text-slate-500 font-medium"
                        >
                          No scheduled courses found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {loadingAssessments ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {assessments.map((asm: any) => (
                  <div
                    key={asm.id}
                    className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                        <FileText className="w-5 h-5" />
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl">
                          <DropdownMenuItem
                            onClick={() => handleDelete(asm.id)}
                            className="text-red-600 focus:text-red-700 focus:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <h3 className="font-bold text-slate-900 line-clamp-1 mb-1">
                      {asm.title}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mb-4">
                      <BookOpen className="w-3.5 h-3.5" />
                      {asm.timetable?.course?.code || "Course"}
                    </p>
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-600 bg-slate-50 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {asm.durationMinutes || asm.durationMins} Mins
                      </div>
                      <div className="text-purple-600">
                        {asm.totalMarks} Marks
                      </div>
                    </div>
                    <Button
                      onClick={() =>
                        router.push(
                          `/uni-lecturer/assessments/${asm.id}/results`,
                        )
                      }
                      variant="ghost"
                      className="w-full mt-4 h-10 rounded-xl text-purple-600 hover:bg-purple-50 font-bold border border-transparent hover:border-purple-100"
                    >
                      View Reports
                    </Button>
                  </div>
                ))}
                {assessments.length === 0 && (
                  <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                    <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">
                      No assessments created yet.
                    </p>
                    <Button
                      onClick={() =>
                        router.push(
                          "/uni-lecturer/assessments/create-assessment",
                        )
                      }
                      variant="link"
                      className="text-purple-600 font-bold mt-2"
                    >
                      Create your first assessment →
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
