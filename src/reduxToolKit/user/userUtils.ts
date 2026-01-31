
import { routespath } from "@/lib/routepath";

/**
 * Normalizes user roles into a string array.
 * Handles various structures like objects with role names or simple string arrays.
 */
export const normalizeRoles = (roles: any): string[] => {
  if (!roles) return [];
  if (Array.isArray(roles) && roles.every((r) => typeof r === "string")) return roles;
  if (Array.isArray(roles)) {
    return roles
      .map((r) => r?.role?.name || r?.name || r)
      .filter((v) => typeof v === "string");
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
  
  // Default to main dashboard for other roles (admin, student, etc.)
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
 */
export const extractSubdomainFromUser = (user: any, responseData: any): string | null => {
  // Priority: 1. Response root, 2. User object, 3. Nested objects
  return (
    responseData?.subdomain || 
    user?.subdomain || 
    user?.school?.subdomain || 
    user?.tenant?.subdomain || 
    null
  );
};
