# Report Card Template API — Frontend Integration Guide

## Overview

Report card templates are EJS-based HTML layouts stored in the database as plain text. The system has two layers:

| Layer | Who manages it | What it holds |
|---|---|---|
| **Global Template Library** | SuperAdmin | All available EJS templates with thumbnail previews |
| **School Template Selection** | School Admin | Templates the school has chosen from the library |

When a school admin selects a template it is **immediately activated**. A school can have multiple active templates, and the teacher/admin picks one at the point of report card generation.

---

## Authentication

All endpoints require a `Bearer` token in the `Authorization` header and tenant identification via the `X-Tenant-Subdomain` header.

```
Authorization: Bearer <jwt_token>
X-Tenant-Subdomain: <school_subdomain>
```

---

## Part 1 — SuperAdmin: Manage the Global Library

> **Base URL:** `/super-admin/report-card-templates`
> **Guard:** SuperAdmin only

### 1.1 Create a Template

```
POST /super-admin/report-card-templates
```

**Request Body**

```json
{
  "name": "Classic A4",
  "ejsCode": "<div class='report'>Hello <%= student.name %></div>",
  "thumbnailUrl": "https://res.cloudinary.com/.../thumbnail.png",
  "description": "Best for primary and nursery school students",
  "version": 1
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | ✅ | Human-readable template name |
| `ejsCode` | string | ✅ | Full EJS template source code |
| `thumbnailUrl` | string | ✅ | Cloudinary URL of a rendered preview image |
| `description` | string | ❌ | Guidance on which school type this suits |
| `version` | number | ❌ | Defaults to `1` |

**Response `201`**

```json
{
  "success": true,
  "message": "Template created",
  "data": {
    "id": "clx1abc123",
    "name": "Classic A4",
    "thumbnailUrl": "https://res.cloudinary.com/.../thumbnail.png",
    "description": "Best for primary and nursery school students",
    "version": 1,
    "isActive": true,
    "createdAt": "2026-03-22T10:00:00.000Z"
  }
}
```

---

### 1.2 List All Templates (Admin view — includes `ejsCode`)

```
GET /super-admin/report-card-templates
```

Returns all templates. `ejsCode` is **excluded** from the list for payload efficiency.

**Response `200`**

```json
{
  "success": true,
  "message": "Templates retrieved",
  "data": [
    {
      "id": "clx1abc123",
      "name": "Classic A4",
      "thumbnailUrl": "https://res.cloudinary.com/.../thumbnail.png",
      "description": "Best for primary and nursery school students",
      "version": 1,
      "isActive": true,
      "createdAt": "2026-03-22T10:00:00.000Z"
    }
  ]
}
```

---

### 1.3 Get a Single Template (includes `ejsCode`)

```
GET /super-admin/report-card-templates/:id
```

Returns the full template record including the raw `ejsCode`.

---

### 1.4 Update a Template

```
PATCH /super-admin/report-card-templates/:id
```

All fields are optional — send only what you want to change.

```json
{
  "name": "Classic A4 v2",
  "ejsCode": "<div>Updated EJS...</div>",
  "thumbnailUrl": "https://res.cloudinary.com/.../new-thumbnail.png",
  "description": "Updated description",
  "version": 2
}
```

---

### 1.5 Delete a Template

```
DELETE /super-admin/report-card-templates/:id
```

**Response `200`**

```json
{ "success": true, "message": "Template deleted", "data": null }
```

---

## Part 2 — School Admin: Browse & Select Templates

> **Base URL:** `/report-card-template-manager`
> **Guard:** JWT + school tenant

### 2.1 Browse the Global Library

Used during **school setup** or the settings page so the admin can pick their preferred templates.

```
GET /report-card-template-manager/available
```

Returns only `id`, `name`, `thumbnailUrl`, and `description`. The EJS source is **never exposed** to the school.

**Response `200`**

```json
{
  "success": true,
  "message": "Available templates retrieved",
  "data": [
    {
      "id": "clx1abc123",
      "name": "Classic A4",
      "thumbnailUrl": "https://res.cloudinary.com/.../thumbnail.png",
      "description": "Best for primary and nursery school students"
    },
    {
      "id": "clx2def456",
      "name": "Modern Grid",
      "thumbnailUrl": "https://res.cloudinary.com/.../grid-thumb.png",
      "description": "Best for junior and senior secondary students"
    }
  ]
}
```

**Frontend usage:** render each template as a card showing the thumbnail and description. The admin taps/clicks to select one or more.

---

### 2.2 Select a Template

When the admin selects a template card, make this call. The template is **immediately activated** for the school — no separate activation step needed.

```
POST /report-card-template-manager/:templateId/select
```

| URL param | Description |
|---|---|
| `templateId` | `id` from the `/available` list |

**No request body required.**

**Response `201`**

```json
{
  "success": true,
  "message": "Template selected successfully",
  "data": {
    "id": "sel_abc123",
    "schoolId": "school_xyz",
    "templateId": "clx1abc123",
    "isActive": true,
    "createdAt": "2026-03-22T11:00:00.000Z"
  }
}
```

**Error responses**

| Status | `error` | Meaning |
|---|---|---|
| `404` | `NotFoundException` | `templateId` doesn't exist in the global library |
| `409` | `ConflictException` | School already selected this template |

**Frontend usage:** after a successful `201`, mark the card as selected in the UI. The `data.id` returned here is the **selection ID** — store it locally if you need to deactivate or remove the template later.

---

### 2.3 Get the School's Selected Templates

Displays the templates this school has already selected (for a settings/management page).

```
GET /report-card-template-manager
```

Returns each selection enriched with the template's `id`, `name`, `thumbnailUrl`, and `description`.

**Response `200`**

```json
{
  "success": true,
  "message": "School templates retrieved",
  "data": [
    {
      "id": "sel_abc123",
      "schoolId": "school_xyz",
      "templateId": "clx1abc123",
      "isActive": true,
      "createdAt": "2026-03-22T11:00:00.000Z",
      "updatedAt": "2026-03-22T11:00:00.000Z",
      "template": {
        "id": "clx1abc123",
        "name": "Classic A4",
        "thumbnailUrl": "https://res.cloudinary.com/.../thumbnail.png",
        "description": "Best for primary and nursery school students"
      }
    }
  ]
}
```

> **Note:** `id` at the top level is the **selection ID** (used for activate/deactivate/remove). `template.id` is the global template ID.

---

### 2.4 Deactivate a Template

Keeps the selection but stops the template from being offered during report card generation.

```
PATCH /report-card-template-manager/:id/deactivate
```

| URL param | Description |
|---|---|
| `id` | Selection ID (`data.id` from the select or list response) |

**Response `200`**

```json
{
  "success": true,
  "message": "Template deactivated",
  "data": { "id": "sel_abc123", "isActive": false, ... }
}
```

---

### 2.5 Re-activate a Template

```
PATCH /report-card-template-manager/:id/activate
```

Same param as deactivate. Sets `isActive` back to `true`.

---

### 2.6 Remove a Template Selection

Permanently removes the template from the school's list.

```
DELETE /report-card-template-manager/:id
```

**Response `200`**

```json
{ "success": true, "message": "Template removed", "data": null }
```

---

## Part 3 — Report Card Generation with Template Selection

When generating a report card, the teacher/admin can choose which of the school's **active** templates to render with. If no `templateId` is provided, the backend uses the first active template automatically.

### 3.1 Queue Report Card PDF Generation

```
GET /reports/student/:studentId/:classId/report-card/pdf
```

| Parameter | Where | Required | Description |
|---|---|---|---|
| `studentId` | path | ✅ | Student's user ID |
| `classId` | path | ✅ | Class ID |
| `session` | query | ✅ | Academic session e.g. `2024/2025` |
| `term` | query | ✅ | Term e.g. `First Term` |
| `templateId` | query | ❌ | Selection ID of the desired active template |

**Example request**

```
GET /reports/student/stu_001/cls_001/report-card/pdf
    ?session=2024/2025
    &term=First Term
    &templateId=sel_abc123
```

> **`templateId` here is the selection ID** (from `GET /report-card-template-manager`), not the global template ID. Pass the `id` field at the top level of each item in that list.

**Response `200`** — job is queued; PDF is generated asynchronously.

```json
{
  "message": "Report card generation queued",
  "jobId": "stu_001_First Term_2024/2025"
}
```

---

## Full Setup Flow (School Admin Onboarding)

```
1.  GET  /report-card-template-manager/available
        → Show template gallery to admin (thumbnail + name + description)

2.  POST /report-card-template-manager/:templateId/select   (repeat for each chosen template)
        → Template is saved and auto-activated
        → Store the returned selection `id` for later management

3.  GET  /report-card-template-manager
        → Show the school's active templates (management/settings screen)

4.  PATCH /report-card-template-manager/:id/deactivate      (optional)
        → Admin can turn off a template without removing it

5.  DELETE /report-card-template-manager/:id                (optional)
        → Admin removes a template from the school entirely
```

---

## Report Card Generation Flow (Teacher / Admin)

```
1.  GET  /report-card-template-manager
        → Fetch school's active templates
        → Show thumbnails so user picks one

2.  GET  /reports/student/:studentId/:classId/report-card/pdf
        ?session=2024/2025&term=First Term&templateId=<selection_id>
        → PDF is queued for generation using the chosen template
```

---

## Field Reference

### `ReportCardTemplate` (global library record)

| Field | Type | Description |
|---|---|---|
| `id` | string | Global template ID |
| `name` | string | Display name |
| `thumbnailUrl` | string | Cloudinary preview image |
| `description` | string? | Suitability description |
| `ejsCode` | string | EJS source — **never sent to school endpoints** |
| `version` | number | Template version number |
| `isActive` | boolean | Whether superadmin has made it available |
| `createdAt` | datetime | |

### `SchoolReportCardTemplate` (school selection record)

| Field | Type | Description |
|---|---|---|
| `id` | string | **Selection ID** — use this for activate/deactivate/remove/generation |
| `schoolId` | string | Owning school |
| `templateId` | string | FK to global `ReportCardTemplate.id` |
| `isActive` | boolean | Whether this template is offered during generation |
| `createdAt` | datetime | |
| `updatedAt` | datetime | |

---

## Common Mistakes

| Mistake | Correct approach |
|---|---|
| Passing `template.id` (global) as `templateId` in report generation | Pass the **selection `id`** from `GET /report-card-template-manager` |
| Calling activate after select | Not needed — selection auto-activates |
| Expecting `ejsCode` in school-facing endpoints | EJS is never returned to school endpoints; only the thumbnail and description |
| Not sending `X-Tenant-Subdomain` header | All school-facing endpoints require it for tenant resolution |
