# Subjects & Assessments — Frontend Integration Guide

> **Audience:** paralearn-frontend team  
> **Backend version:** post-migration (April 2026)  
> **Base URL (tenant):** `https://{subdomain}.pl.ng/api` — all endpoints below require the tenant subdomain in the request host.  
> **Auth:** All endpoints require `Authorization: Bearer <access_token>` unless stated otherwise.

---

## Table of Contents

1. [What changed and why](#1-what-changed-and-why)
2. [Data model overview](#2-data-model-overview)
3. [Subject endpoints](#3-subject-endpoints)
4. [ClassSubject endpoints (assign / unassign)](#4-classsubject-endpoints)
5. [Assessment → ClassSubject linking](#5-assessment--classsubject-linking)
6. [Migration guide — updating existing frontend code](#6-migration-guide)
7. [Common flows with code examples](#7-common-flows)
8. [Error reference](#8-error-reference)

---

## 1. What changed and why

### Before (old model)

Every subject was **hard-wired to one class**. To teach "Mathematics" in three classes you had to create it three times:

```
Subject { name: "Mathematics", code: "MTH101", classId: "cls_jss1a" }
Subject { name: "Mathematics", code: "MTH101", classId: "cls_jss1b" }
Subject { name: "Mathematics", code: "MTH101", classId: "cls_jss2a" }
```

Problems this caused:

- Renaming "Mathematics" → "Maths" meant updating three rows
- Deleting a class deleted its subjects entirely, orphaning assessments
- You could not see "all classes that teach Physics" at a glance
- Assessments had no structured way to say "this exam is for JSS 1A's Mathematics"

### After (new model)

Subjects live at the **school level**. A single `Subject` row represents "Mathematics" for the whole school. It is then **assigned** to as many classes as needed through a `ClassSubject` join record. That join record carries per-class metadata.

```
Subject { name: "Mathematics", code: "MTH101", schoolId: "sch_xyz" }
    │
    ├── ClassSubject { classId: "cls_jss1a", subjectType: "core",     difficulty: "medium" }
    ├── ClassSubject { classId: "cls_jss1b", subjectType: "core",     difficulty: "medium" }
    └── ClassSubject { classId: "cls_jss2a", subjectType: "elective", difficulty: "hard"   }
```

Assessments can additionally be linked to a specific `ClassSubject` (instead of just a subject) so the report card engine knows exactly which class's Mathematics exam it belongs to.

---

## 2. Data model overview

```
School
 └── Subject[]          ← school-level catalogue (one "Mathematics" per school)
      └── ClassSubject[] ← join: Subject ↔ Class, with per-class metadata
           └── ClassSubjectAssessment[] ← join: ClassSubject ↔ Assessment
```

### Subject

| Field                | Type               | Notes                                                                       |
| -------------------- | ------------------ | --------------------------------------------------------------------------- |
| `id`                 | string             | cuid                                                                        |
| `name`               | string             | e.g. `"Mathematics"`                                                        |
| `code`               | string             | e.g. `"MTH101"` — unique per school (enforced in logic, unique index in DB) |
| `schoolId`           | string             |                                                                             |
| `classSubjects`      | `ClassSubject[]`   | which classes this subject is assigned to                                   |
| `teacherAssignments` | `TeacherSubject[]` | teachers assigned to this subject                                           |
| `createdAt`          | ISO datetime       |                                                                             |

### ClassSubject

| Field         | Type           | Notes                                                     |
| ------------- | -------------- | --------------------------------------------------------- |
| `id`          | string         | **Use this as `classSubjectId` when linking assessments** |
| `classId`     | string         |                                                           |
| `subjectId`   | string         |                                                           |
| `schoolId`    | string         |                                                           |
| `subjectType` | string \| null | `"core"` \| `"elective"` \| `"optional"`                  |
| `difficulty`  | string \| null | `"easy"` \| `"medium"` \| `"hard"`                        |
| `description` | string \| null | per-class description                                     |
| `isActive`    | boolean        |                                                           |
| `createdAt`   | ISO datetime   |                                                           |
| `updatedAt`   | ISO datetime   |                                                           |

### ClassSubjectAssessment

| Field            | Type         | Notes                  |
| ---------------- | ------------ | ---------------------- |
| `id`             | string       |                        |
| `classSubjectId` | string       | FK → `ClassSubject.id` |
| `assessmentId`   | string       | FK → `Assessment.id`   |
| `createdAt`      | ISO datetime |                        |

---

## 3. Subject endpoints

### `POST /subjects` — Create a school-level subject

**Roles:** `admin`

`classId` is now **optional**. You can create a subject first, then assign it to classes later.

#### Request body

```json
{
  "name": "Mathematics",
  "code": "MTH101"
}
```

Or — create and immediately assign to a class in one shot:

```json
{
  "name": "Mathematics",
  "code": "MTH101",
  "classId": "cls_jss1a_id",
  "subjectType": "core",
  "difficulty": "medium",
  "description": "Algebra and number theory for JSS 1A"
}
```

#### Response `201`

```json
{
  "id": "sub_cld9f2x3k0000abc",
  "name": "Mathematics",
  "code": "MTH101",
  "schoolId": "sch_xyz",
  "classId": null,
  "createdAt": "2026-04-08T10:00:00.000Z"
}
```

> If `classId` is included, the `ClassSubject` assignment is silently created and you can verify it with `GET /subjects/:id`.

#### Special behaviour — duplicate code

If a subject with the same `code` already exists **and** you provided a `classId`:

- Old behaviour: `409 Conflict`
- **New behaviour:** the existing subject is automatically linked to the given `classId` and the assignment is returned. No error.

If a subject with the same `code` already exists and **no `classId`** was provided, you still get `409`:

```json
{
  "message": "Subject with code 'MTH101' already exists in this school. Use POST /subjects/:id/classes to assign it to a class.",
  "statusCode": 409
}
```

---

### `GET /subjects` — School subject catalogue

**Roles:** `admin`, `teacher`

Returns every subject in the school, each with a `classSubjects` array showing all classes it is currently assigned to.

#### Response `200`

```json
[
  {
    "id": "sub_001",
    "name": "Mathematics",
    "code": "MTH101",
    "schoolId": "sch_xyz",
    "createdAt": "2026-01-15T08:00:00.000Z",
    "classSubjects": [
      {
        "id": "cs_001",
        "classId": "cls_jss1a",
        "subjectId": "sub_001",
        "schoolId": "sch_xyz",
        "subjectType": "core",
        "difficulty": "medium",
        "description": "Algebra and number theory",
        "isActive": true,
        "createdAt": "2026-01-15T08:00:00.000Z",
        "updatedAt": "2026-04-08T10:00:00.000Z",
        "class": {
          "id": "cls_jss1a",
          "name": "JSS 1A",
          "code": "JSS1A"
        }
      },
      {
        "id": "cs_002",
        "classId": "cls_jss1b",
        "subjectType": "core",
        "difficulty": "medium",
        "isActive": true,
        "class": { "id": "cls_jss1b", "name": "JSS 1B", "code": "JSS1B" }
      }
    ],
    "teacherAssignments": [
      {
        "id": "ts_001",
        "teacherId": "usr_teacher_01",
        "teacher": {
          "id": "usr_teacher_01",
          "firstName": "Ngozi",
          "lastName": "Adeyemi",
          "email": "ngozi@school.edu"
        }
      }
    ]
  }
]
```

---

### `GET /subjects/by-class/:classId` — Subjects for a specific class ⭐ NEW

**Roles:** `admin`, `teacher`

> **This is the primary endpoint for building a class timetable, subject picker, or report card view.**  
> It returns subjects that are actively assigned to the class, with per-class metadata flattened onto each subject.

#### Request

```
GET /subjects/by-class/cls_jss1a
```

#### Response `200`

```json
[
  {
    "id": "sub_001",
    "name": "Mathematics",
    "code": "MTH101",
    "schoolId": "sch_xyz",
    "createdAt": "2026-01-15T08:00:00.000Z",
    "classSubjectId": "cs_001",
    "subjectType": "core",
    "difficulty": "medium",
    "description": "Algebra and number theory for JSS 1A",
    "isActive": true,
    "teacherAssignments": [
      {
        "teacherId": "usr_teacher_01",
        "teacher": {
          "id": "usr_teacher_01",
          "firstName": "Ngozi",
          "lastName": "Adeyemi",
          "email": "ngozi@school.edu"
        }
      }
    ]
  },
  {
    "id": "sub_002",
    "name": "English Language",
    "code": "ENG101",
    "schoolId": "sch_xyz",
    "classSubjectId": "cs_003",
    "subjectType": "core",
    "difficulty": "easy",
    "description": null,
    "isActive": true,
    "teacherAssignments": []
  }
]
```

> **Key field:** `classSubjectId` — save this. You need it to link assessments to this class-subject combination.

---

### `GET /subjects/:id` — Single subject

**Roles:** `admin`, `teacher`

Returns the subject with all class assignments and teacher assignments.

#### Response `200`

```json
{
  "id": "sub_001",
  "name": "Mathematics",
  "code": "MTH101",
  "schoolId": "sch_xyz",
  "createdAt": "2026-01-15T08:00:00.000Z",
  "classSubjects": [
    {
      "id": "cs_001",
      "classId": "cls_jss1a",
      "subjectType": "core",
      "difficulty": "medium",
      "isActive": true,
      "class": { "id": "cls_jss1a", "name": "JSS 1A", "code": "JSS1A" }
    }
  ]
}
```

---

### `PATCH /subjects/:id` — Update subject name or code

**Roles:** `admin`

Only updates the school-level record (name/code). To change per-class metadata use `POST /subjects/:id/classes`.

#### Request body

```json
{
  "name": "Advanced Mathematics",
  "code": "MTH201"
}
```

#### Response `200`

```json
{
  "id": "sub_001",
  "name": "Advanced Mathematics",
  "code": "MTH201",
  "schoolId": "sch_xyz",
  "createdAt": "2026-01-15T08:00:00.000Z",
  "updatedAt": "2026-04-08T12:00:00.000Z"
}
```

---

### `DELETE /subjects/:id` — Delete a subject

**Roles:** `admin`

Permanently deletes the subject and all its class assignments. Assessments linked to this subject will have their `subjectId` set to `null` (not deleted).

#### Response `200`

```json
{
  "success": true,
  "message": "Subject deleted successfully"
}
```

---

## 4. ClassSubject endpoints

### `POST /subjects/:id/classes` — Assign a subject to a class ⭐ NEW

**Roles:** `admin`

Links an existing school-level subject to a class. **Idempotent** — calling this again updates the metadata without creating a duplicate.

#### Request

```
POST /subjects/sub_001/classes
```

```json
{
  "classId": "cls_jss2a",
  "subjectType": "elective",
  "difficulty": "hard",
  "description": "Advanced maths for top-set JSS 2A students"
}
```

Only `classId` is required. All metadata fields are optional:

```json
{
  "classId": "cls_jss2a"
}
```

#### Response `201`

```json
{
  "id": "cs_004",
  "classId": "cls_jss2a",
  "subjectId": "sub_001",
  "schoolId": "sch_xyz",
  "subjectType": "elective",
  "difficulty": "hard",
  "description": "Advanced maths for top-set JSS 2A students",
  "isActive": true,
  "createdAt": "2026-04-08T10:30:00.000Z",
  "updatedAt": "2026-04-08T10:30:00.000Z"
}
```

---

### `DELETE /subjects/:id/classes/:classId` — Remove subject from a class ⭐ NEW

**Roles:** `admin`

Deletes only the `ClassSubject` assignment. The subject itself stays in the school catalogue and remains assigned to all other classes.

#### Request

```
DELETE /subjects/sub_001/classes/cls_jss2a
```

#### Response `200`

```json
{
  "success": true,
  "message": "Subject removed from class"
}
```

---

### `POST /subjects/:id/assign-teacher` — Assign a teacher to a subject

Unchanged behaviour. Links a teacher to a subject school-wide.

#### Request

```json
{
  "teacherId": "usr_teacher_02"
}
```

#### Response `201`

```json
{
  "classAssignment": null,
  "subjectAssignment": {
    "id": "ts_002",
    "teacherId": "usr_teacher_02",
    "subjectId": "sub_001",
    "classId": null
  }
}
```

---

## 5. Assessment → ClassSubject linking

### Why this exists

Previously an assessment was linked to a subject and a class via separate fields on the `Assessment` row. Now you can express "this assessment belongs to **Mathematics as taught in JSS 1A**" explicitly using the `ClassSubjectAssessment` join table.

Report cards use these links. If an assessment is linked to a `ClassSubject`, it is pulled into the report card for that specific class + subject combination.

### How to get `classSubjectId`

Call `GET /subjects/by-class/:classId`. Each subject in the response has a `classSubjectId` field — that's the value you need.

---

### `POST /assessments/:id/class-subjects` — Link assessment to a ClassSubject ⭐ NEW

**Roles:** `teacher`, `admin`

**Idempotent** — safe to call multiple times for the same pair.

#### Request

```
POST /assessments/asm_abc123/class-subjects
```

```json
{
  "classSubjectId": "cs_001"
}
```

#### Response `201`

```json
{
  "id": "csa_001",
  "classSubjectId": "cs_001",
  "assessmentId": "asm_abc123",
  "createdAt": "2026-04-08T11:00:00.000Z",
  "classSubject": {
    "class": {
      "id": "cls_jss1a",
      "name": "JSS 1A"
    },
    "subject": {
      "id": "sub_001",
      "name": "Mathematics"
    }
  }
}
```

---

### `DELETE /assessments/:id/class-subjects/:classSubjectId` — Unlink ⭐ NEW

**Roles:** `teacher`, `admin`

Removes the link. The assessment is **not** deleted.

#### Request

```
DELETE /assessments/asm_abc123/class-subjects/cs_001
```

#### Response `200`

```json
{
  "success": true,
  "message": "Assessment unlinked from ClassSubject"
}
```

---

### `GET /assessments/:id/class-subjects` — List class-subject links ⭐ NEW

**Roles:** `teacher`, `admin`

Returns all `ClassSubject` records this assessment is linked to.

#### Response `200`

```json
[
  {
    "id": "csa_001",
    "classSubjectId": "cs_001",
    "classSubject": {
      "class": {
        "id": "cls_jss1a",
        "name": "JSS 1A",
        "code": "JSS1A"
      },
      "subject": {
        "id": "sub_001",
        "name": "Mathematics",
        "code": "MTH101"
      }
    }
  }
]
```

---

## 6. Migration guide

### For pages that list subjects in a class

| Old                                                          | New                                                                                           |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| `GET /subjects` then filter by `subject.classId === classId` | `GET /subjects/by-class/:classId`                                                             |
| Each subject had `classId` directly                          | Each subject now has `classSubjectId`, `subjectType`, `difficulty`, `description`, `isActive` |

### For forms that create a subject

| Old                                                         | New                                                                |
| ----------------------------------------------------------- | ------------------------------------------------------------------ |
| `classId` was required                                      | `classId` is optional                                              |
| Creating "Mathematics" for 3 classes = 3 API calls          | Create once, then call `POST /subjects/:id/classes` for each class |
| Sending the same `name`+`code` for a second class would 409 | Now auto-links if `classId` is provided                            |

### For pages that show subject info on an assessment

| Old                              | New                                                                          |
| -------------------------------- | ---------------------------------------------------------------------------- |
| `assessment.subject.classId`     | Use `GET /assessments/:id/class-subjects` to see which classes it belongs to |
| No structured class+subject link | `ClassSubjectAssessment` join records, retrieved via the new GET endpoint    |

### Subject `classId` field

The `Subject` model still has a `classId` field in this release — it is **nullable** and kept for backward compatibility during the migration window. **Do not rely on it.** It will be removed in a future migration. Use `classSubjects[]` instead.

---

## 7. Common flows

### Flow A — Admin sets up a new term's subjects

```
1. For each subject (e.g. Mathematics):
   POST /subjects
   { "name": "Mathematics", "code": "MTH101" }
   → saves sub_001

2. Assign to each class:
   POST /subjects/sub_001/classes
   { "classId": "cls_jss1a", "subjectType": "core", "difficulty": "medium" }

   POST /subjects/sub_001/classes
   { "classId": "cls_jss1b", "subjectType": "core", "difficulty": "medium" }

   POST /subjects/sub_001/classes
   { "classId": "cls_jss2a", "subjectType": "elective", "difficulty": "hard" }
```

### Flow B — Teacher creates an assessment for a class subject

```
1. Get subjects for the class:
   GET /subjects/by-class/cls_jss1a
   → each item has classSubjectId

2. Teacher picks "Mathematics" (classSubjectId: "cs_001")

3. Create the assessment:
   POST /assessments
   { "title": "Mid-Term Mathematics", "subjectId": "sub_001", "classId": "cls_jss1a", ... }
   → asm_abc123

4. Link assessment to the class-subject:
   POST /assessments/asm_abc123/class-subjects
   { "classSubjectId": "cs_001" }
```

### Flow C — Admin removes a subject from one class only

```
DELETE /subjects/sub_001/classes/cls_jss2a
```

Subject stays in the catalogue and in all other classes.

### Flow D — Subject picker component

```typescript
// When a class is selected in a dropdown:
const subjects = await api.get(`/subjects/by-class/${selectedClassId}`);

// Render as list. Each item:
// { id, name, code, classSubjectId, subjectType, difficulty, isActive, ... }

// When user picks a subject for an assessment:
const classSubjectId = subject.classSubjectId; // ← this is what you store
```

---

## 8. Error reference

| Status | When                                                                 |
| ------ | -------------------------------------------------------------------- |
| `400`  | Missing required field or bad format                                 |
| `401`  | Missing or invalid JWT                                               |
| `403`  | Role not permitted for this endpoint                                 |
| `404`  | Subject, Class, ClassSubject, or Assessment not found in this school |
| `409`  | Subject code already exists with no `classId` provided to auto-link  |

All errors follow the shape:

```json
{
  "message": "Human-readable error description",
  "statusCode": 404
}
```

---

_Generated: 2026-04-08 — paralearn-backend team_
