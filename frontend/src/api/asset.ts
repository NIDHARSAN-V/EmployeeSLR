import api from "./api";
import { Asset } from "@/types/asset";
import { Status } from "@/types/status";

export const GetAllAssets = async (): Promise<Asset[]> => {
  const result = await api.get<Asset[]>("/assets");
  return result.data;
};

export const GetAssetsByStatus = async (status: Status): Promise<Asset[]> => {
  const result = await api.get<Asset[]>(`/assets/status/${status}`);
  return result.data;
};

export const GetAssetsAcceptedByUser = async (userId: string): Promise<Asset[]> => {
  const result = await api.get<Asset[]>(`/assets/accepted/${userId}`);
  return result.data;
};


export const AcceptAsset = async (id: string, userId: string): Promise<Asset> => {
  const result = await api.post<Asset>(`/assets/${id}/accept`, { accepted_by: userId });
  return result.data;
};


export const CompleteAsset = async (id: string, userId: string): Promise<Asset> => {
  const result = await api.post<Asset>(`/assets/${id}/complete`, { completed_by: userId });
  return result.data;
};
