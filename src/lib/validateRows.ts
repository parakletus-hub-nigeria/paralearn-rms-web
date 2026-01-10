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
export const validateName = (name: string, fieldLabel = "Name"): boolean => {
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
  const validRoles = ['student', 'teacher', 'admin'];
  
  return validRoles.includes(roleStr.toLowerCase());
};

// 4. Validate Date of Birth
export const validateDateOfBirth = (dob: string): boolean => {
  if (!dob) return false;
  
  // Check basic format YYYY-MM-DD
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dob)) {
    return false;
  }

  const date = new Date(dob);
  const now = new Date();
  
  // Check if it's a valid date object
  if (isNaN(date.getTime())) {
    return false;
  }
  
  // Check if date is in the future
  if (date > now) {
    return false;
  }

  // Optional: Check reasonable age (e.g., < 100 years, > 2 years)
  const minDate = new Date();
  minDate.setFullYear(now.getFullYear() - 100);
  if (date < minDate) {
    return false;
  }

  return true;
};

// 5. Validate Gender
export const validateGender = (gender: string): boolean => {
  if (!gender) return false;
  
  const validGenders = ['male', 'female'];
  const normalizedGender = String(gender).toLowerCase();
  
  return validGenders.includes(normalizedGender);
};

// --- Helper: Validate a complete row object ---
export const validateUserRow = (row: any, rowIndex: number) => {
  // Validate all fields
  const isEmailValid = validateEmail(row.email);
  const isFirstNameValid = validateName(row.firstName, "First Name");
  const isLastNameValid = validateName(row.lastName, "Last Name");
  const isRoleValid = validateRole(row.roles || row.role);
  const isDobValid = validateDateOfBirth(row.dateOfBirth);
  const isGenderValid = validateGender(row.gender);

  // All checks must pass
  const isValid = isEmailValid && isFirstNameValid && isLastNameValid && isRoleValid && isDobValid && isGenderValid;

  return {
    rowIndex,
    isValid,
    data: row
  };
};