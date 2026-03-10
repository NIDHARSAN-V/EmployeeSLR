export type DiscussionKind = "ticket" | "asset";

export interface DiscussionMessage {
  userId: string;
  message: string;
  createdAt: string;
}

export interface DiscussionThread {
  kind: DiscussionKind;
  refId: string;
  messages: DiscussionMessage[];
}
