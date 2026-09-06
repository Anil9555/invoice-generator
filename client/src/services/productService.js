const API_URL = "http://localhost:5000/api/products";

// Get all products/services
export const getProducts = async () => {
    const response = await fetch(API_URL);

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to fetch products"
        );
    }

    return data;
};


// Create product/service
export const createProduct = async (productData) => {
    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to create product"
        );
    }

    return data;
};


// Update product/service
export const updateProduct = async (id, productData) => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to update product"
        );
    }

    return data;
};


// Delete product/service
export const deleteProduct = async (id) => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to delete product"
        );
    }

    return data;
};