"use client";

import { StudentDialog } from "@/components/RMS/dialogs";
import { UserDropDown } from "@/components/RMS/dropdown";
import { Header } from "@/components/RMS/header";
import { Users2, Search, MoreVertical, Download } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/reduxToolKit/store";
import { fetchAllUsers } from "@/reduxToolKit/user/userThunks";
import { exportStudentsToPDF, exportTeachersToPDF } from "@/lib/pdfExport";

export const UsersPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { students, teachers, studentCount, teacherCount, loading } = useSelector(
    (state: RootState) => state.user
  );
  const [selectedType, setSelectedType] = useState<"student" | "teacher">(
    "student"
  );

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  const vv = [
    {
      title: "Students",
      count: studentCount,
      bg_color: "#9747FF",
      type: "student",
    },
    {
      title: "Teachers",
      count: teacherCount,
      bg_color: "#9747FF4D",
      type: "teacher",
    },
  ];

  const handleStudentDeleted = () => {
    // Refetch users after deletion
    dispatch(fetchAllUsers());
  };

  const handleTeacherDeleted = () => {
    // Refetch users after deletion
    dispatch(fetchAllUsers());
  };

  const handleExportStudents = () => {
    if (students.length === 0) {
      toast.warning("No students to export");
      return;
    }
    
    const studentData = students.map((item: any) => ({
      id: item.studentId || "N/A",
      name: `${item.firstName} ${item.lastName}`,
      email: item.email || "N/A",
      dateOfBirth: item.dateOfBirth
        ? new Date(item.dateOfBirth).toLocaleDateString()
        : "N/A",
      address: item.address || "N/A",
      phoneNumber: item.phoneNumber || "N/A",
      guardianName: item.guardianName || "N/A",
      guardianPhone: item.guardianPhone || "N/A",
    }));
    
    try {
      exportStudentsToPDF(studentData);
      toast.success("Students list exported successfully!");
    } catch (error) {
      toast.error("Failed to export students list");
      console.error("Export error:", error);
    }
  };

  const handleExportTeachers = () => {
    if (teachers.length === 0) {
      toast.warning("No teachers to export");
      return;
    }
    
    const teacherData = teachers.map((item: any) => ({
      id: item.teacherId || "N/A",
      name: `${item.firstName} ${item.lastName}`,
      email: item.email || "N/A",
      dateOfBirth: item.dateOfBirth
        ? new Date(item.dateOfBirth).toLocaleDateString()
        : "N/A",
      phoneNumber: item.phoneNumber || "N/A",
      address: item.address || "N/A",
    }));
    
    try {
      exportTeachersToPDF(teacherData);
      toast.success("Teachers list exported successfully!");
    } catch (error) {
      toast.error("Failed to export teachers list");
      console.error("Export error:", error);
    }
  };

  const displayTableData =
    selectedType === "student"
      ? students.map((item: any) => ({
          db_id: item.id,
          id: item.studentId,
          name: `${item.firstName} ${item.lastName}`,
          email: item.email,
          dateOfBirth: item.dateOfBirth
            ? new Date(item.dateOfBirth).toLocaleDateString()
            : "N/A",
          address: item.address || "N/A",
          phoneNumber: item.phoneNumber || "N/A",
          guardianName: item.guardianName || "N/A",
          guardianPhone: item.guardianPhone || "N/A",
        }))
      : teachers.map((item: any) => ({
          db_id: item.id,
          id: item.teacherId,
          name: `${item.firstName} ${item.lastName}`,
          email: item.email,
          dateOfBirth: item.dateOfBirth
            ? new Date(item.dateOfBirth).toLocaleDateString()
            : "N/A",
          phoneNumber: item.phoneNumber || "N/A",
          address: item.address || "N/A",
        }));

  return (
    <div className="w-full">
      <Header schoolLogo="https://arua.org/wp-content/themes/yootheme/cache/d8/UI-logo-d8a68d3e.webp" />
      <div className="flex items-center justify-between gap-4">
        {vv.map((item, index) => (
          <div
            key={index}
            onClick={() => setSelectedType(item.type as "student" | "teacher")}
            className={`py-[30px] px-[20px] text-white flex justify-between items-center flex-1 rounded-[6px] cursor-pointer transition-all hover:opacity-80 ${
              selectedType === item.type ? "ring-2 ring-white" : ""
            }`}
            style={{ backgroundColor: item.bg_color }}
          >
            <div className="">
              <p>{item.title}</p>
              <p className="text-lg font-bold">{item.count}</p>
            </div>
            <Users2 />
          </div>
        ))}
      </div>
      <div className="flex flex-row justify-between items-center mt-[25px] gap-4">
        <div className="flex flex-row items-center border-[1px] border-gray-300 rounded-[6px] flex-1 px-[15px] py-[10px] gap-2">
          <Search className="size-[20px] text-gray-500" />
          <input
            type="text"
            placeholder="Search"
            className="w-full border-none outline-none bg-transparent text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          {selectedType === "student" ? (
            <button
              onClick={handleExportStudents}
              className="flex items-center gap-2 px-4 py-2 bg-[#9747FF] text-white rounded-[6px] hover:opacity-90 transition-all text-sm font-medium"
              disabled={students.length === 0}
            >
              <Download className="size-[16px]" />
              Export Students
            </button>
          ) : (
            <button
              onClick={handleExportTeachers}
              className="flex items-center gap-2 px-4 py-2 bg-[#9747FF] text-white rounded-[6px] hover:opacity-90 transition-all text-sm font-medium"
              disabled={teachers.length === 0}
            >
              <Download className="size-[16px]" />
              Export Teachers
            </button>
          )}
          <button className="cursor-pointer hover:opacity-80">
            <UserDropDown>
              <MoreVertical className="size-[24px] text-gray-600 cursor-pointer" />
            </UserDropDown>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center w-full my-[40px] min-h-[300px]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
            <p className="text-gray-600">Loading {selectedType}s...</p>
          </div>
        </div>
      ) : displayTableData.length > 0 ? (
        <table
          className="w-[100%] my-[20px]"
          style={{ borderCollapse: "separate", borderSpacing: "0 12px" }}
        >
          <thead>
            <tr
              style={{ backgroundColor: "#AD8ED6", borderRadius: "6px" }}
              className=""
            >
              {Object.keys(displayTableData[0])
                .filter((key) => key !== "db_id")
                .map((key: string, idx: number) => (
                  <th
                    key={key}
                    className="p-2 text-white text-[12px]"
                    style={{
                      borderRadius:
                        idx === 0
                          ? "6px 0 0 6px"
                          : idx ===
                            Object.keys(displayTableData[0]).filter(
                              (k) => k !== "db_id"
                            ).length -
                              1
                          ? "0 6px 6px 0"
                          : "0",
                    }}
                  >
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {displayTableData.map((row: any, index: number) => (
              <StudentDialog
                props={row}
                key={index}
                onStudentDeleted={
                  selectedType === "student"
                    ? handleStudentDeleted
                    : handleTeacherDeleted
                }
              >
                <tr
                  style={{
                    backgroundColor: index % 2 === 0 ? "white" : "#EDEAFB",
                  }}
                  className=""
                >
                  {Object.keys(row)
                    .filter((key) => key !== "db_id")
                    .map((key: string, cellIndex: number) => (
                      <td
                        key={cellIndex}
                        className="p-2 text-[12px]"
                        style={{
                          color: row[key] == "Published" ? "green" : "black",
                        }}
                      >
                        {String(row[key])}
                      </td>
                    ))}
                </tr>
              </StudentDialog>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="flex items-center justify-center w-full my-[40px] min-h-[300px]">
          <p className="text-gray-600">No {selectedType}s found</p>
        </div>
      )}
    </div>
  );
};
