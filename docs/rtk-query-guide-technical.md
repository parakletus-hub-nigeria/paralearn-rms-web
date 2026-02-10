# RTK Query API Layer — Technical Documentation

## Architecture Overview

```
src/reduxToolKit/api/
├── baseApi.ts              ← createApi + axiosBaseQuery (single source of truth)
├── endpoints/
│   ├── users.ts            ← 7 hooks   (CRUD + profile + password)
│   ├── academic.ts         ← 5 hooks   (sessions, terms, onboarding)
│   ├── classes.ts          ← 10 hooks  (CRUD + enrollment + teacher assign)
│   ├── subjects.ts         ← 5 hooks   (CRUD + teacher assign)
│   ├── assessments.ts      ← 11 hooks  (CRUD + publish + questions + grading)
│   ├── scores.ts           ← 3 hooks   (fetch + submit + bulk upload)
│   ├── comments.ts         ← 4 hooks   (my comments + student + bulk)
│   ├── reports.ts          ← 8 hooks   (stats + approval + cards + generate)
│   ├── attendance.ts       ← 2 hooks   (fetch + record)
│   └── settings.ts         ← 7 hooks   (school + grading + tenant + branding)
└── index.ts                ← Barrel re-export of all hooks
```

**Pattern:** One `createApi` instance → many `injectEndpoints` files → one barrel export.

---

## Base API (`baseApi.ts`)

### `axiosBaseQuery`

A custom `BaseQueryFn` adapter that wraps the existing Axios `apiClient` from `@/lib/api`. This preserves all existing infrastructure:

- **Authentication** — Bearer token from `tokenManager`
- **Token refresh** — Axios interceptors handle 401 → refresh → retry
- **Subdomain routing** — All requests go through the proxy layer
- **Response envelope unwrapping** — Automatically extracts `response.data.data` from the `{ success, data, message }` envelope

```typescript
// Signature
const axiosBaseQuery: BaseQueryFn<
  AxiosBaseQueryArgs,
  unknown,
  { status?: number; data?: unknown; message?: string }
>
```

### `paraApi`

The central `createApi` instance. Configuration:

| Setting | Value | Rationale |
|---------|-------|-----------|
| `reducerPath` | `"api"` | Registered at `state.api` in the Redux store |
| `refetchOnFocus` | `true` | Re-fetches stale queries when the browser tab regains focus |
| `refetchOnReconnect` | `true` | Re-fetches when network reconnects |
| `keepUnusedDataFor` | `30` (seconds) | Cached data lives for 30s after all subscribers unmount |

**Tag types** (26 total) enable precise cache invalidation. Each domain uses specific tags:

```typescript
tagTypes: [
  "User", "UserList", "Session", "SessionList", "CurrentSession",
  "Class", "ClassList", "Subject", "SubjectList",
  "Assessment", "AssessmentList", "AssessmentCategory",
  "Score", "ScoreList", "Comment", "CommentList",
  "Report", "ReportCard", "ApprovalQueue", "Attendance",
  "SchoolSettings", "GradingSystem", "GradingTemplate",
  "Tenant", "BookletPreview", "Statistics",
]
```

---

## Store Integration (`store.ts`)

```typescript
import { paraApi } from "./api";

export const store = configureStore({
  reducer: {
    user: userReducer,
    setUp: setUpReducer,
    teacher: teacherReducer,
    admin: adminReducer,
    [paraApi.reducerPath]: paraApi.reducer,  // ← API cache state
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(paraApi.middleware),  // ← polling, refetch, invalidation
});
```

The `StoreProvider` calls `setupListeners(store.dispatch)` to enable `refetchOnFocus` and `refetchOnReconnect`.

---

## Endpoint Patterns

### Query Endpoints (GET)

All query endpoints follow this pattern:

```typescript
getItems: builder.query<ReturnType, ArgType>({
  query: (arg) => ({ url: `/api/proxy/...`, params: { ... } }),
  transformResponse: (res) => { /* normalize */ },
  providesTags: (result) => [
    ...result.map(item => ({ type: "Tag", id: item.id })),
    { type: "TagList" },
  ],
}),
```

**Key design decisions:**

1. **`transformResponse`** — Array endpoints defensively check `Array.isArray(res)` because some backend endpoints return the array directly while others wrap it.

2. **`providesTags`** — Every list query provides both:
   - Individual item tags: `{ type: "User", id: "abc123" }` — enables targeted invalidation
   - List tag: `{ type: "UserList" }` — enables full-list invalidation on create/delete

3. **Parameterized queries** use URL-embedded IDs for scoped caching:
   ```typescript
   // Each classId gets its own cached entry
   providesTags: (_r, _e, { classId }) => [
     { type: "UserList", id: `class-${classId}` },
   ]
   ```

### Mutation Endpoints (POST/PATCH/PUT/DELETE)

```typescript
updateItem: builder.mutation<ReturnType, ArgType>({
  query: ({ id, ...body }) => ({
    url: `/api/proxy/items/${id}`,
    method: "PATCH",
    data: body,
  }),
  invalidatesTags: (_r, _e, { id }) => [
    { type: "Item", id },      // ← refetch this specific item
    { type: "ItemList" },       // ← refetch lists containing this item
  ],
}),
```

**Invalidation strategy:** Mutations always invalidate the minimum set of tags needed. For example, `enrollStudent` invalidates:
- `{ type: "Class", id: classId }` — class detail (student count changed)
- `{ type: "UserList", id: \`class-\${classId}\` }` — students in that class

### File Upload Endpoints

For bulk upload (scores, questions), we use `FormData` with explicit headers:

```typescript
bulkUploadScores: builder.mutation<any, { assessmentId: string; file: File }>({
  query: ({ assessmentId, file }) => {
    const form = new FormData();
    form.append("file", file);
    return {
      url: `/api/proxy/scores/bulk?assessmentId=${assessmentId}`,
      method: "POST",
      data: form,
      headers: { "Content-Type": "multipart/form-data" },
    };
  },
}),
```

---

## Usage Guide

### Basic Query Hook

```tsx
import { useGetClassesQuery } from "@/reduxToolKit/api";

function ClassesPage() {
  const { data: classes, isLoading, isError, error, refetch } = useGetClassesQuery();

  if (isLoading) return <Spinner />;
  if (isError) return <ErrorMessage error={error} />;

  return (
    <ul>
      {classes?.map(cls => <li key={cls.id}>{cls.name}</li>)}
    </ul>
  );
}
```

### Parameterized Query

```tsx
import { useGetSubjectsByClassQuery } from "@/reduxToolKit/api";

function ClassSubjects({ classId }: { classId: string }) {
  const { data: subjects } = useGetSubjectsByClassQuery(classId);
  // Cached per classId — different classes have separate cache entries
}
```

### Skip Query Until Ready

```tsx
const { data } = useGetStudentReportCardQuery(
  { studentId, session, term },
  { skip: !studentId || !session || !term }
);
```

### Mutation Hook

```tsx
import { useCreateClassMutation, useGetClassesQuery } from "@/reduxToolKit/api";

function CreateClassForm() {
  const [createClass, { isLoading }] = useCreateClassMutation();

  const handleSubmit = async (formData) => {
    try {
      await createClass(formData).unwrap();
      toast.success("Class created!");
      // No need to manually refetch — invalidatesTags handles it
    } catch (err) {
      toast.error(err.message);
    }
  };
}
```

### Polling (Real-Time Updates)

```tsx
// Poll every 10 seconds for live updates
const { data } = useGetApprovalQueueQuery("pending", {
  pollingInterval: 10_000,
});
```

### Prefetching

```tsx
import { paraApi } from "@/reduxToolKit/api";

// In a parent component or on hover
const prefetchClasses = paraApi.usePrefetch("getClasses");

<button onMouseEnter={() => prefetchClasses()}>
  View Classes
</button>
```

---

## Complete Hook Reference

### Users (`@/reduxToolKit/api`)
| Hook | Type | Args |
|------|------|------|
| `useGetUsersQuery` | Query | `void` |
| `useGetUserByIdQuery` | Query | `string` (userId) |
| `useGetCurrentUserQuery` | Query | `void` |
| `useGetStudentsByClassQuery` | Query | `{ classId: string }` |
| `useUpdateUserMutation` | Mutation | `{ userId, firstName?, lastName?, ... }` |
| `useDeleteUserMutation` | Mutation | `string` (userId) |
| `useChangePasswordMutation` | Mutation | `{ currentPassword, newPassword }` |

### Academic Sessions
| Hook | Type | Args |
|------|------|------|
| `useGetAllSessionsQuery` | Query | `void` |
| `useGetCurrentSessionQuery` | Query | `void` |
| `useCreateSessionMutation` | Mutation | `{ session, startsAt, endsAt, terms[] }` |
| `useActivateTermMutation` | Mutation | `{ sessionId, termId }` |
| `useOnboardingSetupMutation` | Mutation | `OnboardingSetupInput` |

### Classes
| Hook | Type | Args |
|------|------|------|
| `useGetClassesQuery` | Query | `void \| { level?, isActive? }` |
| `useGetClassByIdQuery` | Query | `string` (classId) |
| `useGetTeacherClassesQuery` | Query | `string` (teacherId) |
| `useGetTeacherAssignedClassesQuery` | Query | `string` (teacherId) |
| `useCreateClassMutation` | Mutation | `{ name, level?, stream?, capacity? }` |
| `useAssignTeacherToClassMutation` | Mutation | `{ classId, teacherId }` |
| `useRemoveTeacherFromClassMutation` | Mutation | `{ classId, teacherId }` |
| `useEnrollStudentMutation` | Mutation | `{ classId, studentId }` |
| `useBulkEnrollStudentsMutation` | Mutation | `{ classId, studentIds[] }` |
| `useRemoveStudentMutation` | Mutation | `{ classId, studentId }` |

### Subjects
| Hook | Type | Args |
|------|------|------|
| `useGetSubjectsQuery` | Query | `void` |
| `useGetSubjectsByClassQuery` | Query | `string` (classId) |
| `useGetSubjectsByTeacherQuery` | Query | `string` (teacherId) |
| `useCreateSubjectMutation` | Mutation | `{ name, code?, classId, description? }` |
| `useAssignTeacherToSubjectMutation` | Mutation | `{ subjectId, teacherId }` |

### Assessments
| Hook | Type | Args |
|------|------|------|
| `useGetAssessmentsByStatusQuery` | Query | `string` (status) |
| `useGetAssessmentByIdQuery` | Query | `string` (id) |
| `useGetAssessmentSubmissionsQuery` | Query | `string` (assessmentId) |
| `useGetAssessmentCategoriesQuery` | Query | `void` |
| `useCreateAssessmentMutation` | Mutation | assessment object |
| `useUpdateAssessmentMutation` | Mutation | `{ assessmentId, data }` |
| `usePublishAssessmentMutation` | Mutation | `{ assessmentId, publish }` |
| `useBulkUploadQuestionsMutation` | Mutation | `{ assessmentId, file: File }` |
| `useCreateAssessmentCategoryMutation` | Mutation | `{ name, code, weight, description? }` |
| `useDeleteAssessmentCategoryMutation` | Mutation | `string` (id) |
| `useGradeAnswerMutation` | Mutation | `{ submissionId, answerId, score, feedback? }` |

### Scores
| Hook | Type | Args |
|------|------|------|
| `useGetScoresByAssessmentQuery` | Query | `string` (assessmentId) |
| `useSubmitScoresMutation` | Mutation | `{ assessmentId, scores[] }` |
| `useBulkUploadScoresMutation` | Mutation | `{ assessmentId, file: File }` |

### Comments
| Hook | Type | Args |
|------|------|------|
| `useGetMyCommentsQuery` | Query | `{ session, term }` |
| `useGetStudentCommentsQuery` | Query | `{ studentId, session, term }` |
| `useAddCommentMutation` | Mutation | comment object |
| `useBulkAddCommentsMutation` | Mutation | comments array |

### Reports
| Hook | Type | Args |
|------|------|------|
| `useGetSchoolStatisticsQuery` | Query | `{ session, term }` |
| `useGetApprovalQueueQuery` | Query | `string \| void` (status) |
| `useGetBookletPreviewQuery` | Query | `{ classId, session, term }` |
| `useGetStudentReportCardQuery` | Query | `{ studentId, session, term }` |
| `useGetReportCardsQuery` | Query | `{ classId?, session?, term? }` |
| `useApproveReportsMutation` | Mutation | `{ action, reportCardIds[], rejectionReason? }` |
| `useSubmitForApprovalMutation` | Mutation | submission object |
| `useGenerateAndNotifyMutation` | Mutation | generation params |

### Attendance
| Hook | Type | Args |
|------|------|------|
| `useGetAttendanceQuery` | Query | `{ studentId?, classId?, session, term }` |
| `useRecordAttendanceMutation` | Mutation | `{ studentId, session, term, daysPresent, totalDays }` |

### Settings
| Hook | Type | Args |
|------|------|------|
| `useGetSchoolSettingsQuery` | Query | `void` |
| `useUpdateSchoolSettingsMutation` | Mutation | settings object |
| `useGetGradingSystemQuery` | Query | `void` |
| `useUpdateGradingSystemMutation` | Mutation | grading config |
| `useGetGradingTemplatesQuery` | Query | `void` |
| `useGetTenantInfoQuery` | Query | `void` |
| `useUpdateBrandingMutation` | Mutation | `{ logoUrl?, primaryColor?, ... }` |

---

## Cache Invalidation Map

This table shows which tags each mutation invalidates:

| Mutation | Invalidated Tags |
|----------|-----------------|
| `createClass` | `ClassList` |
| `assignTeacherToClass` | `Class(classId)` |
| `enrollStudent` | `Class(classId)`, `UserList(class-X)` |
| `bulkEnrollStudents` | `Class(classId)`, `UserList(class-X)` |
| `createAssessment` | `AssessmentList` |
| `publishAssessment` | `Assessment(id)`, `AssessmentList` |
| `submitScores` | `ScoreList(assessmentId)` |
| `addComment` | `CommentList` |
| `approveReports` | `ApprovalQueue`, `ReportCard(LIST)` |
| `updateSchoolSettings` | `SchoolSettings` |
| `updateBranding` | `Tenant` |

---

## Excluded from RTK Query (Intentionally)

The following operations remain as Redux thunks because they involve side effects beyond simple API calls:

| Thunk | Reason |
|-------|--------|
| `loginUser` | Sets cookies, redirects to subdomain URL, persists to localStorage |
| `logoutUser` | Clears cookies, clears localStorage, clears subdomain storage |
| `signupUser` | Returns token for immediate auth setup |
| `refreshAuthToken` | Called by Axios interceptor, sets cookies |
| `requestPasswordReset` | Simple fire-and-forget, no cache involved |
| `confirmPasswordReset` | Simple fire-and-forget, no cache involved |

---

## Migrating a Page (Step-by-Step)

To migrate an existing page from thunks to RTK Query:

### Step 1 — Replace the thunk dispatch with a query hook

```diff
- import { useEffect } from "react";
- import { useAppDispatch, useAppSelector } from "@/reduxToolKit/hooks";
- import { fetchAllUsers } from "@/reduxToolKit/user/userThunks";
+ import { useGetUsersQuery } from "@/reduxToolKit/api";

  function UsersPage() {
-   const dispatch = useAppDispatch();
-   const { users, loading, error } = useAppSelector(state => state.user);
-
-   useEffect(() => {
-     dispatch(fetchAllUsers());
-   }, [dispatch]);
+   const { data: usersData, isLoading: loading, isError, error } = useGetUsersQuery();
+   const users = usersData ?? [];
```

### Step 2 — Replace mutation dispatches

```diff
- import { deleteUser } from "@/reduxToolKit/user/userThunks";
+ import { useDeleteUserMutation } from "@/reduxToolKit/api";

-   const handleDelete = async (userId: string) => {
-     await dispatch(deleteUser(userId));
-     dispatch(fetchAllUsers()); // manual refetch
-   };
+   const [deleteUser] = useDeleteUserMutation();
+   const handleDelete = async (userId: string) => {
+     await deleteUser(userId).unwrap();
+     // No manual refetch needed — cache auto-invalidates
+   };
```

### Step 3 — Remove the `useEffect` + `dispatch` pattern entirely

RTK Query hooks fetch automatically when the component mounts. No `useEffect` needed.

---

## Debugging

### Redux DevTools

All RTK Query state lives under `state.api` in Redux DevTools. You can inspect:
- `queries` — all cached query results with their status
- `mutations` — all in-flight and completed mutations
- `provided` — which tags are currently provided by which queries
- `subscriptions` — which components are subscribed to which queries

### Logging

The `axiosBaseQuery` inherits all logging from the existing `apiClient` Axios interceptors. No additional logging setup needed.
