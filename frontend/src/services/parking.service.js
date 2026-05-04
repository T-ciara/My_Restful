import api from "./api";

export const getAllParking     = ()            => api.get("/parking");
export const getParkingByCode = (code)        => api.get(`/parking/${code}`);
export const createParking    = (data)        => api.post("/parking", data);
export const updateParking    = (code, data)  => api.put(`/parking/${code}`, data);
export const deleteParking    = (code)        => api.delete(`/parking/${code}`);
