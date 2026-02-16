
import { routespath } from "@/lib/routepath";

/**
 * Normalizes user roles into a string array.
 * Handles various structures like objects with role names or simple string arrays.
 */
export const normalizeRoles = (roles: any): string[] => {
  if (!roles) return [];
  if (typeof roles === "string") return [roles.trim().toLowerCase()];
  if (Array.isArray(roles) && roles.every((r) => typeof r === "string")) return roles.map(r => r.trim().toLowerCase());
  if (Array.isArray(roles)) {
    return roles
      .map((r) => r?.role?.name || r?.name || r)
      .filter((v) => typeof v === "string")
      .map((v) => v.trim().toLowerCase());
  }
  return [];
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
  
  // Default to main dashboard for other roles (admin, etc.)
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
