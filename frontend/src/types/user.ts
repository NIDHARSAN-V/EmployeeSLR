export type Role = "EMPLOYEE" | "RESOLVER" | "ADMIN";

export interface User {
  id: string;
  email: string;
  role: Role;
}
