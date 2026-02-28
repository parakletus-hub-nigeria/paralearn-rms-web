# Teacher & Admin Frontend Guide

## Overview

This guide provides comprehensive documentation for frontend developers implementing teacher and admin functionality in ParaLearn. It covers all endpoints, workflows, and best practices.

**Base URL:** `https://{subdomain}.api.paralearn.app` or `http://localhost:3001`

**Authentication:** All endpoints require JWT token in Authorization header: `Bearer <token>`

---

## Quick Reference - Common Workflows

### Admin: Setting Up a New Class

```
Step 1: Create the class
POST /classes
{ "name": "JSS 1A", "level": "JSS1", "stream": "A", "capacity": 40 }

Step 2: Create subjects for the class
POST /subjects
{ "name": "Mathematics", "code": "MTH", "classId": "class-uuid" }

Step 3: Assign teachers to subjects
POST /subjects/:subjectId/assign-teacher
{ "teacherId": "teacher-uuid" }

Step 4: Enroll students
POST /classes/:classId/enroll
{ "studentId": "student-uuid" }
```

### Teacher: Creating Assessment & Entering Scores

```
Step 1: View my assigned classes and subjects
GET /reports/teacher/:teacherId/classes

Step 2: Create an assessment
POST /assessments
{ 
  "title": "CA1", 
  "classId": "class-uuid", 
  "subjectId": "subject-uuid",
  "totalMarks": 30,
  "isOnline": false 
}

Step 3: Enter scores for students
POST /assessments/:assessmentId/scores
{ "scores": [{ "studentId": "xxx", "marksAwarded": 25, "maxMarks": 30 }] }

Step 4: View entered scores
GET /scores/assessment/:assessmentId
```

### Teacher: End of Term Report Submission

```
Step 1: Verify all scores are entered
GET /reports/class/:classId/booklet-preview?session=2024/2025&term=First Term

Step 2: Add comments for students
POST /comments
{ "studentId": "xxx", "comment": "...", "type": "class_teacher", ... }

Step 3: Submit for admin approval
POST /reports/submit-for-approval
{ "classId": "xxx", "session": "2024/2025", "term": "First Term" }
```

### Admin: Approving & Publishing Reports

```
Step 1: View pending approvals
GET /reports/approval-queue?status=pending

Step 2: Review class reports
GET /reports/class/:classId/booklet-preview

Step 3: Approve or reject
POST /reports/approve
{ "action": "approve", "reportCardIds": [...] }

Step 4: Publish to students/parents
POST /reports/approve
{ "action": "publish", "reportCardIds": [...] }
```

---

## Table of Contents

1. [Authentication & Login](#1-authentication--login)
2. [Dashboard & Overview](#2-dashboard--overview)
3. [User Management](#3-user-management)
4. [Class Management](#4-class-management)
5. [Subject Management](#5-subject-management)
6. [Assessment Management](#6-assessment-management)
7. [Score Management](#7-score-management)
8. [Report Cards & Reports](#8-report-cards--reports)
9. [Bulk Operations](#9-bulk-operations)
10. [Academic Settings](#10-academic-settings)
11. [School Settings](#11-school-settings)
12. [Comments & Feedback](#12-comments--feedback)
13. [Attendance](#13-attendance)
14. [Workflows & Processes](#14-workflows--processes)

---

## 1. Authentication & Login

### Login Flow

**Understanding Login Credentials:**

For **Students and Teachers**, login credentials follow this format:
- **Username**: School subdomain (e.g., `brightfuture`)
- **Password**: User code (e.g., `STU-S-26-00001` for students, `TCH-001` for teachers)

For **Admins**: Regular email and password.

### Login Endpoint

```
POST /auth/login
```

**Request Body:**
```json
{
  "email": "brightfuture",
  "password": "TCH-001"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user-uuid",
    "email": "tch-001@brightfuture",
    "firstName": "John",
    "lastName": "Smith",
    "roles": ["teacher"],
    "teacherId": "TCH-001",
    "school": {
      "id": "school-uuid",
      "name": "Bright Future Academy",
      "subdomain": "brightfuture"
    }
  }
}
```

### Other Auth Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/forgot-password` | POST | Request password reset email |
| `/auth/reset-password` | POST | Reset password with token |
| `/auth/change-password` | POST | Change password (authenticated) |
| `/auth/refresh-token` | GET | Refresh JWT token |
| `/auth/logout` | GET | Clear session cookies |

---

## 2. Dashboard & Overview

### Get Current Academic Session

```
GET /academic/current
```

**Response:**
```json
{
  "success": true,
  "data": {
    "session": "2024/2025",
    "term": "First Term",
    "sessionId": "session-uuid",
    "termId": "term-uuid",
    "startDate": "2024-09-01",
    "endDate": "2024-12-15"
  }
}
```

### Get School Statistics (Admin Only)

```
GET /reports/school/statistics?session=2024/2025&term=First Term
```

**Response:**
```json
{
  "overview": {
    "totalStudents": 450,
    "totalTeachers": 25,
    "totalClasses": 12,
    "averageScore": 68.5,
    "passRate": 78.5
  },
  "gradeDistribution": { "A": 50, "B": 120, "C": 180, "D": 70, "F": 30 }
}
```

---

## 3. User Management

### Role Hierarchy

| Role | Permissions |
|------|-------------|
| **Admin** | Full access - manage users, classes, settings, reports |
| **Teacher** | Manage own assessments, scores, comments for assigned classes |
| **Student** | View own data, take assessments |

### Create User (Admin)

```
POST /users
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",    // Optional for students/teachers
  "roles": ["teacher"],
  "phoneNumber": "+2348012345678"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-uuid",
    "email": "tch-001@brightfuture",
    "firstName": "John",
    "lastName": "Doe",
    "teacherId": "TCH-001"
  },
  "loginCredentials": {
    "username": "brightfuture",
    "password": "TCH-001"
  },
  "credentialsSent": true
}
```

### List Users

```
GET /users?role=teacher&page=1&limit=20&search=john
```

**Query Parameters:**
| Parameter | Description |
|-----------|-------------|
| `role` | Filter by role: `student`, `teacher`, `admin` |
| `search` | Search by name or email |
| `classId` | Filter students by class |
| `page` | Page number (default: 1) |
| `limit` | Items per page (default: 20) |

### Update User

```
PATCH /users/:userId
```

### Delete User (Admin)

```
DELETE /users/:userId
```

---

## 4. Class Management (Admin)

### Overview

Classes are the foundation of the school structure. The admin workflow is:

```
┌──────────────┐    ┌─────────────────┐    ┌────────────────┐    ┌─────────────────┐
│ Create Class │ -> │ Assign Teachers │ -> │ Create Subjects│ -> │ Enroll Students │
└──────────────┘    └─────────────────┘    └────────────────┘    └─────────────────┘
```

### Step 1: Create Class

```
POST /classes
```

**Request Body:**
```json
{
  "name": "JSS 1A",
  "level": "JSS1",
  "stream": "A",
  "capacity": 40,
  "academicYear": "2024/2025"
}
```

**Response:**
```json
{
  "id": "class-uuid",
  "name": "JSS 1A",
  "level": "JSS1",
  "stream": "A",
  "capacity": 40,
  "academicYear": "2024/2025",
  "schoolId": "school-uuid",
  "createdAt": "2024-01-15T10:00:00Z"
}
```

**Frontend UI Recommendation:**
- Create a "Class Management" page with a form
- Fields: Name, Level (dropdown), Stream (optional), Capacity
- After creation, redirect to class details page

### Step 2: List All Classes

```
GET /classes?level=JSS1&isActive=true
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `level` | string | Filter by level (JSS1, JSS2, SS1, etc.) |
| `stream` | string | Filter by stream (A, B, C, etc.) |
| `academicYear` | string | Filter by year (2024/2025) |
| `isActive` | boolean | Only active classes |

**Response:**
```json
[
  {
    "id": "class-uuid-1",
    "name": "JSS 1A",
    "level": "JSS1",
    "stream": "A",
    "capacity": 40,
    "enrollmentCount": 35,
    "teacherCount": 8
  },
  {
    "id": "class-uuid-2",
    "name": "JSS 1B",
    "level": "JSS1",
    "stream": "B",
    "capacity": 40,
    "enrollmentCount": 38,
    "teacherCount": 8
  }
]
```

**Frontend UI Recommendation:**
- Display as a table or card grid
- Show enrollment count vs capacity
- Quick actions: View, Edit, Assign Teacher, Add Students

### Step 3: Get Class Details

```
GET /classes/:classId
```

**Response:**
```json
{
  "id": "class-uuid",
  "name": "JSS 1A",
  "level": "JSS1",
  "stream": "A",
  "capacity": 40,
  "academicYear": "2024/2025",
  "teacherAssignments": [
    {
      "id": "assignment-uuid",
      "teacher": {
        "id": "teacher-uuid",
        "firstName": "John",
        "lastName": "Smith",
        "email": "tch-001@brightfuture",
        "teacherId": "TCH-001"
      },
      "assignedBy": { "id": "admin-uuid", "email": "admin@school.com" }
    }
  ],
  "enrollments": [
    {
      "student": {
        "id": "student-uuid",
        "firstName": "Jane",
        "lastName": "Doe",
        "studentId": "STU-S-26-00001"
      }
    }
  ],
  "subjects": [
    {
      "id": "subject-uuid",
      "name": "Mathematics",
      "code": "MTH"
    }
  ]
}
```

### Step 4: Assign Teacher to Class

```
POST /classes/:classId/teachers
```

**Request Body:**
```json
{
  "teacherId": "teacher-uuid"
}
```

**Response:**
```json
{
  "message": "Teacher assigned successfully",
  "assignment": {
    "id": "assignment-uuid",
    "classId": "class-uuid",
    "teacherId": "teacher-uuid",
    "assignedAt": "2024-01-15T10:30:00Z"
  }
}
```

**Frontend UI Recommendation:**
- Show a modal with teacher dropdown/search
- Only show teachers not already assigned to this class
- After assignment, refresh the class details

### Step 5: Remove Teacher from Class

```
DELETE /classes/:classId/teachers/:teacherId
```

### Step 6: Enroll Student in Class

```
POST /classes/:classId/enroll
```

**Request Body:**
```json
{
  "studentId": "student-uuid"
}
```

**Frontend UI Recommendation:**
- Show searchable student list
- Allow bulk selection for multiple enrollments
- Show current enrollment count vs capacity

### Step 7: Remove Student from Class

```
DELETE /classes/:classId/enroll/:studentId
```

### Update Class

```
PUT /classes/:classId
```

**Request Body:**
```json
{
  "name": "JSS 1A (Updated)",
  "capacity": 45
}
```

### Delete Class (Admin)

```
DELETE /classes/:classId
```

**Warning:** This will remove all enrollments and teacher assignments

---

## 5. Subject Management (Admin)

### Overview

Subjects are linked to classes. Each class has its own set of subjects with assigned teachers.

```
┌──────────────────┐    ┌─────────────────────┐    ┌──────────────────────┐
│ Select a Class   │ -> │ Create Subject for  │ -> │ Assign Subject       │
│                  │    │ that Class          │    │ Teacher              │
└──────────────────┘    └─────────────────────┘    └──────────────────────┘
```

### Step 1: Create Subject for a Class

```
POST /subjects
```

**Request Body:**
```json
{
  "name": "Mathematics",
  "code": "MTH",
  "classId": "class-uuid",
  "description": "Core mathematics covering algebra, geometry, and arithmetic"
}
```

**Response:**
```json
{
  "id": "subject-uuid",
  "name": "Mathematics",
  "code": "MTH",
  "classId": "class-uuid",
  "description": "Core mathematics covering algebra, geometry, and arithmetic",
  "createdAt": "2024-01-15T11:00:00Z"
}
```

**Frontend UI Recommendation:**
- Create subjects from the Class Details page
- Have a "Add Subject" button that opens a modal
- Pre-select the current class in the form
- Common subjects: Mathematics, English, Science, Social Studies, etc.

### Step 2: List All Subjects

```
GET /subjects
```

**Response:**
```json
[
  {
    "id": "subject-uuid-1",
    "name": "Mathematics",
    "code": "MTH",
    "class": {
      "id": "class-uuid",
      "name": "JSS 1A"
    },
    "teacherAssignments": [
      {
        "teacher": {
          "id": "teacher-uuid",
          "firstName": "John",
          "lastName": "Smith"
        }
      }
    ]
  },
  {
    "id": "subject-uuid-2",
    "name": "English Language",
    "code": "ENG",
    "class": {
      "id": "class-uuid",
      "name": "JSS 1A"
    },
    "teacherAssignments": []
  }
]
```

**Frontend UI Recommendation:**
- Group subjects by class for better organization
- Show which subjects have teachers assigned (highlight unassigned)
- Filter by class, teacher assignment status

### Step 3: Get Subject Details

```
GET /subjects/:subjectId
```

**Response:**
```json
{
  "id": "subject-uuid",
  "name": "Mathematics",
  "code": "MTH",
  "description": "Core mathematics",
  "class": {
    "id": "class-uuid",
    "name": "JSS 1A",
    "level": "JSS1"
  },
  "teacherAssignments": [
    {
      "teacher": {
        "id": "teacher-uuid",
        "firstName": "John",
        "lastName": "Smith",
        "teacherId": "TCH-001"
      },
      "assignedAt": "2024-01-15T11:30:00Z"
    }
  ]
}
```

### Step 4: Assign Teacher to Subject

```
POST /subjects/:subjectId/assign-teacher
```

**Request Body:**
```json
{
  "teacherId": "teacher-uuid"
}
```

**Response:**
```json
{
  "message": "Teacher assigned to subject successfully",
  "assignment": {
    "subjectId": "subject-uuid",
    "teacherId": "teacher-uuid",
    "assignedAt": "2024-01-15T11:30:00Z"
  }
}
```

**Frontend UI Recommendation:**
- Show teacher dropdown with search
- Display teacher's current subject load
- Allow assigning same teacher to multiple subjects

### Typical Subject List for Nigerian Schools

| Subject | Code | Levels |
|---------|------|--------|
| Mathematics | MTH | All |
| English Language | ENG | All |
| Basic Science | BSC | JSS |
| Basic Technology | BTC | JSS |
| Social Studies | SST | JSS |
| Civic Education | CIV | All |
| Computer Studies | CMP | All |
| Physical & Health Education | PHE | All |
| Agricultural Science | AGR | All |
| Home Economics | HEC | JSS |
| Business Studies | BUS | JSS |
| Physics | PHY | SS |
| Chemistry | CHM | SS |
| Biology | BIO | SS |
| Economics | ECO | SS |
| Government | GOV | SS |
| Literature in English | LIT | SS |

---

## 6. Assessment Management (Teacher)

### Overview

Teachers can only create assessments and enter scores for classes and subjects they are assigned to.

```
┌───────────────────┐    ┌────────────────────┐    ┌─────────────────┐    ┌──────────────┐
│ View My Assigned  │ -> │ Create Assessment  │ -> │ Add Questions   │ -> │ Enter Scores │
│ Classes & Subjects│    │ for Subject        │    │ (if online)     │    │              │
└───────────────────┘    └────────────────────┘    └─────────────────┘    └──────────────┘
```

### Assessment Types

| Type | Description | Use Case |
|------|-------------|----------|
| **Online** | Students take tests digitally with auto-grading | Quizzes, MCQ tests |
| **Offline/Conventional** | Teacher creates assessment, enters scores manually | Paper exams, practicals |

### Step 1: View My Assigned Classes (Teacher)

```
GET /reports/teacher/:teacherId/classes
```

**Response:**
```json
{
  "classes": [
    {
      "id": "class-uuid-1",
      "name": "JSS 1A",
      "stream": "A",
      "isClassTeacher": true,
      "subjects": ["Mathematics", "Physics"]
    },
    {
      "id": "class-uuid-2",
      "name": "JSS 2A",
      "stream": "A",
      "isClassTeacher": false,
      "subjects": ["Mathematics"]
    }
  ]
}
```

**Frontend UI Recommendation:**
- Show this on Teacher Dashboard
- Display as cards with class name, subjects taught
- Highlight if teacher is Class Teacher for that class
- Click to view class details and create assessments

### Step 2: View My Assessments

```
GET /assessments/me
```

**Response:**
```json
[
  {
    "id": "assessment-uuid-1",
    "title": "Mathematics CA1",
    "subject": { "id": "subject-uuid", "name": "Mathematics" },
    "class": { "id": "class-uuid", "name": "JSS 1A" },
    "totalMarks": 30,
    "status": "published",
    "submissionCount": 35,
    "session": "2024/2025",
    "term": "First Term"
  },
  {
    "id": "assessment-uuid-2",
    "title": "Physics Mid-Term",
    "subject": { "id": "subject-uuid", "name": "Physics" },
    "class": { "id": "class-uuid", "name": "JSS 1A" },
    "totalMarks": 50,
    "status": "draft",
    "submissionCount": 0,
    "session": "2024/2025",
    "term": "First Term"
  }
]
```

**Frontend UI Recommendation:**
- Display as a table or card list
- Filter by: Status (draft, published, ended), Class, Subject, Term
- Quick actions: Edit, View Scores, Delete

### Step 3: Create Assessment

```
POST /assessments
```

**Request Body (Offline/Conventional - Most Common):**
```json
{
  "title": "First Continuous Assessment",
  "subjectId": "subject-uuid",
  "classId": "class-uuid",
  "categoryId": "ca1-category-uuid",
  "totalMarks": 30,
  "session": "2024/2025",
  "term": "First Term",
  "isOnline": false
}
```

**Request Body (Online Assessment):**
```json
{
  "title": "Mathematics Quiz 1",
  "subjectId": "subject-uuid",
  "classId": "class-uuid",
  "categoryId": "ca1-category-uuid",
  "totalMarks": 30,
  "passingMarks": 15,
  "duration": 60,
  "instructions": "Answer all questions. No calculators allowed.",
  "startsAt": "2024-10-15T09:00:00Z",
  "endsAt": "2024-10-15T11:00:00Z",
  "session": "2024/2025",
  "term": "First Term",
  "isOnline": true
}
```

**Response:**
```json
{
  "id": "assessment-uuid",
  "title": "First Continuous Assessment",
  "subjectId": "subject-uuid",
  "classId": "class-uuid",
  "categoryId": "ca1-category-uuid",
  "totalMarks": 30,
  "session": "2024/2025",
  "term": "First Term",
  "isOnline": false,
  "status": "draft",
  "createdAt": "2024-10-01T10:00:00Z"
}
```

**Frontend UI Recommendation:**
- Create assessment form with:
  - Title (text input)
  - Class (dropdown - only show assigned classes)
  - Subject (dropdown - only show subjects for selected class)
  - Category (dropdown - CA1, CA2, Exam, etc.)
  - Total Marks (number input)
  - Assessment Type (toggle: Online/Offline)
  - If Online: Duration, Start Time, End Time, Instructions

### Assessment Categories

Get available categories:
```
GET /assessment-categories
```

**Common Categories:**
| Category | Typical Weight | Description |
|----------|---------------|-------------|
| CA1 | 10-15% | First Continuous Assessment |
| CA2 | 10-15% | Second Continuous Assessment |
| CA3 | 10-15% | Third Continuous Assessment |
| Mid-Term | 20% | Mid-Term Examination |
| Exam | 40-60% | End of Term Examination |

### Step 4: Get Assessment Details

```
GET /assessments/:assessmentId
```

### Step 5: Update Assessment

```
PATCH /assessments/:assessmentId
```

**Request Body:**
```json
{
  "title": "Updated Assessment Title",
  "totalMarks": 40
}
```

### Step 6: Publish Assessment (Make visible to students)

```
POST /assessments/:assessmentId/publish
```

**Request Body:**
```json
{
  "publish": true
}
```

### For Online Assessments: Add Questions

#### Bulk Upload Questions (Excel)

```
POST /assessments/:assessmentId/questions/bulk
Content-Type: multipart/form-data

file: [Excel file with questions]
```

**Excel Format:**
| question | type | option_a | option_b | option_c | option_d | correct_answer | marks |
|----------|------|----------|----------|----------|----------|----------------|-------|
| What is 2+2? | multiple_choice | 2 | 3 | 4 | 5 | C | 2 |
| Explain photosynthesis | essay | | | | | | 10 |

**Question Types:**
- `multiple_choice` - Single correct answer from options
- `multi_select` - Multiple correct answers
- `true_false` - True or False
- `short_answer` - Short text response
- `essay` - Long text response (manual grading)

### View Student Submissions (Online Assessments)

```
GET /assessments/:assessmentId/submissions
```

**Response:**
```json
{
  "assessmentId": "assessment-uuid",
  "totalStudents": 40,
  "submitted": 35,
  "pending": 5,
  "submissions": [
    {
      "id": "submission-uuid",
      "student": {
        "id": "student-uuid",
        "firstName": "Jane",
        "lastName": "Doe",
        "studentId": "STU-S-26-00001"
      },
      "submittedAt": "2024-10-15T10:30:00Z",
      "totalMarks": 25,
      "status": "graded"
    }
  ]
}
```

### Grade Essay Answer Manually

```
POST /assessments/submissions/:submissionId/answers/:answerId/grade
```

**Request Body:**
```json
{
  "marksAwarded": 8,
  "comment": "Good explanation but missing key details about chlorophyll"
}
```

---

## 7. Score Management (Teacher)

### Overview

After creating an assessment (especially offline/conventional), teachers need to enter student scores.

```
┌───────────────────┐    ┌────────────────────┐    ┌─────────────────┐
│ Select Assessment │ -> │ View Students in   │ -> │ Enter Scores    │
│                   │    │ Class              │    │ (Individual/Bulk│
└───────────────────┘    └────────────────────┘    └─────────────────┘
```

### Method 1: Upload Scores for Assessment (Recommended for Offline)

This is the primary method for entering scores for offline/conventional assessments.

```
POST /assessments/:assessmentId/scores
```

**Request Body:**
```json
{
  "scores": [
    { 
      "studentId": "student-1-uuid", 
      "marksAwarded": 25, 
      "maxMarks": 30,
      "comment": "Good work"
    },
    { 
      "studentId": "student-2-uuid", 
      "marksAwarded": 28, 
      "maxMarks": 30,
      "comment": "Excellent"
    },
    { 
      "studentId": "student-3-uuid", 
      "marksAwarded": 18, 
      "maxMarks": 30,
      "comment": "Needs improvement"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "created": 3,
  "updated": 0,
  "failed": 0,
  "message": "Scores uploaded successfully"
}
```

**Frontend UI Recommendation:**
- Display a table with all students in the class
- Columns: Student Name, Student ID, Score Input, Max Marks, Comment
- Pre-fill max marks from assessment's totalMarks
- Save button to submit all scores at once
- Show validation errors for invalid scores

### Method 2: Create Individual Score

For entering a single student's score:

```
POST /scores
```

**Request Body:**
```json
{
  "studentId": "student-uuid",
  "assessmentId": "assessment-uuid",
  "marksAwarded": 25,
  "maxMarks": 30,
  "comment": "Excellent work"
}
```

**Response:**
```json
{
  "id": "score-uuid",
  "studentId": "student-uuid",
  "assessmentId": "assessment-uuid",
  "marksAwarded": 25,
  "maxMarks": 30,
  "percentage": 83.33,
  "comment": "Excellent work",
  "createdAt": "2024-10-20T14:00:00Z"
}
```

### Method 3: Bulk Upload Scores via Excel

For uploading scores from an Excel file:

```
POST /scores/bulk?assessmentId=assessment-uuid
Content-Type: multipart/form-data

file: [Excel file with scores]
```

**Excel Format:**
| studentId | marksAwarded | maxMarks | comment |
|-----------|--------------|----------|---------|
| STU-S-26-00001 | 25 | 30 | Good |
| STU-S-26-00002 | 28 | 30 | Excellent |
| STU-S-26-00003 | 15 | 30 | Needs improvement |

**Alternative columns accepted:**
- `studentEmail` instead of `studentId`
- `admissionNo` instead of `studentId`

**Response:**
```json
{
  "success": true,
  "processed": 35,
  "created": 30,
  "updated": 5,
  "failed": 0,
  "errors": []
}
```

### View Scores for Assessment

```
GET /scores/assessment/:assessmentId
```

**Response:**
```json
{
  "assessment": {
    "id": "assessment-uuid",
    "title": "Mathematics CA1",
    "totalMarks": 30,
    "class": { "id": "class-uuid", "name": "JSS 1A" },
    "subject": { "id": "subject-uuid", "name": "Mathematics" }
  },
  "scores": [
    {
      "id": "score-uuid",
      "student": {
        "id": "student-uuid",
        "firstName": "Jane",
        "lastName": "Doe",
        "studentId": "STU-S-26-00001"
      },
      "marksAwarded": 25,
      "maxMarks": 30,
      "percentage": 83.33,
      "comment": "Good work",
      "gradedAt": "2024-10-20T14:00:00Z"
    }
  ],
  "statistics": {
    "totalStudents": 40,
    "scored": 38,
    "pending": 2,
    "average": 22.5,
    "highest": 30,
    "lowest": 12,
    "passRate": 85.0
  }
}
```

**Frontend UI Recommendation:**
- Show score entry form as a spreadsheet-like table
- Display statistics (average, highest, lowest) at the top
- Highlight students with no scores yet
- Allow inline editing of scores
- Show student photo/avatar for easy identification

### Score Entry Workflow for Teachers

```
1. Go to "My Assessments" page
   GET /assessments/me

2. Select an assessment to enter scores
   
3. View class students and existing scores
   GET /scores/assessment/:assessmentId

4. Enter scores for each student
   POST /assessments/:assessmentId/scores
   
5. Review and verify all scores entered
   
6. Scores automatically reflect in report cards
```

### Important Notes

1. **Scores are linked to session and term** - Ensure the assessment has correct session/term
2. **Teachers can only score their own assessments** - System enforces this
3. **Scores can be updated** - If a score exists, submitting again will update it
4. **Max marks validation** - marksAwarded cannot exceed maxMarks

---

## 8. Report Cards & Reports

### Report Card Workflow

```
┌─────────────────┐    ┌──────────────┐    ┌───────────────┐    ┌────────────┐
│ Teacher enters  │ -> │ Submit for   │ -> │ Admin reviews │ -> │  Publish   │
│ scores/comments │    │   approval   │    │  & approves   │    │ to parents │
└─────────────────┘    └──────────────┘    └───────────────┘    └────────────┘
```

### Preview Report Booklet (Before Submission)

```
GET /reports/class/:classId/booklet-preview?session=2024/2025&term=First Term
```

Shows all students with computed scores, grades, positions.

### Submit for Approval (Teacher)

```
POST /reports/submit-for-approval
```

**Request Body:**
```json
{
  "classId": "class-uuid",
  "session": "2024/2025",
  "term": "First Term"
}
```

### View Approval Queue (Admin)

```
GET /reports/approval-queue?status=pending
```

### Approve/Reject Reports (Admin)

```
POST /reports/approve
```

**Request Body:**
```json
{
  "action": "approve",  // or "reject" or "publish"
  "reportCardIds": ["report-1", "report-2"],
  "rejectionReason": "Comments incomplete"  // Required for reject
}
```

### Generate Individual Report Card PDF

```
GET /reports/student/:studentId/report-card/pdf?session=2024/2025&term=First Term
```

Returns: PDF file download

### Bulk Generate Class Report Cards

```
GET /reports/class/:classId/report-cards/bulk-generate?session=2024/2025&term=First Term&format=combined
```

**Format options:**
- `individual` - Separate PDF for each student
- `combined` - Single PDF with all students

### Download Combined Class PDF

```
GET /reports/class/:classId/report-cards/download?session=2024/2025&term=First Term
```

### Get Class Performance Report

```
GET /reports/class/:classId/performance?session=2024/2025&term=First Term
```

### Get Student Rankings

```
GET /reports/rankings?classId=xxx&session=2024/2025&term=First Term
```

---

## 9. Bulk Operations

### Download Templates

```
GET /bulk/template/students   // Student upload template
GET /bulk/template/teachers   // Teacher upload template
```

Returns: Excel file (.xlsx)

### Bulk Upload Students

```
POST /bulk/upload/students
Content-Type: multipart/form-data

file: [Excel file]
```

**Template Columns:**
| Column | Required |
|--------|----------|
| firstName | ✅ Yes |
| lastName | ✅ Yes |
| className | ✅ Yes |
| email | ❌ Optional |
| dateOfBirth | ❌ Optional |
| gender | ❌ Optional |
| guardianName | ❌ Optional |
| guardianPhone | ❌ Optional |

### Bulk Upload Teachers

```
POST /bulk/upload/teachers
Content-Type: multipart/form-data

file: [Excel file]
```

### Bulk Upload Result Sheets

For uploading student scores from external result sheets:

```
POST /bulk/upload/result-sheets
Content-Type: multipart/form-data

file: [Excel file]
```

**Excel Format:**
| studentName | class | Mathematics_CA1 | Mathematics_Exam | English_CA1 | English_Exam |
|-------------|-------|-----------------|------------------|-------------|--------------|
| John Doe | JSS1A | 25 | 60 | 28 | 55 |

### Bulk Download Data

```
GET /bulk/download?type=students&format=excel&classId=xxx
```

**Types:** `students`, `teachers`, `classes`, `assessments`
**Formats:** `excel`, `csv`, `pdf`

---

## 10. Academic Settings

### Get All Sessions

```
GET /academic/sessions
```

### Create Academic Session (Admin)

```
POST /academic/sessions
```

**Request Body:**
```json
{
  "session": "2024/2025",
  "startDate": "2024-09-01",
  "endDate": "2025-07-31",
  "terms": [
    { "name": "First Term", "startDate": "2024-09-01", "endDate": "2024-12-15" },
    { "name": "Second Term", "startDate": "2025-01-06", "endDate": "2025-04-10" },
    { "name": "Third Term", "startDate": "2025-04-28", "endDate": "2025-07-25" }
  ]
}
```

### Activate Term (Admin)

```
POST /academic/sessions/:sessionId/terms/:termId/activate
```

---

## 11. School Settings

### Get School Settings (Admin)

```
GET /school-settings
```

### Update School Settings (Admin)

```
PUT /school-settings
```

**Request Body:**
```json
{
  "schoolName": "Bright Future Academy",
  "motto": "Knowledge is Light",
  "address": "123 Education Street",
  "phoneNumber": "+234801234567",
  "primaryColor": "#2563eb",
  "secondaryColor": "#1e40af",
  "passingMark": 50,
  "useLetterGrades": true
}
```

### Get Grading Templates

```
GET /school-settings/grading/templates
```

Returns pre-defined grading systems (Nigerian WAEC, UK A-Levels, etc.)

### Get Current Grading System

```
GET /school-settings/grading
```

### Update Grading System (Admin)

```
PUT /school-settings/grading
```

**Request Body:**
```json
{
  "useLetterGrade": true,
  "usePoints": false,
  "useGPA": true,
  "gradeBoundaries": [
    { "grade": "A", "minScore": 70, "maxScore": 100, "points": 5, "description": "Excellent" },
    { "grade": "B", "minScore": 60, "maxScore": 69, "points": 4, "description": "Very Good" },
    { "grade": "C", "minScore": 50, "maxScore": 59, "points": 3, "description": "Good" },
    { "grade": "D", "minScore": 40, "maxScore": 49, "points": 2, "description": "Fair" },
    { "grade": "F", "minScore": 0, "maxScore": 39, "points": 0, "description": "Fail" }
  ]
}
```

---

## 12. Comments & Feedback

### Comment Types

| Type | Description | Who Can Add |
|------|-------------|-------------|
| `subject_teacher` | Subject-specific feedback | Subject Teacher |
| `class_teacher` | General class teacher remarks | Class Teacher |
| `principal` | Administrative comments | Admin/Principal |

### Add Comment

```
POST /comments
```

**Request Body:**
```json
{
  "studentId": "student-uuid",
  "subjectId": "subject-uuid",  // Optional for class_teacher/principal
  "term": "First Term",
  "session": "2024/2025",
  "comment": "Shows great improvement in algebra",
  "type": "subject_teacher"
}
```

### Bulk Add Comments

```
POST /comments/bulk
```

**Request Body:**
```json
{
  "studentIds": ["student-1", "student-2", "student-3"],
  "term": "First Term",
  "session": "2024/2025",
  "comment": "Promoted to next class",
  "type": "class_teacher"
}
```

### Get Student Comments

```
GET /comments/student/:studentId?term=First Term&session=2024/2025
```

### Get My Comments (Teacher)

```
GET /comments/my-comments?term=First Term&session=2024/2025
```

---

## 13. Attendance

### Record Attendance

```
POST /attendance
```

**Request Body:**
```json
{
  "studentId": "student-uuid",
  "session": "2024/2025",
  "term": "First Term",
  "daysPresent": 55,
  "totalDays": 60
}
```

### Get Student Attendance

```
GET /attendance?studentId=xxx&session=2024/2025&term=First Term
```

### Get Class Attendance

```
GET /attendance?classId=xxx&session=2024/2025&term=First Term
```

---

## 14. Workflows & Processes

### End-of-Term Workflow (Teacher)

```
1. Ensure all scores entered
   GET /reports/class/:classId/booklet-preview

2. Add comments for each student
   POST /comments

3. Review and submit for approval
   POST /reports/submit-for-approval

4. Wait for admin approval
```

### End-of-Term Workflow (Admin)

```
1. Review approval queue
   GET /reports/approval-queue?status=pending

2. Review each class submission
   GET /reports/class/:classId/booklet-preview

3. Approve or reject
   POST /reports/approve

4. Generate and distribute report cards
   GET /reports/class/:classId/report-cards/bulk-generate

5. Notify parents
   POST /reports/generate-and-notify
```

### New Student Onboarding (Admin)

```
1. Create student account
   POST /users (with roles: ["student"])
   
2. Enroll in class
   POST /classes/:classId/enroll

3. Credentials are auto-generated:
   - Username: School subdomain
   - Password: Student ID (e.g., STU-S-26-00001)

4. Share credentials with student/parent
```

### New Teacher Onboarding (Admin)

```
1. Create teacher account
   POST /users (with roles: ["teacher"])

2. Assign to classes
   POST /classes/:classId/teachers

3. Assign subjects
   POST /subjects/:subjectId/assign-teacher

4. Credentials are auto-generated:
   - Username: School subdomain  
   - Password: Teacher ID (e.g., TCH-001)
```

### Bulk Student Import (Admin)

```
1. Download template
   GET /bulk/template/students

2. Fill Excel with student data

3. Upload file
   POST /bulk/upload/students

4. Review results and fix errors
```

---

## Error Handling

### Common Error Responses

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### Error Codes

| Code | Meaning |
|------|---------|
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Duplicate entry |
| 500 | Server Error |

---

## Best Practices

### For Teachers

1. **Enter scores regularly** - Don't wait until end of term
2. **Add meaningful comments** - They appear on report cards
3. **Review before submission** - Use booklet preview
4. **Track assessment deadlines** - Students may miss submissions

### For Admins

1. **Set up academic calendar first** - Sessions and terms
2. **Configure grading system** - Before any scores are entered
3. **Use bulk operations** - For large data imports
4. **Review pending approvals regularly** - Don't delay report cards
5. **Backup before bulk operations** - Especially deletions

### API Integration Tips

1. **Always include Authorization header** with JWT token
2. **Handle token refresh** - Tokens expire after 24 hours
3. **Use pagination** - For large lists (users, assessments)
4. **Cache static data** - Grading configs, class lists
5. **Show loading states** - Bulk operations can take time

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-01-30 | Initial release |
