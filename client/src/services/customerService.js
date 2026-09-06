import apiRequest from "./api";

export const getCustomers = async () => {
    return await apiRequest("/customers");
};

export const createCustomer = async (customerData) => {
    return await apiRequest("/customers", {
        method: "POST",
        body: JSON.stringify(customerData),
    });
};

export const updateCustomer = async (id, customerData) => {
    return await apiRequest(`/customers/${id}`, {
        method: "PUT",
        body: JSON.stringify(customerData),
    });
};

export const deleteCustomer = async (id) => {
    return await apiRequest(`/customers/${id}`, {
        method: "DELETE",
    });
};