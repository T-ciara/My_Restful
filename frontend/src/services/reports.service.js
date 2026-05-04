import api from "./api";

export const getOutgoingReport = (startDate, endDate) => {
  const params = startDate && endDate ? `?startDate=${startDate}&endDate=${endDate}` : "";
  return api.get(`/reports/outgoing${params}`);
};

export const getEntriesReport = (startDate, endDate) => {
  const params = startDate && endDate ? `?startDate=${startDate}&endDate=${endDate}` : "";
  return api.get(`/reports/entries${params}`);
};
