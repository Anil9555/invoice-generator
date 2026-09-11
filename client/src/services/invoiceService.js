import apiRequest from "./api";

export const getInvoices = async () => {
    return apiRequest("/invoices");
};

export const getInvoiceById = async (id) => {
    return apiRequest(`/invoices/${id}`);
};

export const createInvoice = async (invoiceData) => {
    return apiRequest("/invoices", {
        method: "POST",
        body: JSON.stringify(invoiceData),
    });
};

export const updateInvoice = async (id, invoiceData) => {
    return apiRequest(`/invoices/${id}`, {
        method: "PUT",
        body: JSON.stringify(invoiceData),
    });
};

export const deleteInvoice = async (id) => {
    return apiRequest(`/invoices/${id}`, {
        method: "DELETE",
    });
};