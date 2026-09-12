import apiRequest from "./api";



export const getQuotations = async () => {
    return apiRequest("/quotations");
};

export const getQuotationById = async (id) => {
    return apiRequest(`/quotations/${id}`);
};

export const createQuotation = async (quotationData) => {
    return apiRequest("/quotations", {
        method: "POST",
        body: JSON.stringify(quotationData),
    });
};

export const updateQuotation = async (id, quotationData) => {
    return apiRequest(`/quotations/${id}`, {
        method: "PUT",
        body: JSON.stringify(quotationData),
    });
};

export const deleteQuotation = async (id) => {
    return apiRequest(`/quotations/${id}`, {
        method: "DELETE",
    });
};