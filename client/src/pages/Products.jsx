import { useEffect, useState } from "react";

import Button from "../components/Button";
import Input from "../components/Input";
import Card from "../components/Card";
import Modal from "../components/Modal";
import Table from "../components/Table";

import {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
} from "../services/productService";


function Products() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const [search, setSearch] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        type: "product",
        price: "",
        tax_rate: "",
    });


    // Load products
    useEffect(() => {
        const loadProducts = async () => {
            try {
                const data = await getProducts();

                setProducts(data.data);
            } catch (error) {
                console.error("Error fetching products:", error);
            } finally {
                setLoading(false);
            }
        };

        loadProducts();
    }, []);


    // Handle form changes
    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };


    // Open Add Modal
    const openAddModal = () => {
        setEditingProduct(null);

        setFormData({
            name: "",
            description: "",
            type: "product",
            price: "",
            tax_rate: "",
        });

        setIsModalOpen(true);
    };


    // Open Edit Modal
    const openEditModal = (product) => {
        setEditingProduct(product);

        setFormData({
            name: product.name || "",
            description: product.description || "",
            type: product.type || "product",
            price: product.price || "",
            tax_rate: product.tax_rate || "",
        });

        setIsModalOpen(true);
    };


    // Submit form
    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!formData.name.trim()) {
            alert("Product/Service name is required.");
            return;
        }

        if (formData.price === "") {
            alert("Price is required.");
            return;
        }

        try {
            // EDIT
            if (editingProduct) {
                await updateProduct(
                    editingProduct.id,
                    formData
                );

                setProducts((previous) =>
                    previous.map((product) =>
                        product.id === editingProduct.id
                            ? {
                                ...product,
                                ...formData,
                            }
                            : product
                    )
                );
            }

            // ADD
            else {
                const data = await createProduct(formData);

                setProducts((previous) => [
                    data.data,
                    ...previous,
                ]);
            }

            setIsModalOpen(false);

        } catch (error) {
            console.error("Product error:", error);

            alert(error.message);
        }
    };


    // Delete product
    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this product/service?"
        );

        if (!confirmed) {
            return;
        }

        try {
            await deleteProduct(id);

            setProducts((previous) =>
                previous.filter(
                    (product) => product.id !== id
                )
            );

        } catch (error) {
            console.error(
                "Delete product error:",
                error
            );

            alert(error.message);
        }
    };


    // Search
    const filteredProducts = products.filter((product) => {
        const searchText = search.toLowerCase();

        return (
            product.name
                .toLowerCase()
                .includes(searchText) ||

            (product.description || "")
                .toLowerCase()
                .includes(searchText)
        );
    });


    // Table columns
    const columns = [
        {
            key: "name",
            label: "Name",
        },

        {
            key: "type",
            label: "Type",

            render: (product) =>
                product.type === "service"
                    ? "Service"
                    : "Product",
        },

        {
            key: "price",
            label: "Price",

            render: (product) =>
                `₹${Number(product.price).toFixed(2)}`,
        },

        {
            key: "tax_rate",
            label: "Tax",

            render: (product) =>
                `${Number(product.tax_rate || 0)}%`,
        },

        {
            key: "actions",
            label: "Actions",

            render: (product) => (
                <div className="table-actions">

                    <Button
                        variant="secondary"
                        onClick={() =>
                            openEditModal(product)
                        }
                    >
                        Edit
                    </Button>

                    <Button
                        variant="danger"
                        onClick={() =>
                            handleDelete(product.id)
                        }
                    >
                        Delete
                    </Button>

                </div>
            ),
        },
    ];


    return (
        <div className="products-page">

            {/* Header */}
            <div className="page-header">

                <div>
                    <h1>Products & Services</h1>

                    <p>
                        Manage your products and services.
                    </p>
                </div>

                <Button onClick={openAddModal}>
                    + Add Product / Service
                </Button>

            </div>


            {/* Products Card */}
            <Card>

                <div className="customer-toolbar">

                    <Input
                        label=""
                        name="search"
                        placeholder="Search products/services..."
                        value={search}
                        onChange={(event) =>
                            setSearch(event.target.value)
                        }
                    />

                </div>


                {loading ? (
                    <p>Loading products...</p>
                ) : (
                    <Table
                        columns={columns}
                        data={filteredProducts}
                        emptyMessage={
                            search
                                ? "No products/services match your search."
                                : "No products/services added yet."
                        }
                    />
                )}

            </Card>


            {/* Add/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() =>
                    setIsModalOpen(false)
                }
                title={
                    editingProduct
                        ? "Edit Product / Service"
                        : "Add Product / Service"
                }
            >

                <form onSubmit={handleSubmit}>

                    <Input
                        label="Name"
                        name="name"
                        placeholder="e.g. Website Development"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />


                    <Input
                        label="Description"
                        name="description"
                        placeholder="Enter description"
                        value={formData.description}
                        onChange={handleChange}
                    />


                    <div className="form-group">

                        <label>Type</label>

                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                        >
                            <option value="product">
                                Product
                            </option>

                            <option value="service">
                                Service
                            </option>
                        </select>

                    </div>


                    <Input
                        label="Price"
                        type="number"
                        name="price"
                        placeholder="Enter price"
                        value={formData.price}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        required
                    />


                    <Input
                        label="Tax Rate (%)"
                        type="number"
                        name="tax_rate"
                        placeholder="e.g. 18"
                        value={formData.tax_rate}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                    />


                    <div className="modal-actions">

                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() =>
                                setIsModalOpen(false)
                            }
                        >
                            Cancel
                        </Button>

                        <Button type="submit">
                            {editingProduct
                                ? "Update Product"
                                : "Add Product"}
                        </Button>

                    </div>

                </form>

            </Modal>

        </div>
    );
}


export default Products;