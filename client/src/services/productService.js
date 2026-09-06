import apiRequest from "./api";

export const getProducts = async () => {
    return await apiRequest("/products");
};

export const createProduct = async (productData) => {
    return await apiRequest("/products", {
        method: "POST",
        body: JSON.stringify(productData),
    });
};

export const updateProduct = async (id, productData) => {
    return await apiRequest(`/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(productData),
    });
};

export const deleteProduct = async (id) => {
    return await apiRequest(`/products/${id}`, {
        method: "DELETE",
    });
};