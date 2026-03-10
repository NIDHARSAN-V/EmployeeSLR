export enum Role {
  EMPLOYEE = "EMPLOYEE",
  RESOLVER = "RESOLVER",
  ADMIN = "ADMIN"
}


export interface IUser extends Document {
  userName: string;
  email: string;
  password: string;
  role: Role;
}