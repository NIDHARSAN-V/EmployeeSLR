export const API_BASE_URL = "http://localhost:8000";

export function apiUrl(path: string): string {
  const trimmedPath = path.replace(/^\//, "");
  return `${API_BASE_URL}/${trimmedPath}`;
}
