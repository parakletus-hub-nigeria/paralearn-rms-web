import apiClient from "@/lib/api";
import { downloadBlob, safeFilename } from "@/lib/download";

const tryGetFilenameFromHeaders = (headers: any): string | null => {
  const cd: string | undefined =
    headers?.["content-disposition"] || headers?.["Content-Disposition"];
  if (!cd) return null;
  const match = cd.match(/filename\*?=(?:UTF-8'')?\"?([^\";]+)\"?/i);
  if (!match?.[1]) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
};

export async function downloadStudentReportCardPdf(params: {
  studentId: string;
  classId: string;
  session: string;
  term: string;
}) {
  const url = `/api/proxy/reports/student/${encodeURIComponent(
    params.studentId
  )}/${encodeURIComponent(params.classId)}/report-card/pdf?session=${encodeURIComponent(params.session)}&term=${encodeURIComponent(
    params.term
  )}`;

  // Expect JSON response with documentUrl
  const res = await apiClient.get(url);
  const data = res.data;

  if (data.success && data.data?.documentUrl) {
    const pdfUrl = data.data.documentUrl;
    
    // Fetch the PDF blob from the URL
    const pdfRes = await fetch(pdfUrl);
    const blob = await pdfRes.blob();
    
    const filename = safeFilename(
      `report-card-${params.studentId}-${params.session}-${params.term}.pdf`
    );
    downloadBlob(blob, filename);
  } else {
    console.error("Failed to generate report card", data);
    throw new Error(data.message || "Failed to generate report card");
  }
}

export async function bulkGenerateClassReportCards(params: {
  classId: string;
  session: string;
  term: string;
  format: "individual" | "combined";
}) {
  const url = `/api/proxy/reports/class/${encodeURIComponent(
    params.classId
  )}/report-cards/bulk-generate?session=${encodeURIComponent(
    params.session
  )}&term=${encodeURIComponent(params.term)}&format=${encodeURIComponent(params.format)}`;

  const res = await apiClient.get(url, { responseType: "blob" });
  const blob = res.data as Blob;
  const headerName = tryGetFilenameFromHeaders(res.headers);
  const filename =
    headerName ||
    safeFilename(
      `class-report-cards-${params.classId}-${params.session}-${params.term}-${params.format}.pdf`
    );
  downloadBlob(blob, filename);
}

export async function downloadCombinedClassReportCards(params: {
  classId: string;
  session: string;
  term: string;
}) {
  const url = `/api/proxy/reports/class/${encodeURIComponent(
    params.classId
  )}/report-cards/download?session=${encodeURIComponent(
    params.session
  )}&term=${encodeURIComponent(params.term)}`;

  const res = await apiClient.get(url, { responseType: "blob" });
  const blob = res.data as Blob;
  const headerName = tryGetFilenameFromHeaders(res.headers);
  const filename =
    headerName ||
    safeFilename(
      `class-report-cards-${params.classId}-${params.session}-${params.term}-combined.pdf`
    );
  downloadBlob(blob, filename);
}

