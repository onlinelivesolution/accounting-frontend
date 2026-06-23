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

export const approveTenant = async (tenantID: number) => {
  return await api.put(`/api/tenants/approve/${tenantID}`);
};

export const getTenantById = async (tenantID: number) => {
  return await api.get(`/managetenants/getTenantById/${tenantID}`);
};
