export default interface RequestRow {
  id: string;
  issue: string;
  type: string;
  raisedBy: string;
  acceptedBy?: string | null;
  acceptDueAt?: string | null;
  completeDueAt?: string | null;
};