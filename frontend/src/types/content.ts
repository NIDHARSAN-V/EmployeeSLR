export interface DiscussionMessage {
  _id: string;
  userId: string;
  message: string;
  createdAt: string;
}

export interface Content {
  kind: "ticket" | "asset";
  refId: string;
  messages: DiscussionMessage[];
}