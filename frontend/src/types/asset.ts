interface Asset {
  kind: string,
  refId: string,
  request_type: string,
  status:  Status,
  raised_by: string,
  accepted_by: string | null,
  completed_by: string | null,
  createdAt: string | null,
  acceptedAt: string | null,
  completedAt: string| null,
  acceptDueAt: string | null,
  completeDueAt: string | null,
};
