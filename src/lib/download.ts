export const downloadBlob = (blob: Blob, filename: string) => {
  if (typeof window === "undefined") return;
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

export const safeFilename = (name: string) =>
  name
    .replace(/[\/\\?%*:|"<>]/g, "-")
    .replace(/\s+/g, "_")
    .slice(0, 180);

