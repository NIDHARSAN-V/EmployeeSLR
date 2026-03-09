import { UserModel } from "@/types/user";
import api from "./api";

export const GetAllUsers = async () => {
  const result = await api.get<UserModel[]>("/auth/all");
  return result.data;
};

export const GetUserById = async (id: string) => {
  const result = await api.get<{ success: boolean; message: string; user: UserModel }>(`/auth/${id}`);
  console.log(result.data);
  return result.data.user;
};