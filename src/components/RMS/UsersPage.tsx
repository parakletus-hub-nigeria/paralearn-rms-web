"use client";

import Image from "next/image";
import { StudentDialog } from "@/components/RMS/dialogs";
import { UserDropDown } from "@/components/RMS/dropdown";
import { Header } from "@/components/RMS/header";
import { Users2, Search, MoreVertical, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/reduxToolKit/store";
import { fetchAllUsers } from "@/reduxToolKit/user/userThunks";
import { exportStudentsToPDF, exportTeachersToPDF } from "@/lib/pdfExport";
import logo from "../../../public/mainLogo.svg";

export const UsersPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { students, teachers, studentCount, teacherCount, loading } = useSelector(
    (state: RootState) => state.user
  );
  const [selectedType, setSelectedType] = useState<"student" | "teacher">(
    "student"
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  // Reset to page 1 when switching between student/teacher or changing search
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedType, searchQuery]);

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

  // Filter and paginate data
  const allTableData = useMemo(() => {
    const data =
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

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return data.filter((item: any) =>
        Object.values(item)
          .filter((val) => val !== "db_id")
          .some((val) => String(val).toLowerCase().includes(query))
      );
    }

    return data;
  }, [selectedType, students, teachers, searchQuery]);

  // Calculate pagination
  const totalPages = Math.ceil(allTableData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayTableData = allTableData.slice(startIndex, endIndex);
  const totalItems = allTableData.length;
  const showingFrom = totalItems > 0 ? startIndex + 1 : 0;
  const showingTo = Math.min(endIndex, totalItems);

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
            placeholder="Search by name, email, ID, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
          <div className="relative w-20 h-20 flex items-center justify-center">
            <Image
              src={logo}
              alt="Loading"
              width={80}
              height={80}
              className="animate-pulse drop-shadow-lg"
              priority
            />
          </div>
        </div>
      ) : displayTableData.length > 0 || allTableData.length > 0 ? (
        <>
          <table
            className="w-[100%] my-[20px]"
            style={{ borderCollapse: "separate", borderSpacing: "0 12px" }}
          >
            <thead>
              <tr
                style={{ backgroundColor: "#AD8ED6", borderRadius: "6px" }}
                className=""
              >
                {displayTableData.length > 0 &&
                  Object.keys(displayTableData[0])
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
                  key={row.db_id || index}
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

          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 px-2">
            {/* Items per page selector and info */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Items per page:</label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#9747FF]"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold">{showingFrom}</span> to{" "}
                <span className="font-semibold">{showingTo}</span> of{" "}
                <span className="font-semibold">{totalItems}</span> {selectedType}s
              </p>
            </div>

            {/* Pagination buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {(() => {
                  const pages: number[] = [];
                  
                  if (totalPages <= 5) {
                    // Show all pages if 5 or fewer
                    for (let i = 1; i <= totalPages; i++) {
                      pages.push(i);
                    }
                  } else {
                    // Always show first page
                    pages.push(1);
                    
                    // Calculate middle pages
                    let startPage = Math.max(2, currentPage - 1);
                    let endPage = Math.min(totalPages - 1, currentPage + 1);
                    
                    // Adjust if we're near the start
                    if (currentPage <= 3) {
                      startPage = 2;
                      endPage = Math.min(4, totalPages - 1);
                    }
                    
                    // Adjust if we're near the end
                    if (currentPage >= totalPages - 2) {
                      startPage = Math.max(2, totalPages - 3);
                      endPage = totalPages - 1;
                    }
                    
                    // Add ellipsis if there's a gap after page 1
                    if (startPage > 2) {
                      pages.push(-1); // -1 represents ellipsis
                    }
                    
                    // Add middle pages
                    for (let i = startPage; i <= endPage; i++) {
                      if (i !== 1 && i !== totalPages) {
                        pages.push(i);
                      }
                    }
                    
                    // Add ellipsis if there's a gap before last page
                    if (endPage < totalPages - 1) {
                      pages.push(-2); // -2 represents ellipsis before last
                    }
                    
                    // Always show last page
                    if (totalPages > 1) {
                      pages.push(totalPages);
                    }
                  }
                  
                  return pages.map((pageNum, idx) => {
                    if (pageNum === -1 || pageNum === -2) {
                      return (
                        <span key={`ellipsis-${idx}`} className="px-2 text-gray-500">
                          ...
                        </span>
                      );
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-2 text-sm font-medium rounded-md transition-all ${
                          currentPage === pageNum
                            ? "bg-[#9747FF] text-white shadow-md"
                            : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  });
                })()}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center w-full my-[40px] min-h-[300px]">
          <p className="text-gray-600">
            {searchQuery
              ? `No ${selectedType}s found matching "${searchQuery}"`
              : `No ${selectedType}s found`}
          </p>
        </div>
      )}
    </div>
  );
};
