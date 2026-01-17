/**
 * Utility to manage subdomain extraction and storage
 */

const SUBDOMAIN_KEY = "adminSubdomain";

/**
 * Extract subdomain from URL
 * Splits the hostname by '.' and gets the first part
 * Example: 'subdomain.pl.ng' -> 'subdomain'
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

    // Split by '.' and get the first part
    const parts = hostname.split(".");
    if (parts.length > 0 && parts[0]) {
      // Remove 'www' if present
      const subdomain = parts[0].toLowerCase();
      return subdomain === "www" && parts.length > 1 ? parts[1] : subdomain;
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
 * Get subdomain with fallback priority:
 * 1. Redux state (passed as parameter)
 * 2. localStorage
 * 3. URL extraction
 */
export const getSubdomain = (reduxSubdomain?: string | null): string | null => {
  // First, check Redux state if provided
  if (reduxSubdomain) {
    return reduxSubdomain;
  }

  // Second, check localStorage
  const storedSubdomain = getSubdomainFromStorage();
  if (storedSubdomain) {
    return storedSubdomain;
  }

  // Third, extract from URL
  const urlSubdomain = extractSubdomainFromURL();
  if (urlSubdomain) {
    // Save it for future use
    saveSubdomainToStorage(urlSubdomain);
    return urlSubdomain;
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
