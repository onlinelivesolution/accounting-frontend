import api from "../api/axiosClient";

export const registerTenant = async (payload: any) => {
  return await api.post("/api/tenants/register", payload);
};

export const getAllTenants = async () => {
  return await api.get("/managetenants/getAllTenants");
};

export const updateTenantStatus = async (tenantID: number, status: string) => {
  return await api.put(`/managetenants/updateTenantStatus/${tenantID}`, {
    status,
  });
};

export const approveTenantB = async (tenantID: number) => {
  return await api.put(`/api/tenants/approve/${tenantID}`);
};

export const getTenantById = async (tenantID: number) => {
  return await api.get(`/managetenants/getTenantById/${tenantID}`);
};

export const approveTenant = async (tenantId: number) => {
  const response = await api.put(
    `/managetenants/approveTenant/${tenantId}`
  );

  return response.data;
};
