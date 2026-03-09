import api from "./api";
import { Ticket } from "@/types/ticket";
import { Status } from "@/types/status";

export const GetAllTickets = async (): Promise<Ticket[]> => {
  const result = await api.get<Ticket[]>("/tickets");
  return result.data;
};

export const GetTicketsByStatus = async (status: Status): Promise<Ticket[]> => {
  const result = await api.get<Ticket[]>(`/tickets/status/${status}`);
  return result.data;
};

export const GetTicketsAcceptedByUser = async (userId: string): Promise<Ticket[]> => {
  const result = await api.get<Ticket[]>(`/tickets/accepted/${userId}`);
  return result.data;
};


export const AcceptTicket = async (id: string, userId: string): Promise<Ticket> => {
  const result = await api.post<Ticket>(`/tickets/${id}/accept`, { accepted_by: userId });
  return result.data;
};


export const CompleteTicket = async (id: string, userId: string): Promise<Ticket> => {
  const result = await api.post<Ticket>(`/tickets/${id}/complete`, { completed_by: userId });
  return result.data;
};
