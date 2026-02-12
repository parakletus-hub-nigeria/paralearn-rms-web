export const routespath = {
  DASHBOARD: "/RMS/dashboard",
  PROFILE: "/RMS/profile",
  REPORT: "/RMS/report",
  USERS: "/RMS/users",
  BULK_UPLOAD: "/RMS/bulk_upload",
  // Admin modules (from TEACHER_ADMIN_GUIDE.md)
  CLASSES: "/RMS/classes",
  SUBJECTS: "/RMS/subjects",
  ASSESSMENTS: "/RMS/assessments",
  SCORES: "/RMS/scores",
  COMMENTS: "/RMS/comments",
  ATTENDANCE: "/RMS/attendance",
  ACADEMIC: "/RMS/academic",
  SCHOOL_SETTINGS: "/RMS/school-settings",
  ENROLLMENTS: "/RMS/enrollments",
  // Teacher routes
  TEACHER_DASHBOARD: "/teacher/dashboard",
  TEACHER_CLASSES: "/teacher/classes",
  TEACHER_ASSESSMENTS: "/teacher/assessments",
  TEACHER_SCORES: "/teacher/scores",
  TEACHER_COMMENTS: "/teacher/comments",
  TEACHER_REPORTS: "/teacher/reports",
  SIGNIN: "/auth/signin",
  SIGNUP: "/auth/signup",
  RESET_PASSWORD: "/auth/reset-password",
  // Endpoints for our backend calls
  API_LOGIN: "/auth/login",
  API_LOGOUT: "/auth/logout",
  API_REFRESH: "/auth/refresh-token",
  API_SIGNUP: "/auth/signup",
  API_USER_PROFILE: "/user/profile",
  API_FORGOT_PASSWORD: "/auth/forgot-password",
  API_RESET_PASSWORD: "/auth/reset-password",
  // Academic Session endpoints
  API_CREATE_ACADEMIC_SESSION: "/academic/sessions",
  API_GET_ALL_SESSIONS: "/academic/sessions",
  API_GET_CURRENT_SESSION: "/academic/current",
  API_UPDATE_CURRENT_SESSION: "/academic/sessions/current/update",
  // Class endpoints
  API_CREATE_CLASS: "/classes",
  // Subject endpoints
  API_CREATE_SUBJECT: "/subjects",
  // School Settings endpoints
  API_UPDATE_GRADING_SCALE: "/school-settings/grading",
  // Onboarding Wizard endpoints
  API_ONBOARDING_SETUP: "/onboarding/setup",
  // Public endpoints
  API_GET_SUBDOMAINS: "/academic/subdomains",
};
