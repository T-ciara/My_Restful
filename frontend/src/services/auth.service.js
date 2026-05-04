import api from "./api";

export const signup    = (data)          => api.post("/auth/signup", data);
export const verifyOtp = (email, otp)    => api.post("/auth/verify-otp", { email, otp });
export const resendOtp = (email)         => api.post("/auth/resend-otp", { email });
export const login     = (data)          => api.post("/auth/login", data);
