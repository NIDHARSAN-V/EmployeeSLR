export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "") ?? "http://localhost:8000";

export function apiUrl(path: string): string {
  const trimmedPath = path.replace(/^\//, "");
  return `${API_BASE_URL}/${trimmedPath}`;
}
