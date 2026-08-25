import api from "@/utils/axios";

export interface TenantBannerResponse {
  bannerPath: string | null;
}

export const getTenantBanner = async (): Promise<TenantBannerResponse> => {
  const response = await api.get<TenantBannerResponse>("/api/tenant/banner");

  return response.data;
};

export const uploadTenantBanner = async (
  file: File,
): Promise<TenantBannerResponse> => {
  const formData = new FormData();

  formData.append("file", file);

  const response = await api.post<TenantBannerResponse>(
    "/api/tenant/banner",
    formData,
  );

  return response.data;
};
