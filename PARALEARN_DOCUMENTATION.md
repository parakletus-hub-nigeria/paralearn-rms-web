# ParaLearn – Product Documentation

**Version:** 2.0  
**Last Updated:** May 2026  
**Platform:** Web (SaaS, Multi-Tenant)  
**Domain:** `pln.ng` (K-12) · `cbt.pln.ng` (CBT Admin Portal)

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [System Architecture](#2-system-architecture)
3. [Authentication & Multi-Tenancy](#3-authentication--multi-tenancy)
4. [K-12 School Module](#4-k-12-school-module)
   - 4.1 [Admin Portal](#41-admin-portal)
   - 4.2 [Teacher Portal](#42-teacher-portal)
   - 4.3 [Student Portal](#43-student-portal)
5. [CBT (Computer-Based Testing) Module](#5-cbt-computer-based-testing-module)
   - 5.1 [CBT Admin Portal](#51-cbt-admin-portal)
   - 5.2 [Online Exam Interface](#52-online-exam-interface)
   - 5.3 [Proctoring System](#53-proctoring-system)
6. [University Module](#6-university-module)
   - 6.1 [University Admin Portal](#61-university-admin-portal)
   - 6.2 [Lecturer Portal](#62-lecturer-portal)
   - 6.3 [University Student Portal](#63-university-student-portal)
7. [AI Lesson Generator (SabiNote)](#7-ai-lesson-generator-sabinote)
8. [Report Card System](#8-report-card-system)
9. [Bulk Data Import](#9-bulk-data-import)
10. [Super Admin Portal](#10-super-admin-portal)
11. [Technical Stack](#11-technical-stack)
12. [API Architecture](#12-api-architecture)
13. [Redux State Management](#13-redux-state-management)
14. [Roles & Permissions](#14-roles--permissions)
15. [Deployment & Configuration](#15-deployment--configuration)

---

## 1. Product Overview

ParaLearn is a cloud-based School Management and Assessment Platform built as a multi-tenant SaaS product. It supports two distinct institution types: **K-12 schools** and **Universities**, each with their own user roles, workflows, and feature sets — all managed through a single unified codebase.

### Core Capabilities

| Capability | K-12 | University |
|---|---|---|
| Academic session & term management | ✅ | ✅ |
| Class / department / faculty management | ✅ | ✅ |
| Subject / course management | ✅ | ✅ |
| Teacher / lecturer management | ✅ | ✅ |
| Student enrollment | ✅ | ✅ |
| Online CBT exams (with proctoring) | ✅ | ✅ |
| Offline assessment scoring | ✅ | ✅ |
| Attendance tracking | ✅ | ✅ |
| Report card generation & approval | ✅ | — |
| AI lesson plan generation | ✅ | — |
| Score bulk upload (Excel) | ✅ | ✅ |
| Timetable management | — | ✅ |
| Exam hall management | — | ✅ |

### Platform URLs

| Environment | URL Pattern | Purpose |
|---|---|---|
| K-12 School Admin | `{school}.pln.ng/RMS` | School admin portal |
| K-12 Teacher | `{school}.pln.ng/teacher` | Teacher portal |
| K-12 Student | `{school}.pln.ng/student` | Student exam portal |
| CBT Admin | `cbt.pln.ng/RMS/cbt` | Online exam management |
| University Admin | `{uni}.pln.ng/uni-admin` | University admin portal |
| University Lecturer | `{uni}.pln.ng/uni-lecturer` | Lecturer portal |
| University Student | `{uni}.pln.ng/uni-student` | University student portal |

---

## 2. System Architecture

### Frontend

- **Framework:** Next.js 16.1.2 (App Router, React 19.1.0)
- **Language:** TypeScript 5
- **State Management:** Redux Toolkit 2.11.2 + RTK Query
- **Styling:** Tailwind CSS 4 + Shadcn/UI (Radix UI)
- **HTTP Client:** Axios 1.13.2
- **Build Tool:** Turbopack

### Backend Proxy Architecture

The Next.js application proxies all API calls through internal Next.js rewrites. The frontend never calls backend services directly.

```
Browser
  │
  ├─── /api/proxy/*  ──────────►  K-12 Backend  (Azure – Switzerland North)
  │
  └─── /api/uni-proxy/*  ──────►  University Backend
```

**Next.js rewrite rules** (`next.config.ts`):
```
/api/proxy/:path*        →  {K12_BACKEND_URL}/:path*
/api/uni-proxy/:path*    →  {UNI_BACKEND_URL}/:path*
```

### Multi-Tenant Architecture

Every school/university has its own **subdomain** (e.g., `greenfield.pln.ng`). The subdomain is:
- Detected from `window.location.hostname` on load
- Cached in localStorage and Redux state
- Sent on every API request as the `X-Tenant-Subdomain` header
- Stored in cross-subdomain cookies for token sharing

This allows a single deployment to serve thousands of independent schools with completely isolated data.

---

## 3. Authentication & Multi-Tenancy

### Login Flow

1. User visits `{school}.pln.ng/auth/signin`
2. Credentials submitted to `POST /api/proxy/auth/login` (K-12) or `POST /api/uni-proxy/auth/login` (University)
3. Backend returns `accessToken` + user data
4. Token stored in:
   - `js-cookie` (7-day expiration, domain-scoped)
   - Redux state (`user.accessToken`)
5. All subsequent requests include `Authorization: Bearer {token}` + `X-Tenant-Subdomain: {subdomain}`

### Token Refresh

- On any `401 Unauthorized` response, the interceptor automatically calls `POST /api/proxy/auth/refresh`
- Failed requests during refresh are queued and retried after token renewal
- On refresh failure the user is logged out and Redux state is cleared

### Cross-Subdomain Redirect

When a user logs in from a subdomain that differs from their registered school, the system:
1. Detects the mismatch
2. Appends `?auth_token={token}` to the correct school URL
3. Redirects the browser; the destination school reads and stores the token

### Role-Based Access Control

Roles are extracted from the JWT payload and normalized across multiple formats (`roles[]`, `role`, flag properties). Route-level guarding is enforced by:
- `<ProtectedRoute>` – redirects unauthenticated users
- `<RoleGuard role="school_admin">` – restricts specific routes to specific roles

**Available Roles:**

| Role | Description |
|---|---|
| `school_admin` | Full access to K-12 admin portal |
| `teacher` | K-12 teacher portal access |
| `student` | K-12 student exam portal |
| `uni_admin` | University admin portal |
| `uni_lecturer` | University lecturer portal |
| `uni_student` | University student portal |
| `super_admin` | Super admin – manage all schools |

### Logout

Logout clears:
- All auth cookies (including cross-domain variants)
- Redux state (via `RESET_STORE` action — resets all 8 slices)
- localStorage keys (token, subdomain, CBT exam IDs, exam session)

---

## 4. K-12 School Module

### 4.1 Admin Portal

The admin portal is accessible at `{school}.pln.ng/RMS` and covers the full lifecycle of school operations.

#### Dashboard (`/RMS/dashboard`)

Displays school-wide statistics:
- Total students, teachers, classes
- Average score and pass rate across the school
- Grade distribution chart
- Recent activity feed

#### Academic Sessions & Terms (`/RMS/academic`)

- Create academic sessions with one or more terms (e.g., "2024/2025" with First, Second, Third Terms)
- Activate a specific term as the "current" term — this scopes all scores, reports, and assessments
- View all past sessions and terms
- Uses the **Setup Wizard** for first-time session creation

#### School Setup Wizard (`/setup`)

A guided multi-step onboarding wizard for new schools:

| Step | Action |
|---|---|
| 1 | Create academic session + terms |
| 2 | Create classes and grade levels |
| 3 | Create subjects and assign to classes |
| 4 | Configure grading scale and rules |

#### Class Management (`/RMS/classes`)

- Create, edit, and delete classes (with level, stream, capacity, academic year)
- Enroll students into classes individually or in bulk
- Assign subject teachers to a class
- Remove students or teachers from a class
- View per-class statistics (student count, teacher count)

#### Subject Management (`/RMS/subjects`)

- Create subjects with name, code, and description
- Assign subjects to one or more classes
- Assign a teacher to a subject within a specific class (class-subject-teacher three-way link)
- Remove subject-class or subject-teacher assignments

#### User Management (`/RMS/users` and `/RMS/users/[id]`)

- View all users (students and teachers) in a filterable, searchable list
- Create new users (role, name, email, password)
- Edit any user's profile details
- Soft-delete and hard-delete users
- Reactivate previously deleted users
- View individual user profiles with all associated classes and subjects

#### Enrollment Management (`/RMS/enrollments`)

- View all student enrollments across classes
- Enroll students individually or bulk-enroll via Excel/CSV
- Remove students from classes

#### Assessment Management (`/RMS/assessments` and `/RMS/assessments/[id]`)

- View all assessments across the school (filterable by status: `not_started`, `in_progress`, `completed`)
- Create new assessments (title, category, subject, class, total marks, duration, instructions, start/end time)
- Publish or unpublish assessments
- View and grade individual student submissions
- Delete assessments

Assessments come in two types:
- **Offline assessments** — admin or teacher uploads a score sheet; no student-facing exam
- **Online assessments (CBT)** — live exams students take in the browser with a timer and proctoring

#### Grading System (`/RMS/settings`)

- Configure grade boundaries (e.g., A = 70–100, B = 60–69…)
- Create named grading templates per academic level
- Assign grading templates to classes
- These rules govern the auto-calculation of letter grades and grade points on report cards

#### Scores (`/RMS/scores` and `/RMS/scores/import`)

- View all scores for any assessment
- Enter scores manually per student
- Import scores from Excel (`.xlsx`) with column mapping and row validation
- View score distribution and statistics

#### Attendance (`/RMS/attendance`)

- Record daily attendance for any class (present, absent, late)
- View attendance records by class and date range
- Attendance statistics per student

#### Student Comments (`/RMS/comments`)

- Add qualitative remarks per student (e.g., "Excellent performance this term")
- Bulk-add comments for an entire class from a template
- Comments appear on the student's report card

#### Report Cards (`/RMS/report`)

- Generate report cards for all students in a class for the current term
- Report card includes: scores per subject, grade, position in class, attendance, teacher comments, principal remarks
- Admin approval workflow:
  1. Teachers submit their class for approval
  2. Admin reviews and approves
  3. Reports are published (visible to students/parents)
- Export individual or batch report cards as PDF

#### School Settings & Branding (`/RMS/school-settings`, `/RMS/branding`)

- Upload school logo and signature
- Set school name, address, motto
- Configure primary color (used throughout the admin portal UI)
- Report card template settings (header layout, field visibility)

#### Class Promotion (`/RMS/classes`)

- Preview which students will be promoted or retained based on their scores
- Execute bulk promotion: moves all passing students to the next class level
- Configurable promotion rules (minimum pass score, minimum subjects passed)

---

### 4.2 Teacher Portal

Accessible at `{school}.pln.ng/teacher`. Teachers only see data for their assigned classes and subjects.

#### Teacher Dashboard (`/teacher/dashboard`)

- Overview of assigned classes and subjects
- Upcoming assessments
- Recent grading activity

#### My Classes (`/teacher/classes`)

- View classes the teacher is assigned to
- See enrolled students per class
- View class-subject assignments

#### Assessments (`/teacher/assessments`)

- View assessments for teacher's classes and subjects (filterable by status)
- Create new assessments (online or offline)
- Edit or delete own assessments
- Publish assessments (makes them visible to students)

#### Assessment Grading (`/teacher/assessments/[id]/grade/[submissionId]`)

- Review individual student submissions
- Grade essay or open-ended questions manually
- Auto-grading for MCQ and True/False questions
- View answer-by-answer breakdown

#### Score Entry (`/teacher/scores`)

- Enter scores per student for offline assessments
- Upload score sheets from Excel

#### Attendance (`/teacher/attendance`)

- Mark daily attendance for own classes
- View attendance history

#### Student Comments (`/teacher/comments`)

- Write qualitative remarks per student
- Bulk comment entry for full class

#### Question Drafting (`/teacher/question-drafting`)

- Draft and organize exam questions per subject/class
- Questions can be pulled into assessments

#### Reports (`/teacher/reports`)

- Preview report cards for own class
- Submit class reports for admin approval

---

### 4.3 Student Portal

Accessible at `{school}.pln.ng/student`. Students have a minimal interface focused on taking exams.

#### Student Dashboard (`/student/dashboard`)

- List of published assessments available to the student
- Status indicators (not started, in progress, completed, results available)
- Report card access (once published by admin)

#### Exam Lobby (`/student/lobby`)

- Pre-exam checklist and instructions
- System requirements check (browser compatibility, tab detection readiness)
- Proctoring consent / acknowledgment
- "Start Exam" button that initiates the live session

#### Live Exam Interface (`/student/exam`)

Full-featured online exam taking interface:

- **Question Navigation** — numbered grid; click any question to jump to it
- **Timer** — countdown displayed prominently; audible alert at 5 minutes remaining
- **Question Types Supported:**
  - Multiple Choice (MCQ) — single correct answer
  - True / False — binary choice
  - Essay / Long Answer — text area input
  - Multi-Select — select multiple correct answers
  - Short Answer (TEXT)
- **Mark for Review** — flag a question to return to it later (highlighted in navigation grid)
- **Answer Persistence** — answers saved to localStorage on every change; survives accidental refresh
- **Auto-Submit** — when timer reaches 0, exam is automatically submitted with a warning dialog
- **Submit Confirmation** — shows count of unanswered questions before final submission
- **Results Screen** — post-submission score display (if immediate results are enabled)

---

## 5. CBT (Computer-Based Testing) Module

The CBT module is the admin-facing management layer for creating and managing online exams. It is accessible from the same school admin portal under the `/RMS/cbt` path (or the dedicated `cbt.pln.ng` domain).

### 5.1 CBT Admin Portal

#### CBT Dashboard (`/RMS/cbt`)

- Statistics overview: total online exams, active exams, students who have taken exams
- Quick links to create exam, view results, manage question bank

#### CBT Exams Page (`/RMS/cbt/exams`)

A dedicated page listing only **online (CBT) exams**, separate from the general assessments list.

**Creating a CBT Exam:**

The "Create CBT Exam" dialog supports creating multiple exams at once via a class-subject pair grid:
1. Select assessment category
2. Select one or more classes
3. For each selected class, choose a subject
4. Enter exam title, total marks, passing marks, duration (minutes), start/end time, and instructions
5. On submit, one assessment is created per class-subject pair
6. Created exam IDs are immediately stored in `localStorage["cbt_exam_ids"]` so they appear on this page even after a refresh (since the backend list endpoints do not return an `isOnline` flag)

**Exam Visibility Logic:**

An exam is shown on the CBT Exams page if:
- Its ID is in `localStorage["cbt_exam_ids"]` (created from CBT portal), OR
- The backend returns `isOnline: true` on the assessment object

#### CBT Exam Detail Page (`/RMS/cbt/exams/[examId]`)

Full configuration and question management for a single online exam:

**Settings Panel:**
- Edit title, total marks, passing marks, duration
- Set start/end datetime (determines when students can take the exam)
- Update instructions shown to students before the exam

**Add Question (Manual):**

Each question requires:
- Question text / prompt
- Question type: `MCQ` or `TRUE_FALSE`
- Answer options (2–6 options for MCQ; fixed True/False for TRUE_FALSE)
- Correct answer selection (mark one option as correct)
- Point value (default: 1)

On submission, the new question is appended to the existing question list and the full array is sent to the backend via `PATCH /assessments/{id}` (replaces the entire `questions` array).

**Important:** The backend expects question types as uppercase strings: `"MCQ"` and `"TRUE_FALSE"`. The frontend normalizes all type values via a `normalizeType()` helper before sending.

**Bulk Upload Questions:**

Upload a `.xlsx` or `.csv` file with the following column structure:

| Column | Description |
|---|---|
| `question` | Question text |
| `type` | `MCQ` or `TRUE_FALSE` |
| `option_a` | Option A text |
| `option_b` | Option B text |
| `option_c` | Option C (optional) |
| `option_d` | Option D (optional) |
| `correct` | Correct answer (`a`, `b`, `c`, or `d`) |
| `marks` | Point value (default: 1) |

#### CBT Question Bank (`/RMS/cbt/question-bank`)

- Manage a reusable pool of questions
- Organize questions by subject and category
- Import questions to any exam
- Questions can be individually edited or deleted

#### CBT Results (`/RMS/cbt/results`)

- View results for all completed CBT exams
- Per-student score breakdown (question-by-question)
- Score statistics: average, highest, lowest, pass rate
- Export results to Excel or PDF

---

### 5.2 Online Exam Interface

The student-facing exam interface (`/student/exam`) provides a full-featured browser-based testing environment.

#### Session State Management

When a student starts an exam:
1. `POST /api/proxy/assessments/{id}/start` — creates a submission record
2. Response includes `submissionId` and `deadline`
3. All session state is persisted to `localStorage` (answers, timer offset, proctoring counts)
4. On reconnect/refresh the session is automatically restored from localStorage

#### Answer Submission

- Answers are saved in Redux state and localStorage on every change (no explicit "save" button)
- Final submission: `POST /api/proxy/assessments/{id}/submit` with all answers and proctoring flags
- If the exam auto-submits on timeout, the same endpoint is called with a `autoSubmit: true` flag

---

### 5.3 Proctoring System

ParaLearn includes a lightweight browser-based proctoring system to detect suspicious behavior during online exams.

#### Detection Events

| Event | How Detected | Tracking |
|---|---|---|
| Tab Switch | `document.visibilitychange` event | Count incremented; questions being answered at time of switch are auto-flagged |
| Window Blur | `window.blur` event | Count incremented; current question auto-flagged |
| Full-screen Exit | `fullscreenerror` / `fullscreenchange` events | Tracked (where supported) |

#### Proctoring Flags

Every flagged event generates a `ProctoringFlag` object:
```
{
  type: "tab_switch" | "window_blur",
  timestamp: ISO string,
  questionIndex: number
}
```

All flags are included in the final submission payload for review by the admin/teacher.

#### Suspension Rules

Configurable per exam:
- After N tab switches → exam auto-submits and student is blocked from re-entry
- Counts are shown to the student as a warning (e.g., "Warning: 2/3 violations")

#### Device Tracking

- A `deviceId` is generated on exam start (UUID stored in localStorage)
- Sent with every heartbeat ping (`POST /assessments/{id}/heartbeat` every 20 seconds)
- Used to detect multiple simultaneous sessions from different devices

---

## 6. University Module

### 6.1 University Admin Portal

Accessible at `{uni}.pln.ng/uni-admin`. Covers the full administrative lifecycle of a university.

#### University Dashboard (`/uni-admin/dashboard`)

- Institution-wide statistics
- Active assessments, enrolled students, lecturer count
- Department and faculty breakdown

#### Faculty Management (`/uni-admin/faculties`)

- Create, edit, and delete faculties (top-level academic divisions)
- Each faculty contains multiple departments

#### Department Management (`/uni-admin/departments`)

- Create departments within faculties
- Assign head of department
- View all courses belonging to a department

#### Course Management (`/uni-admin/courses`)

- Create courses with name, code, credit units, and level
- Assign courses to departments
- Assign lecturers to courses
- View student roster per course

#### Academic Sessions (`/uni-admin/sessions`)

- Create university academic sessions and semesters
- Activate a semester as the current active period
- All assessments, attendance, and results are scoped to the active semester

#### User Management (`/uni-admin/users`)

- List all university users (students, lecturers, admins)
- Create and manage user accounts
- Role assignment
- View individual user profiles (`/uni-admin/users/[id]`)

#### Assessments (`/uni-admin/assessments`)

- School-wide view of all assessments across all departments
- Create, edit, delete assessments at the admin level
- Override or extend deadlines

#### Exam Halls (`/uni-admin/halls`)

- Create and manage physical exam hall/room locations
- Assign capacity and location details
- Used during exam scheduling

#### Timetable (`/uni-admin/timetable`)

- Create a weekly lecture and exam timetable
- Assign courses, lecturers, halls, and time slots
- Publish timetable (visible to students and lecturers)
- View timetable in grid format by day

#### University Settings (`/uni-admin/settings`)

- Institution name, logo, contact details
- Grading configuration
- System preferences

---

### 6.2 Lecturer Portal

Accessible at `{uni}.pln.ng/uni-lecturer`.

#### Lecturer Dashboard (`/uni-lecturer/dashboard`)

- My courses this semester
- Upcoming assessments
- Recent submissions to grade

#### My Assessments (`/uni-lecturer/assessments`)

- List, create, edit, and delete assessments for own courses
- Create assessment: `POST /api/uni-proxy/assessments` with title, course, total marks, start/end time
- Publish assessments to make them available to enrolled students

#### Create Assessment (`/uni-lecturer/assessments/create-assessment`)

Dedicated page for creating a new assessment with full configuration:
- Assessment metadata (title, instructions, duration)
- Question management (MCQ, True/False, Essay)
- Scheduling (start/end datetime)
- Proctoring settings

#### Grading Submissions (`/uni-lecturer/assessments/[id]/grade/[submissionId]`)

- Review student answers question-by-question
- Manually grade open-ended answers
- MCQ and True/False auto-graded
- Post grades and provide written feedback

#### Results (`/uni-lecturer/assessments/[id]/results`)

- View all student results for an assessment
- Statistics panel (average, highest, lowest, pass rate)
- Export results

#### Course Roster (`/uni-lecturer/courses/[courseId]/roster`)

- View all students enrolled in a course
- Enrollment status and contact info

#### Attendance (`/uni-lecturer/attendance` and `/uni-lecturer/attendance/[lectureId]`)

- Mark attendance for a lecture session
- Mark students present, absent, or late
- View per-lecture attendance records

#### Timetable (`/uni-lecturer/timetable`)

- View personal lecture and exam timetable
- Navigate by week

---

### 6.3 University Student Portal

Accessible at `{uni}.pln.ng/uni-student`.

#### Student Dashboard (`/uni-student/dashboard`)

- Enrolled courses overview
- Upcoming exams
- Attendance summary
- GPA display

#### My Courses (`/uni-student/courses`)

- All courses enrolled in for the current semester
- Course details (lecturer, credit units, schedule)

#### My Exams (`/uni-student/exams`)

- List of published assessments available to the student
- Start exam (redirects to live exam interface)
- View completed exam status

#### Attendance (`/uni-student/attendance`)

- View own attendance record per course
- Attendance percentage per course

#### Results (`/uni-student/results`)

- View scored results per assessment
- Semester GPA calculation
- Cumulative GPA

#### Timetable (`/uni-student/timetable`)

- View weekly lecture and exam schedule
- Navigate by week

---

## 7. AI Lesson Generator (SabiNote)

The AI Lesson Generator is an integrated feature for K-12 schools, accessible from the admin portal at `/RMS/lesson-generator`. It uses **Google Gemini AI** to generate structured lesson plans and notes.

### Creating a Lesson (`/RMS/lesson-generator/new`)

Required inputs:
- **Subject** (e.g., Mathematics, English)
- **Grade / Class level** (e.g., JSS 1, SS 3)
- **Topic** (e.g., "Introduction to Quadratic Equations")
- **Term** (First, Second, Third)
- **Week number**
- **Duration** (optional, in minutes)
- **Curriculum** (selected from available options)

On submission:
1. Request sent to SabiNote API with the above parameters
2. Google Gemini generates a structured lesson note
3. Lesson is saved to history and wallet is debited

### Generated Lesson Content Structure

Each generated lesson contains:
- Lesson objectives
- Introduction / hook
- Main content (explanation, examples, diagrams descriptions)
- Class activities
- Assessment questions
- Summary and conclusion
- Keywords / vocabulary list

### Lesson History (`/RMS/lesson-generator`)

- List of all previously generated lessons
- Search and filter by subject, grade, topic
- Click any lesson to view full content (`/RMS/lesson-generator/[id]`)

### Wallet System (`/RMS/lesson-generator/wallet`)

Lesson generation consumes **credits** from the school's SabiNote wallet.

- View current credit balance
- View transaction history (generation costs, top-ups)
- Top up wallet (payment integration)
- Each generation deducts a cost in credits based on token usage

---

## 8. Report Card System

The report card system is a multi-step, approval-based workflow for generating and publishing student performance reports at the end of each term.

### Report Card Fields

Each student's report card includes:
- Student name, class, admission number, and term
- Subject-by-subject breakdown: raw score, grade, grade point, remarks
- Total score, average, position in class
- Attendance record (days present / total days)
- Teacher's comment
- Principal/Head Teacher's remark
- School branding (logo, name, motto, signature)

### Grading Calculation

The system automatically calculates:
- **Letter Grade** — based on the configured grading scale for the student's class level
- **Grade Point** — numeric equivalent of the letter grade
- **Class Position** — ranking among all students in the same class for the same term

### Approval Workflow

```
Teacher enters scores
        │
        ▼
Teacher submits reports for approval (/teacher/reports → "Submit for Approval")
        │
        ▼
Admin reviews approval queue (/RMS/report)
        │
        ▼
Admin approves → reports are published
        │
        ▼
Students/parents can view/download report card (/student/dashboard)
```

### Report Card Export

- Individual report cards exportable as PDF (via jsPDF + jsPDF-AutoTable)
- Batch export: generate PDFs for an entire class at once
- PDF includes school branding, formatted table, and signature image

### Report Card Templates (`/RMS/settings`)

Configurable template settings:
- Show/hide specific fields (attendance, position, comments)
- Header layout (logo placement, school info layout)
- Footer content (signature, stamp area)

---

## 9. Bulk Data Import

ParaLearn supports importing large datasets via Excel (`.xlsx`) or CSV files to reduce manual data entry.

### Supported Import Types

| Import Type | Location | Template Columns |
|---|---|---|
| Students | `/RMS/bulk_upload` | firstName, lastName, email, classId, admissionNumber |
| Teachers | `/RMS/bulk_upload` | firstName, lastName, email, subjectIds |
| Classes | `/RMS/bulk_upload` | name, level, stream, capacity |
| Subjects | `/RMS/bulk_upload` | name, code, description |
| Scores | `/RMS/scores/import` | studentId, assessmentId, score |
| Questions | CBT Exam Detail | question, type, option_a–d, correct, marks |

### Import Process

1. Download the template file (pre-formatted `.xlsx`)
2. Fill in data rows
3. Upload file on the import page
4. The system validates each row:
   - Required field checks
   - Data type validation
   - Duplicate detection
   - Foreign key resolution (e.g., class name → classId)
5. Preview table shows validated rows (errors highlighted in red)
6. Confirm import — valid rows are submitted in batch; invalid rows are skipped with an error report

### Error Handling

- Row-level errors displayed inline (e.g., "Row 5: email is required")
- Invalid rows are never imported; valid rows proceed
- A download-error-report option exports failed rows with error descriptions

---

## 10. Super Admin Portal

The Super Admin portal is accessible at `{root-domain}/super-admin` and provides a god-mode interface for managing all schools on the platform.

### Authentication

- Super admins log in with a dedicated API key (`X-Super-Admin-Key` header)
- The key is stored in Redux `superAdmin.apiKey` and sent with all super-admin API calls

### K-12 Schools Management (`/super-admin/k12`)

- View all K-12 schools registered on the platform
- Inspect any school's data (by setting the active subdomain context)
- Create new school accounts
- Deactivate or suspend schools
- Impersonate school admins (for support purposes)

### Subdomain Switching

The super admin can "switch into" any school:
1. Set `k12Subdomain` in Redux state
2. All subsequent API calls include that school's subdomain in `X-Tenant-Subdomain`
3. UI reflects the selected school's branding and data

---

## 11. Technical Stack

### Core Dependencies

| Category | Library | Version |
|---|---|---|
| Framework | Next.js | 16.1.2 |
| UI Library | React | 19.1.0 |
| Language | TypeScript | 5 |
| State | Redux Toolkit | 2.11.2 |
| API | RTK Query + Axios | 2.11.2 / 1.13.2 |
| Styling | Tailwind CSS | 4 |
| Component Library | Radix UI / Shadcn | latest |
| Icons | Lucide React | 0.562 |
| Icons (alt) | React Icons | 5.5.0 |
| Animation | Framer Motion | 12.34.0 |
| Notifications | Sonner | 2.0.7 |
| Notifications (alt) | React-Toastify | 11.0.5 |
| Date Utils | date-fns | 4.1.0 |
| CSV Parsing | PapaParse | 5.5.3 |
| Excel | XLSX | 0.18.5 |
| PDF Export | jsPDF + AutoTable | 4.0.0 / 5.0.7 |
| Maps | Leaflet + React-Leaflet | 1.9.4 / 5.0.0 |
| Auth | jwt-decode | 4.0.0 |
| Cookies | js-cookie | 3.0.5 |
| File Download | file-saver | 2.0.5 |
| AI | @google/generative-ai | 0.24.1 |
| Theming | next-themes | 0.4.6 |
| Product Tour | react-joyride | 2.9.3 |

---

## 12. API Architecture

### Proxy Routes

All backend calls go through Next.js rewrites:

| Prefix | Target |
|---|---|
| `/api/proxy/` | K-12 Backend (Azure) |
| `/api/uni-proxy/` | University Backend |

### Axios Client

A shared Axios instance with:
- **Request interceptor:** Injects auth token and tenant subdomain header; handles super-admin subdomain override
- **Response interceptor:** Auto-unwraps `{ data: { data: [...] } }` envelope; handles 401 with token refresh queue; normalizes errors to user-friendly messages

```
Request Flow:
Component → Redux Thunk → apiClient → Request Interceptor
  → Add Authorization header
  → Add X-Tenant-Subdomain header
  → Next.js Proxy → Backend

Response Flow:
Backend → Response Interceptor
  → Unwrap response envelope
  → On 401: queue request, refresh token, retry
  → On error: parse message, show toast
  → Return data to Redux Thunk → Update Redux state → Component re-renders
```

### K-12 Backend Endpoints Reference

#### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/login` | K-12 login |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Logout |
| POST | `/auth/forgot-password` | Request password reset |
| POST | `/auth/reset-password/{code}` | Reset with token |

#### Classes
| Method | Endpoint | Description |
|---|---|---|
| GET | `/classes` | List all classes |
| POST | `/classes` | Create class |
| PATCH | `/classes/{id}` | Update class |
| DELETE | `/classes/{id}` | Delete class |
| POST | `/classes/{id}/enroll` | Enroll student |
| POST | `/classes/{id}/teachers` | Assign teacher |

#### Subjects
| Method | Endpoint | Description |
|---|---|---|
| GET | `/subjects` | List all subjects |
| POST | `/subjects` | Create subject |
| POST | `/classes/{classId}/subjects/{subjectId}` | Assign subject to class |
| DELETE | `/classes/{classId}/subjects/{subjectId}` | Remove subject from class |

#### Assessments
| Method | Endpoint | Description |
|---|---|---|
| GET | `/assessments/not_started` | List upcoming assessments |
| GET | `/assessments/in_progress` | List active assessments |
| GET | `/assessments/completed` | List completed assessments |
| POST | `/assessments` | Create assessment |
| PATCH | `/assessments/{id}` | Update assessment (incl. replace questions array) |
| DELETE | `/assessments/{id}` | Delete assessment |
| POST | `/assessments/{id}/publish` | Publish assessment |
| GET | `/assessments/{id}/submissions` | Get all student submissions |
| POST | `/assessments/{id}/questions/bulk` | Bulk upload questions |

#### Assessment Categories
| Method | Endpoint | Description |
|---|---|---|
| GET | `/assessment-categories` | List all categories |
| POST | `/assessment-categories` | Create category |
| DELETE | `/assessment-categories/{id}` | Delete category |

#### Scores
| Method | Endpoint | Description |
|---|---|---|
| GET | `/assessments/{id}/scores` | Get scores for assessment |
| POST | `/assessments/{id}/scores` | Record score |
| POST | `/assessments/{id}/scores/bulk` | Bulk upload scores |

#### Users
| Method | Endpoint | Description |
|---|---|---|
| GET | `/users` | List users |
| GET | `/users/{id}` | Get user |
| POST | `/users` | Create user |
| PATCH | `/users/{id}` | Update user |
| DELETE | `/users/{id}` | Soft delete user |

#### Reports
| Method | Endpoint | Description |
|---|---|---|
| GET | `/reports/statistics` | School statistics |
| GET | `/reports/approval-queue` | Reports awaiting approval |
| POST | `/reports/approve` | Approve batch of reports |
| GET | `/reports/booklet/{classId}` | Preview report cards for class |

#### Attendance
| Method | Endpoint | Description |
|---|---|---|
| GET | `/attendance` | Get attendance records |
| POST | `/attendance` | Record attendance |

---

## 13. Redux State Management

### Store Configuration

The Redux store (`src/reduxToolKit/store.ts`) combines:
- 8 slice reducers
- 3 RTK Query API middleware (paraApi, uniApi, superAdminApi)
- A `RESET_STORE` action that resets all slices to their initial state (used on logout)

### Slices Overview

#### `user` Slice

| State Field | Type | Description |
|---|---|---|
| `accessToken` | string | JWT token |
| `subdomain` | string | Current tenant subdomain |
| `institutionType` | "k12" \| "university" | Institution type |
| `user` | UserObject | Logged-in user details |
| `users` | UserObject[] | All users list |
| `students` | UserObject[] | Filtered students |
| `teachers` | UserObject[] | Filtered teachers |
| `tenantInfo` | TenantInfo | School configuration |
| `loading` | boolean | Request in flight |

#### `admin` Slice

| State Field | Type | Description |
|---|---|---|
| `classes` | ClassItem[] | All classes |
| `subjects` | SubjectItem[] | All subjects |
| `assessments` | AssessmentItem[] | All assessments |
| `scores` | Score[] | Assessment scores |
| `attendance` | Attendance[] | Attendance records |
| `comments` | Comment[] | Student comments |
| `schoolSettings` | Settings | School configuration |
| `gradingSystem` | GradingSystem | Grading rules |
| `assessmentCategories` | Category[] | Assessment categories |
| `cbtExamIds` | string[] | IDs of CBT (online) exams — persisted to localStorage |
| `promotionPreview` | PromotionPreview | Class promotion preview data |
| `schoolStatistics` | Statistics | Dashboard statistics |
| `approvalQueue` | Report[] | Reports awaiting approval |

#### `teacher` Slice

| State Field | Type | Description |
|---|---|---|
| `academicCurrent` | AcademicSession | Active session/term |
| `assessments` | Assessment[] | Teacher's assessments |
| `teacherClasses` | ClassItem[] | Assigned classes |
| `classStudents` | Student[] | Students in selected class |
| `classSubjects` | Subject[] | Subjects for selected class |
| `submissions` | Submission[] | Student submissions for current assessment |
| `scores` | Score[] | Scores for current assessment |
| `comments` | Comment[] | Teacher's comments |
| `bookletPreview` | ReportBooklet | Report card preview data |

#### `student` Slice

| State Field | Type | Description |
|---|---|---|
| `assessments` | Assessment[] | Available assessments |
| `currentAssessment` | Assessment | Selected exam details |
| `activeSession` | ExamSession | Live exam state (answers, timer, proctoring) |

`activeSession` persists to `localStorage["exam_session"]` for crash recovery.

#### `setUp` Slice

| State Field | Type | Description |
|---|---|---|
| `sessions` | Session[] | All academic sessions |
| `currentSession` | Session | Active session/term |
| `onboardingSetupData` | OnboardingData | Wizard state |
| `createdClasses` | ClassItem[] | Classes created in wizard |
| `createdSubjects` | SubjectItem[] | Subjects created in wizard |
| `gradingScaleData` | GradingScale | Grading rules set in wizard |

#### `superAdmin` Slice

| State Field | Type | Description |
|---|---|---|
| `apiKey` | string | Super admin API key |
| `k12Subdomain` | string | School currently being managed |
| `k12AdminEmail` | string | Logged-in super admin email |
| `k12Unlocked` | boolean | Whether K-12 panel is accessible |

#### `lessonGenerator` Slice

| State Field | Type | Description |
|---|---|---|
| `lessons` | Lesson[] | Generation history |
| `selectedLesson` | Lesson | Current lesson content |
| `wallet` | WalletData | Balance and transactions |

#### `sabiStandaloneAuth` Slice

- Standalone auth tokens for SabiNote API (lesson generator backend)

### localStorage Keys

| Key | Content | Purpose |
|---|---|---|
| `cbt_exam_ids` | `string[]` (JSON) | IDs of exams created via CBT portal — persists across page refreshes since backend list endpoints don't return `isOnline` flag |
| `exam_session` | `ExamSession` (JSON) | Active exam session — crash/refresh recovery |
| `subdomain` | `string` | Current tenant subdomain |
| `accessToken` | `string` | Auth token fallback |

---

## 14. Roles & Permissions

### K-12 Roles

| Role | Access Level | Key Restrictions |
|---|---|---|
| `school_admin` | Full access to `/RMS/*` | Can manage all users, classes, subjects, assessments, and reports |
| `teacher` | Access to `/teacher/*` | Can only see own assigned classes and subjects; cannot view other teachers' data |
| `student` | Access to `/student/*` | Can only view published assessments and own report card |

### University Roles

| Role | Access Level | Key Restrictions |
|---|---|---|
| `uni_admin` | Full access to `/uni-admin/*` | Can manage all faculties, departments, courses, users |
| `uni_lecturer` | Access to `/uni-lecturer/*` | Can only manage own courses and assessments |
| `uni_student` | Access to `/uni-student/*` | Read-only access to own courses, exams, and results |

### Super Admin

| Role | Access Level | Key Restrictions |
|---|---|---|
| `super_admin` | Access to `/super-admin/*` | Can manage all schools on the platform; uses API key auth |

### Route Protection

All protected routes are wrapped in:
1. **`<ProtectedRoute>`** — redirects to `/auth/signin` if no valid token
2. **`<RoleGuard role="...">`** — redirects to `/unauthorized` if role doesn't match

---

## 15. Deployment & Configuration

### Environment Variables

| Variable | Description | Required |
|---|---|---|
| `K12_BACKEND_URL` | K-12 backend base URL | ✅ |
| `UNI_BACKEND_URL` | University backend base URL | ✅ |
| `NEXT_PUBLIC_GEMINI_API_KEY` | Google Gemini API key (lesson generator) | Optional |
| `NEXT_PUBLIC_SABINOTE_API_URL` | SabiNote API URL | Optional |

### Build

```bash
npm install
npm run dev        # Development (Turbopack)
npm run build      # Production build
npm start          # Production server
```

### Multi-Tenant Subdomain Setup

For subdomain-based tenancy to work in production:
1. Wildcard DNS: `*.pln.ng → server IP`
2. Wildcard SSL certificate for `*.pln.ng`
3. Reverse proxy (NGINX/CloudFront) terminates TLS and forwards to Next.js

In development, schools are accessed via `{subdomain}.localhost:3000`.

### Cookie Configuration

The auth token cookie is set with:
- `Domain: .pln.ng` (dot prefix = shared across all subdomains)
- `SameSite: None; Secure` (for cross-subdomain sharing)
- `Expires: 7 days`

This allows a user logged into `school-a.pln.ng` to be automatically authenticated when visiting `school-a.pln.ng/teacher` or any other path on the same subdomain without re-login.

---

*ParaLearn is actively developed. Features and endpoints are subject to change.*
