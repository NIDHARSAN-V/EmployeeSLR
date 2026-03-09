export const GetAllAssets = async () => {
    const result = await fetch("http://localhost:8000/assets")

    const tickets: Ticket[] = await result.json();

    return tickets;
}

export const GetAssetsByStatus = async (status: Status) => {
    const result = await fetch(`http://localhost:8000/assets/status/${status}`)

    const ticketsByStatus: Ticket[] = await result.json();

    return ticketsByStatus;
}
