import api from "./api";
import {
  DiscussionKind,
  DiscussionThread,
} from "@/types/discussion";

export const GetDiscussionMessages = async (
  kind: DiscussionKind,
  id: string
): Promise<DiscussionThread> => {
  const result = await api.get<DiscussionThread>(`/discussion/${kind}/${id}`);
  return result.data;
};

export const AddDiscussionMessage = async (
  kind: DiscussionKind,
  id: string,
  payload: { userId: string; message: string }
): Promise<DiscussionThread> => {
  const result = await api.post<DiscussionThread>(
    `/discussion/${kind}/${id}/message`,
    payload
  );
  return result.data;
};
