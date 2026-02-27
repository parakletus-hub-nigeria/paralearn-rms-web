# ParaLearn Frontend API Endpoints Documentation

This document lists the backend REST API endpoints explicitly used by the frontend (via Redux Toolkit and Axios), categorized by Role. It defines the exact JSON payload structures expected in the Requests and Responses.

---

## 🔐 Universal / Public Endpoints

### 1. Authenticate / Login
**Endpoint**: `POST /api/proxy/auth/login`
**Purpose**: Authenticates a user and issues a JWT token.

**Request Payload**:
```json
{
  "email": "user@school.com", // Or studentId/teacherId
  "password": "secretpassword",
  "subdomain": "brightness" // Current tenant subdomain scope
}
```

**Response Payload**:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbG...",
    "user": {
      "id": "usr_123",
      "email": "user@school.com",
      "firstName": "John",
      "lastName": "Doe",
      "roles": [{ "role": { "name": "teacher" } }]
    }
  }
}
```

### 2. Tenant Validation
**Endpoint**: `GET /api/proxy/tenant/subdomains`
**Purpose**: Identifies the school ID associated with the URL subdomain before attempting login.

**Request Payload**: None (Query params or hostname headers are used)

**Response Payload**:
```json
{
  "success": true,
  "data": [
    {
      "id": "sch_abc",
      "name": "Brightness Academy",
      "subdomain": "brightness"
    }
  ]
}
```

---

## 👑 Admin Endpoints

### 1. Create User
**Endpoint**: `POST /api/proxy/users`
**Purpose**: Provisions a new teacher, admin, or student account under the school tenant.

**Request Payload**:
```json
{
  "email": "teacher1@school.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "roles": ["teacher"],
  "phoneNumber": "+234800000000",
  "gender": "Female"
}
```

**Response Payload**:
```json
{
  "success": true,
  "data": {
    "id": "usr_456",
    "teacherId": "TCH2025001",
    "email": "teacher1@school.com",
    "isActive": true
  }
}
```

### 2. Create Class
**Endpoint**: `POST /api/proxy/classes`
**Purpose**: Registers a new localized academic class (e.g., JSS 1A).

**Request Payload**:
```json
{
  "name": "JSS 1A",
  "level": 1,
  "stream": "A",
  "capacity": 50
}
```

**Response Payload**:
```json
{
  "success": true,
  "data": {
    "id": "cls_jss1a",
    "name": "JSS 1A",
    "capacity": 50
  }
}
```

---

## 👨‍🏫 Teacher Endpoints

### 1. Create Assessment (Online CBT or Offline Exam)
**Endpoint**: `POST /api/proxy/assessments`
**Purpose**: Creates a test/exam and auto-links it to the current academic active term/session.

**Request Payload (Online CBT)**:
```json
{
  "title": "Math CA1",
  "description": "Algebra basics",
  "subjectId": "subj_123",
  "categoryId": "cat_ca1",
  "startsAt": "2026-03-01T08:00:00Z",
  "durationMins": 45,
  "totalMarks": 10,
  "assessmentType": "online",
  "isPublished": false,
  "questions": [
    {
      "questionType": "MCQ",
      "questionText": "Solve 2x = 4",
      "marks": 2,
      "options": [
        { "text": "1", "isCorrect": false },
        { "text": "2", "isCorrect": true }
      ]
    }
  ]
}
```

**Response Payload**:
```json
{
  "success": true,
  "data": {
    "id": "assess_abc",
    "code": "MATH-CA1-2026",
    "title": "Math CA1",
    "session": "2025/2026",
    "term": "Term 2",
    "totalMarks": 10,
    "durationMins": 45,
    "isPublished": false
  }
}
```

### 2. Fetch Teacher Assessments List
**Endpoint**: `GET /api/proxy/assessments/:status` (status mapped dynamically: `started`, `not_started`, `ended`)
**Purpose**: Dashboard retrieval of all assessments created by the teacher, grouped by subject.

**Request Payload**: None

**Response Payload (Array Grouped By Subjects)**:
```json
{
  "success": true,
  "data": [
    {
      "name": "Mathematics",
      "code": "MTH",
      "class": {
        "id": "cls_jss1",
        "name": "JSS 1A"
      },
      "assessments": [
        {
          "id": "assess_abc",
          "title": "Math CA1",
          "assessmentType": "exam",
          "totalMarks": 10,
          "durationMins": 45,
          "isPublished": true,
          "startsAt": "2026-03-01T08:00:00Z",
          "endsAt": "2026-03-01T09:00:00Z",
          "submissions": [
            {
              "id": "sub_001",
              "studentId": "usr_789",
              "status": "graded",
              "score": 8
            }
          ],
          "_count": { "submissions": 1 }
        }
      ]
    }
  ]
}
```

### 3. Upload Bulk Scores (Offline Exam)
**Endpoint**: `POST /api/proxy/assessments/:assessmentId/scores`
**Purpose**: Directly records student scores for paper-based assessments.

**Request Payload**:
```json
{
  "scores": [
    {
      "studentId": "usr_001",
      "marksAwarded": 45,
      "remarks": "Good"
    },
    {
      "studentId": "usr_002",
      "marksAwarded": 75,
      "remarks": "Excellent"
    }
  ]
}
```

**Response Payload**:
```json
{
  "success": true,
  "data": {
    "uploadedCount": 2,
    "failedCount": 0
  }
}
```

---

## 🎓 Student Endpoints

### 1. Load Active Exam Environment
**Endpoint**: `GET /api/proxy/assessments/details/:id`
**Purpose**: Retrieves the full exam structure to begin testing. Excludes `isCorrect` booleans from UI.

**Request Payload**: None

**Response Payload**:
```json
{
  "success": true,
  "data": {
    "id": "assess_abc",
    "title": "Math CA1",
    "durationMins": 45,
    "totalMarks": 10,
    "questions": [
      {
        "id": "que_1",
        "type": "MCQ",
        "prompt": "Solve 2x = 4",
        "marks": 2,
        "choices": [
          { "id": "opt_a", "text": "1" },
          { "id": "opt_b", "text": "2" }
        ]
      }
    ]
  }
}
```

### 2. Lock-in Exam Timer
**Endpoint**: `POST /api/proxy/assessments/:id/start`
**Purpose**: Syncs the backend `startedAt` timestamp to secure the duration countdown.

**Request Payload**:
```json
{
  "startedAt": "2026-02-22T08:00:00.000Z",
  "deviceMeta": {
    "userAgent": "Mozilla/5.0...",
    "screenRes": "1920x1080"
  },
  "antiMalpracticeData": {
    "visibilityHidden": false
  }
}
```

**Response Payload**:
```json
{
  "success": true,
  "data": {
    "submissionId": "sub_444",
    "status": "in_progress",
    "startedAt": "2026-02-22T08:00:00.000Z",
    "deadline": "2026-02-22T08:45:00.000Z"
  }
}
```

### 3. Submit Final Answers
**Endpoint**: `POST /api/proxy/assessments/:assessmentId/submissions`
**Purpose**: Pushes the student's choices for auto-grading and finalizes the exam.

**Request Payload**:
```json
{
  "submissionId": "sub_444",
  "startedAt": "2026-02-22T08:00:00.000Z",
  "finishedAt": "2026-02-22T08:42:00.000Z",
  "durationSecs": 2520,
  "deviceMeta": {
    "browser": "Chrome"
  },
  "answers": [
    {
      "questionId": "que_1",
      "choiceId": "opt_b",
      "text": "2"
    }
  ]
}
```

**Response Payload**:
```json
{
  "success": true,
  "data": {
    "submissionId": "sub_444",
    "status": "graded",
    "score": 2,
    "totalMarks": 10,
    "autoGraded": true
  }
}
```
