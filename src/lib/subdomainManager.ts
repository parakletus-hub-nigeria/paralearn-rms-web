/**
 * Utility to manage subdomain extraction and storage
 */

const SUBDOMAIN_KEY = "adminSubdomain";

/**
 * Extract subdomain from URL
 * Splits the hostname by '.' and gets the first part
 * Example: 'subdomain.pln.ng' -> 'subdomain'
 * Example: 'subdomain.localhost' -> 'subdomain'
 */
export const extractSubdomainFromURL = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const hostname = window.location.hostname;
    if (!hostname) {
      return null;
    }

    // If we're on bare localhost / IP, there is no subdomain.
    const lower = hostname.toLowerCase();
    if (lower === "localhost" || lower === "127.0.0.1" || lower === "0.0.0.0") {
      return null;
    }

    // Split by '.' and get the first part
    const parts = hostname.split(".");
    if (parts.length > 0 && parts[0]) {
      const first = parts[0].toLowerCase();

      // Handle subdomain.localhost (dev)
      if (lower.endsWith(".localhost")) {
        // subdomain.localhost => return subdomain
        return first === "www" ? null : first;
      }

      // For normal domains: only treat it as a subdomain if there are 3+ parts.
      // e.g. brightfuture.pl.ng (3) => brightfuture
      // e.g. paralearn.app (2) => no subdomain
      if (parts.length >= 3) {
        return first === "www" && parts.length > 1 ? parts[1]?.toLowerCase() || null : first;
      }

      return null;
    }

    return null;
  } catch (error) {
    console.error("[Subdomain] Error extracting from URL:", error);
    return null;
  }
};

/**
 * Get subdomain from localStorage
 */
export const getSubdomainFromStorage = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const subdomain = localStorage.getItem(SUBDOMAIN_KEY);
    return subdomain || null;
  } catch (error) {
    console.error("[Subdomain] Error reading from localStorage:", error);
    return null;
  }
};

/**
 * Save subdomain to localStorage
 */
export const saveSubdomainToStorage = (subdomain: string): void => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(SUBDOMAIN_KEY, subdomain);
  } catch (error) {
    console.error("[Subdomain] Error saving to localStorage:", error);
  }
};

/**
 * Remove subdomain from localStorage
 */
export const removeSubdomainFromStorage = (): void => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.removeItem(SUBDOMAIN_KEY);
  } catch (error) {
    console.error("[Subdomain] Error removing from localStorage:", error);
  }
};

/**
 * Sanitize subdomain - remove any invalid characters
 */
const sanitizeSubdomain = (subdomain: string | null | undefined): string | null => {
  if (!subdomain) return null;
  
  // Remove any whitespace, convert to lowercase, and only keep alphanumeric + hyphens
  const cleaned = subdomain.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
  
  // Must be at least 1 character and not just hyphens
  if (!cleaned || /^-*$/.test(cleaned)) return null;
  
  return cleaned;
};

/**
 * Get subdomain with fallback priority:
 * 1. Redux state (passed as parameter)
 * 2. localStorage
 * 3. URL extraction
 */
export const getSubdomain = (reduxSubdomain?: string | null): string | null => {
  // First, check Redux state if provided
  const cleanRedux = sanitizeSubdomain(reduxSubdomain);
  if (cleanRedux) {
    return cleanRedux;
  }

  // Second, check localStorage
  const storedSubdomain = getSubdomainFromStorage();
  const cleanStored = sanitizeSubdomain(storedSubdomain);
  if (cleanStored) {
    return cleanStored;
  }

  // Third, extract from URL
  const urlSubdomain = extractSubdomainFromURL();
  const cleanUrl = sanitizeSubdomain(urlSubdomain);
  if (cleanUrl) {
    // Save it for future use
    saveSubdomainToStorage(cleanUrl);
    return cleanUrl;
  }

  return null;
};

export const subdomainManager = {
  extractFromURL: extractSubdomainFromURL,
  getFromStorage: getSubdomainFromStorage,
  saveToStorage: saveSubdomainToStorage,
  removeFromStorage: removeSubdomainFromStorage,
  get: getSubdomain,
};
