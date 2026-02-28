"use client";

import { createSlice } from "@reduxjs/toolkit";
import type { AssessmentItem, ClassItem, SchoolStatistics, SubjectItem } from "./adminThunks";
import {
  addCommentAdmin,
  approveReports,
  assignTeacherToClass,
  assignTeacherToSubject,
  bulkAddComments,
  bulkEnrollStudents,
  bulkUploadQuestions,
  bulkUploadScores,
  createAssessment,
  createClass,
  createSubject,
  enrollStudentToClass,
  fetchAttendance,
  fetchApprovalQueue,
  fetchAssessments,
  fetchBookletPreviewAdmin,
  fetchClasses,
  fetchClassDetails,
  fetchStudentComments,
  fetchGradingSystem,
  fetchGradingTemplates,
  fetchSchoolStatistics,
  fetchSchoolSettings,
  fetchScoresByAssessment,
  fetchSubjects,
  fetchTeacherAssignedClasses,
  publishAssessmentAdmin,
  recordAttendance,
  removeStudentFromClass,
  removeTeacherFromClass,
  updateAssessment,
  updateGradingSystem,
  updateSchoolSettings,
  fetchAssessmentCategoriesMap,
  createAssessmentCategory,
  deleteAssessmentCategory,
  deleteAssessment,
} from "./adminThunks";

type AdminState = {
  loading: boolean;
  error: string | null;
  success: string | null;

  classes: ClassItem[];
  subjects: SubjectItem[];
  assessments: AssessmentItem[];

  scores: any[];

  schoolStatistics: SchoolStatistics | null;
  approvalQueue: any[];
  bookletPreview: any | null;

  schoolSettings: any | null;
  gradingTemplates: any[];
  gradingSystem: any | null;
  attendance: any[];
  comments: any[];

  // Class details with enrolled students
  selectedClassDetails: any | null;
  // Teacher's assigned classes
  // Teacher's assigned classes
  teacherClasses: any | null;
  assessmentCategories: any[];
};

const initialState: AdminState = {
  loading: false,
  error: null,
  success: null,
  classes: [],
  subjects: [],
  assessments: [],
  scores: [],
  schoolStatistics: null,
  approvalQueue: [],
  bookletPreview: null,
  schoolSettings: null,
  gradingTemplates: [],
  gradingSystem: null,
  attendance: [],
  comments: [],
  selectedClassDetails: null,
  teacherClasses: null,
  assessmentCategories: [],
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    clearAdminError: (state) => {
      state.error = null;
    },
    clearAdminSuccess: (state) => {
      state.success = null;
    },
    clearBookletPreview: (state) => {
      state.bookletPreview = null;
    },
  },
  extraReducers: (builder) => {
    const pending = (state: AdminState) => {
      state.loading = true;
      state.error = null;
      state.success = null;
    };
    const rejected = (state: AdminState, action: any, fallback: string) => {
      state.loading = false;
      state.error = (action.payload as string) || fallback;
    };

    builder
      .addCase(fetchClasses.pending, pending)
      .addCase(fetchClasses.fulfilled, (state, action) => {
        state.loading = false;
        state.classes = action.payload;
      })
      .addCase(fetchClasses.rejected, (state, action) => rejected(state, action, "Failed to load classes"));

    builder
      .addCase(createClass.pending, pending)
      .addCase(createClass.fulfilled, (state, action) => {
        state.loading = false;
        state.classes = [action.payload, ...state.classes];
        state.success = "Class created";
      })
      .addCase(createClass.rejected, (state, action) => rejected(state, action, "Failed to create class"));

    builder
      .addCase(assignTeacherToClass.pending, pending)
      .addCase(assignTeacherToClass.fulfilled, (state) => {
        state.loading = false;
        state.success = "Teacher assigned to class";
      })
      .addCase(assignTeacherToClass.rejected, (state, action) => rejected(state, action, "Failed to assign teacher"));

    builder
      .addCase(enrollStudentToClass.pending, pending)
      .addCase(enrollStudentToClass.fulfilled, (state) => {
        state.loading = false;
        state.success = "Student enrolled";
      })
      .addCase(enrollStudentToClass.rejected, (state, action) => rejected(state, action, "Failed to enroll student"));

    builder
      .addCase(fetchSubjects.pending, pending)
      .addCase(fetchSubjects.fulfilled, (state, action) => {
        state.loading = false;
        state.subjects = action.payload;
      })
      .addCase(fetchSubjects.rejected, (state, action) => rejected(state, action, "Failed to load subjects"));

    builder
      .addCase(createSubject.pending, pending)
      .addCase(createSubject.fulfilled, (state, action) => {
        state.loading = false;
        state.subjects = [action.payload, ...state.subjects];
        state.success = "Subject created";
      })
      .addCase(createSubject.rejected, (state, action) => rejected(state, action, "Failed to create subject"));

    builder
      .addCase(assignTeacherToSubject.pending, pending)
      .addCase(assignTeacherToSubject.fulfilled, (state) => {
        state.loading = false;
        state.success = "Teacher assigned to subject";
      })
      .addCase(assignTeacherToSubject.rejected, (state, action) => rejected(state, action, "Failed to assign teacher"));

    builder
      .addCase(fetchAssessments.pending, pending)
      .addCase(fetchAssessments.fulfilled, (state, action) => {
        state.loading = false;
        state.assessments = action.payload;
      })
      .addCase(fetchAssessments.rejected, (state, action) => rejected(state, action, "Failed to load assessments"));

    builder
      .addCase(createAssessment.pending, pending)
      .addCase(createAssessment.fulfilled, (state, action) => {
        state.loading = false;
        state.assessments = [action.payload, ...state.assessments];
        state.success = "Assessment created";
      })
      .addCase(createAssessment.rejected, (state, action) => rejected(state, action, "Failed to create assessment"));

    builder
      .addCase(updateAssessment.pending, pending)
      .addCase(updateAssessment.fulfilled, (state, action) => {
        state.loading = false;
        state.assessments = state.assessments.map((a) => (a.id === action.payload.id ? action.payload : a));
        state.success = "Assessment updated";
      })
      .addCase(updateAssessment.rejected, (state, action) => rejected(state, action, "Failed to update assessment"));

    builder
      .addCase(deleteAssessment.pending, pending)
      .addCase(deleteAssessment.fulfilled, (state, action) => {
        state.loading = false;
        state.assessments = state.assessments.filter((a) => a.id !== action.payload);
        state.success = "Assessment deleted";
      })
      .addCase(deleteAssessment.rejected, (state, action) => rejected(state, action, "Failed to delete assessment"));

    builder
      .addCase(publishAssessmentAdmin.pending, pending)
      .addCase(publishAssessmentAdmin.fulfilled, (state) => {
        state.loading = false;
        state.success = "Publish status updated";
      })
      .addCase(publishAssessmentAdmin.rejected, (state, action) => rejected(state, action, "Failed to publish assessment"));

    builder
      .addCase(bulkUploadQuestions.pending, pending)
      .addCase(bulkUploadQuestions.fulfilled, (state) => {
        state.loading = false;
        state.success = "Questions uploaded";
      })
      .addCase(bulkUploadQuestions.rejected, (state, action) => rejected(state, action, "Failed to upload questions"));

    builder
      .addCase(fetchScoresByAssessment.pending, pending)
      .addCase(fetchScoresByAssessment.fulfilled, (state, action) => {
        state.loading = false;
        state.scores = action.payload;
      })
      .addCase(fetchScoresByAssessment.rejected, (state, action) => rejected(state, action, "Failed to load scores"));

    builder
      .addCase(bulkUploadScores.pending, pending)
      .addCase(bulkUploadScores.fulfilled, (state) => {
        state.loading = false;
        state.success = "Scores uploaded";
      })
      .addCase(bulkUploadScores.rejected, (state, action) => rejected(state, action, "Failed to upload scores"));

    builder
      .addCase(fetchSchoolStatistics.pending, pending)
      .addCase(fetchSchoolStatistics.fulfilled, (state, action) => {
        state.loading = false;
        state.schoolStatistics = action.payload;
      })
      .addCase(fetchSchoolStatistics.rejected, (state, action) => rejected(state, action, "Failed to load statistics"));

    builder
      .addCase(fetchApprovalQueue.pending, pending)
      .addCase(fetchApprovalQueue.fulfilled, (state, action) => {
        state.loading = false;
        state.approvalQueue = action.payload;
      })
      .addCase(fetchApprovalQueue.rejected, (state, action) => rejected(state, action, "Failed to load approval queue"));

    builder
      .addCase(approveReports.pending, pending)
      .addCase(approveReports.fulfilled, (state) => {
        state.loading = false;
        state.success = "Reports updated";
      })
      .addCase(approveReports.rejected, (state, action) => rejected(state, action, "Failed to update reports"));

    builder
      .addCase(fetchBookletPreviewAdmin.pending, pending)
      .addCase(fetchBookletPreviewAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.bookletPreview = action.payload;
      })
      .addCase(fetchBookletPreviewAdmin.rejected, (state, action) =>
        rejected(state, action, "Failed to load booklet preview")
      );

    builder
      .addCase(fetchSchoolSettings.pending, pending)
      .addCase(fetchSchoolSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.schoolSettings = action.payload;
      })
      .addCase(fetchSchoolSettings.rejected, (state, action) =>
        rejected(state, action, "Failed to load school settings")
      );

    builder
      .addCase(updateSchoolSettings.pending, pending)
      .addCase(updateSchoolSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.schoolSettings = action.payload;
        state.success = "School settings updated";
      })
      .addCase(updateSchoolSettings.rejected, (state, action) =>
        rejected(state, action, "Failed to update school settings")
      );

    builder
      .addCase(fetchGradingTemplates.pending, pending)
      .addCase(fetchGradingTemplates.fulfilled, (state, action) => {
        state.loading = false;
        state.gradingTemplates = action.payload;
      })
      .addCase(fetchGradingTemplates.rejected, (state, action) =>
        rejected(state, action, "Failed to load grading templates")
      );

    builder
      .addCase(fetchGradingSystem.pending, pending)
      .addCase(fetchGradingSystem.fulfilled, (state, action) => {
        state.loading = false;
        state.gradingSystem = action.payload;
      })
      .addCase(fetchGradingSystem.rejected, (state, action) =>
        rejected(state, action, "Failed to load grading system")
      );

    builder
      .addCase(updateGradingSystem.pending, pending)
      .addCase(updateGradingSystem.fulfilled, (state, action) => {
        state.loading = false;
        state.gradingSystem = action.payload;
        state.success = "Grading system updated";
      })
      .addCase(updateGradingSystem.rejected, (state, action) =>
        rejected(state, action, "Failed to update grading system")
      );

    builder
      .addCase(recordAttendance.pending, pending)
      .addCase(recordAttendance.fulfilled, (state) => {
        state.loading = false;
        state.success = "Attendance recorded";
      })
      .addCase(recordAttendance.rejected, (state, action) =>
        rejected(state, action, "Failed to record attendance")
      );

    builder
      .addCase(fetchAttendance.pending, pending)
      .addCase(fetchAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.attendance = action.payload;
      })
      .addCase(fetchAttendance.rejected, (state, action) =>
        rejected(state, action, "Failed to fetch attendance")
      );

    builder
      .addCase(fetchStudentComments.pending, pending)
      .addCase(fetchStudentComments.fulfilled, (state, action) => {
        state.loading = false;
        state.comments = action.payload;
      })
      .addCase(fetchStudentComments.rejected, (state, action) =>
        rejected(state, action, "Failed to fetch comments")
      );

    builder
      .addCase(addCommentAdmin.pending, pending)
      .addCase(addCommentAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.success = "Comment added";
        if (action.payload) state.comments = [action.payload, ...state.comments];
      })
      .addCase(addCommentAdmin.rejected, (state, action) =>
        rejected(state, action, "Failed to add comment")
      );

    builder
      .addCase(bulkAddComments.pending, pending)
      .addCase(bulkAddComments.fulfilled, (state) => {
        state.loading = false;
        state.success = "Comments added";
      })
      .addCase(bulkAddComments.rejected, (state, action) =>
        rejected(state, action, "Failed to bulk add comments")
      );

    // Fetch class details with enrolled students
    builder
      .addCase(fetchClassDetails.pending, pending)
      .addCase(fetchClassDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedClassDetails = action.payload;
      })
      .addCase(fetchClassDetails.rejected, (state, action) =>
        rejected(state, action, "Failed to fetch class details")
      );

    // Bulk enroll students
    builder
      .addCase(bulkEnrollStudents.pending, pending)
      .addCase(bulkEnrollStudents.fulfilled, (state) => {
        state.loading = false;
        state.success = "Students enrolled successfully";
      })
      .addCase(bulkEnrollStudents.rejected, (state, action) =>
        rejected(state, action, "Failed to enroll students")
      );

    // Remove student from class
    builder
      .addCase(removeStudentFromClass.pending, pending)
      .addCase(removeStudentFromClass.fulfilled, (state) => {
        state.loading = false;
        state.success = "Student removed from class";
      })
      .addCase(removeStudentFromClass.rejected, (state, action) =>
        rejected(state, action, "Failed to remove student")
      );

    // Fetch teacher assigned classes
    builder
      .addCase(fetchTeacherAssignedClasses.pending, pending)
      .addCase(fetchTeacherAssignedClasses.fulfilled, (state, action) => {
        state.loading = false;
        state.teacherClasses = action.payload;
      })
      .addCase(fetchTeacherAssignedClasses.rejected, (state, action) =>
        rejected(state, action, "Failed to fetch teacher classes")
      );

    // Remove teacher from class
    builder
      .addCase(removeTeacherFromClass.pending, pending)
      .addCase(removeTeacherFromClass.fulfilled, (state) => {
        state.loading = false;
        state.success = "Teacher removed from class";
      })
      .addCase(removeTeacherFromClass.rejected, (state, action) =>
        rejected(state, action, "Failed to remove teacher")
      );
  // Assessment Categories
    builder
      .addCase(fetchAssessmentCategoriesMap.pending, pending)
      .addCase(fetchAssessmentCategoriesMap.fulfilled, (state, action) => {
        state.loading = false;
        state.assessmentCategories = action.payload;
      })
      .addCase(fetchAssessmentCategoriesMap.rejected, (state, action) =>
        rejected(state, action, "Failed to load assessment categories")
      );

    builder
      .addCase(createAssessmentCategory.pending, pending)
      .addCase(createAssessmentCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.assessmentCategories = [action.payload, ...state.assessmentCategories];
        state.success = "Assessment category created";
      })
      .addCase(createAssessmentCategory.rejected, (state, action) =>
        rejected(state, action, "Failed to create assessment category")
      );

    builder
      .addCase(deleteAssessmentCategory.pending, pending)
      .addCase(deleteAssessmentCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.assessmentCategories = state.assessmentCategories.filter((c) => c.id !== action.payload);
        state.success = "Assessment category deleted";
      })
      .addCase(deleteAssessmentCategory.rejected, (state, action) =>
        rejected(state, action, "Failed to delete assessment category")
      );
  },
});

export const { clearAdminError, clearAdminSuccess, clearBookletPreview } = adminSlice.actions;
export default adminSlice.reducer;

