
import { routespath } from "@/lib/routepath";

/**
 * Normalizes user roles into a string array.
 * Handles various structures like objects with role names or simple string arrays.
 */
export const normalizeRoles = (roles: any): string[] => {
  if (!roles) return [];
  
  // If roles is already an array of strings
  if (Array.isArray(roles) && roles.every((r) => typeof r === "string")) {
    return roles.map(r => r.trim().toLowerCase());
  }
  
  // If roles is an array of objects like [{role: {name: 'admin'}}]
  if (Array.isArray(roles)) {
    return roles
      .map((r) => r?.role?.name || r?.name || r)
      .filter((v) => typeof v === "string")
      .map((v) => v.trim().toLowerCase());
  }

  // If roles is a single string
  if (typeof roles === "string") return [roles.trim().toLowerCase()];

  // If roles is actually a user object containing role flags
  // These are common in some JWT payloads and backend responses
  const extractedRoles: string[] = [];
  
  // Helper to check for truthy role flags (bool true or string "true")
  const isTrue = (val: any) => val === true || val === "true" || val === 1;

  if (isTrue(roles.iadmin) || isTrue(roles.isAdmin) || roles.role === "admin") {
    extractedRoles.push("admin");
  }
  if (isTrue(roles.iseditor) || isTrue(roles.isEditor) || roles.role === "editor") {
    extractedRoles.push("editor");
  }
  
  // Also check for 'teacher' and 'student' flags if they exist
  if (isTrue(roles.isTeacher) || roles.role === "teacher") {
    extractedRoles.push("teacher");
  }
  if (isTrue(roles.isStudent) || roles.role === "student") {
    extractedRoles.push("student");
  }
  
  return extractedRoles;
};

/**
 * Determines the redirect path based on user roles.
 */
export const pickRedirectPath = (roles: string[]): string => {
  if (!roles || roles.length === 0) return routespath.DASHBOARD;
  
  if (roles.includes("teacher")) {
    return routespath.TEACHER_DASHBOARD;
  }
  
  if (roles.includes("student")) {
    return routespath.STUDENT_DASHBOARD;
  }
  
  if (roles.includes("admin") || roles.includes("editor")) {
    return routespath.DASHBOARD;
  }
  
  // Default to main dashboard
  return routespath.DASHBOARD; 
};

/**
 * Extracts authentication token and user object from API response data.
 */
export const extractTokenAndUser = (data: any) => {
  const token = data?.accessToken || data?.token;
  // Handle various user nesting possibilities
  const user = data?.user || data?.data?.user;
  return { token, user };
};

/**
 * Extracts tenant/school subdomain from user object or response data.
 * Handles the response structure: { data: { school: { subdomain: "..." } } }
 */
export const extractSubdomainFromUser = (user: any, responseData: any): string | null => {
  // Priority: 1. Response data.school.subdomain, 2. Response root subdomain, 3. School object subdomain
  return (
    responseData?.data?.school?.subdomain || 
    responseData?.subdomain || 
    responseData?.school?.subdomain ||
    null
  );
};
