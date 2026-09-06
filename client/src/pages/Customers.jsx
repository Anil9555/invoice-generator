import { useEffect, useState } from "react";

import Button from "../components/Button";
import Input from "../components/Input";
import Card from "../components/Card";
import Modal from "../components/Modal";
import Table from "../components/Table";

import {
    getCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
} from "../services/customerService";

function Customers() {
    const [customers, setCustomers] = useState([]);

    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [editingCustomer, setEditingCustomer] = useState(null);

    const [deletingId, setDeletingId] = useState(null);

    const [search, setSearch] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        company_name: "",
        email: "",
        phone: "",
    });

    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const loadCustomers = async () => {  // Load customers from the API
            try {
                const data = await getCustomers();

                setCustomers(data.data);
            } catch (error) {
                console.error("Error fetching customers:", error);
            } finally {
                setLoading(false);
            }
        };

        loadCustomers();
    }, []);


    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };


    const openAddModal = () => {
        setEditingCustomer(null);

        setFormData({
            name: "",
            company_name: "",
            email: "",
            phone: "",
        });

        setIsModalOpen(true);
    };


    const openEditModal = (customer) => {
        setEditingCustomer(customer);

        setFormData({
            name: customer.name,
            company_name: customer.company_name,
            email: customer.email,
            phone: customer.phone,
        });

        setIsModalOpen(true);
    };


    const handleSubmit = async (event) => {
        event.preventDefault();

        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = "Customer name is required.";
        }

        if (formData.email.trim()) {
            const email = formData.email.trim();

            const emailRegex =
                /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

            if (!emailRegex.test(email)) {
                newErrors.email = "Please enter a valid email address.";
            }
        }

        if (formData.phone.trim()) {
            const phone = formData.phone.trim();

            const phoneRegex = /^[6-9][0-9]{9}$/;

            if (!phoneRegex.test(phone)) {
                newErrors.phone =
                    "Please enter a valid 10-digit Indian mobile number.";
            }
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            return;
        }

        setSaving(true);

        try {
            if (editingCustomer) {
                await updateCustomer(
                    editingCustomer.id,
                    formData
                );

                setCustomers((previous) =>
                    previous.map((customer) =>
                        customer.id === editingCustomer.id
                            ? {
                                ...customer,
                                ...formData,
                            }
                            : customer
                    )
                );
            } else {
                const data = await createCustomer(formData);

                setCustomers((previous) => [
                    data.data,
                    ...previous,
                ]);
            }

            setIsModalOpen(false);
            setErrors({});

        } catch (error) {
            console.error("Customer error:", error);
            alert(error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this customer?"
        );

        if (!confirmed) return;

        setDeletingId(id);

        try {
            await deleteCustomer(id);

            setCustomers((prev) =>
                prev.filter((customer) => customer.id !== id)
            );
        } catch (error) {
            console.error("Delete customer error:", error);
            alert(error.message);
        } finally {
            setDeletingId(null);
        }
    };

    const filteredCustomers = customers.filter((customer) => {

        const searchText = search.toLowerCase();

        return (
            customer.name.toLowerCase().includes(searchText) ||
            customer.company_name.toLowerCase().includes(searchText) ||
            customer.email.toLowerCase().includes(searchText) ||
            customer.phone.toLowerCase().includes(searchText)
        );
    });


    const columns = [
        {
            key: "name",
            label: "Name",
        },
        {
            key: "company_name",
            label: "Company",
        },
        {
            key: "email",
            label: "Email",
        },
        {
            key: "phone",
            label: "Phone",
        },
        {
            key: "actions",
            label: "Actions",
            render: (customer) => (
                <div className="table-actions">

                    <Button
                        variant="secondary"
                        onClick={() => openEditModal(customer)}
                    >
                        Edit
                    </Button>

                    <Button
                        variant="danger"
                        onClick={() => handleDelete(customer.id)}
                        disabled={deletingId === customer.id}
                    >
                        {deletingId === customer.id ? "Deleting..." : "Delete"}
                    </Button>

                </div>
            ),
        },
    ];


    return (
        <div className="customers-page">

            {/* Header */}

            <div className="page-header">

                <div>
                    <h1>Customers</h1>

                    <p>
                        Manage your customers and their information.
                    </p>
                </div>

                <Button onClick={openAddModal}>
                    + Add Customer
                </Button>

            </div>


            {/* Customer List */}

            <Card>

                <div className="customer-toolbar">

                    <Input
                        label=""
                        name="search"
                        placeholder="Search customers..."
                        value={search}
                        onChange={(event) =>
                            setSearch(event.target.value)
                        }
                    />

                </div>


                {loading ? (
                    <p>Loading customers...</p>
                ) : (
                    <Table
                        columns={columns}
                        data={filteredCustomers}
                        emptyMessage={
                            search
                                ? "No customers match your search."
                                : "No customers added yet."
                        }
                    />
                )}

            </Card>


            {/* Add/Edit Modal */}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={
                    editingCustomer
                        ? "Edit Customer"
                        : "Add Customer"
                }
            >

                <form onSubmit={handleSubmit}>

                    <Input
                        label="Customer Name"
                        name="name"
                        placeholder="Enter customer name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />

                    {errors.name && (
                        <p className="form-error">
                            {errors.name}
                        </p>
                    )}


                    <Input
                        label="Company Name"
                        name="company_name"
                        placeholder="Enter company name"
                        value={formData.company_name}
                        onChange={handleChange}
                    />


                    <Input
                        label="Email"
                        type="email"
                        name="email"
                        placeholder="customer@example.com"
                        value={formData.email}
                        onChange={handleChange}
                    />

                    {errors.email && (
                        <p className="form-error">
                            {errors.email}
                        </p>
                    )}


                    <Input
                        label="Phone"
                        type="tel"
                        name="phone"
                        placeholder="Enter phone number"
                        value={formData.phone}
                        onChange={handleChange}
                    />

                    {errors.phone && (
                        <p className="form-error">
                            {errors.phone}
                        </p>
                    )}


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

                        <Button type="submit" disabled={saving}>
                            {saving
                                ? "Saving..."
                                : editingCustomer
                                    ? "Update Customer"
                                    : "Add Customer"}
                        </Button>

                    </div>

                </form>

            </Modal>

        </div>
    );
}

export default Customers;