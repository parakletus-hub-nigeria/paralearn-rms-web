/**
 * Validator functions for Bulk User Import
 * These can be used during the "Map Columns" or "Validate Data" steps.
 */

// 1. Validate Email
export const validateEmail = (email: string): boolean => {
  if (!email) return false;
  // Standard regex for email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(String(email).toLowerCase());
};

// 2. Validate Names (First Name / Last Name)
export const validateName = (name: string): boolean => {
  if (!name || String(name).trim() === "") {
    return false;
  }
  if (String(name).length < 2) {
    return false;
  }
  // Optional: Check for invalid characters (numbers, special chars)
  // const nameRegex = /^[a-zA-Z\s\-']+$/;
  // if (!nameRegex.test(name)) return false;

  return true;
};

// 3. Validate Role
export const validateRole = (role: string): boolean => {
  if (!role) return false;

  // Normalize input (handle if it came in as array or string)
  const roleStr = Array.isArray(role) ? role[0] : String(role);
  const validRoles = ["student", "teacher", "admin"];

  return validRoles.includes(roleStr.toLowerCase());
};

// 4. Validate Date of Birth
export const validateDateOfBirth = (dob: string | number): boolean => {
  if (!dob) return false;

  let jsDate: Date;

  // 1. Handle Excel Serial Numbers (e.g., 36617)
  if (typeof dob === "number") {
    jsDate = new Date((dob - 25569) * 86400 * 1000);
  }
  // 2. Handle Strings (supports "DD/MM/YYYY", "DD-MM-YYYY", "YYYY-MM-DD")
  else {
    const dobStr = String(dob).trim();

    // Regex to detect separators (/ or -)
    // Matches: 2000-01-01, 2000/01/01, 01-01-2000, 01/01/2000
    const dateParts = dobStr.split(/[-/]/);

    if (dateParts.length !== 3) return false;

    let year: number, month: number, day: number;

    // Check if the first part is the Year (ISO format: YYYY-MM-DD)
    if (dateParts[0].length === 4) {
      year = parseInt(dateParts[0]);
      month = parseInt(dateParts[1]);
      day = parseInt(dateParts[2]);
    }
    // Otherwise assume Day-Month-Year (Common format: DD-MM-YYYY)
    // Note: This prioritizes DD/MM over MM/DD (Standard in Nigeria/UK/Europe)
    else if (dateParts[2].length === 4) {
      day = parseInt(dateParts[0]);
      month = parseInt(dateParts[1]);
      year = parseInt(dateParts[2]);
    } else {
      return false; // Unknown format
    }

    // Create date manually (Month is 0-indexed in JS, so we subtract 1)
    jsDate = new Date(year, month - 1, day);
  }

  // --- VALIDATION CHECKS ---

  // Is it a valid date object?
  if (isNaN(jsDate.getTime())) return false;

  const now = new Date();
  const minDate = new Date();
  minDate.setFullYear(now.getFullYear() - 100); // Max age 100 years

  // Future check (Date cannot be in the future)
  if (jsDate > now) return false;

  // Too old check (User cannot be older than 100)
  if (jsDate < minDate) return false;

  return true;
};

// 5. Validate Gender
export const validateGender = (gender: string): boolean => {
  if (!gender) return false;

  const validGenders = ["male", "female"];
  const normalizedGender = gender.toLowerCase();

  return validGenders.includes(normalizedGender);
};

// --- Helper: Validate a complete row object ---
// Only requires email, firstName, and lastName for authentication
export const validateUserRow = (row: any, rowIndex: number) => {
  // Validate only required fields: email, firstName, lastName
  const isEmailValid = validateEmail(row.email);
  const isFirstNameValid = validateName(row.firstName);
  const isLastNameValid = validateName(row.lastName);

  // Only these three fields are required
  const isValid = isEmailValid && isFirstNameValid && isLastNameValid;

  console.log([isEmailValid, isFirstNameValid, isLastNameValid]);
  return {
    rowIndex,
    isValid,
    data: row,
  };
};
