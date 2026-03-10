export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "") ?? "http://135.235.195.238:8000";

/**
 * Build a fully-qualified API URL.
 *
 * @param path - endpoint path (can start with or without `/`)
 */
export function apiUrl(path: string): string {
  const trimmedPath = path.replace(/^\//, "");
  return `${API_BASE_URL}/${trimmedPath}`;
}
