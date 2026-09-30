import apiRequest from "./api";

export const getDashboardSummary = async (query = "") => {
  const url = query
  ? `/dashboard/summary?${query}`
  : "/dashboard/summary";

  return apiRequest(url);
};