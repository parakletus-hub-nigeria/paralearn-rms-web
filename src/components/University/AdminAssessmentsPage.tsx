"use client";

import { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { Header } from "@/components/RMS/header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  FileText,
  AlertCircle,
  Eye,
  BookOpen,
  Users,
  Building,
  GraduationCap,
} from "lucide-react";
import { RootState } from "@/reduxToolKit/store";
import { useGetAdminAssessmentsQuery } from "@/reduxToolKit/uniFeatures/assessmentsApi";
import { useGetFacultiesQuery } from "@/reduxToolKit/uniFeatures/facultyApi";
import { useGetDepartmentsQuery } from "@/reduxToolKit/uniFeatures/departmentApi";

const DEFAULT_PRIMARY = "#641BC4";

export function AdminAssessmentsPage() {
  const { tenantInfo } = useSelector((s: RootState) => s.user);
  const primaryColor = DEFAULT_PRIMARY;

  const [q, setQ] = useState("");
  const [facultyFilter, setFacultyFilter] = useState("all");
  const [deptFilter, setDeptFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: assessmentsResponse, isLoading: loadingAssessments } =
    useGetAdminAssessmentsQuery();
  const { data: facultiesResponse } = useGetFacultiesQuery();
  const { data: deptsResponse } = useGetDepartmentsQuery(
    facultyFilter !== "all" ? facultyFilter : undefined,
    { skip: facultyFilter === "all" },
  );

  const assessments = Array.isArray(assessmentsResponse?.data)
    ? assessmentsResponse.data
    : Array.isArray(assessmentsResponse)
      ? assessmentsResponse
      : [];

  const faculties = Array.isArray(facultiesResponse?.data)
    ? facultiesResponse.data
    : Array.isArray(facultiesResponse)
      ? facultiesResponse
      : [];

  const filtered = useMemo(() => {
    let result = assessments;

    if (facultyFilter !== "all") {
      result = result.filter(
        (a: any) =>
          a.timetable?.course?.department?.facultyId === facultyFilter,
      );
    }

    if (deptFilter !== "all") {
      result = result.filter(
        (a: any) => a.timetable?.course?.departmentId === deptFilter,
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((a: any) => a.status === statusFilter);
    }

    const term = q.trim().toLowerCase();
    if (term) {
      result = result.filter(
        (a: any) =>
          (a.title || "").toLowerCase().includes(term) ||
          (a.timetable?.course?.code || "").toLowerCase().includes(term) ||
          (a.lecturer?.firstName || "").toLowerCase().includes(term) ||
          (a.lecturer?.lastName || "").toLowerCase().includes(term),
      );
    }

    return result;
  }, [assessments, facultyFilter, deptFilter, statusFilter, q]);

  return (
    <div className="w-full">
      <Header
        schoolLogo={tenantInfo?.logoUrl}
        schoolName={tenantInfo?.name || "ParaLearn University"}
      />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 font-coolvetica">
          University Assessments
        </h1>
        <p className="text-slate-500 mt-1 font-coolvetica">
          Monitor and oversee all assessments and CBT exams across the
          university.
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-purple-50 border border-purple-100 rounded-2xl p-5 mb-8 flex items-start gap-4">
        <AlertCircle className="w-6 h-6 text-purple-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-purple-900">
            Admin Oversight Mode
          </p>
          <p className="text-sm text-purple-700 mt-1">
            As an administrator, you have a read-only view of all assessments
            created by lecturers. Use the filters below to browse by Faculty or
            Department.
          </p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Total Assessments",
            value: assessments.length,
            icon: FileText,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            label: "Active Exams",
            value: assessments.filter((a: any) => a.status === "active").length,
            icon: Eye,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
          },
          {
            label: "Mixed Types",
            value: assessments.filter((a: any) => a.type === "MIXED").length,
            icon: BookOpen,
            color: "text-purple-600",
            bg: "bg-purple-50",
          },
          {
            label: "Participating Students",
            value: "—",
            icon: Users,
            color: "text-amber-600",
            bg: "bg-amber-50",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm"
          >
            <div
              className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-3`}
            >
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-8">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by title, course code or lecturer..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-10 h-12 rounded-xl border-slate-200 bg-white shadow-sm"
            />
          </div>

          <Select
            value={facultyFilter}
            onValueChange={(val) => {
              setFacultyFilter(val);
              setDeptFilter("all");
            }}
          >
            <SelectTrigger className="h-12 w-[180px] rounded-xl border-slate-200 bg-white">
              <SelectValue placeholder="All Faculties" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Faculties</SelectItem>
              {faculties.map((f: any) => (
                <SelectItem key={f.id} value={f.id}>
                  {f.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={deptFilter}
            onValueChange={setDeptFilter}
            disabled={facultyFilter === "all"}
          >
            <SelectTrigger className="h-12 w-[180px] rounded-xl border-slate-200 bg-white">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Departments</SelectItem>
              {Array.isArray(deptsResponse?.data || deptsResponse) &&
                (deptsResponse?.data || deptsResponse).map((d: any) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-12 w-[150px] rounded-xl border-slate-200 bg-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="not_started">Pending</SelectItem>
              <SelectItem value="ended">Ended</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grid */}
      {loadingAssessments ? (
        <div className="flex items-center justify-center py-20">
          <div
            className="animate-spin rounded-full h-10 w-10 border-[3px] border-slate-200"
            style={{ borderTopColor: primaryColor }}
          />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 py-20 text-center">
          <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900">
            No Assessments Found
          </h3>
          <p className="text-slate-500 mt-2">
            Try adjusting your filters or search query.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((asm: any) => (
            <div
              key={asm.id}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden relative group"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-purple-100" />

              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <Badge
                    className={`rounded-lg px-2.5 py-1 text-[10px] font-bold border-0 ${
                      asm.status === "active"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {asm.status === "active" ? "ACTIVE" : "PENDING"}
                  </Badge>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {asm.type}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-lg line-clamp-1 mb-1">
                  {asm.title}
                </h3>
                <div className="flex items-center gap-2 text-xs font-semibold text-purple-600 mb-4">
                  <BookOpen className="w-3.5 h-3.5" />
                  {asm.timetable?.course?.code}
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Building className="w-4 h-4 text-slate-400" />
                    <span className="truncate">
                      {asm.timetable?.course?.department?.faculty?.name ||
                        "Faculty Name"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <GraduationCap className="w-4 h-4 text-slate-400" />
                    <span>
                      {asm.lecturer?.firstName} {asm.lecturer?.lastName}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">
                      Marks
                    </p>
                    <p className="text-sm font-bold text-slate-900">
                      {asm.totalMarks}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">
                      Duration
                    </p>
                    <p className="text-sm font-bold text-slate-900">
                      {asm.durationMins}m
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100">
                <Button
                  variant="ghost"
                  className="w-full rounded-xl text-slate-600 hover:bg-white hover:shadow-sm font-bold text-xs gap-2"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
