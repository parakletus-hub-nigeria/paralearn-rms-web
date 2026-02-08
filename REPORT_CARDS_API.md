# Report Cards API Documentation

## Overview

The Report Cards API provides functionality to generate, retrieve, and manage student report cards. The system supports both individual student report card generation and bulk retrieval of report cards for an entire class.

### Key Features

- **Individual Report Generation**: Generate PDF report cards for a specific student
- **Bulk Retrieval**: Fetch all report cards for a class with filtering options
- **Queue-Based Processing**: Asynchronous report card generation using BullMQ
- **Permission-Based Access**: Role-based access control (Admin, Teacher, Student)
- **Cloud Storage**: PDFs are uploaded to Cloudinary for secure storage and access

---

## API Endpoints

### 1. Generate Student Report Card PDF

**Endpoint:** `GET /reports/student/:studentId/:classId/report-card/pdf`

**Description:** Initiates the generation of a report card PDF for a specific student and adds it to the processing queue.

#### Request Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `studentId` | string | URL path | Yes | The unique identifier of the student |
| `classId` | string | URL path | Yes | The class ID the student belongs to |
| `session` | string | Query | Yes | Academic session (e.g., "2023/2024") |
| `term` | string | Query | Yes | Academic term (e.g., "First Term", "Second Term") |

#### Authentication & Authorization

- **Required Guard**: `JwtAuthGuard`, `RolesGuard`
- **Allowed Roles**: All authenticated users
- **Permission Rules**:
  - Students can only generate/view their own report cards
  - Teachers and Admins can generate/view report cards for any student in their class/school

#### Request Example

```bash
GET /reports/student/student-123/class-456/report-card/pdf?session=2023/2024&term=First%20Term
Authorization: Bearer <JWT_TOKEN>
```

#### Response Schema

**Success Response (202 Accepted):**

```json
{
  "success": true,
  "message": "Report card generation has started, you will be notified when report card is already available for download",
  "data": null
}
```

**Error Responses:**

```json
// Permission Denied
{
  "statusCode": 403,
  "message": "You can only download your own report card"
}

// Missing Parameters
{
  "statusCode": 400,
  "message": "Session and term are required"
}

// Report Card Already Exists
{
  "success": true,
  "message": "Report card already exists",
  "data": {
    "id": "report-card-id",
    "studentId": "student-123",
    "term": "First Term",
    "session": "2023/2024",
    "documentUrl": "https://cloudinary-url.pdf",
    "documentPublicId": "public-id",
    "bytes": 245632,
    "uploadedById": "admin-123",
    "status": "approved",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}

// Server Error
{
  "statusCode": 500,
  "message": "Failed to generate report card"
}
```

#### Implementation Details

1. **Permission Check**: Validates that students can only request their own report cards
2. **Parameter Validation**: Ensures session and term are provided
3. **Duplicate Prevention**: Checks if report card already exists in the database
4. **Queue Processing**: If not existing, adds generation job to BullMQ queue with:
   - `jobId`: studentId
   - `attempts`: 3 (retry on failure)
   - `backoff`: 5000ms (delay between retries)
5. **Async Processing**: Returns immediately to client, processing happens in background

#### Processing Pipeline

```
Client Request
      ↓
[Permission & Parameter Validation]
      ↓
[Check if Report Exists]
      ↓
YES → Return existing report card
 ↓
NO → Add to Generation Queue
      ↓
[Background Job Processing]
  - Fetch student report data
  - Generate PDF from template
  - Upload to Cloudinary
  - Save record to database
      ↓
[Notification Sent to Student]
```

#### Status Codes

| Code | Meaning | Scenario |
|------|---------|----------|
| 200 | Success | Report card already exists or generation queued |
| 400 | Bad Request | Missing required parameters |
| 401 | Unauthorized | JWT token missing or invalid |
| 403 | Forbidden | Permission denied (student requesting another's report) |
| 500 | Internal Server Error | Report generation failed |

#### Use Cases

1. **Student requests own report card**: Student initiates generation of their report card
2. **Teacher generates for a student**: Teacher generates report card for student in their class
3. **Admin generates for any student**: Admin can generate for any student in the school

---

### 2. Retrieve All Report Cards

**Endpoint:** `GET /reports/report-cards`

**Description:** Retrieves all generated report cards for the school, with optional filtering by class, term, and session.

#### Request Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `classId` | string | Query | No | Filter by class ID |
| `term` | string | Query | No | Filter by academic term |
| `session` | string | Query | No | Filter by academic session |

#### Authentication & Authorization

- **Required Guard**: `JwtAuthGuard`, `RolesGuard`
- **Allowed Roles**: `admin`, `teacher`
- **Permission Rules**:
  - Students cannot access this endpoint
  - Teachers and Admins can view all report cards for their school

#### Request Examples

```bash
# Get all report cards
GET /reports/report-cards
Authorization: Bearer <JWT_TOKEN>

# Get report cards for a specific class
GET /reports/report-cards?classId=class-456
Authorization: Bearer <JWT_TOKEN>

# Get report cards for specific term and session
GET /reports/report-cards?classId=class-456&term=First%20Term&session=2023/2024
Authorization: Bearer <JWT_TOKEN>
```

#### Response Schema

**Success Response (302 Found):**

```json
{
  "status": 302,
  "message": "report cards found successfully",
  "data": [
    {
      "id": "report-card-1",
      "studentId": "student-123",
      "studentName": "John Doe",
      "classId": "class-456",
      "className": "JSS 3A",
      "term": "First Term",
      "session": "2023/2024",
      "documentUrl": "https://res.cloudinary.com/..../report-card-1.pdf",
      "documentPublicId": "report-cards/student-123/...",
      "bytes": 245632,
      "uploadedById": "teacher-789",
      "status": "approved",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T11:00:00Z"
    },
    {
      "id": "report-card-2",
      "studentId": "student-124",
      "studentName": "Jane Smith",
      "classId": "class-456",
      "className": "JSS 3A",
      "term": "First Term",
      "session": "2023/2024",
      "documentUrl": "https://res.cloudinary.com/..../report-card-2.pdf",
      "documentPublicId": "report-cards/student-124/...",
      "bytes": 248192,
      "uploadedById": "teacher-789",
      "status": "approved",
      "createdAt": "2024-01-15T10:35:00Z",
      "updatedAt": "2024-01-15T11:05:00Z"
    }
  ]
}
```

**Error Responses:**

```json
// Student Attempting Access
{
  "statusCode": 403,
  "message": "students cannot view all report card"
}

// User Role Cannot Be Determined
{
  "statusCode": 403,
  "message": "user role cannot be determined"
}

// Server Error
{
  "statusCode": 500,
  "message": "Failed to get report cards"
}
```

#### Implementation Details

1. **Role Validation**: 
   - Checks if user has a valid role
   - Rejects students from accessing the endpoint

2. **Tenant Isolation**: 
   - Uses `getTenantId()` to ensure school isolation
   - Only returns report cards for the user's school

3. **Query Filtering**: 
   - Applies filters from query parameters
   - Supports multiple filter combinations

4. **Data Retrieval**: 
   - Delegates to `reportsService.getStudentsReportCard()`
   - Returns all matching report card records

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique report card ID |
| `studentId` | string | Student identifier |
| `studentName` | string | Student's full name |
| `classId` | string | Class identifier |
| `className` | string | Class name/code |
| `term` | string | Academic term |
| `session` | string | Academic session |
| `documentUrl` | string | Cloudinary URL to PDF |
| `documentPublicId` | string | Cloudinary public ID |
| `bytes` | number | PDF file size in bytes |
| `uploadedById` | string | ID of user who uploaded |
| `status` | string | Approval status (pending, approved, published, rejected) |
| `createdAt` | ISO8601 | Creation timestamp |
| `updatedAt` | ISO8601 | Last update timestamp |

#### Status Codes

| Code | Meaning | Scenario |
|------|---------|----------|
| 302 | Found | Report cards retrieved successfully |
| 400 | Bad Request | Invalid filter parameters |
| 401 | Unauthorized | JWT token missing or invalid |
| 403 | Forbidden | User role not valid or is student |
| 500 | Internal Server Error | Database or service error |

#### Use Cases

1. **Class Report Review**: Teachers retrieve all report cards for their class
2. **Admin Report Audit**: Admins review all report cards generated in a term
3. **Bulk Download**: Teachers get list of available reports for batch operations
4. **Report Status Check**: Verify which reports have been generated and approved

#### Filtering Examples

```bash
# Get all report cards for JSS 3A
GET /reports/report-cards?classId=class-456

# Get all report cards for First Term, 2023/2024 session
GET /reports/report-cards?term=First%20Term&session=2023/2024

# Get specific class report for specific term/session
GET /reports/report-cards?classId=class-456&term=First%20Term&session=2023/2024
```

---

## Complete Workflow Example

### Scenario: Generate and Retrieve a Student's Report Card

#### Step 1: Generate Report Card

```bash
# Teacher initiates report card generation for a student
curl -X GET "http://localhost:3000/reports/student/student-123/class-456/report-card/pdf?session=2023/2024&term=First%20Term" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "success": true,
  "message": "Report card generation has started, you will be notified when report card is already available for download",
  "data": null
}
```

#### Step 2: Background Processing (Queue Job)

The system adds a job to the BullMQ queue with the following workflow:

```
Job Added to Queue
      ↓
[Job Worker Picks Up]
      ↓
[Fetch Report Data]
  - Student information
  - Grades and scores
  - Assessment results
  - Computed averages
      ↓
[Generate PDF]
  - Use report template
  - Populate with student data
  - Format as printable PDF
      ↓
[Upload to Cloudinary]
  - Store PDF securely
  - Get secure URL
  - Get public ID for reference
      ↓
[Save to Database]
  - Create/Update reportCard record
  - Set status to 'approved'
  - Store metadata
      ↓
[Send Notification]
  - Email student: "Your report card is ready"
  - Notification in app
```

#### Step 3: Retrieve Generated Report Cards

```bash
# After generation completes, retrieve all report cards
curl -X GET "http://localhost:3000/reports/report-cards?classId=class-456&term=First%20Term&session=2023/2024" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "status": 302,
  "message": "report cards found successfully",
  "data": [
    {
      "id": "report-card-1",
      "studentId": "student-123",
      "studentName": "John Doe",
      "classId": "class-456",
      "className": "JSS 3A",
      "term": "First Term",
      "session": "2023/2024",
      "documentUrl": "https://res.cloudinary.com/...../report-card-1.pdf",
      "documentPublicId": "report-cards/student-123/First%20Term/2023-2024/1705316400000.pdf",
      "bytes": 245632,
      "uploadedById": "teacher-789",
      "status": "approved",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T11:00:00Z"
    }
  ]
}
```

#### Step 4: Download/Access Report Card

```bash
# Student can now access/download the PDF using the documentUrl
# The URL points directly to the Cloudinary hosted PDF
https://res.cloudinary.com/...../report-card-1.pdf
```

---

## Error Handling

### Common Errors and Solutions

#### 1. "Session and term are required"
**Status Code:** 400

**Cause:** Query parameters are missing

**Solution:** Include both `session` and `term` in the request:
```bash
GET /reports/student/student-123/class-456/report-card/pdf?session=2023/2024&term=First%20Term
```

#### 2. "You can only download your own report card"
**Status Code:** 403

**Cause:** Student is trying to access another student's report card

**Solution:** Students can only access their own report cards. Admins and teachers can access any student's report.

#### 3. "user role cannot be determined"
**Status Code:** 403

**Cause:** JWT token doesn't contain role information

**Solution:** Ensure the JWT token is valid and includes user roles. Re-authenticate if needed.

#### 4. "students cannot view all report card"
**Status Code:** 403

**Cause:** A student is trying to use the bulk retrieval endpoint

**Solution:** Only admins and teachers can use the `GET /reports/report-cards` endpoint. Students should request individual report cards.

#### 5. "Failed to generate report card"
**Status Code:** 500

**Cause:** Error during PDF generation or Cloudinary upload

**Solution:** 
- Check that the student has grades/assessments recorded
- Verify Cloudinary credentials are configured
- Check system logs for detailed error information

---

## Database Schema

### reportCard Table

```prisma
model ReportCard {
  id                String    @id @default(cuid())
  studentId         String
  term              String
  session           String
  schoolId          String
  documentUrl       String    // Cloudinary secure URL
  documentPublicId  String    // Public ID for reference
  bytes             Int       // File size
  uploadedById      String
  status            String    // 'pending', 'approved', 'published', 'rejected'
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  // Relations
  student           User      @relation(fields: [studentId], references: [id])
  school            School    @relation(fields: [schoolId], references: [id])
  uploadedBy        User      @relation(fields: [uploadedById], references: [id])

  @@unique([studentId, term, session, schoolId])
  @@index([schoolId])
  @@index([studentId])
}
```

---

## Queue Configuration

### BullMQ Job Configuration

```typescript
// Job added with these parameters:
{
  jobId: studentId,
  attempts: 3,              // Retry 3 times on failure
  backoff: 5000,            // 5 second delay between retries
  priority: null,           // Normal priority
  removeOnComplete: true,   // Remove job after success
  removeOnFail: false       // Keep failed jobs for debugging
}
```

---

## Security Considerations

### 1. Authentication
- All endpoints require valid JWT token
- Token must be passed in `Authorization: Bearer <token>` header

### 2. Authorization
- **Role-Based Access Control (RBAC)**:
  - Admin: Can access all report cards
  - Teacher: Can access report cards for their classes/students
  - Student: Can only access their own report cards
  - Others: Forbidden

### 3. Tenant Isolation
- Each school is isolated via `schoolId`
- Users can only access report cards from their school
- Multi-tenancy enforced at database level

### 4. Data Protection
- PDFs stored on Cloudinary (encrypted in transit)
- Secure URLs include access tokens
- File deletions require proper authorization

---

## Performance Optimization

### Bulk Processing Strategy

For large classes, the system uses **batching**:
- Process 3 students at a time
- Prevents resource exhaustion
- Maintains responsiveness

### Caching Opportunities
- Cache report parameters (session, term)
- Cache student-to-class mapping
- Cache approval status checks

### Database Optimization
- Unique constraint on `(studentId, term, session, schoolId)`
- Prevents duplicate generations
- Fast lookup for existing reports

---

## Related Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/reports/student/:studentId/report-card/preview` | Preview as HTML |
| GET | `/reports/class/:classId/report-cards/bulk-generate` | Bulk generate for class |
| GET | `/reports/class/:classId/report-cards/download` | Download combined PDF |
| POST | `/reports/submit-for-approval` | Submit for approval |
| POST | `/reports/approve` | Admin approval |
| GET | `/reports/approval-queue` | View pending approvals |

---

## Troubleshooting

### Report Card Not Appearing

1. **Check job queue status**
   ```bash
   # Check if job is processing
   # Look in BullMQ dashboard or logs
   ```

2. **Verify student has grades**
   - Ensure assessments are graded
   - Check if scores are published

3. **Check Cloudinary configuration**
   - Verify API credentials
   - Check upload permissions

### Slow Report Generation

1. **Batch processing**: Already optimized with 3-student batches
2. **Database optimization**: Ensure indexes are created
3. **Cloudinary rate limits**: Verify upload speed
4. **Server resources**: Check CPU/memory availability

### Duplicate Report Cards

1. **Unique constraint**: Database prevents true duplicates
2. **Status check**: Old reports may have 'pending' status
3. **Clean up**: Can delete pending reports and regenerate

---

## Best Practices

1. **Always include session and term**: Required for accurate report generation
2. **Check existing reports**: Don't unnecessarily regenerate
3. **Use bulk endpoints**: For class-wide operations
4. **Monitor queue health**: Ensure background jobs are processing
5. **Implement retry logic**: Handle transient failures gracefully
6. **Log student actions**: Audit who accessed which reports

