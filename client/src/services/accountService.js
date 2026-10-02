import apiRequest from "./api";

export const getAccount = async () => {
  return apiRequest("/account");
};

export const updateAccount = async (accountData) => {
  return apiRequest("/account", {
    method: "PUT",
    body: JSON.stringify(accountData),
  });
};

export const changePassword = async (passwordData) => {
  return apiRequest("/account/password", {
    method: "PUT",
    body: JSON.stringify(passwordData),
  });
};
