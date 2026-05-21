import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "./store";

// ---------------------------------------------------------------------------
// User slice selectors
// ---------------------------------------------------------------------------
export const selectUserSlice = (s: RootState) => s.user;

export const selectDashboardUserData = createSelector(
  selectUserSlice,
  (user) => ({
    studentCount: user.studentCount,
    teacherCount: user.teacherCount,
    tenantInfo: user.tenantInfo,
  })
);

export const selectTeachers = createSelector(
  selectUserSlice,
  (user) => user.teachers
);

export const selectStudents = createSelector(
  selectUserSlice,
  (user) => user.students
);

// ---------------------------------------------------------------------------
// Admin slice selectors
// ---------------------------------------------------------------------------
export const selectAdminSlice = (s: RootState) => s.admin;

export const selectAdminClasses = createSelector(
  selectAdminSlice,
  (admin) => ({
    classes: admin.classes,
    loading: admin.loading,
    error: admin.error,
    success: admin.success,
    schoolSettings: admin.schoolSettings,
  })
);

export const selectAdminClassDetails = createSelector(
  selectAdminSlice,
  (admin) => ({
    selectedClassDetails: admin.selectedClassDetails,
    selectedClassSubjects: admin.selectedClassSubjects,
  })
);

export const selectAdminSubjects = createSelector(
  selectAdminSlice,
  (admin) => ({
    subjects: admin.subjects,
    classes: admin.classes,
    loading: admin.loading,
    error: admin.error,
    success: admin.success,
    schoolSettings: admin.schoolSettings,
  })
);

// ---------------------------------------------------------------------------
// SetUp slice selectors
// ---------------------------------------------------------------------------
export const selectCurrentSession = createSelector(
  (s: RootState) => s.setUp,
  (setUp) => setUp.currentSession
);
