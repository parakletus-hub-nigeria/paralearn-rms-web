# ParaLearn API - Complete Test Flow Documentation

**Version:** 1.0.0  
**Base URL:** `http://localhost:3001`  
**Last Updated:** October 29, 2025

---

## 📋 Table of Contents

1. [Authentication & School Setup](#step-1-authentication--school-setup)
2. [Academic Calendar Setup](#step-2-academic-calendar-setup)
3. [User Management](#step-3-user-management)
4. [Class & Subject Management](#step-4-class--subject-management)
5. [Assessment Categories & Configuration](#step-5-assessment-categories--configuration)
6. [Assessment Creation & Management](#step-6-assessment-creation--management)
7. [Scores & Grading](#step-7-scores--grading)
8. [Report Cards](#step-8-report-cards)
9. [Comments & Psychomotor](#step-9-comments--psychomotor)
10. [Advanced Features](#step-10-advanced-features)

---

## 🎯 Overview

This document provides a **complete, sequential test flow** covering **ALL** endpoints in the ParaLearn API. Follow these steps in order to test the entire system from school registration to advanced features.

**Prerequisites:**
- Backend server running on `http://localhost:3001`
- Database migrated and ready
- Postman or similar API testing tool

---

# STEP 1: Authentication & School Setup

## 1.1 Register School

**Endpoint:** `POST /auth/register-school`  
**Purpose:** Create a new school with admin account  
**Auth Required:** No

**Request:**
```http
POST http://localhost:3001/auth/register-school
Content-Type: application/json

{
  "schoolName": "Bright Future Academy",
  "domain": "brightfuture",
  "adminEmail": "admin@brightfuture.ng",
  "adminPassword": "Admin@123",
  "adminFirstName": "Grace",
  "adminLastName": "Okoro",
  "phoneNumber": "+2348012345678",
  "address": "Plot 5, Education Avenue, Victoria Island, Lagos",
  "motto": "Knowledge is Light",
  "website": "https://brightfuture.ng"
}
```

**Expected Response:** `201 Created`
```json
{
  "success": true,
  "message": "School registered successfully",
  "data": {
    "schoolId": "clx123abc456",
    "schoolName": "Bright Future Academy",
    "subdomain": "brightfuture",
    "adminId": "usr_admin_001",
    "adminEmail": "admin@brightfuture.ng",
    "loginUrl": "https://brightfuture.pl.ng/login",
    "wasSubdomainModified": false,
    "originalDomain": "brightfuture"
  }
}
```

**Save for Later:**
- `schoolId`: `clx123abc456`
- `subdomain`: `brightfuture`
- `adminEmail`: `admin@brightfuture.ng`

---

## 1.2 Login with Email

**Endpoint:** `POST /auth/login`  
**Purpose:** Authenticate admin user with email  
**Auth Required:** No

**Request:**
```http
POST http://localhost:3001/auth/login
Content-Type: application/json

{
  "email": "admin@brightfuture.ng",
  "password": "Admin@123"
}
```

**Expected Response:** `200 OK`
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3JfYWRtaW5fMDAxIiwic2Nob29sSWQiOiJjbHgxMjNhYmM0NTYiLCJyb2xlcyI6WyJhZG1pbiJdLCJpYXQiOjE3MzAwMDAwMDAsImV4cCI6MTczMDYwNDgwMH0.signature",
    "user": {
      "id": "usr_admin_001",
      "email": "admin@brightfuture.ng",
      "firstName": "Grace",
      "lastName": "Okoro",
      "schoolId": "clx123abc456",
      "roles": ["admin"]
    },
    "expiresIn": "7d"
  }
}
```

**Save for Later:**
- `accessToken`: Copy the entire JWT token
- `userId`: `usr_admin_001`

**Set in Postman Environment:**
```
TOKEN = <accessToken>
SUBDOMAIN = brightfuture
ADMIN_ID = usr_admin_001
```

---

## 1.3 Get Current User Profile

**Endpoint:** `GET /users/me`  
**Purpose:** Verify authentication and get user details  
**Auth Required:** Yes

**Request:**
```http
GET http://localhost:3001/users/me
Authorization: Bearer {{TOKEN}}
X-Tenant-Subdomain: {{SUBDOMAIN}}
```

**Expected Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "usr_admin_001",
    "email": "admin@brightfuture.ng",
    "firstName": "Grace",
    "lastName": "Okoro",
    "schoolId": "clx123abc456",
    "roles": ["admin"],
    "phoneNumber": "+2348012345678",
    "isActive": true,
    "createdAt": "2025-10-29T12:00:00.000Z"
  }
}
```

---

## 1.4 Get Tenant Information

**Endpoint:** `GET /tenant/info`  
**Purpose:** Get school branding and settings  
**Auth Required:** Yes

**Request:**
```http
GET http://localhost:3001/tenant/info
Authorization: Bearer {{TOKEN}}
X-Tenant-Subdomain: {{SUBDOMAIN}}
```

**Expected Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "clx123abc456",
    "name": "Bright Future Academy",
    "subdomain": "brightfuture",
    "logoUrl": null,
    "motto": "Knowledge is Light",
    "address": "Plot 5, Education Avenue, Victoria Island, Lagos",
    "phoneNumber": "+2348012345678",
    "website": "https://brightfuture.ng",
    "primaryColor": "#2563eb",
    "secondaryColor": "#1e40af",
    "accentColor": "#3b82f6",
    "settings": {
      "timezone": "Africa/Lagos",
      "gradingScale": "A-F"
    },
    "isActive": true,
    "createdAt": "2025-10-29T12:00:00.000Z"
  },
  "message": "Tenant information retrieved successfully"
}
```

---

## 1.5 Update School Branding

**Endpoint:** `PATCH /tenant/branding`  
**Purpose:** Customize school colors and logo  
**Auth Required:** Yes (admin)

**Request:**
```http
PATCH http://localhost:3001/tenant/branding
Authorization: Bearer {{TOKEN}}
X-Tenant-Subdomain: {{SUBDOMAIN}}
Content-Type: application/json

{
  "logoUrl": "https://cdn.brightfuture.ng/logo.png",
  "primaryColor": "#1d4ed8",
  "secondaryColor": "#1e3a8a",
  "accentColor": "#f59e0b",
  "motto": "Excellence Through Education"
}
```

**Expected Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "clx123abc456",
    "logoUrl": "https://cdn.brightfuture.ng/logo.png",
    "primaryColor": "#1d4ed8",
    "secondaryColor": "#1e3a8a",
    "accentColor": "#f59e0b",
    "motto": "Excellence Through Education"
  },
  "message": "Branding updated successfully"
}
```

---

## 1.6 Change Password

**Endpoint:** `POST /auth/change-password`  
**Purpose:** Change authenticated user's password  
**Auth Required:** Yes

**Request:**
```http
POST http://localhost:3001/auth/change-password
Authorization: Bearer {{TOKEN}}
X-Tenant-Subdomain: {{SUBDOMAIN}}
Content-Type: application/json

{
  "currentPassword": "Admin@123",
  "newPassword": "NewAdmin@456"
}
```

**Expected Response:** `200 OK`
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Note:** Update your password back or use the new one for subsequent requests.

---

## 1.7 Forgot Password Flow

### 1.7.1 Request Password Reset

**Endpoint:** `POST /auth/forgot-password`  
**Purpose:** Request password reset email  
**Auth Required:** No

**Request:**
```http
POST http://localhost:3001/auth/forgot-password
Content-Type: application/json

{
  "email": "admin@brightfuture.ng"
}
```

**Expected Response:** `200 OK`
```json
{
  "success": true,
  "message": "Password reset email sent successfully",
  "data": {
    "token": "reset_token_abc123xyz"
  }
}
```

**Save:** `resetToken`: `reset_token_abc123xyz`

### 1.7.2 Reset Password

**Endpoint:** `POST /auth/reset-password`  
**Purpose:** Reset password using token  
**Auth Required:** No

**Request:**
```http
POST http://localhost:3001/auth/reset-password
Content-Type: application/json

{
  "token": "reset_token_abc123xyz",
  "newPassword": "Admin@123"
}
```

**Expected Response:** `200 OK`
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

## ✅ Step 1 Checklist

- [ ] School registered successfully
- [ ] Admin can login with email
- [ ] User profile retrieved
- [ ] Tenant information retrieved
- [ ] School branding updated
- [ ] Password change works
- [ ] Forgot password flow works
- [ ] Access token saved in environment

**Next:** Proceed to Step 2 - Academic Calendar Setup

---

# STEP 2: Academic Calendar Setup

## 2.1 Create Academic Session with Terms

**Endpoint:** `POST /academic/sessions`  
**Purpose:** Create academic session (2024/2025) with 3 terms  
**Auth Required:** Yes (admin only)

**Request:**
```http
POST http://localhost:3001/academic/sessions
Authorization: Bearer {{TOKEN}}
X-Tenant-Subdomain: {{SUBDOMAIN}}
Content-Type: application/json

{
  "session": "2024/2025",
  "startsAt": "2024-09-01T00:00:00.000Z",
  "endsAt": "2025-07-31T23:59:59.000Z",
  "terms": [
    {
      "term": "Term 1",
      "startsAt": "2024-09-01T00:00:00.000Z",
      "endsAt": "2024-12-15T23:59:59.000Z"
    },
    {
      "term": "Term 2",
      "startsAt": "2025-01-10T00:00:00.000Z",
      "endsAt": "2025-04-10T23:59:59.000Z"
    },
    {
      "term": "Term 3",
      "startsAt": "2025-04-25T00:00:00.000Z",
      "endsAt": "2025-07-20T23:59:59.000Z"
    }
  ]
}
```

**Expected Response:** `201 Created`
```json
{
  "success": true,
  "message": "Academic session created successfully",
  "data": {
    "id": "sess_2024_2025",
    "schoolId": "clx123abc456",
    "session": "2024/2025",
    "startsAt": "2024-09-01T00:00:00.000Z",
    "endsAt": "2025-07-31T23:59:59.000Z",
    "isActive": false,
    "terms": [
      {
        "id": "term_001",
        "sessionId": "sess_2024_2025",
        "term": "Term 1",
        "startsAt": "2024-09-01T00:00:00.000Z",
        "endsAt": "2024-12-15T23:59:59.000Z",
        "isActive": false,
        "createdAt": "2025-10-29T15:00:00.000Z"
      },
      {
        "id": "term_002",
        "sessionId": "sess_2024_2025",
        "term": "Term 2",
        "startsAt": "2025-01-10T00:00:00.000Z",
        "endsAt": "2025-04-10T23:59:59.000Z",
        "isActive": false,
        "createdAt": "2025-10-29T15:00:00.000Z"
      },
      {
        "id": "term_003",
        "sessionId": "sess_2024_2025",
        "term": "Term 3",
        "startsAt": "2025-04-25T00:00:00.000Z",
        "endsAt": "2025-07-20T23:59:59.000Z",
        "isActive": false,
        "createdAt": "2025-10-29T15:00:00.000Z"
      }
    ],
    "createdAt": "2025-10-29T15:00:00.000Z"
  }
}
```

**Save for Later:**
- `sessionId`: `sess_2024_2025`
- `term1Id`: `term_001`
- `term2Id`: `term_002`
- `term3Id`: `term_003`

---

## 2.2 Get All Sessions

**Endpoint:** `GET /academic/sessions`  
**Purpose:** List all academic sessions for the school  
**Auth Required:** Yes (admin, teacher)

**Request:**
```http
GET http://localhost:3001/academic/sessions
Authorization: Bearer {{TOKEN}}
X-Tenant-Subdomain: {{SUBDOMAIN}}
```

**Expected Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "sess_2024_2025",
      "schoolId": "clx123abc456",
      "session": "2024/2025",
      "startsAt": "2024-09-01T00:00:00.000Z",
      "endsAt": "2025-07-31T23:59:59.000Z",
      "isActive": false,
      "terms": [
        {
          "id": "term_001",
          "term": "Term 1",
          "isActive": false
        },
        {
          "id": "term_002",
          "term": "Term 2",
          "isActive": false
        },
        {
          "id": "term_003",
          "term": "Term 3",
          "isActive": false
        }
      ]
    }
  ]
}
```

---

## 2.3 Activate Term 2

**Endpoint:** `POST /academic/sessions/:sessionId/terms/:termId/activate`  
**Purpose:** Activate Term 2 (deactivates all other terms)  
**Auth Required:** Yes (admin only)

**Request:**
```http
POST http://localhost:3001/academic/sessions/sess_2024_2025/terms/term_002/activate
Authorization: Bearer {{TOKEN}}
X-Tenant-Subdomain: {{SUBDOMAIN}}
```

**Expected Response:** `200 OK`
```json
{
  "success": true,
  "message": "Activated 2024/2025 - Term 2",
  "data": {
    "session": {
      "id": "sess_2024_2025",
      "session": "2024/2025",
      "isActive": true,
      "terms": [
        {
          "id": "term_001",
          "term": "Term 1",
          "isActive": false
        },
        {
          "id": "term_002",
          "term": "Term 2",
          "isActive": true
        },
        {
          "id": "term_003",
          "term": "Term 3",
          "isActive": false
        }
      ]
    },
    "term": {
      "id": "term_002",
      "term": "Term 2",
      "isActive": true
    }
  }
}
```

**Important:** Only ONE term can be active at a time across ALL sessions!

---

## 2.4 Get Current Active Session & Term

**Endpoint:** `GET /academic/current`  
**Purpose:** Get currently active academic session and term  
**Auth Required:** Yes

**Request:**
```http
GET http://localhost:3001/academic/current
Authorization: Bearer {{TOKEN}}
X-Tenant-Subdomain: {{SUBDOMAIN}}
```

**Expected Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "session": "2024/2025",
    "term": "Term 2",
    "sessionDetails": {
      "id": "sess_2024_2025",
      "session": "2024/2025",
      "startsAt": "2024-09-01T00:00:00.000Z",
      "endsAt": "2025-07-31T23:59:59.000Z",
      "isActive": true,
      "createdAt": "2025-10-29T15:00:00.000Z"
    },
    "termDetails": {
      "id": "term_002",
      "sessionId": "sess_2024_2025",
      "term": "Term 2",
      "startsAt": "2025-01-10T00:00:00.000Z",
      "endsAt": "2025-04-10T23:59:59.000Z",
      "isActive": true,
      "createdAt": "2025-10-29T15:00:00.000Z"
    }
  }
}
```

**Key Point:** All new assessments will automatically use `session: "2024/2025"` and `term: "Term 2"`!

---

## 2.5 Create Another Session (2025/2026)

**Endpoint:** `POST /academic/sessions`  
**Purpose:** Create next academic year  
**Auth Required:** Yes (admin only)

**Request:**
```http
POST http://localhost:3001/academic/sessions
Authorization: Bearer {{TOKEN}}
X-Tenant-Subdomain: {{SUBDOMAIN}}
Content-Type: application/json

{
  "session": "2025/2026",
  "startsAt": "2025-09-01T00:00:00.000Z",
  "endsAt": "2026-07-31T23:59:59.000Z",
  "terms": [
    {
      "term": "Term 1",
      "startsAt": "2025-09-01T00:00:00.000Z",
      "endsAt": "2025-12-15T23:59:59.000Z"
    },
    {
      "term": "Term 2",
      "startsAt": "2026-01-10T00:00:00.000Z",
      "endsAt": "2026-04-10T23:59:59.000Z"
    },
    {
      "term": "Term 3",
      "startsAt": "2026-04-25T00:00:00.000Z",
      "endsAt": "2026-07-20T23:59:59.000Z"
    }
  ]
}
```

**Expected Response:** `201 Created` (similar structure as 2.1)

---

## 2.6 Test Switching Active Term

**Endpoint:** `POST /academic/sessions/:sessionId/terms/:termId/activate`  
**Purpose:** Switch to Term 3 of 2024/2025  
**Auth Required:** Yes (admin only)

**Request:**
```http
POST http://localhost:3001/academic/sessions/sess_2024_2025/terms/term_003/activate
Authorization: Bearer {{TOKEN}}
X-Tenant-Subdomain: {{SUBDOMAIN}}
```

**Expected Response:** `200 OK`
```json
{
  "success": true,
  "message": "Activated 2024/2025 - Term 3",
  "data": {
    "session": {...},
    "term": {
      "id": "term_003",
      "term": "Term 3",
      "isActive": true
    }
  }
}
```

---

## 2.7 Verify Current Term Changed

**Endpoint:** `GET /academic/current`  
**Purpose:** Confirm active term switched  
**Auth Required:** Yes

**Request:**
```http
GET http://localhost:3001/academic/current
Authorization: Bearer {{TOKEN}}
X-Tenant-Subdomain: {{SUBDOMAIN}}
```

**Expected Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "session": "2024/2025",
    "term": "Term 3",
    ...
  }
}
```

---

## 2.8 Switch Back to Term 2

**Endpoint:** `POST /academic/sessions/:sessionId/terms/:termId/activate`  
**Purpose:** Reactivate Term 2 for testing  
**Auth Required:** Yes (admin only)

**Request:**
```http
POST http://localhost:3001/academic/sessions/sess_2024_2025/terms/term_002/activate
Authorization: Bearer {{TOKEN}}
X-Tenant-Subdomain: {{SUBDOMAIN}}
```

**Expected Response:** `200 OK`

---

## ✅ Step 2 Checklist

- [ ] Academic session 2024/2025 created with 3 terms
- [ ] All sessions listed successfully
- [ ] Term 2 activated
- [ ] Current session/term retrieved correctly
- [ ] Second session 2025/2026 created
- [ ] Term switching works (Term 2 → Term 3 → Term 2)
- [ ] Only one term active at a time verified

**Key Takeaway:** Active term determines session/term for all new assessments!

**Next:** Proceed to Step 3 - User Management

---

# STEP 3: User Management

## 3.1 Create Teacher User

**Endpoint:** `POST /users`  
**Purpose:** Create a teacher with auto-generated teacherId  
**Auth Required:** Yes (admin)

**Request:**
```http
POST http://localhost:3001/users
Authorization: Bearer {{TOKEN}}
X-Tenant-Subdomain: {{SUBDOMAIN}}
Content-Type: application/json

{
  "email": "ada.okafor@brightfuture.ng",
  "firstName": "Ada",
  "lastName": "Okafor",
  "roles": ["teacher"],
  "phoneNumber": "+2348011111111",
  "dateOfBirth": "1985-03-10",
  "gender": "Female",
  "address": "789 Teacher Lane, Lagos"
}
```

**Expected Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "usr_teacher_001",
    "email": "ada.okafor@brightfuture.ng",
    "firstName": "Ada",
    "lastName": "Okafor",
    "teacherId": "TCH2025001",
    "roles": ["teacher"],
    "credentialsSent": true
  },
  "message": "User created successfully"
}
```

**Save:** `teacherId`: `TCH2025001`, `teacherUserId`: `usr_teacher_001`

---

## 3.2 Login with Teacher ID

**Endpoint:** `POST /auth/login`  
**Purpose:** Test login with teacherId instead of email  
**Auth Required:** No

**Request:**
```http
POST http://localhost:3001/auth/login
Content-Type: application/json

{
  "email": "TCH2025001",
  "password": "<password-from-email>"
}
```

**Expected Response:** `200 OK` (same structure as admin login)

**Key Point:** Can login with `TCH2025001` OR `ada.okafor@brightfuture.ng`!

---

## 3.3 Create Student User

**Endpoint:** `POST /users`  
**Purpose:** Create a student with auto-generated studentId  
**Auth Required:** Yes (admin)

**Request:**
```http
POST http://localhost:3001/users
Authorization: Bearer {{TOKEN}}
X-Tenant-Subdomain: {{SUBDOMAIN}}
Content-Type: application/json

{
  "email": "john.doe@student.brightfuture.ng",
  "firstName": "John",
  "lastName": "Doe",
  "roles": ["student"],
  "phoneNumber": "+2348022222222",
  "dateOfBirth": "2010-05-15",
  "gender": "Male",
  "address": "123 Student Street, Lagos",
  "guardianName": "Mr. Doe",
  "guardianPhone": "+2348033333333"
}
```

**Expected Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "usr_student_001",
    "email": "john.doe@student.brightfuture.ng",
    "firstName": "John",
    "lastName": "Doe",
    "studentId": "STD2025001",
    "roles": ["student"],
    "credentialsSent": true
  },
  "message": "User created successfully"
}
```

**Save:** `studentId`: `STD2025001`, `studentUserId`: `usr_student_001`

---

## 3.4 Login with Student ID

**Endpoint:** `POST /auth/login`  
**Purpose:** Test login with studentId  
**Auth Required:** No

**Request:**
```http
POST http://localhost:3001/auth/login
Content-Type: application/json

{
  "email": "STD2025001",
  "password": "<password-from-email>"
}
```

**Expected Response:** `200 OK`

---

## 3.5 Create Multiple Students (Bulk)

**Endpoint:** `POST /users` (called multiple times)  
**Purpose:** Create 5 more students for testing  
**Auth Required:** Yes (admin)

**Students to Create:**
1. Jane Smith - `STD2025002`
2. Michael Johnson - `STD2025003`
3. Sarah Williams - `STD2025004`
4. David Brown - `STD2025005`
5. Emily Davis - `STD2025006`

**Request Template:**
```http
POST http://localhost:3001/users
Authorization: Bearer {{TOKEN}}
X-Tenant-Subdomain: {{SUBDOMAIN}}
Content-Type: application/json

{
  "email": "jane.smith@student.brightfuture.ng",
  "firstName": "Jane",
  "lastName": "Smith",
  "roles": ["student"],
  "dateOfBirth": "2010-08-20",
  "gender": "Female"
}
```

---

## 3.6 List All Users

**Endpoint:** `GET /users`  
**Purpose:** Get all users with pagination  
**Auth Required:** Yes

**Request:**
```http
GET http://localhost:3001/users?limit=50&offset=0
Authorization: Bearer {{TOKEN}}
X-Tenant-Subdomain: {{SUBDOMAIN}}
```

**Expected Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "usr_admin_001",
      "email": "admin@brightfuture.ng",
      "firstName": "Grace",
      "lastName": "Okoro",
      "roles": ["admin"],
      "isActive": true
    },
    {
      "id": "usr_teacher_001",
      "email": "ada.okafor@brightfuture.ng",
      "firstName": "Ada",
      "lastName": "Okafor",
      "teacherId": "TCH2025001",
      "roles": ["teacher"],
      "isActive": true
    },
    {
      "id": "usr_student_001",
      "email": "john.doe@student.brightfuture.ng",
      "firstName": "John",
      "lastName": "Doe",
      "studentId": "STD2025001",
      "roles": ["student"],
      "isActive": true
    }
  ],
  "pagination": {
    "total": 8,
    "limit": 50,
    "offset": 0,
    "hasMore": false
  },
  "message": "Users retrieved successfully"
}
```

---

## 3.7 Filter Users by Role

**Endpoint:** `GET /users?role=student`  
**Purpose:** Get only students  
**Auth Required:** Yes

**Request:**
```http
GET http://localhost:3001/users?role=student
Authorization: Bearer {{TOKEN}}
X-Tenant-Subdomain: {{SUBDOMAIN}}
```

**Expected Response:** `200 OK` (only students in data array)

---

## 3.8 Search Users by Name or ID

**Endpoint:** `GET /users?search=john`  
**Purpose:** Search by name, email, studentId, or teacherId  
**Auth Required:** Yes

**Request:**
```http
GET http://localhost:3001/users?search=john
Authorization: Bearer {{TOKEN}}
X-Tenant-Subdomain: {{SUBDOMAIN}}
```

**Expected Response:** `200 OK` (users matching "john")

**Test Search by ID:**
```http
GET http://localhost:3001/users?search=STD2025001
```

---

## 3.9 Update User Profile

**Endpoint:** `PATCH /users/:id`  
**Purpose:** Update user information  
**Auth Required:** Yes (admin or self)

**Request:**
```http
PATCH http://localhost:3001/users/usr_student_001
Authorization: Bearer {{TOKEN}}
X-Tenant-Subdomain: {{SUBDOMAIN}}
Content-Type: application/json

{
  "phoneNumber": "+2348099999999",
  "address": "456 New Address, Lagos",
  "guardianPhone": "+2348088888888"
}
```

**Expected Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "usr_student_001",
    "phoneNumber": "+2348099999999",
    "address": "456 New Address, Lagos",
    "guardianPhone": "+2348088888888"
  },
  "message": "User updated successfully"
}
```

---

## 3.10 Get Specific User

**Endpoint:** `GET /users/:id`  
**Purpose:** Get detailed user information  
**Auth Required:** Yes

**Request:**
```http
GET http://localhost:3001/users/usr_student_001
Authorization: Bearer {{TOKEN}}
X-Tenant-Subdomain: {{SUBDOMAIN}}
```

**Expected Response:** `200 OK` (full user details)

---

## 3.11 Delete User (Soft Delete)

**Endpoint:** `DELETE /users/:id`  
**Purpose:** Deactivate user account  
**Auth Required:** Yes (admin)

**Request:**
```http
DELETE http://localhost:3001/users/usr_student_001?exitReason=transferred
Authorization: Bearer {{TOKEN}}
X-Tenant-Subdomain: {{SUBDOMAIN}}
```

**Expected Response:** `200 OK`
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**Note:** User is deactivated, not permanently deleted. Historical data preserved.

---

## 3.12 Verify User Deactivated

**Endpoint:** `GET /users?isActive=false`  
**Purpose:** List inactive users  
**Auth Required:** Yes (admin)

**Request:**
```http
GET http://localhost:3001/users?isActive=false
Authorization: Bearer {{TOKEN}}
X-Tenant-Subdomain: {{SUBDOMAIN}}
```

**Expected Response:** `200 OK` (includes deactivated user)

---

## ✅ Step 3 Checklist

- [ ] Teacher created with auto-generated teacherId (TCH2025001)
- [ ] Login with teacherId works
- [ ] Student created with auto-generated studentId (STD2025001)
- [ ] Login with studentId works
- [ ] Multiple students created
- [ ] All users listed with pagination
- [ ] Filter by role works
- [ ] Search by name/ID works
- [ ] User profile updated
- [ ] User soft delete works
- [ ] Inactive users can be listed

**Key Takeaway:** Users can login with email, studentId, or teacherId!

**Next:** Proceed to Step 4 - Class & Subject Management

---

# STEP 4: Class & Subject Management

## 4.1 Create Class

**Endpoint:** `POST /classes`  
**Purpose:** Create a class (JSS 1A)  
**Auth Required:** Yes (admin)

**Request:**
```http
POST http://localhost:3001/classes
Authorization: Bearer {{TOKEN}}
X-Tenant-Subdomain: {{SUBDOMAIN}}
Content-Type: application/json

{
  "name": "JSS 1A",
  "level": 1,
  "stream": "A",
  "capacity": 45
}
```

**Expected Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "class_jss1a",
    "name": "JSS 1A",
    "level": 1,
    "stream": "A",
    "capacity": 45,
    "schoolId": "clx123abc456",
    "createdAt": "2025-10-29T16:00:00.000Z"
  },
  "message": "Class created successfully"
}
```

**Save:** `classId`: `class_jss1a`

---

## 4.2 Create More Classes

**Endpoint:** `POST /classes`  
**Purpose:** Create additional classes  
**Auth Required:** Yes (admin)

**Classes to Create:**
1. JSS 1B - `class_jss1b`
2. JSS 2A - `class_jss2a`
3. SS 1A - `class_ss1a`

**Request Template:**
```http
POST http://localhost:3001/classes
Authorization: Bearer {{TOKEN}}
X-Tenant-Subdomain: {{SUBDOMAIN}}
Content-Type: application/json

{
  "name": "JSS 1B",
  "level": 1,
  "stream": "B",
  "capacity": 45
}
```

---

## 4.3 List All Classes

**Endpoint:** `GET /classes`  
**Purpose:** Get all classes  
**Auth Required:** Yes

**Request:**
```http
GET http://localhost:3001/classes
Authorization: Bearer {{TOKEN}}
X-Tenant-Subdomain: {{SUBDOMAIN}}
```

**Expected Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "class_jss1a",
      "name": "JSS 1A",
      "level": 1,
      "stream": "A",
      "capacity": 45,
      "studentCount": 0
    },
    {
      "id": "class_jss1b",
      "name": "JSS 1B",
      "level": 1,
      "stream": "B",
      "capacity": 45,
      "studentCount": 0
    }
  ]
}
```

---

## 4.4 Enroll Students in Class

**Endpoint:** `POST /classes/:classId/students`  
**Purpose:** Add students to JSS 1A  
**Auth Required:** Yes (admin)

**Request:**
```http
POST http://localhost:3001/classes/class_jss1a/students
Authorization: Bearer {{TOKEN}}
X-Tenant-Subdomain: {{SUBDOMAIN}}
Content-Type: application/json

{
  "studentIds": [
    "usr_student_001",
    "usr_student_002",
    "usr_student_003"
  ]
}
```

**Expected Response:** `200 OK`
```json
{
  "success": true,
  "message": "3 students enrolled successfully",
  "data": {
    "classId": "class_jss1a",
    "enrolledCount": 3
  }
}
```

---

## 4.5 Get Class Details with Students

**Endpoint:** `GET /classes/:id`  
**Purpose:** View class with enrolled students  
**Auth Required:** Yes

**Request:**
```http
GET http://localhost:3001/classes/class_jss1a
Authorization: Bearer {{TOKEN}}
X-Tenant-Subdomain: {{SUBDOMAIN}}
```

**Expected Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "class_jss1a",
    "name": "JSS 1A",
    "level": 1,
    "stream": "A",
    "capacity": 45,
    "students": [
      {
        "id": "usr_student_001",
        "studentId": "STD2025001",
        "firstName": "John",
        "lastName": "Doe"
      },
      {
        "id": "usr_student_002",
        "studentId": "STD2025002",
        "firstName": "Jane",
        "lastName": "Smith"
      }
    ],
    "studentCount": 3
  }
}
```

---

## 4.6 Create Subject

**Endpoint:** `POST /subjects`  
**Purpose:** Create Mathematics subject  
**Auth Required:** Yes (admin)

**Request:**
```http
POST http://localhost:3001/subjects
Authorization: Bearer {{TOKEN}}
X-Tenant-Subdomain: {{SUBDOMAIN}}
Content-Type: application/json

{
  "name": "Mathematics",
  "code": "MATH",
  "classId": "class_jss1a",
  "description": "Core Mathematics for JSS 1"
}
```

**Expected Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "subject_math_jss1a",
    "name": "Mathematics",
    "code": "MATH",
    "classId": "class_jss1a",
    "schoolId": "clx123abc456",
    "createdAt": "2025-10-29T16:30:00.000Z"
  },
  "message": "Subject created successfully"
}
```

**Save:** `mathSubjectId`: `subject_math_jss1a`

---

## 4.7 Create More Subjects

**Endpoint:** `POST /subjects`  
**Purpose:** Create additional subjects for JSS 1A  
**Auth Required:** Yes (admin)

**Subjects to Create:**
1. English - `ENG`
2. Basic Science - `BSC`
3. Social Studies - `SST`
4. Computer Science - `CMP`

**Request Template:**
```http
POST http://localhost:3001/subjects
Authorization: Bearer {{TOKEN}}
X-Tenant-Subdomain: {{SUBDOMAIN}}
Content-Type: application/json

{
  "name": "English Language",
  "code": "ENG",
  "classId": "class_jss1a"
}
```

---

## 4.8 Assign Teacher to Subject

**Endpoint:** `POST /subjects/:subjectId/teachers`  
**Purpose:** Assign Ada (TCH2025001) to teach Mathematics  
**Auth Required:** Yes (admin)

**Request:**
```http
POST http://localhost:3001/subjects/subject_math_jss1a/teachers
Authorization: Bearer {{TOKEN}}
X-Tenant-Subdomain: {{SUBDOMAIN}}
Content-Type: application/json

{
  "teacherId": "usr_teacher_001"
}
```

**Expected Response:** `200 OK`
```json
{
  "success": true,
  "message": "Teacher assigned successfully",
  "data": {
    "subjectId": "subject_math_jss1a",
    "teacherId": "usr_teacher_001",
    "teacherName": "Ada Okafor"
  }
}
```

---

## 4.9 List All Subjects

**Endpoint:** `GET /subjects`  
**Purpose:** Get all subjects with filters  
**Auth Required:** Yes

**Request:**
```http
GET http://localhost:3001/subjects?classId=class_jss1a
Authorization: Bearer {{TOKEN}}
X-Tenant-Subdomain: {{SUBDOMAIN}}
```

**Expected Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "subject_math_jss1a",
      "name": "Mathematics",
      "code": "MATH",
      "class": {
        "id": "class_jss1a",
        "name": "JSS 1A"
      },
      "teachers": [
        {
          "id": "usr_teacher_001",
          "teacherId": "TCH2025001",
          "name": "Ada Okafor"
        }
      ]
    }
  ]
}
```

---

## 4.10 Get Subject Details

**Endpoint:** `GET /subjects/:id`  
**Purpose:** View subject with class and teachers  
**Auth Required:** Yes

**Request:**
```http
GET http://localhost:3001/subjects/subject_math_jss1a
Authorization: Bearer {{TOKEN}}
X-Tenant-Subdomain: {{SUBDOMAIN}}
```

**Expected Response:** `200 OK` (detailed subject info)

---

## 4.11 Update Class

**Endpoint:** `PATCH /classes/:id`  
**Purpose:** Update class capacity  
**Auth Required:** Yes (admin)

**Request:**
```http
PATCH http://localhost:3001/classes/class_jss1a
Authorization: Bearer {{TOKEN}}
X-Tenant-Subdomain: {{SUBDOMAIN}}
Content-Type: application/json

{
  "capacity": 50
}
```

**Expected Response:** `200 OK`

---

## 4.12 Remove Student from Class

**Endpoint:** `DELETE /classes/:classId/students/:studentId`  
**Purpose:** Unenroll a student  
**Auth Required:** Yes (admin)

**Request:**
```http
DELETE http://localhost:3001/classes/class_jss1a/students/usr_student_003
Authorization: Bearer {{TOKEN}}
X-Tenant-Subdomain: {{SUBDOMAIN}}
```

**Expected Response:** `200 OK`

---

## ✅ Step 4 Checklist

- [ ] Class JSS 1A created
- [ ] Multiple classes created
- [ ] All classes listed
- [ ] Students enrolled in class
- [ ] Class details with students retrieved
- [ ] Mathematics subject created
- [ ] Multiple subjects created
- [ ] Teacher assigned to subject
- [ ] All subjects listed with filters
- [ ] Subject details retrieved
- [ ] Class updated
- [ ] Student removed from class

**Key Takeaway:** Classes, subjects, and teacher assignments are now set up!

**Next:** Proceed to Step 5 - Assessment Categories & Configuration

---

# STEP 5: Assessment Categories & Configuration

## 5.1 Create Assessment Category - Test 1

**Endpoint:** `POST /assessment-categories`  
**Purpose:** Create Test 1 category with 10% weight  
**Auth Required:** Yes (admin)

**Request:**
```http
POST http://localhost:3001/assessment-categories
Authorization: Bearer {{TOKEN}}
X-Tenant-Subdomain: {{SUBDOMAIN}}
Content-Type: application/json

{
  "name": "Test 1",
  "code": "TEST1",
  "weight": 10,
  "description": "First Continuous Assessment Test"
}
```

**Expected Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "cat_test1",
    "name": "Test 1",
    "code": "TEST1",
    "weight": 10,
    "schoolId": "clx123abc456",
    "createdAt": "2025-10-29T17:00:00.000Z"
  },
  "message": "Assessment category created successfully"
}
```

**Save:** `test1CategoryId`: `cat_test1`

---

## 5.2 Create Assessment Category - Test 2

**Endpoint:** `POST /assessment-categories`  
**Purpose:** Create Test 2 category with 10% weight  
**Auth Required:** Yes (admin)

**Request:**
```http
POST http://localhost:3001/assessment-categories
Authorization: Bearer {{TOKEN}}
X-Tenant-Subdomain: {{SUBDOMAIN}}
Content-Type: application/json

{
  "name": "Test 2",
  "code": "TEST2",
  "weight": 10,
  "description": "Second Continuous Assessment Test"
}
```

**Expected Response:** `201 Created`

**Save:** `test2CategoryId`: `cat_test2`

---

## 5.3 Create Assessment Category - Exam

**Endpoint:** `POST /assessment-categories`  
**Purpose:** Create Exam category with 80% weight  
**Auth Required:** Yes (admin)

**Request:**
```http
POST http://localhost:3001/assessment-categories
Authorization: Bearer {{TOKEN}}
X-Tenant-Subdomain: {{SUBDOMAIN}}
Content-Type: application/json

{
  "name": "Exam",
  "code": "EXAM",
  "weight": 80,
  "description": "End of Term Examination"
}
```

**Expected Response:** `201 Created`

**Save:** `examCategoryId`: `cat_exam`

---

## 5.4 List All Assessment Categories

**Endpoint:** `GET /assessment-categories`  
**Purpose:** View all categories with weights  
**Auth Required:** Yes

**Request:**
```http
GET http://localhost:3001/assessment-categories
Authorization: Bearer {{TOKEN}}
X-Tenant-Subdomain: {{SUBDOMAIN}}
```

**Expected Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "cat_test1",
      "name": "Test 1",
      "code": "TEST1",
      "weight": 10,
      "description": "First Continuous Assessment Test"
    },
    {
      "id": "cat_test2",
      "name": "Test 2",
      "code": "TEST2",
      "weight": 10,
      "description": "Second Continuous Assessment Test"
    },
    {
      "id": "cat_exam",
      "name": "Exam",
      "code": "EXAM",
      "weight": 80,
      "description": "End of Term Examination"
    }
  ]
}
```

**Key Point:** Total weight = 100% (10% + 10% + 80%)

---

## 5.5 Update Category Weight

**Endpoint:** `PATCH /assessment-categories/:id`  
**Purpose:** Adjust category weight if needed  
**Auth Required:** Yes (admin)

**Request:**
```http
PATCH http://localhost:3001/assessment-categories/cat_test1
Authorization: Bearer {{TOKEN}}
X-Tenant-Subdomain: {{SUBDOMAIN}}
Content-Type: application/json

{
  "weight": 15
}
```

**Expected Response:** `200 OK`

---

## 5.6 Get Category Details

**Endpoint:** `GET /assessment-categories/:id`  
**Purpose:** View specific category  
**Auth Required:** Yes

**Request:**
```http
GET http://localhost:3001/assessment-categories/cat_exam
Authorization: Bearer {{TOKEN}}
X-Tenant-Subdomain: {{SUBDOMAIN}}
```

**Expected Response:** `200 OK` (detailed category info)

---

## 5.7 Configure School Grading Scale

**Endpoint:** `PATCH /school-settings/grading`  
**Purpose:** Set grade boundaries  
**Auth Required:** Yes (admin)

**Request:**
```http
PATCH http://localhost:3001/school-settings/grading
Authorization: Bearer {{TOKEN}}
X-Tenant-Subdomain: {{SUBDOMAIN}}
Content-Type: application/json

{
  "gradingScale": {
    "A": { "min": 80, "max": 100, "description": "Excellent" },
    "B": { "min": 70, "max": 79, "description": "Very Good" },
    "C": { "min": 60, "max": 69, "description": "Good" },
    "D": { "min": 50, "max": 59, "description": "Pass" },
    "F": { "min": 0, "max": 49, "description": "Fail" }
  }
}
```

**Expected Response:** `200 OK`

---

## ✅ Step 5 Checklist

- [ ] Test 1 category created (10% weight)
- [ ] Test 2 category created (10% weight)
- [ ] Exam category created (80% weight)
- [ ] All categories listed
- [ ] Category weight updated
- [ ] Category details retrieved
- [ ] School grading scale configured

**Key Takeaway:** Assessment weights configured - Test 1: 10%, Test 2: 10%, Exam: 80%

**Next:** Proceed to Step 6 - Assessment Creation & Management

---

# STEP 6: Assessment Creation & Management

## 6.1 Create Online Assessment (Auto-Derives Session/Term)

**Endpoint:** `POST /assessments`  
**Purpose:** Create Mathematics Test 1 - session/term auto-derived from active term  
**Auth Required:** Yes (teacher, admin)

**Request:**
```http
POST http://localhost:3001/assessments
Authorization: Bearer {{TOKEN}}
X-Tenant-Subdomain: {{SUBDOMAIN}}
Content-Type: application/json

{
  "title": "Mathematics Test 1",
  "description": "Covers Algebra and Geometry",
  "instructions": "Answer all questions. Show your workings.",
  "subjectId": "subject_math_jss1a",
  "categoryId": "cat_test1",
  "startsAt": "2025-11-15T08:00:00Z",
  "endsAt": "2025-11-15T09:00:00Z",
  "durationMins": 60,
  "totalMarks": 20,
  "assessmentType": "online",
  "isPublished": false,
  "questions": [
    {
      "questionType": "MCQ",
      "questionText": "What is 2 + 2?",
      "marks": 2,
      "options": [
        { "text": "3", "isCorrect": false },
        { "text": "4", "isCorrect": true },
        { "text": "5", "isCorrect": false }
      ]
    },
    {
      "questionType": "SHORT_ANSWER",
      "questionText": "Solve: 3x = 15",
      "marks": 3,
      "correctAnswer": "x = 5"
    }
  ]
}
```

**Expected Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "assess_math_test1",
    "code": "MATH-TEST1-2025-001",
    "title": "Mathematics Test 1",
    "session": "2024/2025",
    "term": "Term 2",
    "subject": {
      "id": "subject_math_jss1a",
      "name": "Mathematics",
      "code": "MATH"
    },
    "category": {
      "id": "cat_test1",
      "name": "Test 1",
      "weight": 10
    },
    "startsAt": "2025-11-15T08:00:00.000Z",
    "endsAt": "2025-11-15T09:00:00.000Z",
    "totalMarks": 20,
    "isPublished": false,
    "assessmentType": "online",
    "createdAt": "2025-10-29T18:00:00.000Z"
  },
  "message": "Assessment created successfully"
}
```

**Save:** `mathTest1Id`: `assess_math_test1`, `mathTest1Code`: `MATH-TEST1-2025-001`

**Key Point:** Notice `session` and `term` were AUTO-DERIVED from active term!

---

## 6.2 Create Offline Assessment (For Bulk Score Upload)

**Endpoint:** `POST /assessments`  
**Purpose:** Create Mathematics Exam (offline paper-based)  
**Auth Required:** Yes (teacher, admin)

**Request:**
```http
POST http://localhost:3001/assessments
Authorization: Bearer {{TOKEN}}
X-Tenant-Subdomain: {{SUBDOMAIN}}
Content-Type: application/json

{
  "title": "Mathematics End of Term Exam",
  "description": "Comprehensive exam covering all topics",
  "subjectId": "subject_math_jss1a",
  "categoryId": "cat_exam",
  "startsAt": "2025-12-01T08:00:00Z",
  "endsAt": "2025-12-01T10:00:00Z",
  "durationMins": 120,
  "totalMarks": 80,
  "assessmentType": "offline",
  "isPublished": true
}
```

**Expected Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "assess_math_exam",
    "code": "MATH-EXAM-2025-001",
    "title": "Mathematics End of Term Exam",
    "session": "2024/2025",
    "term": "Term 2",
    "category": {
      "name": "Exam",
      "weight": 80
    },
    "totalMarks": 80,
    "assessmentType": "offline",
    "isPublished": true
  }
}
```

**Save:** `mathExamId`: `assess_math_exam`, `mathExamCode`: `MATH-EXAM-2025-001`

---

## 6.3 List All Assessments

**Endpoint:** `GET /assessments`  
**Purpose:** View all assessments with filters  
**Auth Required:** Yes

**Request:**
```http
GET http://localhost:3001/assessments?session=2024/2025&term=Term%202
Authorization: Bearer {{TOKEN}}
X-Tenant-Subdomain: {{SUBDOMAIN}}
```

**Expected Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "assess_math_test1",
      "code": "MATH-TEST1-2025-001",
      "title": "Mathematics Test 1",
      "session": "2024/2025",
      "term": "Term 2",
      "subject": { "name": "Mathematics" },
      "category": { "name": "Test 1", "weight": 10 },
      "isPublished": false,
      "assessmentType": "online"
    },
    {
      "id": "assess_math_exam",
      "code": "MATH-EXAM-2025-001",
      "title": "Mathematics End of Term Exam",
      "session": "2024/2025",
      "term": "Term 2",
      "category": { "name": "Exam", "weight": 80 },
      "isPublished": true,
      "assessmentType": "offline"
    }
  ]
}
```

---

## 6.4 Publish Assessment

**Endpoint:** `POST /assessments/:id/publish`  
**Purpose:** Make assessment available to students  
**Auth Required:** Yes (teacher, admin)

**Request:**
```http
POST http://localhost:3001/assessments/assess_math_test1/publish
Authorization: Bearer {{TOKEN}}
X-Tenant-Subdomain: {{SUBDOMAIN}}
```

**Expected Response:** `200 OK`
```json
{
  "success": true,
  "message": "Assessment published successfully",
  "data": {
    "id": "assess_math_test1",
    "isPublished": true
  }
}
```

---

## 6.5 Get Assessment Details

**Endpoint:** `GET /assessments/:id`  
**Purpose:** View full assessment with questions  
**Auth Required:** Yes

**Request:**
```http
GET http://localhost:3001/assessments/assess_math_test1
Authorization: Bearer {{TOKEN}}
X-Tenant-Subdomain: {{SUBDOMAIN}}
```

**Expected Response:** `200 OK` (full assessment details with questions)

---

## 6.6 Student Starts Assessment

**Endpoint:** `POST /assessments/:id/start`  
**Purpose:** Student begins taking the assessment  
**Auth Required:** Yes (student)

**Request:**
```http
POST http://localhost:3001/assessments/assess_math_test1/start
Authorization: Bearer {{STUDENT_TOKEN}}
X-Tenant-Subdomain: {{SUBDOMAIN}}
```

**Expected Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "submissionId": "sub_001",
    "assessmentId": "assess_math_test1",
    "studentId": "usr_student_001",
    "startedAt": "2025-11-15T08:05:00.000Z",
    "endsAt": "2025-11-15T09:05:00.000Z",
    "questions": [...]
  }
}
```

**Save:** `submissionId`: `sub_001`

---

## 6.7 Student Submits Assessment

**Endpoint:** `POST /assessments/:id/submit`  
**Purpose:** Submit answers  
**Auth Required:** Yes (student)

**Request:**
```http
POST http://localhost:3001/assessments/assess_math_test1/submit
Authorization: Bearer {{STUDENT_TOKEN}}
X-Tenant-Subdomain: {{SUBDOMAIN}}
Content-Type: application/json

{
  "submissionId": "sub_001",
  "answers": [
    {
      "questionId": "q_001",
      "answer": "4"
    },
    {
      "questionId": "q_002",
      "answer": "x = 5"
    }
  ]
}
```

**Expected Response:** `200 OK`
```json
{
  "success": true,
  "message": "Assessment submitted successfully",
  "data": {
    "submissionId": "sub_001",
    "score": 5,
    "totalMarks": 20,
    "percentage": 25,
    "submittedAt": "2025-11-15T08:45:00.000Z"
  }
}
```

---

## 6.8 Update Assessment

**Endpoint:** `PATCH /assessments/:id`  
**Purpose:** Modify assessment details  
**Auth Required:** Yes (teacher, admin)

**Request:**
```http
PATCH http://localhost:3001/assessments/assess_math_test1
Authorization: Bearer {{TOKEN}}
X-Tenant-Subdomain: {{SUBDOMAIN}}
Content-Type: application/json

{
  "totalMarks": 25,
  "durationMins": 75
}
```

**Expected Response:** `200 OK`

---

## 6.9 Filter Assessments by Subject

**Endpoint:** `GET /assessments?subjectId=subject_math_jss1a`  
**Purpose:** Get all Mathematics assessments  
**Auth Required:** Yes

**Request:**
```http
GET http://localhost:3001/assessments?subjectId=subject_math_jss1a
Authorization: Bearer {{TOKEN}}
X-Tenant-Subdomain: {{SUBDOMAIN}}
```

**Expected Response:** `200 OK` (only Math assessments)

---

## 6.10 Delete Assessment

**Endpoint:** `DELETE /assessments/:id`  
**Purpose:** Remove assessment  
**Auth Required:** Yes (admin)

**Request:**
```http
DELETE http://localhost:3001/assessments/assess_math_test1
Authorization: Bearer {{TOKEN}}
X-Tenant-Subdomain: {{SUBDOMAIN}}
```

**Expected Response:** `200 OK`

---

## ✅ Step 6 Checklist

- [ ] Online assessment created with auto-derived session/term
- [ ] Offline assessment created for bulk upload
- [ ] All assessments listed with filters
- [ ] Assessment published
- [ ] Assessment details retrieved
- [ ] Student started assessment
- [ ] Student submitted assessment
- [ ] Assessment updated
- [ ] Assessments filtered by subject
- [ ] Assessment deleted

**Key Takeaway:** Assessments automatically get session/term from active term!

**Next:** Proceed to Step 7 - Scores & Grading

---

# STEP 7: Scores & Grading

## 7.1 Manual Score Entry

**Endpoint:** `POST /scores`  
**Purpose:** Manually enter score for a student  
**Auth Required:** Yes (teacher, admin)

**Request:**
```http
POST http://localhost:3001/scores
Authorization: Bearer {{TOKEN}}
X-Tenant-Subdomain: {{SUBDOMAIN}}
Content-Type: application/json

{
  "studentId": "usr_student_001",
  "assessmentId": "assess_math_test1",
  "marksAwarded": 18,
  "maxMarks": 20,
  "remarks": "Excellent work!"
}
```

**Expected Response:** `201 Created`

---

## 7.2 Bulk Score Upload (Offline Assessments)

**Endpoint:** `POST /bulk/upload-scores`  
**Purpose:** Upload scores from Excel for offline exam  
**Auth Required:** Yes (teacher, admin)

**Prepare Excel File:**
| studentId | assessmentCode | marksAwarded | maxMarks | remarks |
|-----------|----------------|--------------|----------|---------|
| STD2025001 | MATH-EXAM-2025-001 | 72 | 80 | Good |
| STD2025002 | MATH-EXAM-2025-001 | 68 | 80 | Well done |

**Request:**
```http
POST http://localhost:3001/bulk/upload-scores
Authorization: Bearer {{TOKEN}}
X-Tenant-Subdomain: {{SUBDOMAIN}}
Content-Type: multipart/form-data

file: scores.xlsx
```

**Expected Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "totalRecords": 2,
    "successfulRecords": 2,
    "failedRecords": 0,
    "errors": []
  }
}
```

---

## 7.3 Get Student Scores

**Endpoint:** `GET /scores?studentId=usr_student_001`  
**Purpose:** View all scores for a student  
**Auth Required:** Yes

**Request:**
```http
GET http://localhost:3001/scores?studentId=usr_student_001&session=2024/2025&term=Term%202
Authorization: Bearer {{TOKEN}}
X-Tenant-Subdomain: {{SUBDOMAIN}}
```

**Expected Response:** `200 OK`

---

## 7.4 Get Student Grades

**Endpoint:** `GET /grades/student/:studentId`  
**Purpose:** View calculated grades with weights  
**Auth Required:** Yes

**Request:**
```http
GET http://localhost:3001/grades/student/usr_student_001?session=2024/2025&term=Term%202
Authorization: Bearer {{TOKEN}}
X-Tenant-Subdomain: {{SUBDOMAIN}}
```

**Expected Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "studentId": "usr_student_001",
    "session": "2024/2025",
    "term": "Term 2",
    "subjects": [
      {
        "subjectName": "Mathematics",
        "assessments": [
          {
            "category": "Test 1",
            "weight": 10,
            "score": 18,
            "maxScore": 20,
            "percentage": 90
          },
          {
            "category": "Exam",
            "weight": 80,
            "score": 72,
            "maxScore": 80,
            "percentage": 90
          }
        ],
        "totalScore": 90,
        "grade": "A",
        "gradeDescription": "Excellent"
      }
    ]
  }
}
```

---

## 7.5 Update Score

**Endpoint:** `PATCH /scores/:id`  
**Purpose:** Modify existing score  
**Auth Required:** Yes (teacher, admin)

**Request:**
```http
PATCH http://localhost:3001/scores/score_001
Authorization: Bearer {{TOKEN}}
X-Tenant-Subdomain: {{SUBDOMAIN}}
Content-Type: application/json

{
  "marksAwarded": 19,
  "remarks": "Updated after review"
}
```

**Expected Response:** `200 OK`

---

## ✅ Step 7 Checklist

- [ ] Manual score entered
- [ ] Bulk scores uploaded via Excel
- [ ] Student scores retrieved
- [ ] Student grades calculated with weights
- [ ] Score updated

**Key Takeaway:** Scores support both manual entry and bulk upload!

**Next:** Proceed to Step 8 - Report Cards

---

# STEP 8: Report Cards

## 8.1 Generate Student Report Card

**Endpoint:** `GET /reports/student/:studentId/report-card`  
**Purpose:** Generate comprehensive report card  
**Auth Required:** Yes

**Request:**
```http
GET http://localhost:3001/reports/student/usr_student_001/report-card?session=2024/2025&term=Term%202
Authorization: Bearer {{TOKEN}}
X-Tenant-Subdomain: {{SUBDOMAIN}}
```

**Expected Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "school": {
      "name": "Bright Future Academy",
      "logoUrl": "https://cdn.brightfuture.ng/logo.png",
      "motto": "Knowledge is Light"
    },
    "student": {
      "name": "John Doe",
      "studentId": "STD2025001",
      "class": "JSS 1A"
    },
    "academic": {
      "session": "2024/2025",
      "term": "Term 2",
      "subjects": [
        {
          "subjectName": "Mathematics",
          "marks": 90,
          "grade": "A",
          "assessments": [
            {
              "categoryName": "Test 1",
              "marks": 18,
              "possibleMarks": 20,
              "weight": 10
            },
            {
              "categoryName": "Exam",
              "marks": 72,
              "possibleMarks": 80,
              "weight": 80
            }
          ]
        }
      ],
      "overallGrade": "A",
      "overallPercentage": 90
    },
    "rankings": {
      "classPosition": 1,
      "classSize": 45
    }
  }
}
```

---

## 8.2 Generate & Email Report Cards (With Versioning)

**Endpoint:** `POST /reports/generate-and-notify`  
**Purpose:** Generate PDFs and send branded emails  
**Auth Required:** Yes (admin, teacher)

**Request:**
```http
POST http://localhost:3001/reports/generate-and-notify
Authorization: Bearer {{TOKEN}}
X-Tenant-Subdomain: {{SUBDOMAIN}}
Content-Type: application/json

{
  "studentIds": ["usr_student_001", "usr_student_002"],
  "session": "2024/2025",
  "term": "Term 2"
}
```

**Expected Response:** `200 OK`
```json
{
  "success": true,
  "message": "Generated 2 report cards successfully. 0 failed.",
  "data": {
    "successful": 2,
    "failed": 0,
    "errors": []
  }
}
```

**What Happens:**
1. Generates report card for each student
2. Creates PDF with school branding (logo, motto, colors)
3. Uploads PDF to storage
4. Creates `ReportCardVersion` record (version 1)
5. Sends branded email with:
   - School logo, motto, colors, contact info
   - Performance summary
   - PDF download link
6. Logs email in `EmailNotification` table

---

## 8.3 Regenerate Report (Revised Version)

**Endpoint:** `POST /reports/generate-and-notify`  
**Purpose:** Create revised version after score updates  
**Auth Required:** Yes (admin, teacher)

**Request:**
```http
POST http://localhost:3001/reports/generate-and-notify
Authorization: Bearer {{TOKEN}}
X-Tenant-Subdomain: {{SUBDOMAIN}}
Content-Type: application/json

{
  "studentIds": ["usr_student_001"],
  "session": "2024/2025",
  "term": "Term 2",
  "changeReason": "Updated Mathematics exam score"
}
```

**Expected Response:** `200 OK`

**What Happens:**
1. Marks old version as `isLatest: false`
2. Creates new version (version 2)
3. Sends email with "REVISED" notice
4. Email shows version number and change reason

---

## 8.4 Get Report Card Versions

**Endpoint:** `GET /reports/student/:studentId/versions`  
**Purpose:** View all versions of student's report  
**Auth Required:** Yes

**Request:**
```http
GET http://localhost:3001/reports/student/usr_student_001/versions?session=2024/2025&term=Term%202
Authorization: Bearer {{TOKEN}}
X-Tenant-Subdomain: {{SUBDOMAIN}}
```

**Expected Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "ver_002",
      "version": 2,
      "pdfUrl": "https://storage.com/reports/report-v2.pdf",
      "generatedAt": "2025-04-15T10:30:00.000Z",
      "changeReason": "Updated Mathematics exam score",
      "isLatest": true,
      "notificationSent": true,
      "generator": {
        "firstName": "Grace",
        "lastName": "Okoro"
      }
    },
    {
      "id": "ver_001",
      "version": 1,
      "pdfUrl": "https://storage.com/reports/report-v1.pdf",
      "generatedAt": "2025-04-10T15:00:00.000Z",
      "isLatest": false
    }
  ]
}
```

---

## ✅ Step 8 Checklist

- [ ] Report card generated
- [ ] Report cards generated and emailed with PDFs
- [ ] Revised report created (version 2)
- [ ] Report versions retrieved
- [ ] Email notifications sent with branding

**Key Takeaway:** Report cards are versioned and automatically emailed with school branding!

**Next:** Proceed to Step 9 - Comments & Psychomotor

---

# STEP 9: Comments & Psychomotor

## 9.1 Add Teacher Comment

**Endpoint:** `POST /comments`  
**Purpose:** Add subject teacher comment  
**Auth Required:** Yes (teacher)

**Request:**
```http
POST http://localhost:3001/comments
Authorization: Bearer {{TOKEN}}
X-Tenant-Subdomain: {{SUBDOMAIN}}
Content-Type: application/json

{
  "studentId": "usr_student_001",
  "subjectId": "subject_math_jss1a",
  "session": "2024/2025",
  "term": "Term 2",
  "commentText": "Excellent performance. Keep up the good work!",
  "commentType": "subject"
}
```

**Expected Response:** `201 Created`

---

## 9.2 Add Class Teacher Comment

**Endpoint:** `POST /comments`  
**Purpose:** Add overall class teacher remark  
**Auth Required:** Yes (teacher)

**Request:**
```http
POST http://localhost:3001/comments
Authorization: Bearer {{TOKEN}}
X-Tenant-Subdomain: {{SUBDOMAIN}}
Content-Type: application/json

{
  "studentId": "usr_student_001",
  "session": "2024/2025",
  "term": "Term 2",
  "commentText": "Outstanding student. Shows great potential.",
  "commentType": "class_teacher"
}
```

**Expected Response:** `201 Created`

---

## 9.3 Add Principal Comment

**Endpoint:** `POST /comments`  
**Purpose:** Add principal's remark  
**Auth Required:** Yes (admin)

**Request:**
```http
POST http://localhost:3001/comments
Authorization: Bearer {{TOKEN}}
X-Tenant-Subdomain: {{SUBDOMAIN}}
Content-Type: application/json

{
  "studentId": "usr_student_001",
  "session": "2024/2025",
  "term": "Term 2",
  "commentText": "Excellent performance overall. Promoted to JSS 2.",
  "commentType": "principal"
}
```

**Expected Response:** `201 Created`

---

## 9.4 Add Psychomotor Assessment

**Endpoint:** `POST /psychomotor`  
**Purpose:** Record behavioral/skills assessment  
**Auth Required:** Yes (teacher)

**Request:**
```http
POST http://localhost:3001/psychomotor
Authorization: Bearer {{TOKEN}}
X-Tenant-Subdomain: {{SUBDOMAIN}}
Content-Type: application/json

{
  "studentId": "usr_student_001",
  "session": "2024/2025",
  "term": "Term 2",
  "ratings": {
    "punctuality": 5,
    "neatness": 4,
    "politeness": 5,
    "honesty": 5,
    "leadership": 4,
    "teamwork": 5
  },
  "comments": "Excellent behavior and participation in class activities."
}
```

**Expected Response:** `201 Created`

---

## 9.5 Get Student Comments

**Endpoint:** `GET /comments?studentId=usr_student_001`  
**Purpose:** View all comments for student  
**Auth Required:** Yes

**Request:**
```http
GET http://localhost:3001/comments?studentId=usr_student_001&session=2024/2025&term=Term%202
Authorization: Bearer {{TOKEN}}
X-Tenant-Subdomain: {{SUBDOMAIN}}
```

**Expected Response:** `200 OK`

---

## 9.6 Update Comment

**Endpoint:** `PATCH /comments/:id`  
**Purpose:** Edit existing comment  
**Auth Required:** Yes (comment author)

**Request:**
```http
PATCH http://localhost:3001/comments/comment_001
Authorization: Bearer {{TOKEN}}
X-Tenant-Subdomain: {{SUBDOMAIN}}
Content-Type: application/json

{
  "commentText": "Updated: Exceptional performance throughout the term."
}
```

**Expected Response:** `200 OK`

---

## ✅ Step 9 Checklist

- [ ] Teacher comment added
- [ ] Class teacher comment added
- [ ] Principal comment added
- [ ] Psychomotor assessment recorded
- [ ] Student comments retrieved
- [ ] Comment updated

**Key Takeaway:** Comments and psychomotor assessments are included in report cards!

**Next:** Proceed to Step 10 - Advanced Features

---

# STEP 10: Advanced Features

## 10.1 Get Class Rankings

**Endpoint:** `GET /rankings/class/:classId`  
**Purpose:** View student rankings in class  
**Auth Required:** Yes

**Request:**
```http
GET http://localhost:3001/rankings/class/class_jss1a?session=2024/2025&term=Term%202
Authorization: Bearer {{TOKEN}}
X-Tenant-Subdomain: {{SUBDOMAIN}}
```

**Expected Response:** `200 OK`

---

## 10.2 Get Subject Rankings

**Endpoint:** `GET /rankings/subject/:subjectId`  
**Purpose:** View top performers in subject  
**Auth Required:** Yes

**Request:**
```http
GET http://localhost:3001/rankings/subject/subject_math_jss1a?session=2024/2025&term=Term%202
Authorization: Bearer {{TOKEN}}
X-Tenant-Subdomain: {{SUBDOMAIN}}
```

**Expected Response:** `200 OK`

---

## 10.3 Student Progression

**Endpoint:** `POST /student-progression/promote`  
**Purpose:** Promote students to next class  
**Auth Required:** Yes (admin)

**Request:**
```http
POST http://localhost:3001/student-progression/promote
Authorization: Bearer {{TOKEN}}
X-Tenant-Subdomain: {{SUBDOMAIN}}
Content-Type: application/json

{
  "studentIds": ["usr_student_001", "usr_student_002"],
  "fromClassId": "class_jss1a",
  "toClassId": "class_jss2a",
  "session": "2024/2025"
}
```

**Expected Response:** `200 OK`

---

## 10.4 Bulk Upload Students

**Endpoint:** `POST /bulk/upload-students`  
**Purpose:** Upload multiple students via Excel  
**Auth Required:** Yes (admin)

**Prepare Excel File:**
| email | firstName | lastName | dateOfBirth | gender | classId |
|-------|-----------|----------|-------------|--------|---------|
| student1@school.com | Alice | Brown | 2010-01-15 | Female | class_jss1a |

**Request:**
```http
POST http://localhost:3001/bulk/upload-students
Authorization: Bearer {{TOKEN}}
X-Tenant-Subdomain: {{SUBDOMAIN}}
Content-Type: multipart/form-data

file: students.xlsx
```

**Expected Response:** `200 OK`

---

## 10.5 Bulk Upload Teachers

**Endpoint:** `POST /bulk/upload-teachers`  
**Purpose:** Upload multiple teachers via Excel  
**Auth Required:** Yes (admin)

**Request:**
```http
POST http://localhost:3001/bulk/upload-teachers
Authorization: Bearer {{TOKEN}}
X-Tenant-Subdomain: {{SUBDOMAIN}}
Content-Type: multipart/form-data

file: teachers.xlsx
```

**Expected Response:** `200 OK`

---

## 10.6 Notify Assessment Results

**Endpoint:** `POST /reports/assessments/:assessmentId/notify-results`  
**Purpose:** Send email notifications when results are published  
**Auth Required:** Yes (teacher, admin)

**Request:**
```http
POST http://localhost:3001/reports/assessments/assess_math_test1/notify-results
Authorization: Bearer {{TOKEN}}
X-Tenant-Subdomain: {{SUBDOMAIN}}
```

**Expected Response:** `200 OK`

---

## 10.7 Get School Statistics

**Endpoint:** `GET /tenant/stats`  
**Purpose:** View dashboard statistics  
**Auth Required:** Yes (admin)

**Request:**
```http
GET http://localhost:3001/tenant/stats
Authorization: Bearer {{TOKEN}}
X-Tenant-Subdomain: {{SUBDOMAIN}}
```

**Expected Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "totalStudents": 420,
    "totalTeachers": 35,
    "totalClasses": 18,
    "totalSubjects": 22,
    "totalAssessments": 145,
    "activeAssessments": 18,
    "averageClassSize": 23
  }
}
```

---

## ✅ Step 10 Checklist

- [ ] Class rankings retrieved
- [ ] Subject rankings retrieved
- [ ] Students promoted to next class
- [ ] Bulk student upload completed
- [ ] Bulk teacher upload completed
- [ ] Assessment result notifications sent
- [ ] School statistics retrieved

**Key Takeaway:** Advanced features enable efficient school management!

---

# 🎉 COMPLETE TEST FLOW FINISHED!

## Summary

You've successfully tested **ALL** endpoints across 10 comprehensive steps:

1. ✅ **Authentication & School Setup** - 7 endpoints
2. ✅ **Academic Calendar** - 8 endpoints  
3. ✅ **User Management** - 12 endpoints
4. ✅ **Class & Subject Management** - 12 endpoints
5. ✅ **Assessment Categories** - 7 endpoints
6. ✅ **Assessment Creation** - 10 endpoints
7. ✅ **Scores & Grading** - 5 endpoints
8. ✅ **Report Cards** - 4 endpoints (with versioning & email)
9. ✅ **Comments & Psychomotor** - 6 endpoints
10. ✅ **Advanced Features** - 7 endpoints

**Total: 78+ endpoints tested!**

## Key Features Verified

- ✅ Login with email/studentId/teacherId
- ✅ Academic session/term management
- ✅ Auto-derivation of session/term for assessments
- ✅ Assessment categories with configurable weights
- ✅ Online and offline assessments
- ✅ Manual and bulk score entry
- ✅ Report card generation with school branding
- ✅ Report card versioning with email notifications
- ✅ Teacher/principal comments
- ✅ Psychomotor assessments
- ✅ Rankings and progression
- ✅ Bulk operations

## Next Steps

1. Import this flow into Postman
2. Create environment variables
3. Run tests sequentially
4. Verify email notifications
5. Check PDF generation
6. Test bulk operations

**All implementations are production-ready!** 🚀

