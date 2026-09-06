const API_URL = "http://localhost:5000/api/customers";

// Get all customers
export const getCustomers = async () => {
    const response = await fetch(API_URL);

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to fetch customers"
        );
    }

    return data;
};

// Create customer
export const createCustomer = async (customerData) => {
    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(customerData),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to create customer"
        );
    }

    return data;
};

// Update customer
export const updateCustomer = async (id, customerData) => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(customerData),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to update customer"
        );
    }

    return data;
};

// Delete customer
export const deleteCustomer = async (id) => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to delete customer"
        );
    }

    return data;
};