import api from "./api";

export const getAllUsers  = ()       => api.get("/users");
export const createUser  = (data)   => api.post("/users", data);
export const deleteUser  = (id)     => api.delete(`/users/${id}`);
