# Attendance API Documentation

Base URL: `/attendance`

Authentication: All endpoints require a valid JWT token in the `Authorization` header (`Bearer <token>`).

## Enum: AttendanceStatus
The `status` field in attendance records uses the following enum values:
- `PRESENT`
- `ABSENT`
- `LATE`

---

## 1. Get Daily Class Attendance

Fetch the daily attendance list for a specific class and date. This returns a list of students with their attendance status for that day.

- **Endpoint**: `GET /attendance/class/:classId/daily`
- **Method**: `GET`
- **Roles**: `admin`, `teacher`

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `date` | `string` | Yes | Date in ISO format (e.g., `2023-10-27`) |

### Request Example
```http
GET /attendance/class/cl_12345/daily?date=2023-10-27
```

### Response Example
```json
[
  {
    "enrollmentId": "enr_98765",
    "student": {
      "id": "usr_111",
      "firstName": "John",
      "lastName": "Doe",
      "studentId": "STU_001",
      "profilePicture": "https://..."
    },
    "attendance": {
      "id": "att_555",
      "enrollmentId": "enr_98765",
      "date": "2023-10-27T00:00:00.000Z",
      "status": "PRESENT"
    }
  },
  {
    "enrollmentId": "enr_98766",
    "student": {
      "id": "usr_222",
      "firstName": "Jane",
      "lastName": "Smith",
      "studentId": "STU_002",
      "profilePicture": null
    },
    "attendance": null // No record found for this date (implies not marked yet)
  }
]
```

---

## 2. Bulk Update Attendance

Submit attendance status for multiple students for a specific date. This is used to mark the register.

- **Endpoint**: `PATCH /attendance/bulk`
- **Method**: `PATCH`
- **Roles**: `admin`, `teacher`

### Request Body
```typescript
interface UpdateBulkAttendanceDto {
  date: Date; // ISO String
  records: {
    enrollmentId: string;
    status: 'PRESENT' | 'ABSENT' | 'LATE';
  }[];
}
```

### Request Example
```json
{
  "date": "2023-10-27",
  "records": [
    {
      "enrollmentId": "enr_98765",
      "status": "PRESENT"
    },
    {
      "enrollmentId": "enr_98766",
      "status": "ABSENT"
    }
  ]
}
```

### Response Example
```json
[
  {
    "id": "att_555",
    "enrollmentId": "enr_98765",
    "date": "2023-10-27T00:00:00.000Z",
    "status": "PRESENT",
    "createdAt": "...",
    "updatedAt": "..."
  },
  // ... other created/updated records
]
```

---

## 3. Get Student Attendance Summary

Get aggregated attendance statistics for a student (days present, absent, late) for a specific term.

- **Endpoint**: `GET /attendance`
- **Method**: `GET`
- **Roles**: `admin`, `teacher`, `student`

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `studentId` | `string` | No* | Required if `classId` is not provided. Target student ID. |
| `classId` | `string` | No* | Required if `studentId` is not provided. Target class ID. |
| `session` | `string` | Yes | Academic Session (e.g., `2023/2024`) |
| `term` | `string` | Yes | Term (e.g., `First Term`) |

### Request Example (Single Student)
```http
GET /attendance?studentId=usr_111&session=2023/2024&term=First Term
```

### Response Example (Single Student)
```json
{
  "id": "attsum_777",
  "studentId": "usr_111",
  "session": "2023/2024",
  "term": "First Term",
  "daysPresent": 45,
  "daysPossible": 50,
  "daysAbsent": 5,
  "lateCount": 2,
  "remarks": "Exclude valid excuses",
  "student": {
    "id": "usr_111",
    "firstName": "John",
    "lastName": "Doe",
    "studentId": "STU_001",
    "email": "john@example.com"
  }
}
```

### Request Example (Class Summary)
```http
GET /attendance?classId=cl_12345&session=2023/2024&term=First Term
```

### Response Example (Class Summary)
```json
[
  {
    "id": "attsum_777",
    "studentId": "usr_111",
    // ... same as above
  },
  {
    "id": "attsum_778",
    "studentId": "usr_222",
    // ...
  }
]
```

---

## 4. Create/Update Attendance Summary (Manual)

Manually set the aggregate attendance numbers for a student.

- **Endpoint**: `POST /attendance`
- **Method**: `POST`
- **Roles**: `admin`, `teacher`

### Request Body
```typescript
interface CreateAttendanceDto {
  studentId: string;
  session?: string; // Optional, defaults to current
  term?: string;    // Optional, defaults to current
  daysPresent: number;
  daysPossible: number;
  daysAbsent?: number; // Optional, defaults to possible - present
  lateCount?: number;
  remarks?: string;
}
```

### Request Example
```json
{
  "studentId": "usr_111",
  "session": "2023/2024",
  "term": "First Term",
  "daysPresent": 45,
  "daysPossible": 50,
  "lateCount": 2,
  "remarks": "Good attendance"
}
```

---

## 5. Delete Attendance Summary

Delete an attendance summary record.

- **Endpoint**: `DELETE /attendance`
- **Method**: `DELETE`
- **Roles**: `admin`

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `studentId` | `string` | Yes | Student ID |
| `session` | `string` | Yes | Session |
| `term` | `string` | Yes | Term |

### Request Example
```http
DELETE /attendance?studentId=usr_111&session=2023/2024&term=First Term
```
