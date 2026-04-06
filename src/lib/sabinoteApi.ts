import { createApiClient } from "./apiFactory";

/**
 * Specialized Axios instance for the SabiNote Lesson Generator service.
 * It uses the same backend as the rest of the application but forces
 * the 'sabinote' tenant context via headers.
 */
const STANDALONE_TOKEN_KEY = "sabiStandaloneToken";

const sabinoteApi = createApiClient(""); // Uses NextJS relative proxy routing

// Interceptor 1: inject standalone JWT when no main-app token is already set
sabinoteApi.interceptors.request.use((config) => {
  const alreadyHasAuth = config.headers?.["Authorization"] || config.headers?.["authorization"];
  if (!alreadyHasAuth && typeof window !== "undefined") {
    const standaloneToken = localStorage.getItem(STANDALONE_TOKEN_KEY);
    if (standaloneToken) {
      if (typeof config.headers?.set === "function") {
        config.headers.set("Authorization", `Bearer ${standaloneToken}`);
      } else if (config.headers) {
        config.headers["Authorization"] = `Bearer ${standaloneToken}`;
      }
    }
  }
  return config;
});

// Interceptor 2: force sabinote tenant + rewrite URL to /api/proxy/lesson-generator/**
sabinoteApi.interceptors.request.use((config) => {
  // 1. Ensure the 'X-Tenant-Subdomain' is ALWAYS 'sabinote' for this service
  if (config.headers) {
    if (typeof config.headers.set === "function") {
      config.headers.set("X-Tenant-Subdomain", "sabinote");
    } else {
      config.headers["X-Tenant-Subdomain"] = "sabinote";
    }
  }

  // 2. Ensure the full proxy path and lesson-generator prefix is present
  if (config.url && !config.url.startsWith("http")) {
    let url = config.url.startsWith("/") ? config.url : `/${config.url}`;
    
    // Ensure /api/proxy prefix
    if (!url.startsWith("/api/proxy")) {
      url = `/api/proxy${url}`;
    }
    
    // Ensure /lesson-generator sub-path
    if (!url.includes("/lesson-generator")) {
      // If the URL was just "/api/proxy", it becomes "/api/proxy/lesson-generator/"
      // If it was "/api/proxy/history", it becomes "/api/proxy/lesson-generator/history"
      url = url.replace("/api/proxy", "/api/proxy/lesson-generator");
    }
    
    config.url = url;
  }
  
  return config;
});

export default sabinoteApi;
