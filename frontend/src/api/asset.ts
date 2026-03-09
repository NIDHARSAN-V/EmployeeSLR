import api from "./api";

export const GetAllAssets = async () => {
  const result = await api.get<Ticket[]>("/assets");
  return result.data;
};

export const GetAssetsByStatus = async (status: Status) => {
  const result = await api.get<Ticket[]>(`/assets/status/${status}`);
  return result.data;
};