import api from "../api/axiosClient";

export const registerTenant = async (payload: any) => {
    return await api.post(
        "/api/tenants/register",
        payload
    );
};

export const getPendingTenants = async () => {
    return await api.get(
        "/managetenants/getPendingTenants"
    );
};

export const updateTenantStatus = async (
    tenantID: number,
    status: string 
) => {
    return await api.put(
        `/managetenants/updateTenantStatus/${tenantID}`,
        { status }
    );
};

export const approveTenant = async (
    tenantID: number
) => {
    return await api.put(
        `/api/tenants/approve/${tenantID}`
    );
};