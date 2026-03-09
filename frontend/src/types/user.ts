export type Role = "EMPLOYEE" | "RESOLVER" | "ADMIN";

export interface User {
  id: string;
  email: string;
  role: Role;
}

export interface UserModel {
  id: string;
  name: string;
  role: Role;
  email: string;
}
