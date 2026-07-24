// import api from "../lib/axios";
import api from "@/utils/axios";

export interface DetailItemCreateRequest {
  accountType: string;
  detailItemName: string;
  openingBalance?: number;
  loadType?: string;
}

export interface DetailItemRead {
  detailItemCode: string;
  detailItemName: string;
  reportingItemCode: string;
  normalBalance: string;
  isActive: boolean;
  loadType: string;
}

export const createDetailItem = async (
  payload: DetailItemCreateRequest
): Promise<DetailItemRead> => {
  try {
    const response = await api.post<DetailItemRead>(
      "/api/detailitems/auto-create",
      payload
    );

    return response.data;
  } catch (error: any) {
    // backend validation / business error
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }

    // fallback error
    throw new Error("Unable to create Detail Item");
  }
};
