import api from "./api";

export const GetAllTickets = async () => {
  const result = await api.get<Ticket[]>("/tickets");
  return result.data;
};

export const GetTicketsByStatus = async (status: Status) => {
  const result = await api.get<Ticket[]>(`/tickets/status/${status}`);
  return result.data;
};