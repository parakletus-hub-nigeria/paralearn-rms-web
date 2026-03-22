"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Header } from "@/components/RMS/header";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Check,
  Trash2,
  Library,
  GraduationCap,
  Clock,
} from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/reduxToolKit/store";
import {
  useGetAllCoursesWithStatusQuery,
  useEnrollCoursesMutation,
  useDropCoursesMutation,
  useGetEnrolledCoursesQuery,
} from "@/reduxToolKit/uniFeatures/courseApi";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DEFAULT_PRIMARY = "#641BC4";

export function StudentCoursesPage() {
  const { tenantInfo } = useSelector((s: RootState) => s.user);
  const primaryColor = DEFAULT_PRIMARY;

  const [activeTab, setActiveTab] = useState("available");

  // API Hooks
  const { data: eligibleResponse, isLoading: loadingEligible } =
    useGetAllCoursesWithStatusQuery();
  const { data: enrolledResponse, isLoading: loadingEnrolled } =
    useGetEnrolledCoursesQuery();
  const [enrollCourses, { isLoading: isEnrolling }] =
    useEnrollCoursesMutation();
  const [dropCourses, { isLoading: isDropping }] = useDropCoursesMutation();

  const allCourses = Array.isArray(eligibleResponse?.data)
    ? eligibleResponse.data
    : Array.isArray(eligibleResponse)
      ? eligibleResponse
      : [];
  // Filter to courses the student hasn't enrolled in yet
  const eligibleCourses = allCourses.filter((c: any) => !c.isEnrolled);
  const enrolledCourses = Array.isArray(enrolledResponse?.data)
    ? enrolledResponse.data
    : Array.isArray(enrolledResponse)
      ? enrolledResponse
      : [];

  const [selectedEnroll, setSelectedEnroll] = useState<string[]>([]);
  const [selectedDrop, setSelectedDrop] = useState<string[]>([]);

  const toggleEnroll = (id: string) => {
    setSelectedEnroll((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const toggleDrop = (id: string) => {
    setSelectedDrop((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleEnroll = async () => {
    try {
      await enrollCourses({ courseIds: selectedEnroll }).unwrap();
      toast.success("Enrolled successfully");
      setSelectedEnroll([]);
    } catch (e: any) {
      toast.error(e?.data?.message || e?.message || "Enrollment failed");
    }
  };

  const handleDrop = async () => {
    try {
      await dropCourses({ courseIds: selectedDrop }).unwrap();
      toast.success("Courses dropped successfully");
      setSelectedDrop([]);
    } catch (e: any) {
      toast.error(e?.data?.message || e?.message || "Failed to drop courses");
    }
  };

  return (
    <div className="w-full">
      <Header
        schoolLogo={tenantInfo?.logoUrl}
        schoolName={tenantInfo?.name || "ParaLearn University"}
      />

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-6 md:p-10 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-black text-slate-900 font-coolvetica tracking-tight">
              Academic Registry
            </h1>
            <p className="text-slate-500 font-medium font-coolvetica mt-1">
              Select your courses for the current semester and manage your
              academic load.
            </p>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="bg-slate-50 p-1.5 rounded-2xl border border-slate-100"
          >
            <TabsList className="bg-transparent border-none">
              <TabsTrigger
                value="available"
                className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-[#641BC4] data-[state=active]:shadow-sm px-6 font-bold"
              >
                Available Courses ({eligibleCourses.length})
              </TabsTrigger>
              <TabsTrigger
                value="enrolled"
                className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-[#641BC4] data-[state=active]:shadow-sm px-6 font-bold"
              >
                My Enrollment ({enrolledCourses.length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="available">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-[#641BC4]">
                  <Library className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 font-coolvetica">
                  Eligible Courses
                </h2>
              </div>
              {selectedEnroll.length > 0 && (
                <Button
                  onClick={handleEnroll}
                  disabled={isEnrolling}
                  className="rounded-xl px-8 font-black text-white shadow-lg shadow-purple-500/20 active:scale-95 transition-all"
                  style={{ backgroundColor: primaryColor }}
                >
                  {isEnrolling
                    ? "Processing..."
                    : `Register Selected (${selectedEnroll.length})`}
                </Button>
              )}
            </div>

            {loadingEligible ? (
              <div className="py-20 text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#641BC4] mx-auto mb-4" />
                <p className="text-slate-500 font-medium">
                  Fetching available courses...
                </p>
              </div>
            ) : eligibleCourses.length === 0 ? (
              <div className="py-20 text-center bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-bold font-coolvetica">
                  No new courses available
                </p>
                <p className="text-slate-400 text-sm mt-1">
                  You've registered for all eligible courses this semester.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {eligibleCourses.map((course: any) => {
                  const isSelected = selectedEnroll.includes(course.id);
                  const isAlreadyEnrolled = enrolledCourses.some(
                    (e: any) => e.courseId === course.id || e.id === course.id,
                  );

                  if (isAlreadyEnrolled) return null;

                  return (
                    <div
                      key={course.id}
                      onClick={() => toggleEnroll(course.id)}
                      className={`group p-6 rounded-[2rem] border-2 transition-all cursor-pointer ${
                        isSelected
                          ? "border-[#641BC4] bg-[#FDFDFF] shadow-xl shadow-purple-500/5 ring-4 ring-purple-50"
                          : "border-slate-100 bg-white hover:border-slate-200 hover:shadow-md"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="font-black text-[10px] tracking-widest bg-slate-100 border-none text-slate-600 uppercase"
                          >
                            {course.code}
                          </Badge>
                          <Badge className="bg-purple-100 text-[#641BC4] hover:bg-purple-100 border-none font-bold text-[10px]">
                            {course.creditUnits} UNITS
                          </Badge>
                        </div>
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            isSelected
                              ? "bg-[#641BC4] border-[#641BC4] text-white"
                              : "border-slate-200"
                          }`}
                        >
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 stroke-[3px]" />
                          )}
                        </div>
                      </div>

                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#641BC4] transition-colors line-clamp-2 min-h-[3.5rem] font-coolvetica">
                        {course.title}
                      </h3>

                      <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-slate-500 font-medium text-xs">
                        <span className="truncate">
                          {course.department?.name || "General Studies"}
                        </span>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>SEM {course.semester || 1}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="enrolled">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 font-coolvetica">
                  Enrolled Courses
                </h2>
              </div>
              {selectedDrop.length > 0 && (
                <Button
                  onClick={handleDrop}
                  disabled={isDropping}
                  variant="destructive"
                  className="rounded-xl px-8 font-black shadow-lg shadow-red-500/20 active:scale-95 transition-all"
                >
                  {isDropping
                    ? "Dropping..."
                    : `Drop Selected (${selectedDrop.length})`}
                </Button>
              )}
            </div>

            {loadingEnrolled ? (
              <div className="py-20 text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">
                  Fetching your enrollments...
                </p>
              </div>
            ) : enrolledCourses.length === 0 ? (
              <div className="py-20 text-center bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                <Library className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-bold font-coolvetica">
                  No active enrollments
                </p>
                <p className="text-slate-400 text-sm mt-1">
                  Head back to available courses to register.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrolledCourses.map((enroll: any) => {
                  const course = enroll.course || enroll;
                  const isSelected = selectedDrop.includes(course.id);

                  return (
                    <div
                      key={course.id}
                      onClick={() => toggleDrop(course.id)}
                      className={`group p-6 rounded-[2rem] border-2 transition-all cursor-pointer ${
                        isSelected
                          ? "border-red-500 bg-red-50/10 shadow-xl shadow-red-500/5 ring-4 ring-red-50"
                          : "border-emerald-100 bg-white hover:border-emerald-200"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="font-black text-[10px] tracking-widest bg-emerald-50 border-none text-emerald-700 uppercase"
                          >
                            {course.code}
                          </Badge>
                          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none font-bold text-[10px]">
                            {course.creditUnits} UNITS
                          </Badge>
                        </div>
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            isSelected
                              ? "bg-red-500 border-red-500 text-white"
                              : "border-emerald-200"
                          }`}
                        >
                          {isSelected ? (
                            <Trash2 className="w-3.5 h-3.5" />
                          ) : (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          )}
                        </div>
                      </div>

                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2 min-h-[3.5rem] font-coolvetica">
                        {course.title}
                      </h3>

                      <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-slate-500 font-medium text-xs">
                        <span className="truncate">
                          {course.department?.name || "Major Studies"}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-600 font-bold">
                            Enrolled
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
