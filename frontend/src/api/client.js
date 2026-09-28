import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
});

export function extractErrorMessage(error) {
  return error?.response?.data?.detail || error?.message || "Something went wrong.";
}

export async function uploadDocument(file) {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post("/documents/upload", formData);
  return data;
}

export async function fetchDocument(sessionId) {
  const { data } = await api.get(`/documents/${sessionId}`);
  return data;
}

export async function sendChatMessage(sessionId, message) {
  const { data } = await api.post(`/documents/${sessionId}/chat`, { message });
  return data;
}

export async function sendReportEmail(sessionId, email) {
  const { data } = await api.post(`/documents/${sessionId}/email`, { email });
  return data;
}

export async function clearSession(sessionId) {
  const { data } = await api.delete(`/documents/${sessionId}`);
  return data;
}

export function summaryDownloadUrl(sessionId) {
  return `${api.defaults.baseURL}/documents/${sessionId}/summary/download`;
}

export function riskChartUrl(sessionId) {
  return `${api.defaults.baseURL}/documents/${sessionId}/risks/chart`;
}

export async function downloadFile(url, filename) {
  const response = await fetch(url);
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.detail || "Download failed.");
  }
  const blob = await response.blob();
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export default api;
