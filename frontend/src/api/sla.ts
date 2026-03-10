import api from "./api";
import { Ticket } from "@/types/ticket";
import { Asset } from "@/types/asset";

interface SLATicket {
    refId: string;
    request_type: string;
    eventId?: string;
    status: string;
    raised_by: string;
    acceptedBy?: string;
    completed_by?: string;
    createdAt: string;
    acceptedAt?: string;
    completedAt?: string;
    acceptDueAt: string;
    completeDueAt?: string;
    deadlineType: string;
    isOverdue: boolean;
    [key: string]: any;
}

interface SLAAsset {
    refId: string;
    request_type: string;
    eventId?: string;
    status: string;
    raised_by: string;
    acceptedBy?: string;
    completed_by?: string;
    createdAt: string;
    acceptedAt?: string;
    completedAt?: string;
    acceptDueAt: string;
    completeDueAt?: string;
    deadlineType: string;
    isOverdue: boolean;
    [key: string]: any;
}


export type SLAResource = SLATicket | SLAAsset;

export const GetBreachedResource = async (id: string): Promise<SLAResource[]> => {
    const result = await api.get<{ mode: string; role: string; items: SLAResource[] }>(`/notifications/ended/${id}`);
    return result.data.items;
};


