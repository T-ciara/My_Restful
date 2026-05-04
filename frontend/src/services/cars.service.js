import api from "./api";

export const carEntry       = (data)        => api.post("/cars/entry", data);
export const carExit        = (plateNumber) => api.put(`/cars/exit/${plateNumber}`);
export const getActiveCars  = ()            => api.get("/cars/active");
export const deleteCarEntry = (id)          => api.delete(`/cars/${id}`);
