# Teacher CBT API Documentation

**Base URL**: `/api/assessments`
**Authorization**: Bearer Token (Teacher/Admin Role)

## 1. Create Assessment
**Endpoint**: `POST /assessments`
**Description**: Creates a new assessment with questions.

### Request Body
```json
{
  "title": "Biology Week 1 Test",
  "description": "Chapter 1-3",
  "subjectId": "subj_123",
  "categoryId": "cat_456", // e.g., ID for "Continuous Assessment"
  "startsAt": "2024-03-20T09:00:00Z", // Date string (ISO)
  "endsAt": "2024-03-20T18:00:00Z",
  "durationMins": 45,
  "instructions": "No calculators allowed.",
  "assessmentType": "online", // "online" for CBT, "offline" for paper
  "isPublished": false, // Set to true to publish immediately
  "questions": [
    {
      "questionText": "What is the powerhouse of the cell?",
      "questionType": "MCQ", // Enum: MCQ, TRUE_FALSE, ESSAY, MULTI_SELECT
      "marks": 2,
      "options": [
        { "text": "Nucleus", "isCorrect": false },
        { "text": "Mitochondria", "isCorrect": true },
        { "text": "Ribosome", "isCorrect": false }
      ]
    },
    {
      "questionText": "Describe the process of osmosis.",
      "questionType": "ESSAY",
      "marks": 5,
      "explanation": "Movement of water molecules..." // Optional teacher note
    }
  ]
}
```

### Explanations
- **categoryId**: Get list from `GET /assessment-categories`.
- **options**: Required for `MCQ`, `TRUE_FALSE`, `MULTI_SELECT`.
- **isCorrect**: **Vital for auto-grading**. Ensure exactly one is true for MCQ.

---

## 2. Publish Assessment
**Endpoint**: `POST /assessments/:id/publish`
**Description**: Makes the assessment visible to students.

### Request Body
```json
{
  "publish": true
}
```

---

## 3. List Assessments
**Endpoint**: `GET /assessments/:status`
**Params**: `status` = `started` | `ended` | `not_started`
**Description**: Lists assessments created by the teacher.

---

## 4. Get Submissions
**Endpoint**: `GET /assessments/:id/submissions`
**Description**: Lists all student submissions for a specific assessment.

### Response includes:
- Student details
- Total Score
- `answers` array (with individual marks per question)

---

## 5. Grade Manually
**Endpoint**: `POST /assessments/submissions/:submissionId/answers/:answerId/grade`
**Description**: Assigns marks to a specific answer (e.g., Essay).

### Request Body
```json
{
  "marksAwarded": 4.5,
  "comment": "Good explanation but missed the keyword."
}
```
