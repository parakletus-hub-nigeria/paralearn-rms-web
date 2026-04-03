# ParaLearn Lesson Generator — Frontend Developer Guide

> This document is written for Claude (or any developer) building the frontend for the Lesson Generator feature. Read it fully before writing any code.

---

## 1. What This Feature Is

The Lesson Generator is an AI-powered tool that creates NERDC-compliant lesson notes for Nigerian teachers. It exists as **one backend**, serving **two types of users**:

| User Type              | Who they are                                                             | How they authenticate                                     |
| ---------------------- | ------------------------------------------------------------------------ | --------------------------------------------------------- |
| **ParaLearn teacher**  | A teacher already registered inside a school on ParaLearn                | Uses the existing ParaLearn JWT (already logged in)       |
| **Standalone teacher** | A teacher with no school on ParaLearn, using the generator independently | Registers/logs in through a separate standalone auth flow |

Both user types buy **$Parats** (the in-app currency) and use the same wallet flow. Both pay **5 $Parats per generation**. Standalone users get **5 free $Parats on signup**.

---

## 2. Base URL

```
https://<your-api-domain>/api
```

All lesson generator endpoints are prefixed with `/lesson-generator`.
All standalone auth endpoints are prefixed with `/lesson-generator/auth`.

---

## 3. Authentication

### 3a. ParaLearn Users

These users are **already authenticated** in the ParaLearn app. Their JWT (stored in cookies or localStorage) is sent automatically. No extra login flow needed — just send their existing token.

The token contains `userType` implicitly as `paralearn` (no field — absence of `standalone` means ParaLearn).

### 3b. Standalone Users

A separate auth flow with its own register/login endpoints. The returned JWT contains `userType: "standalone"` which the backend uses to route to the correct wallet and storage tables.

**Store the standalone token** in `localStorage` under `lessongen_token` (or similar key — keep it separate from the ParaLearn token if both exist in the same app).

**Send the standalone token** as a Bearer header:

```
Authorization: Bearer <token>
```

---

## 4. Standalone Auth Endpoints

### Register

```
POST /lesson-generator/auth/register
Content-Type: application/json

{
  "name": "Amaka Osei",
  "email": "amaka@school.ng",
  "password": "securepass123",
  "schoolName": "Greenfield Academy",    // optional
  "role": "teacher",                     // optional: teacher | admin | headteacher | other
  "subjects": ["Mathematics", "Physics"] // optional
}
```

**Response `201`:**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGci...",
    "user": {
      "id": "clxxx...",
      "email": "amaka@school.ng",
      "name": "Amaka Osei",
      "schoolName": "Greenfield Academy",
      "role": "teacher",
      "subjects": ["Mathematics", "Physics"],
      "createdAt": "2026-04-02T10:00:00.000Z"
    },
    "walletBonus": 5,
    "message": "Account created. 5 free $Parats have been added to your wallet."
  }
}
```

> Show the welcome bonus message prominently on the post-registration screen.

---

### Login

```
POST /lesson-generator/auth/login
Content-Type: application/json

{
  "email": "amaka@school.ng",
  "password": "securepass123"
}
```

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGci...",
    "user": { "id": "...", "email": "...", "name": "...", ... }
  }
}
```

**Error `401`:**

```json
{ "statusCode": 401, "message": "Invalid email or password." }
```

---

### Get Profile

```
GET /lesson-generator/auth/profile
Authorization: Bearer <token>
```

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "id": "clxxx...",
    "name": "Amaka Osei",
    "email": "amaka@school.ng",
    "schoolName": "Greenfield Academy",
    "role": "teacher",
    "subjects": ["Mathematics"],
    "createdAt": "2026-04-02T...",
    "totalNotes": 3
  }
}
```

---

### Update Profile

```
PUT /lesson-generator/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Amaka Osei-Bonsu",
  "schoolName": "New School Name",
  "role": "headteacher",
  "subjects": ["Mathematics", "Further Mathematics"]
}
```

All fields are optional — send only what is changing.

---

### Get Wallet Balance

```
GET /lesson-generator/auth/wallet
Authorization: Bearer <token>
```

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "balance": 15,
    "isLowBalance": true,
    "remainingGenerations": 3,
    "alert": "Low balance: 3 generations remaining."
  }
}
```

> Always check for `alert` — display it as a warning banner near the Generate button when present.

---

### Top Up Wallet

```
POST /lesson-generator/auth/wallet/topup
Authorization: Bearer <token>
Content-Type: application/json

{ "amount": 50 }
```

> Call this endpoint **only after** your payment gateway confirms a successful payment. Do not call it before.

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "balance": 65,
    "transactionId": "clyyy..."
  }
}
```

---

### Transaction History

```
GET /lesson-generator/auth/wallet/transactions?limit=20
Authorization: Bearer <token>
```

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "clyyy...",
        "type": "DEDUCTION",
        "amount": 5,
        "description": "Lesson note: Mathematics - Quadratic Equations (SSS 1)",
        "feature": "lesson-generator",
        "createdAt": "2026-04-02T10:30:00.000Z"
      }
    ],
    "balance": 15,
    "totalSpent": 25,
    "totalPurchased": 40,
    "totalRefunded": 0
  }
}
```

Transaction `type` values: `PURCHASE` | `DEDUCTION` | `REFUND`

---

## 5. Lesson Generator Endpoints

These endpoints work for **both user types**. The backend auto-detects the user from the JWT.

### Get Supported Curricula (populate dropdowns)

```
GET /lesson-generator/curricula
```

No auth required. Call this on page load to populate the Grade and Subject dropdowns.

**Response `200`:**

```json
{
  "success": true,
  "data": [
    {
      "id": "NERDC",
      "name": "Nigerian (NERDC)",
      "gradeLevels": [
        "Primary 1",
        "Primary 2",
        "Primary 3",
        "Primary 4",
        "Primary 5",
        "Primary 6",
        "JSS 1",
        "JSS 2",
        "JSS 3",
        "SSS 1",
        "SSS 2",
        "SSS 3"
      ],
      "subjects": {
        "PRIMARY": [
          "English Language",
          "Mathematics",
          "Basic Science and Technology",
          "..."
        ],
        "JSS": [
          "English Language",
          "Mathematics",
          "Basic Science",
          "Basic Technology",
          "..."
        ],
        "SSS": [
          "English Language",
          "Mathematics",
          "Physics",
          "Chemistry",
          "Biology",
          "..."
        ]
      }
    }
  ]
}
```

> Build cascading dropdowns from this response:
>
> - Grade levels starting with `"Primary"` → use `subjects.PRIMARY`
> - Grade levels starting with `"JSS"` → use `subjects.JSS`
> - Grade levels starting with `"SSS"` → use `subjects.SSS`

---

### Generate a Lesson Note

```
POST /lesson-generator/generate
Authorization: Bearer <token>   // omit for unauthenticated demo generation
Content-Type: application/json

{
  "subject": "Mathematics",
  "grade": "SSS 1",
  "topic": "Quadratic Equations",
  "term": "First",
  "week": 3,
  "duration": 40,
  "curriculum": "NERDC"
}
```

**Field rules:**

| Field        | Type   | Required | Constraints                                          |
| ------------ | ------ | -------- | ---------------------------------------------------- |
| `subject`    | string | Yes      | Must be a valid NERDC subject for the selected grade |
| `grade`      | string | Yes      | e.g. `"Primary 1"`, `"JSS 2"`, `"SSS 3"`             |
| `topic`      | string | Yes      | Free text — the lesson topic                         |
| `term`       | string | Yes      | `"First"` \| `"Second"` \| `"Third"`                 |
| `week`       | number | Yes      | Integer 1–13                                         |
| `duration`   | number | No       | Minutes. 30–120. Defaults to `40`                    |
| `curriculum` | string | No       | `"NERDC"` \| `"British"`. Defaults to `"NERDC"`      |

**Response `201` (authenticated user):**

```json
{
  "success": true,
  "data": {
    "id": "clzzz...",
    "lessonNote": { ... },
    "tokensUsed": 1842,
    "cost": 5,
    "generatedAt": "2026-04-02T11:00:00.000Z",
    "walletBalance": 10
  }
}
```

**Response `201` (unauthenticated demo):**

```json
{
  "success": true,
  "data": {
    "id": null,
    "lessonNote": { ... },
    "tokensUsed": 1842,
    "generatedAt": "2026-04-02T11:00:00.000Z",
    "demo": true,
    "message": "Sign up for a free account to save your lesson notes."
  }
}
```

**Error — invalid subject/grade `400`:**

```json
{
  "statusCode": 400,
  "message": "\"Biology\" is not a valid NERDC subject for Primary 3."
}
```

**Error — insufficient balance `400`:**

```json
{
  "statusCode": 400,
  "message": "Insufficient $Parats. Required: 5, Available: 0"
}
```

> This endpoint takes **10–30 seconds**. Always show a loading state. Disable the Generate button while waiting.

---

### The Lesson Note Object

The `lessonNote` inside the response has this full structure:

```typescript
{
  metadata: {
    subject: string
    grade: string
    topic: string
    duration: string      // e.g. "40 minutes"
    term: string
    week: number
  }

  objectives: Array<{
    type: "cognitive" | "affective" | "psychomotor"
    text: string
    bloomLevel: "Remember" | "Understand" | "Apply" | "Analyze" | "Evaluate" | "Create"
  }>  // 3–7 items

  introduction: {
    setInduction: string       // how the teacher opens the lesson
    priorKnowledge: string[]   // what students should already know
    duration: string
  }

  mainContent: {
    teachingPoints: Array<{
      title: string
      explanation: string
      teacherActivity: string
      studentActivity: string
    }>
    keyVocabulary: Array<{ term: string; definition: string }>
    examples: string[]
  }

  studentActivities: Array<{
    activity: string
    grouping: "Individual" | "Pair" | "Group" | "Whole Class"
    duration: string
  }>

  assessment: {
    formative: {
      duringLesson: Array<{
        technique: string
        description: string
        timing: string
      }>
      exitTicket: { question: string; expectedResponse: string }
    }
    summative: {
      questions: Array<{
        question: string
        type: "multiple-choice" | "short-answer" | "essay" | "practical"
        difficulty: "basic" | "intermediate" | "advanced"
        bloomLevel: string
        points: number
        expectedAnswer: string
      }>
      rubric: {
        criteria: Array<{
          criterion: string
          excellent: string
          good: string
          satisfactory: string
          needsImprovement: string
        }>
      }
    }
    successCriteria: string[]
  }

  conclusion: {
    summary: string
    homework?: string
    nextLesson?: string
  }

  resources: {
    digital: Array<{
      name: string
      type: "video" | "simulation" | "website" | "app" | "document"
      url: string
      description: string
      cost: "free" | "paid" | "subscription"
    }>
    physical: Array<{
      item: string
      purpose: string
      alternatives: string[]
      cost: "free" | "low-cost" | "moderate" | "expensive"
    }>
    textbook: Array<{
      reference: string
      pages: string
      exercises: string
    }>
  }
}
```

---

### Get History

```
GET /lesson-generator/history?limit=20
Authorization: Bearer <token>
```

**Response `200`:**

```json
{
  "success": true,
  "data": [
    {
      "id": "clzzz...",
      "subject": "Mathematics",
      "grade": "SSS 1",
      "topic": "Quadratic Equations",
      "term": "First",
      "week": 3,
      "tokensUsed": 1842,
      "cost": 5,
      "generatedAt": "2026-04-02T11:00:00.000Z"
    }
  ]
}
```

---

### Get a Single Lesson Note

```
GET /lesson-generator/:id
Authorization: Bearer <token>
```

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "id": "clzzz...",
    "subject": "Mathematics",
    "grade": "SSS 1",
    "topic": "Quadratic Equations",
    "content": { ... full lessonNote object ... },
    "tokensUsed": 1842,
    "generatedAt": "2026-04-02T11:00:00.000Z"
  }
}
```

---

### Export to PDF

```
GET /lesson-generator/:id/export-pdf
Authorization: Bearer <token>
```

Returns a styled **HTML page** ready for printing. Open it in a new browser tab and use `Ctrl+P` to save as PDF. Do not parse the response — just open the URL directly:

```javascript
window.open(`/api/lesson-generator/${id}/export-pdf`, "_blank");
```

---

## 6. Pages to Build

### Standalone App

| Page      | Suggested Route | Notes                                                           |
| --------- | --------------- | --------------------------------------------------------------- |
| Landing   | `/`             | Marketing page. Include a demo generation CTA (no login needed) |
| Register  | `/register`     | Sign up form. Show the 5 $Parats bonus on success               |
| Login     | `/login`        | Standard login form                                             |
| Dashboard | `/dashboard`    | Wallet balance widget + recent history list                     |
| Generate  | `/generate`     | Main generation form                                            |
| View Note | `/notes/:id`    | Full lesson note viewer with Print/PDF button                   |
| Wallet    | `/wallet`       | Balance, top-up panel, transaction history                      |
| Profile   | `/profile`      | Edit name, school, subjects, role                               |

### ParaLearn Integration

No separate auth pages are needed — use the existing ParaLearn session. Add:

- A **"Lesson Generator"** item in the teacher sidebar nav
- The **Generate** page (reuse the same form)
- The **View Note** page
- A **"My Lesson Notes"** tab in the teacher's activity/history area

---

## 7. UI/UX Rules

### Generation Form

- Fetch grade levels and subjects from `GET /lesson-generator/curricula` on mount. **Never hardcode** the subject or grade lists.
- Grade selection must cascade into subject filtering:
  - Grade starts with `"Primary"` → show PRIMARY subjects
  - Grade starts with `"JSS"` → show JSS subjects
  - Grade starts with `"SSS"` → show SSS subjects
- Disable the **Generate** button while a request is in flight.
- Show a loading state with the message: **"AI is building your lesson note…"** — generation takes 10–30 seconds.
- After success, navigate to `/notes/:id`.

### Wallet Balance Widget

- Display balance prominently on the dashboard and near the Generate button.
- If `isLowBalance: true` → show an amber warning banner.
- If `balance === 0` → disable the Generate button and show a **"Top Up"** prompt.
- After a successful generation, update the displayed balance immediately using `walletBalance` from the response. Do not make an extra API call to refresh.

### Lesson Note Viewer

Render each section as a distinct card or collapsible panel in this order:

1. **Header** — subject, grade, topic, term, week, duration
2. **Learning Objectives** — group by `type` (cognitive/affective/psychomotor). Show `bloomLevel` as a badge.
3. **Introduction** — set induction paragraph + prior knowledge bullet list
4. **Main Content** — teaching points (numbered steps), vocabulary (table), examples (list)
5. **Student Activities** — each with a grouping badge (Individual/Pair/Group/Whole Class) and duration
6. **Assessment**
   - Formative: techniques table + exit ticket box
   - Summative: questions list with difficulty/type badges, rubric as a grid table
   - Success criteria as a checklist
7. **Conclusion** — summary, homework, next lesson preview
8. **Resources** — three tabs: Digital, Physical, Textbook

### Error Handling

| HTTP Status | Meaning                                     | What to show                                                 |
| ----------- | ------------------------------------------- | ------------------------------------------------------------ |
| `400`       | Validation error or insufficient balance    | Inline message near the relevant field or button             |
| `401`       | Token expired or missing                    | Redirect to `/login`                                         |
| `403`       | Action not permitted                        | Show `message` in a modal                                    |
| `500`       | AI generation failed (Parats auto-refunded) | Toast: "Generation failed. Your $Parats have been refunded." |

---

## 8. Token Storage Pattern (Standalone)

```javascript
const TOKEN_KEY = "lessongen_token";

const auth = {
  save: (token) => localStorage.setItem(TOKEN_KEY, token),
  get: () => localStorage.getItem(TOKEN_KEY),
  clear: () => localStorage.removeItem(TOKEN_KEY),
  headers: () => ({
    Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
  }),
};
```

For ParaLearn-integrated context, use the existing ParaLearn token mechanism — do not create a second token storage.

---

## 9. Key Business Rules — Do Not Break These

1. **Never call `/wallet/topup` before payment is confirmed.** It directly credits real $Parats.
2. **The 5 $Parats signup bonus is automatic** — it is seeded server-side on registration. Do not add it from the frontend.
3. **Both user types pay 5 $Parats per generation** — do not show different pricing.
4. **If a `500` error occurs on generation, $Parats are auto-refunded.** Tell the user this in the error message so they don't panic and try to contact support.
5. **Demo mode (`id: null`) generates but saves nothing.** Never navigate to `/notes/null` — render the result inline instead and show a sign-up prompt.
6. **Subject validation is server-side.** If an invalid subject/grade combo is sent, the API returns `400` with a clear message. Show that message directly to the user.

---

## 10. Full Generation Flow — React Pseudocode

```jsx
async function handleGenerate(formData) {
  setLoading(true);
  setError(null);

  try {
    const res = await fetch("/api/lesson-generator/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...auth.headers(), // omit for demo (unauthenticated)
      },
      body: JSON.stringify({
        subject: formData.subject,
        grade: formData.grade,
        topic: formData.topic,
        term: formData.term,
        week: Number(formData.week),
        duration: Number(formData.duration) || 40,
        curriculum: "NERDC",
      }),
    });

    const json = await res.json();

    if (!res.ok) {
      setError(json.message || "Generation failed.");
      return;
    }

    if (json.data.demo) {
      // Unauthenticated — show result inline, prompt to sign up
      setDemoResult(json.data.lessonNote);
      setShowSignupPrompt(true);
      return;
    }

    // Update wallet balance from response — no extra API call needed
    setWalletBalance(json.data.walletBalance);

    // Navigate to the saved note viewer
    router.push(`/notes/${json.data.id}`);
  } catch {
    setError("Network error. Please try again.");
  } finally {
    setLoading(false);
  }
}
```

---

## 11. Backend File Reference

| File                                                                 | Purpose                                                             |
| -------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `src/lesson-generator/lesson-generator.controller.ts`                | Generate, history, get by ID, export PDF                            |
| `src/lesson-generator/lesson-generator.service.ts`                   | Business logic — routes by user type                                |
| `src/lesson-generator/standalone-auth/standalone-auth.controller.ts` | Register, login, profile, wallet endpoints                          |
| `src/lesson-generator/standalone-auth/standalone-auth.service.ts`    | Auth operations                                                     |
| `src/lesson-generator/standalone-auth/standalone-credits.service.ts` | Wallet operations (balance, deduct, refund, topup)                  |
| `src/lesson-generator/standalone.guard.ts`                           | JWT guards for both user types                                      |
| `src/lesson-generator/schemas/lesson-note.schema.ts`                 | Exact shape of a lesson note (Zod schema)                           |
| `src/lesson-generator/dto/generate-lesson.dto.ts`                    | Generation request validation rules                                 |
| `prisma/schema.prisma`                                               | `StandaloneUser`, `StandaloneWallet`, `StandaloneLessonNote` models |
