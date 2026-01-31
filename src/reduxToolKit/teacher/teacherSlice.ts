"use client";

import { createSlice } from "@reduxjs/toolkit";
import type { AcademicCurrent, Assessment, TeacherComment } from "./teacherThunks";
import {
  addComment,
  bulkUploadScoresExcel,
  fetchAcademicCurrent,
  fetchAssessmentDetail,
  fetchAssessmentSubmissions,
  fetchAssessmentsByStatus,
  fetchBookletPreview,
  fetchMyAssessments,
  fetchMyComments,
  fetchScoresByAssessmentTeacher,
  fetchTeacherClasses,
  gradeAnswer,
  createTeacherAssessment,
  publishAssessment,
  submitReportsForApproval,
  uploadOfflineScores,
  fetchClassStudents,
  fetchClassSubjects,
} from "./teacherThunks";

type TeacherState = {
  academicCurrent: AcademicCurrent | null;
  assessments: Assessment[];
  assessmentsByStatus: Record<string, Assessment[]>;
  selectedAssessment: Assessment | null;
  submissions: any[];
  teacherClasses: any[];
  classStudents: any[];
  classSubjects: any[];
  scores: any[];
  comments: TeacherComment[];
  bookletPreview: any | null;
  loading: boolean;
  error: string | null;
  success: string | null;
};

const initialState: TeacherState = {
  academicCurrent: null,
  assessments: [],
  assessmentsByStatus: {},
  selectedAssessment: null,
  submissions: [],
  teacherClasses: [],
  classStudents: [],
  classSubjects: [],
  scores: [],
  comments: [],
  bookletPreview: null,
  loading: false,
  error: null,
  success: null,
};

const teacherSlice = createSlice({
  name: "teacher",
  initialState,
  reducers: {
    clearTeacherError: (state) => {
      state.error = null;
    },
    clearTeacherSuccess: (state) => {
      state.success = null;
    },
    clearSelectedAssessment: (state) => {
      state.selectedAssessment = null;
      state.submissions = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAcademicCurrent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAcademicCurrent.fulfilled, (state, action) => {
        state.loading = false;
        state.academicCurrent = action.payload;
      })
      .addCase(fetchAcademicCurrent.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to load academic session";
      });

    builder
      .addCase(fetchMyAssessments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyAssessments.fulfilled, (state, action) => {
        state.loading = false;
        state.assessments = action.payload;
      })
      .addCase(fetchMyAssessments.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to load assessments";
      });

    builder
      .addCase(fetchTeacherClasses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeacherClasses.fulfilled, (state, action) => {
        state.loading = false;
        state.teacherClasses = action.payload;
      })
      .addCase(fetchTeacherClasses.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to load teacher classes";
      });

    builder
      .addCase(createTeacherAssessment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTeacherAssessment.fulfilled, (state) => {
        state.loading = false;
        state.success = "Assessment created";
      })
      .addCase(createTeacherAssessment.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to create assessment";
      });

    builder
      .addCase(fetchAssessmentsByStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssessmentsByStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.assessmentsByStatus[action.payload.status] = action.payload.items;
      })
      .addCase(fetchAssessmentsByStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to load assessments";
      });

    builder
      .addCase(fetchAssessmentDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.selectedAssessment = null;
      })
      .addCase(fetchAssessmentDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedAssessment = action.payload;
      })
      .addCase(fetchAssessmentDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to load assessment";
      });

    builder
      .addCase(fetchAssessmentSubmissions.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.submissions = [];
      })
      .addCase(fetchAssessmentSubmissions.fulfilled, (state, action) => {
        state.loading = false;
        state.submissions = action.payload;
      })
      .addCase(fetchAssessmentSubmissions.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to load submissions";
      });

    builder
      .addCase(fetchScoresByAssessmentTeacher.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.scores = [];
      })
      .addCase(fetchScoresByAssessmentTeacher.fulfilled, (state, action) => {
        state.loading = false;
        state.scores = action.payload;
      })
      .addCase(fetchScoresByAssessmentTeacher.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to load scores";
      });

    builder
      .addCase(publishAssessment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(publishAssessment.fulfilled, (state) => {
        state.loading = false;
        state.success = "Publish status updated";
      })
      .addCase(publishAssessment.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to update publish state";
      });

    builder
      .addCase(gradeAnswer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(gradeAnswer.fulfilled, (state) => {
        state.loading = false;
        state.success = "Answer graded";
      })
      .addCase(gradeAnswer.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to grade answer";
      });

    builder
      .addCase(uploadOfflineScores.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadOfflineScores.fulfilled, (state) => {
        state.loading = false;
        state.success = "Scores uploaded";
      })
      .addCase(uploadOfflineScores.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to upload scores";
      });

    builder
      .addCase(bulkUploadScoresExcel.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bulkUploadScoresExcel.fulfilled, (state) => {
        state.loading = false;
        state.success = "Bulk scores uploaded";
      })
      .addCase(bulkUploadScoresExcel.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to bulk upload scores";
      });

    builder
      .addCase(addComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addComment.fulfilled, (state, action) => {
        state.loading = false;
        state.success = "Comment added";
        // Optimistic: append if it looks like a comment object
        if (action.payload?.studentId && action.payload?.comment) {
          state.comments = [action.payload, ...state.comments];
        }
      })
      .addCase(addComment.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to add comment";
      });

    builder
      .addCase(fetchMyComments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyComments.fulfilled, (state, action) => {
        state.loading = false;
        state.comments = action.payload;
      })
      .addCase(fetchMyComments.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to load comments";
      });

    builder
      .addCase(fetchBookletPreview.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.bookletPreview = null;
      })
      .addCase(fetchBookletPreview.fulfilled, (state, action) => {
        state.loading = false;
        state.bookletPreview = action.payload;
      })
      .addCase(fetchBookletPreview.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to load booklet preview";
      });

    builder
      .addCase(submitReportsForApproval.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitReportsForApproval.fulfilled, (state) => {
        state.loading = false;
        state.success = "Submitted for approval";
      })
      .addCase(submitReportsForApproval.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to submit for approval";
      });

    builder
      .addCase(fetchClassStudents.pending, (state) => {
        state.classStudents = [];
      })
      .addCase(fetchClassStudents.fulfilled, (state, action) => {
        state.classStudents = action.payload;
      })
      .addCase(fetchClassStudents.rejected, (state) => {
        state.classStudents = [];
      });

    builder
      .addCase(fetchClassSubjects.pending, (state) => {
        state.classSubjects = [];
      })
      .addCase(fetchClassSubjects.fulfilled, (state, action) => {
        state.classSubjects = action.payload;
      })
      .addCase(fetchClassSubjects.rejected, (state) => {
        state.classSubjects = [];
      });
  },
});

export const { clearTeacherError, clearTeacherSuccess, clearSelectedAssessment } =
  teacherSlice.actions;
export default teacherSlice.reducer;

