# How Data Flows in Paralearn RMS — A Plain-English Guide

## The Problem We Solved

Imagine you're using the Paralearn school app. You open the "Classes" page and see a list of all classes. Previously, every time you navigated to that page, the app would call the server again to re-fetch that same list — even if nothing had changed. This made the app feel slower and put unnecessary load on the server.

We solved this with a **smart caching layer** called **RTK Query**.

---

## What Is RTK Query? (No Jargon Version)

Think of RTK Query as a **smart assistant** that sits between your browser and the school's server.

### Without RTK Query (Before)

```
You open "Classes" page
  → App asks the server: "Give me all classes"
  → Server responds with the list
  → App shows you the list

You navigate away, then come back
  → App asks the server AGAIN: "Give me all classes"
  → Server responds with the SAME list
  → App shows you the SAME list (but you waited again)
```

### With RTK Query (After)

```
You open "Classes" page
  → Smart assistant checks: "Do I already have this data?"
  → NO → Asks the server, saves the response, shows you the list

You navigate away, then come back (within 30 seconds)
  → Smart assistant checks: "Do I already have this data?"
  → YES → Shows you the list INSTANTLY (no waiting for the server)

After 30 seconds OR when you switch browser tabs
  → Smart assistant quietly refreshes the data in the background
  → If anything changed, the page updates automatically
```

---

## Key Features in Simple Terms

### 1. Caching (Remembering Data)

When the app fetches data, it **remembers** it for 30 seconds. If any page needs the same data within that window, it's shown instantly — no server call needed.

### 2. Automatic Refresh

The app automatically re-fetches fresh data when:

- **You switch back to the browser tab** (you were checking email, now you're back)
- **Your internet reconnects** (you were on a subway, now back online)

This means you always see up-to-date information without pressing any "refresh" button.

### 3. Smart Invalidation

When you **change** something (add a student, create a class, delete a user), the system knows exactly which cached data is now outdated and automatically refreshes just those parts.

**Example:** You add a new student to Class 3A.
- The "students in Class 3A" list refreshes automatically
- The "all classes" list refreshes too (because the student count changed)
- The "reports" page is NOT refreshed (it's unrelated)

### 4. Loading & Error States

Every data request automatically provides:
- **"Is it loading?"** — so the page can show a spinner
- **"Did it fail?"** — so the page can show an error message
- **"Is it refreshing in the background?"** — so the page can show a subtle "syncing" indicator

---

## What Data Does This Cover?

The smart caching layer covers **everything** the school app does:

| Area | What It Handles |
|------|----------------|
| **Users** | Student lists, teacher profiles, user details |
| **Classes** | Class lists, enrollments, teacher assignments |
| **Subjects** | Subject lists, teacher-subject assignments |
| **Academic** | School sessions, terms, academic years |
| **Assessments** | Tests, exams, quizzes, grading |
| **Scores** | Student scores, bulk score entry |
| **Comments** | Teacher comments on students |
| **Reports** | Report cards, statistics, approval workflows |
| **Attendance** | Daily attendance records |
| **Settings** | School settings, grading scales, branding |

---

## What About Logging In and Out?

Login, logout, signup, and password reset are **not** handled by the caching system — and that's intentional. These actions involve security-sensitive operations (setting cookies, redirecting to different pages) that need special handling. They work the same way they always have.

---

## How Does This Affect Me as a User?

| Before | After |
|--------|-------|
| Pages felt slow on revisit | Pages load instantly from cache |
| Had to manually refresh to see changes | Changes appear automatically |
| Going offline meant stale data | Data refreshes when you reconnect |
| Switching tabs showed old data | Data refreshes when you return |

**Bottom line:** The app feels faster and always shows you the latest information.
