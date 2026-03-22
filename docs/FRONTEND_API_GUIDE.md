# ParaLearn API — Frontend Developer Guide

> **Base URL:** `http://localhost:3001` (dev) · `https://api.pln.ng` (prod)
> **Swagger UI:** `http://localhost:3001/api/docs` (dev only)

---

## Recent Changes (2026-03-10)

| # | Change | Impact |
|---|--------|--------|
| 1 | **Student identity from JWT** — `studentId` no longer required in `startAssessment` / `heartbeat` request bodies. The server extracts the student ID from the bearer token automatically. | Remove `studentId` from those payloads |
| 2 | **Role guards enforced everywhere** — All protected routes now return `401` for a missing/invalid JWT and `403` for a JWT whose role does not match the route's allowed roles. | Auth errors are now deterministic |
| 3 | **`SUPER_ADMIN_KEY` rotated** — The old default `"super-admin-secret-change-in-production"` no longer works. The key is now a 64-character hex string managed via the `SUPER_ADMIN_KEY` environment variable. | Obtain the new key from the backend team's secrets vault |

---

## Table of Contents

1. [How the API Works](#1-how-the-api-works)
2. [Authentication Flow](#2-authentication-flow)
3. [Role Overview](#3-role-overview)
4. [Super Admin](#4-super-admin)
5. [School Admin](#5-school-admin)
6. [Lecturer](#6-lecturer)
7. [Student](#7-student)
8. [Public Endpoints (No Auth)](#8-public-endpoints-no-auth)
9. [Attendance System](#9-attendance-system)
10. [CBT / Exam System](#10-cbt--exam-system)
11. [Error Reference](#11-error-reference)
12. [Production Risk Assessment](#12-production-risk-assessment)

---

## 1. How the API Works

### Required Headers

Every request to a tenant-scoped endpoint (anything that is NOT `/public/*`, `/super-admin/*`, `/auth/login`, `/auth/register`, `/auth/forgot-password`, `/auth/reset-password`) **must** include a university identifier.

Choose one method:

| Method | Header | Example |
|--------|--------|---------|
| Direct ID | `X-University-Id` | `cm1a2b3c4d5e6f7g8h9` |
| Subdomain slug | `X-Tenant-Subdomain` | `rsu` |

```http
GET /admin/faculties
X-University-Id: cm1a2b3c4d5e6f7g8h9
Authorization: Bearer <jwt_token>
```

### JWT Authentication

After a successful login, you receive an `accessToken`. Send it on every subsequent request:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

The token payload contains:
```json
{
  "sub": "user_cuid",
  "email": "user@rsu.edu.ng",
  "role": "STUDENT | LECTURER | SCHOOL_ADMIN | SUPER_ADMIN",
  "universityId": "uni_cuid",
  "isSuperAdmin": false
}
```

Tokens expire in **7 days**. Redirect to `/login` on 401.

### Response Envelope

All errors follow this shape:
```json
{
  "statusCode": 400,
  "message": "Human-readable error message",
  "error": "Bad Request",
  "timestamp": "2026-03-10T12:00:00.000Z",
  "path": "/auth/login"
}
```

---

## 2. Authentication Flow

### Registration (Students & Lecturers)

```
1. GET /public/universities          → populate dropdown
2. POST /auth/register               → create account, get JWT
3. (optional) POST /auth/login       → get JWT
```

### Admin First Login

```
1. POST /auth/login                  → returns { mustChangePassword: true }
2. POST /auth/change-password        → forced redirect to change-password page
3. Proceed to admin dashboard
```

### Forgot Password

```
1. POST /auth/forgot-password        → user receives email link
2. User clicks link → /auth/reset-password?token=<token>
3. POST /auth/reset-password         → password updated, redirect to login
```

---

## 3. Role Overview

| Role | Description | Access |
|------|-------------|--------|
| `SUPER_ADMIN` | Platform owner (Anthropic / ParaLearn team) | All universities, uses API key |
| `SCHOOL_ADMIN` | University admin — sets up the institution | All admin endpoints for their university |
| `LECTURER` | Teaches courses, manages attendance & assessments | Lecturer endpoints |
| `STUDENT` | Enrolled student | Student endpoints |

---

## 4. Super Admin

> **Auth:** `X-Super-Admin-Key: <value>` header. No JWT needed.
> **No** `X-University-Id` required — these are cross-tenant operations.
>
> ⚠️ **The key has been rotated.** The old default placeholder `"super-admin-secret-change-in-production"` is no longer valid. Obtain the current 64-character hex key from the backend team's secrets vault or the server's `SUPER_ADMIN_KEY` environment variable. Missing or wrong key returns `403 Forbidden`.

### Bootstrap a New University

```http
POST /super-admin/universities
X-Super-Admin-Key: <SUPER_ADMIN_KEY from env>
Content-Type: application/json
```

**Request body:**
```json
{
  "name": "Rivers State University",
  "subdomain": "rsu",
  "schoolAdminEmail": "admin@rsu.edu.ng",
  "adminFirstName": "John",
  "adminLastName": "Doe",
  "logoUrl": "https://rsu.edu.ng/logo.png",
  "address": "Port Harcourt, Rivers State"
}
```

**Response `201`:**
```json
{
  "university": {
    "id": "cm1a2b3c...",
    "name": "Rivers State University",
    "subdomain": "rsu"
  },
  "admin": {
    "email": "admin@rsu.edu.ng",
    "temporaryPassword": "a3f9b2c1d4e5"
  },
  "message": "University bootstrapped. Share the temporary password securely with the admin."
}
```

> ⚠️ Show the `temporaryPassword` **once** on screen or send via secure channel. It is never stored in plain text.

---

### List All Universities (Platform View)

```http
GET /super-admin/universities
X-Super-Admin-Key: <SUPER_ADMIN_KEY from env>
```

**Response `200`:**
```json
[
  {
    "id": "cm1a2b3c...",
    "name": "Rivers State University",
    "subdomain": "rsu",
    "isActive": true,
    "contactEmail": "admin@rsu.edu.ng",
    "createdAt": "2026-03-01T00:00:00.000Z",
    "_count": { "users": 1420 }
  }
]
```

---

## 5. School Admin

> **Auth:** JWT Bearer token + `X-University-Id` header.
> Role in JWT must be `SCHOOL_ADMIN`.
> **Guards enforced:** All routes in this section require `JwtAuthGuard + RolesGuard`. A missing/invalid JWT returns `401`. A JWT with a role other than `SCHOOL_ADMIN` returns `403`.

---

### First Login & Password Change

**Login:**
```http
POST /auth/login
Content-Type: application/json
```
```json
{
  "email": "admin@rsu.edu.ng",
  "password": "a3f9b2c1d4e5",
  "universityId": "cm1a2b3c..."
}
```

**Response `200`:**
```json
{
  "accessToken": "eyJ...",
  "mustChangePassword": true,
  "user": {
    "id": "usr_cuid",
    "email": "admin@rsu.edu.ng",
    "role": "SCHOOL_ADMIN",
    "universityId": "cm1a2b3c..."
  }
}
```

> If `mustChangePassword: true`, redirect immediately to the change-password page before allowing access to the dashboard.

**Change Password:**
```http
POST /auth/change-password
Authorization: Bearer <jwt>
X-University-Id: cm1a2b3c...
```
```json
{
  "currentPassword": "a3f9b2c1d4e5",
  "newPassword": "MyNewSecurePass123!"
}
```

**Response `200`:**
```json
{ "message": "Password updated successfully" }
```

---

### Build Academic Structure

> All admin endpoints require `X-University-Id` and a valid `SCHOOL_ADMIN` JWT.

#### Create Faculty

```http
POST /admin/faculties
```
```json
{ "name": "Faculty of Engineering", "subtitle": "School of Applied Sciences" }
```
**Response:** Full faculty object with `id`.

#### Create Department

```http
POST /admin/departments
```
```json
{ "name": "Mechanical Engineering", "facultyId": "fac_cuid" }
```

#### Create Course

```http
POST /admin/courses
```
```json
{
  "code": "MEE 301",
  "title": "Thermodynamics II",
  "creditUnits": 3,
  "departmentId": "dept_cuid"
}
```

#### Create Timetable Entry

```http
POST /admin/timetable
```
```json
{
  "courseId": "course_cuid",
  "lecturerId": "lecturer_profile_cuid",
  "hallId": "hall_cuid",
  "dayOfWeek": "MONDAY",
  "startTime": "09:00",
  "endTime": "11:00"
}
```

> `dayOfWeek` values: `MONDAY | TUESDAY | WEDNESDAY | THURSDAY | FRIDAY | SATURDAY | SUNDAY`
> `startTime` / `endTime` format: `"HH:MM"` (24-hour, zero-padded)

---

### User Management

#### Add a Single User (Manual)

```http
POST /admin/users
```
```json
{
  "email": "jane.doe@rsu.edu.ng",
  "firstName": "Jane",
  "lastName": "Doe",
  "role": "STUDENT",
  "matricNumber": "2022/001",
  "temporaryPassword": "Welcome123!"
}
```

For lecturers:
```json
{
  "email": "prof.smith@rsu.edu.ng",
  "firstName": "James",
  "lastName": "Smith",
  "role": "LECTURER",
  "staffId": "ENG/002"
}
```

**Response `201`:**
```json
{
  "user": { "id": "usr_cuid", "email": "jane.doe@rsu.edu.ng", "role": "STUDENT" },
  "temporaryPassword": "Welcome123!",
  "message": "User created. Share the temporary password securely."
}
```

---

#### Bulk Import via CSV

Upload a CSV as a JSON body. Two separate endpoints for students and lecturers.

**Students CSV:**
```http
POST /admin/users/import/csv/students
Content-Type: application/json
```
```json
{
  "csvText": "email,firstName,lastName,matricNumber,level,year,department\njane@rsu.edu.ng,Jane,Doe,2022/001,100,1,Computer Science\njohn@rsu.edu.ng,John,Smith,2022/002,100,1,Computer Science"
}
```

**Lecturers CSV:**
```http
POST /admin/users/import/csv/lecturers
Content-Type: application/json
```
```json
{
  "csvText": "email,firstName,lastName,staffId,title\nprof.ada@rsu.edu.ng,Ada,Okafor,ENG/003,PROF"
}
```

Valid `title` values: `PROF | DR | MR | MRS | MS | ENGR`

**Response `200`** (both endpoints):
```json
{
  "created": 42,
  "skipped": 3,
  "errors": [
    { "row": 5, "email": "bad@rsu.edu.ng", "reason": "Email already registered" }
  ]
}
```

> Duplicate emails within the tenant are **skipped**, not errored. Only genuine failures appear in `errors`.

---

#### Download CSV Templates

```http
GET /admin/users/import/template/student
→ Downloads: student-import-template.csv

GET /admin/users/import/template/lecturer
→ Downloads: lecturer-import-template.csv
```

---

#### List All Users

```http
GET /admin/users
```
Returns all users scoped to the current university.

---

### List Faculties

```http
GET /admin/faculties
```

---

### List Sessions

```http
GET /admin/sessions
```

---

## 6. Lecturer

> **Auth:** JWT Bearer + `X-University-Id`.
> Role in JWT: `LECTURER` (or `SCHOOL_ADMIN` for read-only result views).
> **Guards enforced:** All routes in this section require `JwtAuthGuard + RolesGuard`. A missing/invalid JWT returns `401`. Any role other than `LECTURER` or `SCHOOL_ADMIN` returns `403`.

---

### Open / Close Attendance Window

This is the **most important** lecturer action. Students cannot check in until the lecturer opens the window.

```http
POST /lecturer/sessions/activate
Authorization: Bearer <jwt>
X-University-Id: cm1a2b3c...
```

**Open:**
```json
{ "lectureId": "lec_cuid", "open": true }
```

**Close (end of class):**
```json
{ "lectureId": "lec_cuid", "open": false }
```

**Response `200`:**
```json
{
  "message": "Attendance window OPENED for \"MEE 301 - Thermodynamics II\". Students may now check in.",
  "lecture": {
    "id": "lec_cuid",
    "name": "MEE 301 - Thermodynamics II",
    "attendanceOpen": true
  }
}
```

---

### View Assessment Results (with Essay Answers)

```http
GET /lecturer/assessments/:assessmentId/results
Authorization: Bearer <jwt>
X-University-Id: cm1a2b3c...
```

**Response `200`:**
```json
{
  "assessment": {
    "id": "asmt_cuid",
    "title": "Thermodynamics Midterm",
    "totalMarks": 100,
    "type": "MIXED"
  },
  "totalAttempts": 35,
  "attempts": [
    {
      "id": "attempt_cuid",
      "score": 78,
      "gradingStatus": "GRADED",
      "submittedAt": "2026-03-10T10:45:00.000Z",
      "integrityStatus": "CLEAN",
      "proctoringFlags": [],
      "student": {
        "id": "usr_cuid",
        "firstName": "Jane",
        "lastName": "Doe",
        "email": "jane@rsu.edu.ng",
        "studentProfile": {
          "studentId": "RSU-S-26-2022/001",
          "matricNumber": "2022/001"
        }
      },
      "studentAnswers": [
        {
          "id": "ans_cuid",
          "question": {
            "id": "q_cuid",
            "text": "Explain the second law of thermodynamics.",
            "type": "ESSAY",
            "points": 20
          },
          "textAnswer": "The second law states that entropy...",
          "selectedOption": null
        },
        {
          "id": "ans2_cuid",
          "question": {
            "id": "q2_cuid",
            "text": "Which process is adiabatic?",
            "type": "MCQ",
            "points": 5
          },
          "textAnswer": null,
          "selectedOption": {
            "id": "opt_cuid",
            "content": "Carnot cycle",
            "isCorrect": true
          }
        }
      ]
    }
  ]
}
```

> `integrityStatus` values: `CLEAN | LOW | MEDIUM | HIGH`
> `proctoringFlags` is an array of suspicious activity events logged by the frontend during the exam.

---

### View Timetable

```http
GET /lecturer/timetable
```
Optional body: `{ "lecturerId": "lecturer_profile_cuid" }` to filter by a specific lecturer.

---

### View Lecture Halls

```http
GET /lecturer/halls
```

---

## 7. Student

> **Auth:** JWT Bearer + `X-University-Id`.
> Role in JWT: `STUDENT`.
> **Guards enforced:** All routes in this section require `JwtAuthGuard + RolesGuard`. A missing/invalid JWT returns `401`. Any role other than `STUDENT` returns `403`.
> **Identity from JWT:** The server derives the student's ID directly from the bearer token. Do **not** include `studentId` in any request body for student-dashboard endpoints — it will be ignored at best and cause confusion at worst.

---

### Register (Self-Service)

```http
POST /auth/register
Content-Type: application/json
```
```json
{
  "email": "jane.student@rsu.edu.ng",
  "password": "SecurePass123!",
  "firstName": "Jane",
  "lastName": "Doe",
  "role": "STUDENT",
  "universityId": "cm1a2b3c...",
  "matricNumber": "2022/001"
}
```

For lecturers, replace `matricNumber` with `staffId`:
```json
{
  "role": "LECTURER",
  "staffId": "ENG/007"
}
```

**Response `201`:**
```json
{
  "accessToken": "eyJ...",
  "user": {
    "id": "usr_cuid",
    "email": "jane.student@rsu.edu.ng",
    "role": "STUDENT",
    "universityId": "cm1a2b3c..."
  }
}
```

---

### Get My Profile

```http
GET /auth/me
Authorization: Bearer <jwt>
X-University-Id: cm1a2b3c...
```

**Response `200`:**
```json
{
  "id": "usr_cuid",
  "email": "jane.student@rsu.edu.ng",
  "firstName": "Jane",
  "lastName": "Doe",
  "role": "STUDENT",
  "statusId": "ACTIVE",
  "mustChangePassword": false,
  "universityId": "cm1a2b3c...",
  "university": {
    "id": "cm1a2b3c...",
    "name": "Rivers State University",
    "subdomain": "rsu",
    "logoUrl": "https://rsu.edu.ng/logo.png"
  },
  "studentProfile": {
    "studentId": "RSU-S-26-2022/001",
    "matricNumber": "2022/001",
    "level": 300
  },
  "lecturerProfile": null
}
```

---

### View Timetable

```http
GET /student/timetable
Authorization: Bearer <jwt>
X-University-Id: cm1a2b3c...
```

Returns all timetable entries with course, hall, and lecturer info.

---

### View Eligible Courses

```http
GET /student/courses/eligible
```

---

### Start a CBT Exam

```http
POST /student/assessments/:assessmentId/start
Authorization: Bearer <jwt>
X-University-Id: cm1a2b3c...
```
```json
{ "deviceId": "device-hardware-fingerprint-string" }
```

> **No `studentId` needed.** The server identifies the student from the JWT automatically.

**Response `200`:**
```json
{
  "message": "Exam session started. Ensure you send heartbeats every 20 seconds to keep the token alive.",
  "ttl": 30
}
```

> The exam token lives in Redis for 30 seconds. You **must** ping the heartbeat endpoint every 20 seconds or the session expires and the student is locked out.

---

### Send CBT Heartbeat (Keep Exam Alive)

```http
POST /student/assessments/:assessmentId/heartbeat
Authorization: Bearer <jwt>
X-University-Id: cm1a2b3c...
```
```json
{ "deviceId": "device-hardware-fingerprint-string" }
```

> **No `studentId` needed.** Identity is derived from the bearer token.

**Response `200`:**
```json
{ "message": "Token refreshed", "ttl": 30 }
```

---

## 8. Public Endpoints (No Auth)

These endpoints require **no** `Authorization` header and **no** `X-University-Id`.

### List Active Universities (Signup Dropdown)

```http
GET /public/universities
```

**Response `200`:**
```json
[
  { "id": "cm1a2b3c...", "name": "Rivers State University", "subdomain": "rsu" },
  { "id": "cm2b3c4d...", "name": "University of Ibadan", "subdomain": "ui" }
]
```

---

### Login

```http
POST /auth/login
```
```json
{
  "email": "jane@rsu.edu.ng",
  "password": "SecurePass123!",
  "universityId": "cm1a2b3c..."
}
```

---

### Forgot Password

```http
POST /auth/forgot-password
```
```json
{
  "email": "jane@rsu.edu.ng",
  "universityId": "cm1a2b3c..."
}
```

**Response `200`** (always — even if email not found, to prevent enumeration):
```json
{ "message": "If that email is registered you will receive a reset link shortly." }
```

The email contains a link: `{FRONTEND_URL}/auth/reset-password?token=<token>`
Tokens expire in **30 minutes**.

---

### Reset Password

```http
POST /auth/reset-password
```
```json
{
  "token": "<token_from_email_link>",
  "newPassword": "NewSecurePass123!"
}
```

**Response `200`:**
```json
{ "message": "Password has been reset. You can now log in with your new password." }
```

**Response `400`:**
```json
{ "message": "Password reset token has expired. Please request a new one." }
```

---

## 9. Attendance System

> **Guards enforced:** All attendance endpoints require `JwtAuthGuard + RolesGuard`. Allowed roles: `STUDENT`, `LECTURER`, `SCHOOL_ADMIN`. A missing/invalid JWT returns `401`. Any other role returns `403`.

The attendance system enforces **three sequential gates**. All three must pass for a check-in to succeed.

```
Gate 1 — Session Gate:   lecture.attendanceOpen must be true (lecturer opened it)
Gate 2 — Temporal Gate:  timetable slot for this course must be active right now
Gate 3 — Geofence Gate:  student GPS must be inside the lecture hall polygon
```

---

### Mark Attendance

```http
POST /attendance/mark
Authorization: Bearer <jwt>
X-University-Id: cm1a2b3c...
```
```json
{
  "studentId": "usr_cuid",
  "lectureId": "lec_cuid",
  "coords": {
    "lat": 4.8156,
    "lng": 7.0498,
    "accuracy": 12
  },
  "deviceId": "device-hardware-fingerprint-string"
}
```

**Response `200` — Success:**
```json
{
  "status": "MARKED",
  "attendanceLogId": "log_cuid",
  "message": "Attendance marked successfully."
}
```

**Possible `status` values:**

| Status | Meaning |
|--------|---------|
| `MARKED` | Successfully marked PRESENT |
| `ALREADY_MARKED` | Student already marked PRESENT for this lecture |
| `OUTSIDE_FENCE` | Student is outside the geofenced hall area |
| `NO_GEOFENCE` | Hall has no polygon — marked PRESENT by default |
| `PROCESSING` | Complex polygon (>10 vertices) — check back shortly |

**Error responses:**

| Status | Message |
|--------|---------|
| `409` | `"The lecturer has not opened the attendance window..."` |
| `409` | `"This lecture is not scheduled in this hall right now."` |
| `403` | `"Attendance check-in rejected: unauthorized device"` |
| `404` | `"Lecture not found for this university."` |

---

### Dwell Monitoring Heartbeat

After marking attendance, send a heartbeat every **60 seconds** to prove the student hasn't left.

```http
POST /attendance/heartbeat
Authorization: Bearer <jwt>
X-University-Id: cm1a2b3c...
```
```json
{
  "attendanceLogId": "log_cuid",
  "lat": 4.8156,
  "lng": 7.0498,
  "deviceId": "device-hardware-fingerprint-string"
}
```

**Response `200`:**
```json
{
  "status": "INSIDE",
  "message": "Heartbeat recorded"
}
```

If the student leaves the hall:
```json
{
  "status": "OUTSIDE",
  "message": "Student is outside the geofence. Log marked as EXCEPTION."
}
```

---

### Get Attendance for a Lecture

```http
GET /attendance/lecture/:lectureId
Authorization: Bearer <jwt>
X-University-Id: cm1a2b3c...
```

---

### Get Student Attendance History

```http
GET /attendance/student/:studentId
Authorization: Bearer <jwt>
X-University-Id: cm1a2b3c...
```

---

## 10. CBT / Exam System

> **Guards enforced:** All CBT endpoints require `JwtAuthGuard + RolesGuard`. Allowed roles: `STUDENT`, `LECTURER`, `SCHOOL_ADMIN`. A missing/invalid JWT returns `401`. A `SUPER_ADMIN`-only JWT returns `403`.

### Submit Assessment

```http
POST /cbt/submit
Authorization: Bearer <jwt>
X-University-Id: cm1a2b3c...
```
```json
{
  "studentId": "usr_cuid",
  "assessmentId": "asmt_cuid",
  "answers": [
    {
      "questionId": "q1_cuid",
      "selectedOptionId": "opt_cuid"
    },
    {
      "questionId": "q2_cuid",
      "textAnswer": "The process involves thermodynamic equilibrium..."
    }
  ]
}
```

**Response `200` — Graded immediately (≤20 questions):**
```json
{
  "examAttemptId": "attempt_cuid",
  "gradingStatus": "GRADED",
  "score": 85,
  "message": "Assessment graded successfully."
}
```

**Response `200` — Queued (>20 questions):**
```json
{
  "examAttemptId": "attempt_cuid",
  "gradingStatus": "PENDING",
  "jobId": "grade:attempt_cuid",
  "message": "Assessment submitted (45 questions). Grading is in progress — check back shortly."
}
```

---

### Poll Attempt Result

Use this when `gradingStatus` is `PENDING`.

```http
GET /cbt/attempt/:attemptId
Authorization: Bearer <jwt>
X-University-Id: cm1a2b3c...
```

**Response `200`:**
```json
{
  "id": "attempt_cuid",
  "score": 78.5,
  "gradingStatus": "GRADED",
  "submittedAt": "2026-03-10T11:30:00.000Z",
  "assessment": {
    "title": "Thermodynamics Midterm",
    "totalMarks": 100
  }
}
```

---

### Get Student's Exam History

```http
GET /cbt/student/:studentId/attempts
Authorization: Bearer <jwt>
X-University-Id: cm1a2b3c...
```

---

### Proctoring Flags (Anti-Cheating)

During the exam, log suspicious events from the frontend and include them in the submission or a separate proctoring call. Each flag follows this shape:

```json
{
  "type": "TAB_SWITCH",
  "occurredAt": "2026-03-10T11:05:00.000Z",
  "meta": { "tabCount": 2 }
}
```

| `type` | Trigger |
|--------|---------|
| `TAB_SWITCH` | `document.visibilitychange` event |
| `WINDOW_BLUR` | `window.blur` event |
| `SCREENSHOT_ATTEMPT` | `PrintScreen` key detected |
| `COPY_PASTE` | `copy` / `paste` event during exam |
| `FULLSCREEN_EXIT` | Fullscreen API change |
| `DEVTOOLS_OPEN` | Console size heuristic |
| `CONTEXT_MENU` | Right-click disabled |
| `MULTIPLE_FACES` | Camera ML detection |
| `NO_FACE` | Camera ML detection |
| `PHONE_DETECTED` | Camera ML detection |

The backend rolls these up into `integrityStatus`: `CLEAN | LOW | MEDIUM | HIGH`.

---

## 11. Error Reference

| HTTP Code | Meaning | Common Cause |
|-----------|---------|--------------|
| `400` | Bad Request | Missing/invalid field, expired token |
| `401` | Unauthorized | Missing or invalid JWT, wrong password |
| `403` | Forbidden | Wrong role, suspended account, device mismatch |
| `404` | Not Found | University/user/lecture ID doesn't exist |
| `409` | Conflict | Duplicate email, already submitted, attendance gate blocked |
| `500` | Server Error | Unhandled exception — check logs |

---

## 12. Production Risk Assessment

### Overall Risk: **Medium** (estimated 35–45% chance of a breaking error on first production deploy without the remaining fixes below)

The architecture and logic are sound. Three of six original risks have been resolved (see [Recent Changes](#recent-changes-2026-03-10)). The remaining **3 risks** must be addressed before going live:

---

### 🔴 High Risk — Will Break

#### 1. Database Migration Not Applied
**Risk: Certain**
The schema has been updated multiple times (added `mustChangePassword`, `attendanceOpen`, `proctoringFlags`, `integrityStatus`, `passwordResetToken`, `passwordResetExpiry`) but `prisma migrate deploy` has never been run against a production DB. **The app will crash on startup or throw Prisma query errors.**

**Fix:**
```bash
# Run before deploying
npx prisma migrate deploy
```

---

#### 2. Redis Not Configured
**Risk: Certain**
The CBT system (exam tokens) and BullMQ queues (grading, geofence, notifications) all require Redis. If `REDIS_HOST` / `REDIS_PASSWORD` are not set in production env vars, the app will throw on startup when connecting.

**Fix:** Set env vars:
```
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
```

---

#### 3. Mail SMTP Credentials Missing
**Risk: High**
`POST /auth/forgot-password` calls `MailService.sendPasswordReset()`. If `MAIL_USER` / `MAIL_PASS` are empty, the SMTP transporter will throw and the endpoint returns 500.

**Fix:** Set env vars, or in production use a transactional service (Resend, SendGrid):
```
MAIL_HOST=smtp.gmail.com
MAIL_USER=noreply@pln.ng
MAIL_PASS=your-app-password
```

---

### ✅ Resolved — No Longer Blocking

#### ~~4. `studentId` Hardcoded Placeholder~~ — **RESOLVED**
~~`StudentController` used `'AUTH_EXTRACTED_STUDENT_ID'` in `startAssessment` and `sendCbtHeartbeat`.~~

**Resolution:** `@CurrentUser() user: { id: string }` is now used throughout `StudentController`. Student identity is derived from the verified JWT. Do not send `studentId` in the request body for student-dashboard endpoints.

---

#### ~~5. No Role Guards on Any Endpoint~~ — **RESOLVED**
~~All protected endpoints used `X-University-Id` for tenant isolation but no `RolesGuard` was applied.~~

**Resolution:** `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles(...)` are now applied at the controller class level for:
- `AdminController` → `SCHOOL_ADMIN` only
- `LecturerController` → `LECTURER`, `SCHOOL_ADMIN`
- `StudentController` → `STUDENT` only
- `CBTController` → `STUDENT`, `LECTURER`, `SCHOOL_ADMIN`
- `AttendanceController` → `STUDENT`, `LECTURER`, `SCHOOL_ADMIN`

---

#### ~~6. `SUPER_ADMIN_KEY` Default Value~~ — **RESOLVED**
~~The default `"super-admin-secret-change-in-production"` was in `.env`.~~

**Resolution:** The key has been rotated to a 64-character cryptographically random hex value in `.env`. The old placeholder no longer grants access. Obtain the current value from the backend team's secrets vault.

---

### Summary Checklist Before Production

```
[ ] npx prisma migrate deploy
[ ] Set REDIS_HOST, REDIS_PORT, REDIS_PASSWORD
[ ] Set MAIL_HOST, MAIL_USER, MAIL_PASS
[ ] Set JWT_SECRET (strong random value)
[x] Set SUPER_ADMIN_KEY (rotated — done)
[ ] Set FRONTEND_URL (for CORS + reset-password email links)
[x] Replace 'AUTH_EXTRACTED_STUDENT_ID' with @CurrentUser() (done)
[x] Apply JwtAuthGuard + RolesGuard to all protected controllers (done)
[ ] Set NODE_ENV=production
```
