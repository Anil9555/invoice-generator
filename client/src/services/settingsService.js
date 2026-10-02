import apiRequest from "./api";

export const getSettings = async () => {
  return apiRequest("/settings");
};

export const saveSettings = async (settingsData) => {
  return apiRequest("/settings", {
    method: "PUT",
    body: JSON.stringify(settingsData),
  });
};
