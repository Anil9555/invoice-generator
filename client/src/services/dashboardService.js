import apiRequest from "./api";

export const getDashboardSummary = async () => {
    return apiRequest("/dashboard/summary");
};