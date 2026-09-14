import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    getQuotations,
    createQuotation,
    deleteQuotation,
} from "../services/quotationService";
import { getCustomers } from "../services/customerService";
import { getProducts } from "../services/productService";
import Button from "../components/Button";
import Input from "../components/Input";
import { formatDate } from "../utils/formatDate";

function Quotations() {
    const navigate = useNavigate();

    const [quotations, setQuotations] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);

    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState("");

    

    const [formData, setFormData] = useState({
        customer_id: "",
        quotation_number: "",
        issue_date: "",
        valid_until: "",
        discount_type: "fixed",
        discount_value: 0,
        notes: "",
    });

    const [items, setItems] = useState([
        {
            product_id: "",
            quantity: 1,
            discount_type: "fixed",
            discount_value: 0,
        },
    ]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError("");

            const [quotationResponse, customerResponse, productResponse] =
                await Promise.all([
                    getQuotations(),
                    getCustomers(),
                    getProducts(),
                ]);

            setQuotations(quotationResponse.data || []);
            setCustomers(customerResponse.data || []);
            setProducts(productResponse.data || []);
        } catch (error) {
            console.error("Fetch quotation data error:", error);
            setError(error.message || "Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleItemChange = (index, field, value) => {
        setItems((previousItems) =>
            previousItems.map((item, itemIndex) =>
                itemIndex === index
                    ? {
                        ...item,
                        [field]: value,
                    }
                    : item
            )
        );
    };

    //calculation function 

    const calculateItem = (item) => {
        const product = products.find(
            (product) => product.id === Number(item.product_id)
        );

        if (!product) {
            return {
                subtotal: 0,
                discount: 0,
                taxableAmount: 0,
                tax: 0,
                total: 0,
            };
        }

        const quantity = Number(item.quantity) || 0;
        const price = Number(product.price) || 0;
        const taxRate = Number(product.tax_rate) || 0;

        const subtotal = quantity * price;

        const discountValue = Number(item.discount_value) || 0;

        let discount = 0;

        if (item.discount_type === "percentage") {
            discount = subtotal * (discountValue / 100);
        } else {
            discount = discountValue;
        }

        discount = Math.min(discount, subtotal);

        const taxableAmount = subtotal - discount;

        const tax = taxableAmount * (taxRate / 100);

        const total = taxableAmount + tax;

        return {
            subtotal,
            discount,
            taxableAmount,
            tax,
            total,
        };
    };

    const quotationSubtotal = items.reduce(
        (sum, item) => sum + calculateItem(item).subtotal,
        0
    );

    const quotationDiscount = items.reduce(
        (sum, item) => sum + calculateItem(item).discount,
        0
    );

    const quotationTax = items.reduce(
        (sum, item) => sum + calculateItem(item).tax,
        0
    );

    const quotationTotal = items.reduce(
        (sum, item) => sum + calculateItem(item).total,
        0
    );

    const quotationDiscountValue = Number(formData.discount_value) || 0;

    let quotationLevelDiscount = 0;

    if (formData.discount_type === "percentage") {
        quotationLevelDiscount =
            quotationTotal * (quotationDiscountValue / 100);
    } else {
        quotationLevelDiscount = quotationDiscountValue;
    }

    quotationLevelDiscount = Math.min(
        quotationLevelDiscount,
        quotationTotal
    );

    const finalQuotationTotal = quotationTotal - quotationLevelDiscount;

    const addItem = () => {
        setItems((previousItems) => [
            ...previousItems,
            {
                product_id: "",
                quantity: 1,
                discount_type: "fixed",
                discount_value: 0,
            },
        ]);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setError("");

            if (!formData.customer_id) {
                setError("Please select a customer");
                return;
            }

            if (!formData.quotation_number.trim()) {
                setError("Please enter quotation number");
                return;
            }

            if (!formData.issue_date) {
                setError("Please select issue date");
                return;
            }

            const validItems = items.filter(
                (item) => item.product_id && Number(item.quantity) > 0
            );

            if (validItems.length === 0) {
                setError("Please add at least one valid item");
                return;
            }

            const quotationData = {
                customer_id: Number(formData.customer_id),
                quotation_number: formData.quotation_number,
                issue_date: formData.issue_date,
                valid_until: formData.valid_until || null,

                discount_type: formData.discount_type,
                discount_value: Number(formData.discount_value) || 0,

                notes: formData.notes,

                items: validItems.map((item) => ({
                    product_id: Number(item.product_id),
                    quantity: Number(item.quantity),
                    discount_type: item.discount_type,
                    discount_value: Number(item.discount_value) || 0,
                })),
            };

            await createQuotation(quotationData);

            await fetchData();

            setShowForm(false);

            setFormData({
                customer_id: "",
                quotation_number: "",
                issue_date: "",
                valid_until: "",
                discount_type: "fixed",
                discount_value: 0,
                notes: "",
            });

            setItems([
                {
                    product_id: "",
                    quantity: 1,
                    discount_type: "fixed",
                    discount_value: 0,
                },
            ]);
        } catch (error) {
            console.error("Create quotation error:", error);
            setError(error.message || "Failed to create quotation");
        }
    };

    //handleDelete

    const handleDeleteQuotation = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this quotation?"
        );

        if (!confirmed) {
            return;
        }

        try {
            await deleteQuotation(id);

            // Refresh quotation list
            await fetchData();
        } catch (err) {
            console.error(err);
            alert(err.message || "Failed to delete quotation");
        }
    };

    if (loading) {
        return <h1>Loading quotations...</h1>;
    }

    return (
        <div>
            <div className="page-header">
                <h1>Quotations</h1>

                <Button onClick={() => setShowForm(true)}>
                    + Create Quotation
                </Button>
            </div>

            {error && <p className="form-error">{error}</p>}

            {showForm && (
                <div className="card">
                    <h2>Create Quotation</h2>

                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="customer_id">
                                Customer
                            </label>

                            <select
                                id="customer_id"
                                name="customer_id"
                                value={formData.customer_id}
                                onChange={handleChange}
                            >
                                <option value="">
                                    Select Customer
                                </option>

                                {customers.map((customer) => (
                                    <option
                                        key={customer.id}
                                        value={customer.id}
                                    >
                                        {customer.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <Input
                            label="Quotation Number"
                            name="quotation_number"
                            placeholder="e.g. QT-002"
                            value={formData.quotation_number}
                            onChange={handleChange}
                            required
                        />

                        <Input
                            label="Issue Date"
                            name="issue_date"
                            type="date"
                            value={formData.issue_date}
                            onChange={handleChange}
                            required
                        />

                        <Input
                            label="Valid Until"
                            name="valid_until"
                            type="date"
                            value={formData.valid_until}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="quotation-items">
                        <h3>Items</h3>

                        {items.map((item, index) => {
                            const selectedProduct = products.find(
                                (product) =>
                                    product.id === Number(item.product_id)
                            );

                            const price = Number(selectedProduct?.price) || 0;
                            const taxRate = Number(selectedProduct?.tax_rate) || 0;

                            const calculation = calculateItem(item);

                            return (
                                <div className="quotation-item" key={index}>
                                    <div className="form-group">
                                        <label htmlFor={`product-${index}`}>
                                            Product / Service
                                        </label>

                                        <select
                                            id={`product-${index}`}
                                            value={item.product_id}
                                            onChange={(event) =>
                                                handleItemChange(
                                                    index,
                                                    "product_id",
                                                    event.target.value
                                                )
                                            }
                                        >
                                            <option value="">
                                                Select Product / Service
                                            </option>

                                            {products.map((product) => (
                                                <option
                                                    key={product.id}
                                                    value={product.id}
                                                >
                                                    {product.name} - ₹
                                                    {Number(
                                                        product.price
                                                    ).toFixed(2)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <Input
                                        label="Quantity"
                                        type="number"
                                        name={`quantity-${index}`}
                                        value={item.quantity}
                                        onChange={(event) =>
                                            handleItemChange(
                                                index,
                                                "quantity",
                                                event.target.value
                                            )
                                        }
                                    />

                                    <div className="form-group">
                                        <label htmlFor={`discount-type-${index}`}>
                                            Discount Type
                                        </label>

                                        <select
                                            id={`discount-type-${index}`}
                                            value={item.discount_type}
                                            onChange={(event) =>
                                                handleItemChange(
                                                    index,
                                                    "discount_type",
                                                    event.target.value
                                                )
                                            }
                                        >
                                            <option value="fixed">Fixed</option>
                                            <option value="percentage">Percentage</option>
                                        </select>
                                    </div>

                                    <Input
                                        label="Discount"
                                        type="number"
                                        name={`discount-${index}`}
                                        placeholder="0"
                                        value={item.discount_value}
                                        onChange={(event) =>
                                            handleItemChange(
                                                index,
                                                "discount_value",
                                                event.target.value
                                            )
                                        }
                                    />

                                    <div className="form-group">
                                        <label>Unit Price</label>
                                        <input
                                            type="text"
                                            value={`₹${price.toFixed(2)}`}
                                            readOnly
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Line Total</label>
                                        <input
                                            type="text"
                                            value={`₹${calculation.total.toFixed(2)}`}
                                            readOnly
                                        />
                                    </div>

                                    {items.length > 1 && (
                                        <Button
                                            variant="secondary"
                                            onClick={() => {
                                                setItems((previousItems) =>
                                                    previousItems.filter(
                                                        (_, itemIndex) =>
                                                            itemIndex !== index
                                                    )
                                                );
                                            }}
                                        >
                                            Remove
                                        </Button>
                                    )}
                                </div>
                            );
                        })}

                        <Button type="button" onClick={addItem}>
                            + Add Item
                        </Button>
                    </div>

                    <div className="quotation-discount">
                        <h3>Quotation Discount</h3>

                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="discount_type">
                                    Discount Type
                                </label>

                                <select
                                    id="discount_type"
                                    name="discount_type"
                                    value={formData.discount_type}
                                    onChange={handleChange}
                                >
                                    <option value="fixed">Fixed</option>
                                    <option value="percentage">Percentage</option>
                                </select>
                            </div>

                            <Input
                                label="Discount"
                                name="discount_value"
                                type="number"
                                placeholder="0"
                                value={formData.discount_value}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    //notes

                    <div className="form-group quotation-notes">
                        <label htmlFor="notes">
                            Notes / Terms & Conditions
                        </label>

                        <textarea
                            id="notes"
                            name="notes"
                            rows="4"
                            placeholder="Enter notes or terms & conditions..."
                            value={formData.notes}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="quotation-summary">
                        <div className="summary-row">
                            <span>Subtotal</span>
                            <strong>₹{quotationSubtotal.toFixed(2)}</strong>
                        </div>

                        <div className="summary-row">
                            <span>Item Discount</span>
                            <strong>- ₹{quotationDiscount.toFixed(2)}</strong>
                        </div>

                        <div className="summary-row">
                            <span>GST / Tax</span>
                            <strong>₹{quotationTax.toFixed(2)}</strong>
                        </div>

                        <div className="summary-row summary-total">
                            <span>Grand Total</span>
                            <strong>₹{finalQuotationTotal.toFixed(2)}</strong>
                        </div>
                    </div>

                    <div className="form-actions">
                        <Button
                            variant="secondary"
                            onClick={() => setShowForm(false)}
                        >
                            Cancel
                        </Button>

                        <Button type="button" onClick={handleSubmit}>
                            Create Quotation
                        </Button>
                    </div>
                </div>
            )}

            {!showForm && (
                <>
                    {quotations.length === 0 ? (
                        <p>No quotations found.</p>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>Quotation No</th>
                                    <th>Customer</th>
                                    <th>Issue Date</th>
                                    <th>Valid Until</th>
                                    <th>Status</th>
                                    <th>Total</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {quotations.map((quotation) => (
                                    <tr key={quotation.id}>
                                        <td>
                                            {quotation.quotation_number}
                                        </td>

                                        <td>
                                            {quotation.customer_name}
                                        </td>

                                        <td>
                                            {formatDate(quotation.issue_date)}
                                        </td>

                                        <td>
                                            {formatDate(quotation.expiry_date)}
                                        </td>

                                        <td>
                                            {quotation.status}
                                        </td>

                                        <td>
                                            ₹
                                            {Number(
                                                quotation.total_amount
                                            ).toFixed(2)}
                                        </td>

                                        <td>
                                            <Button
                                                onClick={() => navigate(`/quotations/${quotation.id}`)}
                                            >
                                                View
                                            </Button>

                                            <Button
                                                variant="secondary"
                                                onClick={() =>
                                                    navigate(`/quotations/${quotation.id}/edit`)
                                                }
                                            >
                                                Edit
                                            </Button>

                                            <Button
                                                variant="secondary"
                                                onClick={() =>
                                                    handleDeleteQuotation(quotation.id)
                                                }
                                            >
                                                Delete
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </>
            )}
        </div>
    );
}

export default Quotations;