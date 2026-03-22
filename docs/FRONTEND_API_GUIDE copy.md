# ParaLearn API — Frontend Developer Guide

> **Base URL (dev):** `http://localhost:3001`
> **Base URL (prod):** `https://api.pln.ng`
> **Swagger UI:** `http://localhost:3001/api/docs` *(dev only)*
> **Domain:** All sub-domains use `*.pln.ng` (e.g. `rsu.pln.ng`)

---

## Table of Contents

1. [How the API Works](#1-how-the-api-works)
2. [Authentication](#2-authentication)
3. [Role Overview](#3-role-overview)
4. [Super Admin](#4-super-admin)
5. [School Admin](#5-school-admin)
6. [Lecturer](#6-lecturer)
7. [Student](#7-student)
8. [Public Endpoints (No Auth)](#8-public-endpoints-no-auth)
9. [Attendance System](#9-attendance-system)
10. [CBT / Exam System](#10-cbt--exam-system)
11. [Geofence System](#11-geofence-system)
12. [Course Enrollment vs Attendance](#12-course-enrollment-vs-attendance)
13. [Error Reference](#13-error-reference)

---

## 1. How the API Works

### Required Headers

Every request to a **tenant-scoped** endpoint must include a university identifier. Choose one:

| Method | Header | Example |
|--------|--------|---------|
| Direct ID | `X-University-Id` | `cm1a2b3c4d5e6f7g8h9` |
| Subdomain slug | `X-Tenant-Subdomain` | `rsu` |

Tenant-scoped = anything **except** `/public/*`, `/super-admin/*`, `/auth/login`, `/auth/register`, `/auth/forgot-password`, `/auth/reset-password`.

```http
GET /admin/faculties
X-University-Id: cm1a2b3c4d5e6f7g8h9
Authorization: Bearer <jwt>
```

### Subdomain Resolution (Production)

When the frontend is hosted on a subdomain (e.g. `rsu.pln.ng`), the backend automatically resolves the university from the subdomain. In development with `rsu.localhost:3000`, use:

```http
GET /public/universities/by-subdomain/rsu
```
→ Returns `{ id, name, subdomain, logoUrl }`. Store the `id` and pass it as `X-University-Id`.

### Error Shape

All errors return:
```json
{
  "statusCode": 400,
  "message": "Human-readable description",
  "error": "Bad Request"
}
```

Validation errors return an array:
```json
{
  "statusCode": 400,
  "message": ["email must be an email", "password must be at least 8 characters"],
  "error": "Bad Request"
}
```

---

## 2. Authentication

### Standard Login Flow

```
POST /auth/login
POST /auth/register         ← self-registration (Student/Lecturer)
POST /auth/forgot-password
POST /auth/reset-password
POST /auth/change-password  ← requires Bearer token
GET  /auth/me               ← requires Bearer token
```

#### `POST /auth/login`

```json
// Request
{
  "email": "jane.doe@rsu.edu.ng",
  "password": "SecurePass123!",
  "universityId": "cm1a2b3c..."   // optional — resolved from email if omitted
}

// Response 200
{
  "accessToken": "eyJhbGc...",
  "mustChangePassword": false,
  "user": {
    "id": "cm1a2b3c...",
    "email": "jane.doe@rsu.edu.ng",
    "firstName": "Jane",
    "lastName": "Doe",
    "role": "STUDENT",
    "universityId": "cm1a2b3c..."
  }
}
```

> If `mustChangePassword: true` — redirect to the change-password page immediately after login. This is set for School Admins created by the Super Admin.

#### `POST /auth/register`

Self-registration for Students and Lecturers only.

```json
// Request
{
  "email": "jane.doe@rsu.edu.ng",
  "password": "SecurePass123!",
  "firstName": "Jane",
  "lastName": "Doe",
  "role": "STUDENT",
  "universityId": "cm1a2b3c...",
  "matricNumber": "2022/001"       // required for STUDENT
  // "staffId": "ENG/001"          // required for LECTURER (auto-generated if omitted)
}

// Response 201
{
  "accessToken": "eyJhbGc...",
  "user": { "id": "...", "email": "...", "role": "STUDENT" }
}
```

#### `POST /auth/forgot-password`

```json
// Request
{
  "email": "jane.doe@rsu.edu.ng",
  "universityId": "cm1a2b3c..."   // optional — resolved from email if omitted
}

// Response 200 — always returns this, regardless of whether the email exists
{
  "message": "If that email is registered you will receive a reset link shortly."
}
```

Reset email comes from `noreply@pln.ng` with a link to `FRONTEND_URL/auth/reset-password?token=<token>`.

#### `POST /auth/reset-password`

```json
// Request
{
  "token": "<token from email>",
  "newPassword": "NewSecurePass123!"
}
```

#### `POST /auth/change-password` *(requires Bearer token)*

```json
// Request
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass456!"
}
```

#### `GET /auth/me` *(requires Bearer token)*

Returns the full user profile including role-specific data:
```json
{
  "id": "cm...",
  "email": "jane@rsu.edu.ng",
  "firstName": "Jane",
  "lastName": "Doe",
  "role": "STUDENT",
  "mustChangePassword": false,
  "university": { "id": "...", "name": "Rivers State University", "subdomain": "rsu", "logoUrl": "..." },
  "studentProfile": { "studentId": "RSU-S-26-2022/001", "matricNumber": "2022/001", "level": null },
  "lecturerProfile": null
}
```

### JWT Payload

```json
{
  "sub": "user_cuid",
  "email": "user@rsu.edu.ng",
  "role": "STUDENT | LECTURER | SCHOOL_ADMIN | SUPER_ADMIN",
  "universityId": "uni_cuid",
  "isSuperAdmin": false
}
```

Tokens expire in **7 days**. Redirect to `/login` on `401`.

### WebAuthn (Passwordless — optional)

For apps requiring device-bound biometric login:

```
POST /auth/webauthn/registration/generate-options   ← Step 1 of registration
POST /auth/webauthn/registration/verify             ← Step 2 of registration
POST /auth/webauthn/authentication/generate-options ← Step 1 of login
POST /auth/webauthn/authentication/verify           ← Step 2 of login
```

---

## 3. Role Overview

| Role | Token source | What they do |
|------|-------------|--------------|
| `SUPER_ADMIN` | `X-Super-Admin-Key` header (no JWT) | Create / list universities |
| `SCHOOL_ADMIN` | JWT | Manage academic structure, users, halls |
| `LECTURER` | JWT | Manage attendance, geofences, assessments |
| `STUDENT` | JWT | Enroll in courses, attend classes, take exams |

---

## 4. Super Admin

**Auth:** `X-Super-Admin-Key: <64-char-hex-key>` header (no JWT needed).

```
POST /super-admin/universities   ← Bootstrap a new university
GET  /super-admin/universities   ← List all universities on the platform
```

#### `POST /super-admin/universities`

```json
// Request
{
  "name": "Rivers State University",
  "subdomain": "rsu",
  "adminEmail": "admin@rsu.edu.ng",
  "adminFirstName": "John",
  "adminLastName": "Admin",
  "address": "Port Harcourt, Rivers State",
  "logoUrl": "https://rsu.edu.ng/logo.png",
  "contactEmail": "info@rsu.edu.ng"
}

// Response 201
{
  "university": { "id": "cm...", "name": "Rivers State University", "subdomain": "rsu" },
  "admin": {
    "id": "cm...",
    "email": "admin@rsu.edu.ng",
    "temporaryPassword": "df0b0b8d",
    "mustChangePassword": true
  },
  "message": "University created. Share the temporary password securely."
}
```

> The admin receives an email from `noreply@pln.ng` with their temporary password.

---

## 5. School Admin

**Auth:** Bearer JWT with role `SCHOOL_ADMIN`.
**Required header:** `X-University-Id`.

### Academic Structure

```
POST   /admin/faculties                        ← Create faculty
GET    /admin/faculties                        ← List faculties

POST   /admin/departments                      ← Create department
GET    /admin/departments                      ← List departments

POST   /admin/courses                          ← Create course
GET    /admin/courses                          ← List courses
POST   /admin/courses/:id/assign-lecturer      ← Assign lecturer to course
DELETE /admin/courses/:id/remove-lecturer/:lecturerId

GET    /admin/stats                            ← Dashboard counts
```

#### `POST /admin/faculties`
```json
{ "name": "Faculty of Engineering", "subtitle": "Eng" }
```

#### `POST /admin/departments`
```json
{ "name": "Computer Science", "facultyId": "cm..." }
```

#### `POST /admin/courses`
```json
{
  "title": "Data Structures and Algorithms",
  "code": "CSC301",
  "creditUnits": 3,
  "departmentId": "cm..."
}
```

#### `GET /admin/stats`
```json
{ "faculties": 5, "departments": 18, "courses": 120, "users": 3400 }
```

#### `POST /admin/courses/:id/assign-lecturer`
```json
{ "lecturerId": "<LecturerProfile.id>" }
```

### User Management

```
POST   /admin/users                            ← Create Student or Lecturer
GET    /admin/users?page=1&limit=10&search=Jane&role=STUDENT
PATCH  /admin/users/:id/role
GET    /admin/enrollments?courseId=cm...       ← View all course enrollments
```

#### `POST /admin/users`

```json
// Request
{
  "email": "jane.doe@rsu.edu.ng",
  "firstName": "Jane",
  "lastName": "Doe",
  "role": "STUDENT",              // or "LECTURER"
  "matricNumber": "2022/001",     // required for STUDENT
  "staffId": "ENG/001",           // optional for LECTURER (auto-generated if omitted)
  "temporaryPassword": "Pass123!" // optional — auto-generated if omitted
}

// Response 201
{
  "user": { "id": "cm...", "email": "...", "role": "STUDENT" },
  "temporaryPassword": "df0b0b8d",
  "message": "User created. Share the temporary password securely."
}
```

#### `GET /admin/users`

```json
// Response
{
  "data": [
    {
      "id": "cm...",
      "email": "jane@rsu.edu.ng",
      "firstName": "Jane",
      "lastName": "Doe",
      "role": "STUDENT",
      "statusId": "ACTIVE",
      "studentProfile": { "studentId": "RSU-S-26-2022/001", "matricNumber": "2022/001", "level": null },
      "lecturerProfile": null
    }
  ],
  "meta": { "total": 320, "page": 1, "limit": 10, "totalPages": 32 }
}
```

### Bulk Import (CSV)

```
POST /admin/users/import/json/students          ← JSON array of students
POST /admin/users/import/json/lecturers         ← JSON array of lecturers
POST /admin/users/import/csv/students           ← CSV text body
POST /admin/users/import/csv/lecturers          ← CSV text body
POST /admin/curriculum/import/faculties         ← CSV of faculties
POST /admin/curriculum/import/departments       ← CSV of departments
POST /admin/curriculum/import/courses           ← CSV of courses
```

**CSV import:** Send `{ "csvText": "email,firstName,lastName,...\njane@rsu.edu.ng,Jane,Doe,..." }`

**CSV columns for students:** `email, firstName, lastName, matricNumber` (optional: `level, year, department`)
**CSV columns for lecturers:** `email, firstName, lastName, staffId` (optional: `title`)

```json
// Response for all import endpoints
{
  "created": 45,
  "skipped": 2,
  "errors": [{ "row": 3, "reason": "Email already exists" }]
}
```

### Lecture Halls

```
POST   /admin/halls              ← Create hall (with optional default geofence)
GET    /admin/halls              ← List all halls
GET    /admin/halls/:id          ← Get single hall
PATCH  /admin/halls/:id          ← Update hall / geofence
DELETE /admin/halls/:id          ← Delete hall
```

#### `POST /admin/halls`

```json
// Request
{
  "name": "Lecture Theatre 1",
  "geoLat": 4.8156,
  "geoLng": 7.0498,
  "geoRadiusMeters": 50
}

// Response
{
  "id": "cm...",
  "name": "Lecture Theatre 1",
  "geoLat": 4.8156,
  "geoLng": 7.0498,
  "geoRadiusMeters": 50,
  "geofences": []
}
```

> `geoLat`, `geoLng`, `geoRadiusMeters` are the **hall default geofence**. Lecturers can override this per lecture. Leave them `null` for halls with no default fence.

#### `PATCH /admin/halls/:id`

```json
{
  "name": "LT1 Annex",
  "geoLat": 4.8158,
  "geoLng": 7.0501,
  "geoRadiusMeters": 75
}
```

### Timetable

```
POST /admin/timetable            ← Create timetable slot
GET  /admin/timetable            ← List all slots
```

#### `POST /admin/timetable`

```json
{
  "courseId": "cm...",
  "lecturerId": "cm...",          // User.id of the lecturer
  "hallId": "cm...",
  "dayOfWeek": "MONDAY",          // MONDAY | TUESDAY | WEDNESDAY | THURSDAY | FRIDAY | SATURDAY | SUNDAY
  "startTime": "09:00",
  "endTime": "11:00"
}
```

### Academic Sessions

```
POST  /admin/sessions             ← Create session
GET   /admin/sessions             ← List sessions
PATCH /admin/sessions/:id/activate ← Set as active session
```

---

## 6. Lecturer

**Auth:** Bearer JWT with role `LECTURER` or `SCHOOL_ADMIN`.
**Required header:** `X-University-Id`.

### Timetable & Halls

```
GET /lecturer/timetable          ← This lecturer's weekly schedule (auto-filtered by userId)
GET /lecturer/halls              ← All halls with their geofences
```

### My Courses

```
GET /lecturer/courses                        ← Courses assigned to this lecturer
GET /lecturer/courses/:courseId/roster       ← Attendance + enrollment breakdown
```

#### `GET /lecturer/courses`

```json
[
  {
    "courseId": "cm...",
    "code": "CSC301",
    "title": "Data Structures and Algorithms",
    "creditUnits": 3,
    "department": { "id": "cm...", "name": "Computer Science" },
    "enrolledStudents": 45,
    "totalLectures": 12
  }
]
```

#### `GET /lecturer/courses/:courseId/roster`

Returns two lists — **enrolled** (can sit exams) and **attendees** (physically showed up):

```json
{
  "course": { "id": "cm...", "code": "CSC301", "title": "Data Structures and Algorithms" },
  "summary": {
    "totalEnrolled": 45,
    "totalAttendees": 38,
    "attendingButNotEnrolled": 5,
    "enrolledButNeverAttended": 12
  },
  "enrolled": [
    {
      "id": "cm...",
      "firstName": "Jane",
      "lastName": "Doe",
      "email": "jane@rsu.edu.ng",
      "studentProfile": { "studentId": "RSU-S-26-2022/001", "matricNumber": "2022/001", "level": null },
      "enrolledAt": "2026-02-01T08:00:00Z",
      "attendanceCount": 7,
      "hasAttended": true
    }
  ],
  "attendees": [
    {
      "id": "cm...",
      "firstName": "Mark",
      "lastName": "Smith",
      "attendanceCount": 3,
      "lastAttended": "2026-03-10T10:30:00Z"
    }
  ],
  "alerts": {
    "attendingWithoutEnrollment": [ /* students attending but NOT enrolled — cannot sit exams */ ],
    "enrolledWithZeroAttendance": [ /* enrolled but never showed up */ ]
  }
}
```

> **Key distinction:**
> - `enrolled` → formally registered. Can take CBT exams.
> - `attendees` → physically present. Attendance is open to all students.
> - `alerts.attendingWithoutEnrollment` → flag these students — they'll be blocked from exams.

### Attendance Session Control

```
POST /lecturer/sessions/activate       ← Open or close attendance window + optional geofence
GET  /lecturer/lectures/:lectureId/attendance  ← See who attended a specific lecture
```

#### `POST /lecturer/sessions/activate` — Open with existing geofence

```json
{
  "lectureId": "cm...",
  "open": true,
  "geofenceId": "cm..."    // select an existing geofence from GET /lecturer/geofences
}
```

#### `POST /lecturer/sessions/activate` — Open with a new geofence created on the fly

```json
{
  "lectureId": "cm...",
  "open": true,
  "newGeofence": {
    "name": "LT1 – Side Door",
    "lat": 4.8156,
    "lng": 7.0498,
    "radiusMeters": 40,
    "lectureHallId": "cm..."    // optional — links to a hall
  }
}
```

#### `POST /lecturer/sessions/activate` — Open without specifying a geofence

```json
{
  "lectureId": "cm...",
  "open": true
  // hall's default geofence (geoLat/geoLng/geoRadiusMeters) is used automatically
}
```

#### `POST /lecturer/sessions/activate` — Close

```json
{
  "lectureId": "cm...",
  "open": false
}
```

```json
// Response
{
  "message": "Attendance window OPENED for \"CSC301 – Week 5\". Geofence active.",
  "lecture": {
    "id": "cm...",
    "name": "CSC301 – Week 5",
    "attendanceOpen": true,
    "geofence": {
      "id": "cm...",
      "name": "LT1 – Side Door",
      "lat": 4.8156,
      "lng": 7.0498,
      "radiusMeters": 40
    }
  }
}
```

### Assessments (CBT)

```
POST   /lecturer/assessments           ← Create exam/quiz with questions
GET    /lecturer/assessments           ← List all assessments
GET    /lecturer/assessments/:id       ← Get single assessment with questions
PATCH  /lecturer/assessments/:id       ← Update assessment metadata
DELETE /lecturer/assessments/:id       ← Delete assessment

GET    /lecturer/assessments/:id/results   ← All student attempts + answers
GET    /lecturer/submissions/:id           ← Single student submission
PATCH  /lecturer/submissions/:id/grade     ← Manually grade an essay submission
PATCH  /lecturer/results/publish           ← Release results to students
```

#### `POST /lecturer/assessments`

```json
{
  "title": "CSC301 Mid-Semester Exam",
  "timetableId": "cm...",
  "type": "MCQ",                    // MCQ | ESSAY | OBJECTIVE | MIXED
  "totalMarks": 100,
  "durationMins": 60,
  "questions": [
    {
      "text": "What is Big-O notation?",
      "type": "MCQ",
      "points": 2,
      "options": [
        { "content": "A measure of algorithm time complexity", "isCorrect": true },
        { "content": "A sorting algorithm", "isCorrect": false },
        { "content": "A data structure", "isCorrect": false },
        { "content": "None of the above", "isCorrect": false }
      ]
    }
  ]
}
```

#### `GET /lecturer/assessments/:id/results`

```json
{
  "assessment": { "id": "cm...", "title": "Mid-Semester Exam", "totalMarks": 100, "type": "MCQ" },
  "totalAttempts": 42,
  "attempts": [
    {
      "id": "cm...",
      "score": 78,
      "gradingStatus": "GRADED",
      "submittedAt": "2026-03-10T11:45:00Z",
      "integrityStatus": "CLEAN",
      "proctoringFlags": [],
      "student": {
        "id": "cm...",
        "firstName": "Jane",
        "lastName": "Doe",
        "studentProfile": { "studentId": "RSU-S-26-2022/001", "matricNumber": "2022/001" }
      },
      "studentAnswers": [
        {
          "question": { "id": "cm...", "content": "What is Big-O notation?", "type": "MCQ", "points": 2 },
          "selectedOption": { "content": "A measure of algorithm time complexity", "isCorrect": true }
        }
      ]
    }
  ]
}
```

---

## 7. Student

**Auth:** Bearer JWT with role `STUDENT`.
**Required header:** `X-University-Id`.

### Course Discovery & Enrollment

```
GET    /student/courses                       ← All courses with isEnrolled flag
GET    /student/courses/enrolled              ← Only enrolled courses
POST   /student/courses/:courseId/enroll      ← Enroll in one course
DELETE /student/courses/:courseId/enroll      ← Drop one course
POST   /student/courses/enroll               ← Bulk enroll in multiple courses
POST   /student/courses/drop                 ← Bulk drop multiple courses
GET    /student/courses/:courseId/enrollment-status  ← Check enrollment for one course
```

> **Important:** A student can attend any lecture without enrolling. But they **cannot start or submit a CBT exam** without being formally enrolled. See [Section 12](#12-course-enrollment-vs-attendance).

#### `GET /student/courses`

```json
[
  {
    "id": "cm...",
    "code": "CSC301",
    "title": "Data Structures and Algorithms",
    "creditUnits": 3,
    "department": { "id": "cm...", "name": "Computer Science" },
    "isEnrolled": true     // ← student-specific flag
  }
]
```

#### `POST /student/courses/:courseId/enroll`

```
POST /student/courses/cm1a2b3c/enroll

// Response 201
{
  "message": "Successfully enrolled in CSC301 – Data Structures and Algorithms",
  "courseId": "cm..."
}
```

#### `DELETE /student/courses/:courseId/enroll`

```
DELETE /student/courses/cm1a2b3c/enroll

// Response 200
{ "message": "Course dropped successfully" }
```

#### `POST /student/courses/enroll` *(bulk)*

```json
// Request
{ "courseIds": ["cm...", "cm...", "cm..."] }

// Response
{ "count": 3 }
```

#### `POST /student/courses/drop` *(bulk)*

```json
// Request
{ "courseIds": ["cm...", "cm..."] }

// Response
{ "message": "Courses dropped successfully" }
```

#### `GET /student/courses/:courseId/enrollment-status`

```json
{
  "courseId": "cm...",
  "isEnrolled": true,
  "status": "ACTIVE",           // ACTIVE | DROPPED | COMPLETED | null
  "enrolledAt": "2026-02-01T08:00:00Z",
  "canTakeExams": true
}
```

### Timetable

```
GET /student/timetable
```

### Attendance

```
GET /student/attendance/history    ← Personal attendance history across all lectures
```

```json
[
  {
    "id": "cm...",
    "status": "PRESENT",
    "timeStamp": "2026-03-10T09:15:00Z",
    "lecture": { "id": "cm...", "name": "CSC301 – Week 5", "course": { "code": "CSC301", "title": "..." } }
  }
]
```

### CBT (Exams)

> **Prerequisite:** Student must be enrolled in the course before starting or submitting any assessment.

```
GET  /student/assessments/upcoming         ← Published exams for enrolled courses only
POST /student/assessments/:id/start        ← Start exam session (generates Redis token)
POST /student/assessments/:id/heartbeat    ← Keep token alive (call every 20s)
POST /student/assessments/:id/submit       ← Submit answers
GET  /student/results                      ← All past exam attempts + scores
```

#### `GET /student/assessments/upcoming`

Only returns assessments for courses the student is **enrolled** in.

```json
[
  {
    "id": "cm...",
    "title": "CSC301 Mid-Semester Exam",
    "type": "MCQ",
    "totalMarks": 100,
    "durationMinutes": 60,
    "startTime": "2026-03-15T09:00:00Z",
    "endTime": "2026-03-15T10:00:00Z",
    "course": { "code": "CSC301", "title": "Data Structures and Algorithms" }
  }
]
```

#### `POST /student/assessments/:id/start`

```json
// Request
{ "deviceId": "device-uuid-from-device-storage" }

// Response 200
{
  "message": "Exam session started. Ensure you send heartbeats every 20 seconds to keep the token alive.",
  "ttl": 30
}
```

> The `deviceId` must match the device the student registered with. Starts a 30-second Redis token.

#### `POST /student/assessments/:id/heartbeat`

```json
// Request — send every 20 seconds while exam is in progress
{ "deviceId": "device-uuid" }

// Response 200
{ "message": "Token refreshed", "ttl": 30 }
```

#### `POST /student/assessments/:id/submit`

```json
// Request
{
  "answers": [
    { "questionId": "cm...", "selectedOptionId": "cm..." },    // MCQ
    { "questionId": "cm...", "textAnswer": "Binary search..." } // Essay
  ]
}

// Response 200 — immediate result (≤20 questions)
{
  "examAttemptId": "cm...",
  "gradingStatus": "GRADED",
  "score": 78,
  "message": "Assessment graded successfully."
}

// Response 200 — async grading (>20 questions)
{
  "examAttemptId": "cm...",
  "gradingStatus": "PENDING",
  "jobId": "grade:cm...",
  "message": "Assessment submitted. Grading is in progress — check back shortly."
}
```

Poll `GET /cbt/attempt/:examAttemptId` to get the score when status is `PENDING`.

---

## 8. Public Endpoints (No Auth)

```
GET /public/universities                    ← All active universities (signup dropdown)
GET /public/universities/by-subdomain/:sub  ← Resolve university by subdomain
```

#### `GET /public/universities`

```json
[
  { "id": "cm...", "name": "Rivers State University", "subdomain": "rsu" }
]
```

#### `GET /public/universities/by-subdomain/rsu`

```json
{
  "id": "cm...",
  "name": "Rivers State University",
  "subdomain": "rsu",
  "logoUrl": "https://rsu.edu.ng/logo.png"
}
```

Use this to resolve the `universityId` when the app is running on a subdomain.

---

## 9. Attendance System

### How Attendance Works

1. **Lecturer creates / selects a geofence** (see [Section 11](#11-geofence-system))
2. **Lecturer opens the attendance window** via `POST /lecturer/sessions/activate`
3. **Student submits their GPS coordinates** via `POST /attendance/mark`
4. Backend runs **Haversine distance check** — compares student's GPS to the geofence centre
5. If distance ≤ `radiusMeters` → `PRESENT`; otherwise → `ABSENT`
6. **No queue needed** — check is always instant (O(1))

### Attend a Lecture

```
POST /attendance/mark
```

```json
// Request
{
  "studentId": "cm...",
  "lectureId": "cm...",
  "coords": {
    "lat": 4.8154,
    "lng": 7.0496,
    "accuracy": 12.5     // GPS accuracy in metres (optional)
  },
  "deviceId": "device-uuid"
}

// Response 200 — inside fence
{
  "status": "MARKED",
  "attendanceLogId": "cm...",
  "distanceMeters": 23,
  "message": "Attendance marked. You are 23m from the hall centre."
}

// Response 200 — outside fence
{
  "status": "OUTSIDE_FENCE",
  "attendanceLogId": "cm...",
  "distanceMeters": 87,
  "message": "You are 87m from the hall centre (max allowed: 50m)."
}

// Response 200 — no geofence configured
{
  "status": "NO_GEOFENCE",
  "attendanceLogId": "cm...",
  "message": "No geofence configured — marked PRESENT."
}

// Response 200 — duplicate
{
  "status": "ALREADY_MARKED",
  "attendanceLogId": "cm...",
  "message": "Attendance already marked as PRESENT for this lecture."
}
```

> **Important:** Students **do not need to be enrolled** in the course to mark attendance. Attendance is open to all. Enrollment is only required for CBT exams.

### Dwell Monitoring (Heartbeats)

After marking attendance, optionally send position heartbeats to detect if a student leaves:

```
POST /attendance/heartbeat
```

```json
// Request — send every 60 seconds
{
  "attendanceLogId": "cm...",
  "lat": 4.8154,
  "lng": 7.0496,
  "deviceId": "device-uuid"
}

// Response
{
  "status": "INSIDE",           // or "OUTSIDE"
  "distanceMeters": 18,
  "message": "Heartbeat recorded (18m from centre)"
}
```

If `OUTSIDE` — the attendance log is marked `EXCEPTION`.

### View Lecture Attendance

```
GET /attendance/lecture/:lectureId
GET /attendance/student/:studentId
```

---

## 10. CBT / Exam System

### Exam Flow (Student)

```
1. GET  /student/assessments/upcoming        ← See available exams (enrolled courses only)
2. POST /student/assessments/:id/start       ← Start session + get Redis token
3. Every 20s: POST /student/assessments/:id/heartbeat ← Keep session alive
4. POST /student/assessments/:id/submit      ← Submit answers
5. GET  /cbt/attempt/:examAttemptId          ← Poll for score if PENDING
```

### Integrity & Proctoring

The `proctoringFlags` field on `ExamAttempt` stores an array of frontend-captured events:

```json
[
  { "type": "TAB_SWITCH", "occurredAt": "2026-03-15T09:12:00Z" },
  { "type": "WINDOW_BLUR", "occurredAt": "2026-03-15T09:14:00Z" }
]
```

Known event types: `TAB_SWITCH`, `WINDOW_BLUR`, `SCREENSHOT_ATTEMPT`, `COPY_PASTE`, `FULLSCREEN_EXIT`, `DEVTOOLS_OPEN`, `CONTEXT_MENU`, `MULTIPLE_FACES`, `NO_FACE`, `PHONE_DETECTED`

`integrityStatus` is computed server-side on submission: `CLEAN | LOW | MEDIUM | HIGH`

### Legacy CBT Endpoints

These remain available for direct use:

```
POST /cbt/submit                        ← Submit (include studentId + assessmentId in body)
GET  /cbt/attempt/:id                   ← Get attempt result / poll
GET  /cbt/student/:studentId/attempts   ← All attempts for a student
```

> Prefer `POST /student/assessments/:id/submit` from the student dashboard — it reads the studentId from the JWT automatically.

---

## 11. Geofence System

Geofences are **radius-based circles** (centre GPS point + radius in metres). They replaced the old polygon system.

### Priority Order (when a student marks attendance)

1. **`Lecture.geofenceId`** — per-lecture override (set when lecturer opens attendance)
2. **`LectureHall.geoLat/geoLng/geoRadiusMeters`** — hall default (set by admin)
3. **No geofence** → all students marked `PRESENT` by default

### Lecturer Geofence Endpoints

```
GET    /lecturer/geofences         ← List all geofences for this university
POST   /lecturer/geofences         ← Create a named geofence
PATCH  /lecturer/geofences/:id     ← Update geofence
DELETE /lecturer/geofences/:id     ← Delete geofence
```

#### `GET /lecturer/geofences`

```json
[
  {
    "id": "cm...",
    "name": "LT1 – Main Entrance",
    "lat": 4.8156,
    "lng": 7.0498,
    "radiusMeters": 50,
    "lectureHall": { "id": "cm...", "name": "Lecture Theatre 1" },
    "createdBy": { "firstName": "Dr", "lastName": "Smith", "email": "smith@rsu.edu.ng" },
    "createdAt": "2026-02-15T08:00:00Z"
  }
]
```

#### `POST /lecturer/geofences`

```json
// Request
{
  "name": "LT1 – Side Entrance",
  "lat": 4.8159,
  "lng": 7.0502,
  "radiusMeters": 35,
  "lectureHallId": "cm..."    // optional
}
```

### Opening Attendance with a Geofence

When calling `POST /lecturer/sessions/activate`, provide one of:

| Option | Fields | Use case |
|--------|--------|----------|
| **Existing geofence** | `geofenceId` | Reuse a previously created fence |
| **New geofence inline** | `newGeofence: { name, lat, lng, radiusMeters }` | One-time or first-time setup |
| **Hall default** | Neither field | Rely on `LectureHall.geoLat/geoLng/geoRadiusMeters` |
| **No fence** | Neither field + hall has no default | All students marked PRESENT |

---

## 12. Course Enrollment vs Attendance

This is a key distinction in the ParaLearn system:

| Action | Enrollment required? | Result |
|--------|---------------------|--------|
| Attend a lecture (mark attendance) | ❌ No | Any student can check in |
| View timetable | ❌ No | All students can see the schedule |
| See upcoming exams | ✅ Yes | Only enrolled courses show assessments |
| Start a CBT exam | ✅ Yes | `403` if not enrolled |
| Submit a CBT exam | ✅ Yes | `403` if not enrolled |

### Enrollment Status Values

| Status | Meaning |
|--------|---------|
| `ACTIVE` | Formally enrolled — can sit exams |
| `DROPPED` | Dropped the course — blocked from exams |
| `COMPLETED` | Finished the course (end of semester) |

### Typical Student UI Flow

```
1. Student logs in
2. GET /student/courses          → see all courses with isEnrolled flag
3. POST /student/courses/:id/enroll  → tap "Enroll" on desired courses
4. GET /student/assessments/upcoming → exams now appear for enrolled courses
5. Mark attendance any time (no enrollment needed)
6. POST /student/assessments/:id/start → start exam (enrollment checked server-side)
```

---

## 13. Error Reference

| Code | Meaning | Common causes |
|------|---------|---------------|
| `400` | Bad Request | Validation error, missing field |
| `401` | Unauthorized | Missing/expired JWT, wrong password |
| `403` | Forbidden | Wrong role, not enrolled, wrong device, attendance window closed |
| `404` | Not Found | University, course, lecture, geofence, user not found |
| `409` | Conflict | Email already registered, already enrolled, attempt already submitted |
| `500` | Internal Server Error | DB unreachable, BullMQ failure |

### Common 403 Messages

| Message | Fix |
|---------|-----|
| `"You must be enrolled in CSC301 to sit this exam"` | Call `POST /student/courses/:courseId/enroll` first |
| `"Attendance check-in rejected: The lecturer has not opened the attendance window yet."` | Wait for lecturer to open via `/lecturer/sessions/activate` |
| `"Attendance check-in rejected: unauthorized device"` | Student must use their registered device |
| `"Device mismatch. You must take this exam on your primary bound device."` | Exam must be on the registered device |
| `"Exam session expired or invalid."` | Student didn't send heartbeats — session timed out |

---

*Generated: 2026-03-13 · Domain: pln.ng · Backend: NestJS + Prisma 7 + PostgreSQL*
