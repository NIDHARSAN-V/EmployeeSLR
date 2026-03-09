export const GetAllTickets = async () => {
    const result = await fetch("http://localhost:8000/tickets")

    const tickets: Ticket[] = await result.json();

    return tickets;
}

export const GetTicketsByStatus = async (status: Status) => {
    const result = await fetch(`http://localhost:8000/tickets/status/${status}`)

    const ticketsByStatus: Ticket[] = await result.json();

    return ticketsByStatus;
}
