
import * as XLSX from "xlsx";
// Note: XLSX.writeFile handles download in browser.


// Since we are in the browser, XLSX.writeFile works well.

export const generateTemplate = (type: "students" | "teachers" | "questions" | "scores" | "comments") => {
  let data: any[] = [];
  let filename = `${type}_template.xlsx`;

  switch (type) {
    case "students":
      data = [
        {
          firstName: "John",
          lastName: "Doe",
          className: "JSS 1A",
          email: "john@example.com",
          dateOfBirth: "2010-01-01",
          gender: "Male",
          guardianName: "Jane Doe",
          guardianPhone: "08012345678"
        },
        {
          firstName: "Alice",
          lastName: "Smith",
          className: "JSS 1A",
          email: "",
          dateOfBirth: "",
          gender: "Female",
          guardianName: "",
          guardianPhone: ""
        }
      ];
      break;

    case "teachers":
      data = [
        {
          firstName: "Robert",
          lastName: "Brown",
          email: "robert@paralearn.com",
          phone: "08098765432",
          role: "teacher" // or subject_teacher, class_teacher
        }
      ];
      break;

    case "questions":
      data = [
        {
          questionText: "What is the capital of Nigeria?",
          type: "MCQ", // MCQ, SHORT_ANSWER, ESSAY
          marks: 5,
          optionA: "Lagos",
          optionB: "Abuja",
          optionC: "Kano",
          optionD: "Port Harcourt",
          correctAnswer: "Abuja" // content of the correct option
        },
        {
          questionText: "Explain the theory of relativity.",
          type: "ESSAY",
          marks: 20,
          optionA: "",
          optionB: "",
          optionC: "",
          optionD: "",
          correctAnswer: ""
        }
      ];
      break;

    case "scores":
      data = [
        {
          studentId: "STUDENT_ID_HERE",
          studentName: "John Doe (Reference Only)",
          score: 85
        }
      ];
      break;

    case "comments":
      data = [
        {
          studentId: "STUDENT_ID_HERE",
          studentName: "John Doe (Reference Only)",
          comment: "Excellent performance this term."
        }
      ];
      break;
  }

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);

  // Set column widths for better readability
  const wscols = Object.keys(data[0] || {}).map(() => ({ wch: 20 }));
  ws['!cols'] = wscols;

  XLSX.utils.book_append_sheet(wb, ws, "Template");

  // Write file
  XLSX.writeFile(wb, filename);
};
