import { Content } from "@/types/content";
import api from "./api";

export const GetMessages = async (kind: string, id: string): Promise<Content> => {
  const result = await api.get<Content>(`/discussion/${kind}/${id}`);
  return result.data;
};