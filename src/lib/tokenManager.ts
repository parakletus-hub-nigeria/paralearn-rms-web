import Cookies from "js-cookie";

const TOKEN_KEY = "accessToken";

// Helper to get the base domain for cross-subdomain cookies
const getCookieDomain = () => {
  if (typeof window === "undefined") return undefined;
  const hostname = window.location.hostname;
  const isLocalhost = hostname === "localhost" || hostname.endsWith(".localhost") || hostname === "127.0.0.1";

  if (isLocalhost) {
    // Return .localhost to allow sharing across subdomain.localhost and localhost
    // Note: Some browsers might be picky about 'localhost' vs '.localhost', 
    // but .localhost is the modern standard for subdomains.
    return ".localhost";
  }
  
  // For production domains (e.g., school.pln.ng -> .pln.ng)
  const parts = hostname.split(".");
  if (parts.length >= 2) {
    return "." + parts.slice(-2).join(".");
  }
  return undefined;
};

const getCookieOptions = () => ({
  expires: 7, // 7 days
  path: "/",
  domain: getCookieDomain(),
  secure: typeof window !== "undefined" && window.location.protocol === "https:",
  sameSite: "lax" as const, // Changed from strict to lax to allow cross-subdomain navigation
});


// Helper to manage our auth token in cookies
export const tokenManager = {
  // Grab token from cookies (client-side only)
  getToken(): string | undefined {
    if (typeof window === "undefined") {
      return undefined;
    }
    return Cookies.get(TOKEN_KEY);
  },

  // Save the token
  setToken(token: string): void {
    if (typeof window === "undefined") {
      return;
    }
    Cookies.set(TOKEN_KEY, token, getCookieOptions());
  },

  // Kill the token
  removeToken(): void {
    if (typeof window === "undefined") {
      return;
    }
    
    // Get all possible domain variations
    const hostname = window.location.hostname;
    const cookieDomain = getCookieDomain();
    
    // Try to remove in all possible configurations
    const removalConfigs = [
      { path: "/" }, // No domain (current exact domain)
      { path: "/", domain: cookieDomain }, // Base domain (.localhost or .pln.ng)
      { path: "/", domain: hostname }, // Current hostname
      { path: "/", domain: `.${hostname}` }, // Current hostname with dot prefix
    ];
    
    // Also try without dot for localhost
    if (hostname === "localhost" || hostname.endsWith(".localhost")) {
      removalConfigs.push(
        { path: "/", domain: "localhost" },
        { path: "/", domain: ".localhost" }
      );
    }
    
    // Remove token with all configurations
    removalConfigs.forEach(config => {
      Cookies.remove(TOKEN_KEY, config);
    });
  },

  // Helper to see if we're logged in
  hasToken(): boolean {
    return !!this.getToken();
  },

  // Nuke all auth-related cookies
  clearAllAuthCookies(): void {
    if (typeof window === "undefined") {
      return;
    }
    
    // Use the same comprehensive removal as removeToken
    this.removeToken();
    
    // Also manually clear localStorage user data
    try {
      localStorage.removeItem("currentUser");
    } catch (e) {
      // Silent fail
    }
  },
};

export default tokenManager;
