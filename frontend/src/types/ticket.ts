export interface Ticket {
    kind: string,
    refId: string,
    request_type: string,
    status: string,
    raised_by: string,
    accepted_by: string | null,
    completed_by: string | null,
    createdAt: string,
    acceptedAt: string | null,
    completedAt: string | null,
    acceptDueAt: string | null,
    completeDueAt: string | null,
}