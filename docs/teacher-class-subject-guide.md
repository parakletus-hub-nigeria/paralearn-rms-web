# Teacher ↔ Class-Subject Assignment — Frontend Integration Guide

> **Audience:** paralearn-frontend team  
> **Backend version:** post-migration (April 2026 — `20260408000002_add_teacher_class_subject`)  
> **Related guide:** `subjects-refactor-frontend-guide.md`

---

## Table of Contents

1. [What changed and why](#1-what-changed-and-why)
2. [Data model overview](#2-data-model-overview)
3. [New endpoints](#3-new-endpoints)
4. [How GET /subjects/by-class now works](#4-how-get-subjectsby-class-now-works)
5. [Migration guide — updating existing frontend code](#5-migration-guide)
6. [Common flows](#6-common-flows)
7. [Error reference](#7-error-reference)

---

## 1. What changed and why

### Before — school-wide teacher assignment

Previously a teacher was assigned to a **subject** with an optional loose `classId` hint:

```
TeacherSubject { teacherId, subjectId, classId? }
```

This meant "Ngozi teaches Mathematics" — but not *which* Mathematics and not *which class* in a structured way. The `classId` was optional and not enforced. You could not reliably answer "who teaches Mathematics **in JSS 1A** specifically?"

**Problems:**
- No guaranteed link between the teacher, the subject, and a specific class
- The same teacher could appear as teaching a subject across all classes even if she only taught one
- Report cards had to guess which teacher taught which subject in which class
- `classId` on `TeacherSubject` was nullable and often not set

### After — class-subject-scoped teacher assignment

Teachers are now assigned to a **`ClassSubject`** — the join record that represents "Mathematics as taught in JSS 1A". This is expressed through a new `TeacherClassSubject` table:

```
TeacherClassSubject { teacherId, classSubjectId, schoolId, assignedById }
```

This reads as: **"Ngozi teaches Mathematics in JSS 1A"** — precise, unambiguous, queryable.

**What this enables:**
- "Who teaches Physics in SS 2B?" — one query, exact answer
- A teacher can teach the same subject in multiple classes (two `TeacherClassSubject` rows)
- A subject in a class can have multiple teachers (e.g. two co-teachers)
- `GET /subjects/by-class/:classId` now returns teachers per subject for that class
- Report cards automatically know which teacher to show for each subject

### What happened to TeacherSubject?

`TeacherSubject` still exists in the database and is **not removed** — it is kept for backward compatibility. Any `TeacherSubject` rows that had a `classId` have been **automatically backfilled** into `TeacherClassSubject` as part of the migration (216 subjects → backfilled teacher assignments where applicable).

**Going forward:** use `TeacherClassSubject` endpoints only. `TeacherSubject` will be deprecated in a future release.

---

## 2. Data model overview

```
ClassSubject  (Mathematics in JSS 1A)
    └── TeacherClassSubject[]   ← teachers who teach this subject in this class
         └── teacher: User
```

### TeacherClassSubject

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | cuid |
| `teacherId` | string | FK → User |
| `classSubjectId` | string | FK → ClassSubject |
| `schoolId` | string | FK → School |
| `assignedById` | string \| null | who made the assignment |
| `assignedAt` | ISO datetime | |
| `teacher` | User (included) | firstName, lastName, email, profilePicture, teacherId |
| `classSubject` | ClassSubject (included) | with class and subject details |

### Where to get `classSubjectId`

Call `GET /subjects/by-class/:classId` — each subject in the response has a `classSubjectId` field. That is what you pass to all `TeacherClassSubject` endpoints.

---

## 3. New endpoints

All endpoints are under `/subjects/class-subjects/:classSubjectId/teachers`.  
**Auth:** Bearer token required.

---

### `POST /subjects/class-subjects/:classSubjectId/teachers` — Assign teacher to class-subject

**Roles:** `admin`

**Idempotent** — if the teacher is already assigned to this class-subject, the existing record is returned without error.

**Side effect:** automatically creates a `TeacherClass` record so the teacher appears as a class teacher too (no extra call needed).

#### Request

```
POST /subjects/class-subjects/cs_001/teachers
```

```json
{
  "teacherId": "usr_teacher_01"
}
```

#### Response `201`

```json
{
  "id": "tcs_001",
  "teacherId": "usr_teacher_01",
  "classSubjectId": "cs_001",
  "schoolId": "sch_xyz",
  "assignedAt": "2026-04-08T11:30:00.000Z",
  "teacher": {
    "id": "usr_teacher_01",
    "firstName": "Ngozi",
    "lastName": "Adeyemi",
    "email": "ngozi@school.edu",
    "profilePicture": null
  },
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
```

---

### `GET /subjects/class-subjects/:classSubjectId/teachers` — List teachers for a class-subject

**Roles:** `admin`, `teacher`

Returns all teachers assigned to this specific class-subject combination.

#### Request

```
GET /subjects/class-subjects/cs_001/teachers
```

#### Response `200`

```json
[
  {
    "id": "tcs_001",
    "teacherId": "usr_teacher_01",
    "assignedAt": "2026-04-08T11:30:00.000Z",
    "teacher": {
      "id": "usr_teacher_01",
      "firstName": "Ngozi",
      "lastName": "Adeyemi",
      "email": "ngozi@school.edu",
      "teacherId": "TCH_SCH_001",
      "profilePicture": "https://cdn.example.com/photo.jpg"
    }
  },
  {
    "id": "tcs_002",
    "teacherId": "usr_teacher_05",
    "assignedAt": "2026-04-08T12:00:00.000Z",
    "teacher": {
      "id": "usr_teacher_05",
      "firstName": "Emeka",
      "lastName": "Okafor",
      "email": "emeka@school.edu",
      "teacherId": "TCH_SCH_005",
      "profilePicture": null
    }
  }
]
```

---

### `DELETE /subjects/class-subjects/:classSubjectId/teachers/:teacherId` — Remove teacher

**Roles:** `admin`

Removes only the `TeacherClassSubject` record. The teacher remains:
- Assigned to the class (via `TeacherClass`)
- Assigned to any other class-subjects they teach

#### Request

```
DELETE /subjects/class-subjects/cs_001/teachers/usr_teacher_01
```

#### Response `200`

```json
{
  "success": true,
  "message": "Teacher removed from class-subject"
}
```

---

## 4. How `GET /subjects/by-class` now works

`GET /subjects/by-class/:classId` now returns teachers **per class-subject** — not global subject teachers. Each item in the array includes a `teachers` array.

### Before (old response shape)

```json
[
  {
    "id": "sub_001",
    "name": "Mathematics",
    "code": "MTH101",
    "classSubjectId": "cs_001",
    "subjectType": "core",
    "teacherAssignments": [
      { "teacherId": "usr_teacher_01", "teacher": { ... } }
    ]
  }
]
```

The `teacherAssignments` above came from `TeacherSubject` — school-wide, not class-scoped.

### After (new response shape)

```json
[
  {
    "id": "sub_001",
    "name": "Mathematics",
    "code": "MTH101",
    "schoolId": "sch_xyz",
    "classSubjectId": "cs_001",
    "subjectType": "core",
    "difficulty": "medium",
    "description": "Algebra and number theory for JSS 1A",
    "isActive": true,
    "teachers": [
      {
        "id": "tcs_001",
        "teacherId": "usr_teacher_01",
        "assignedAt": "2026-04-08T11:30:00.000Z",
        "teacher": {
          "id": "usr_teacher_01",
          "firstName": "Ngozi",
          "lastName": "Adeyemi",
          "email": "ngozi@school.edu",
          "profilePicture": null
        }
      }
    ]
  }
]
```

**Key change:** the `teachers` array now only contains teachers who teach **this subject in this class** — not all teachers of the subject school-wide.

---

## 5. Migration guide

### Teacher assignment forms / pages

| Old | New |
|-----|-----|
| `POST /subjects/:id/assign-teacher` with `{ teacherId }` | `POST /subjects/class-subjects/:classSubjectId/teachers` with `{ teacherId }` |
| Showed teachers from `subject.teacherAssignments` (school-wide) | Use `teachers` array from `GET /subjects/by-class/:classId` or `GET /subjects/class-subjects/:classSubjectId/teachers` |
| Teacher assigned to subject globally | Teacher assigned to subject within a specific class |

### Displaying "teacher for this subject" in a class view

Old code pattern:
```typescript
// Fetching subjects for a class then reading teachers
const subjects = await api.get('/subjects').then(list =>
  list.filter(s => s.classId === classId)
);
const teacher = subjects[0].teacherAssignments[0]?.teacher;
```

New code pattern:
```typescript
// Single call returns subjects with per-class teachers already included
const subjects = await api.get(`/subjects/by-class/${classId}`);
const teacher = subjects[0].teachers[0]?.teacher;
// teacher = { id, firstName, lastName, email, ... }
```

### Displaying timetable / class schedule

Each subject row in `GET /subjects/by-class/:classId` now gives you:

```typescript
{
  classSubjectId,   // use for teacher assignment calls
  name,             // "Mathematics"
  code,             // "MTH101"
  subjectType,      // "core" | "elective" | null
  difficulty,       // "medium" | null
  teachers: [{ teacher: { firstName, lastName } }]
}
```

No additional fetching needed for teacher names.

### Subject catalogue page (admin)

`GET /subjects` still returns `teacherAssignments` at the school level (from `TeacherSubject`). For a per-class teacher breakdown use `GET /subjects/by-class/:classId` or `GET /subjects/class-subjects/:classSubjectId/teachers`.

---

## 6. Common flows

### Flow A — Admin assigns a teacher to a subject in a class

```
1. Get subjects for the class to find classSubjectId:
   GET /subjects/by-class/cls_jss1a
   → [{ classSubjectId: "cs_001", name: "Mathematics", ... }]

2. Assign the teacher:
   POST /subjects/class-subjects/cs_001/teachers
   { "teacherId": "usr_teacher_01" }
```

### Flow B — Show subject cards with teacher names in a class view

```
GET /subjects/by-class/cls_jss1a
→ Each subject has a `teachers` array ready to display.
  No extra requests needed.
```

### Flow C — Admin reassigns a teacher (replace old with new)

```
1. Remove old teacher:
   DELETE /subjects/class-subjects/cs_001/teachers/usr_teacher_01

2. Add new teacher:
   POST /subjects/class-subjects/cs_001/teachers
   { "teacherId": "usr_teacher_07" }
```

### Flow D — Co-teaching (two teachers for one subject in one class)

```
POST /subjects/class-subjects/cs_001/teachers
{ "teacherId": "usr_teacher_01" }

POST /subjects/class-subjects/cs_001/teachers
{ "teacherId": "usr_teacher_05" }

GET /subjects/class-subjects/cs_001/teachers
→ returns both teachers
```

### Flow E — Teacher teaches the same subject in two classes

```
// Mathematics in JSS 1A (classSubjectId: cs_001)
POST /subjects/class-subjects/cs_001/teachers
{ "teacherId": "usr_teacher_01" }

// Mathematics in JSS 1B (classSubjectId: cs_002)
POST /subjects/class-subjects/cs_002/teachers
{ "teacherId": "usr_teacher_01" }
```

Two `TeacherClassSubject` rows — the teacher shows up correctly in both classes.

---

## 7. Error reference

| Status | When |
|--------|------|
| `400` | Missing school context |
| `401` | Missing or invalid JWT |
| `403` | Role not permitted |
| `404` | ClassSubject not found in school / Teacher not found in school / Assignment not found |

All errors:

```json
{
  "message": "Teacher is not assigned to this class-subject",
  "statusCode": 404
}
```

---

*Generated: 2026-04-08 — paralearn-backend team*
