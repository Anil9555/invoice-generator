import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";


import {
    getInvoiceById,
    updateInvoice,
} from "../services/invoiceService";

import { getCustomers } from "../services/customerService";
import { getProducts } from "../services/productService";


function EditInvoice() {

    const { id } = useParams();

    const navigate = useNavigate();


    // Invoice data
    const [invoice, setInvoice] = useState(null);


    // Customers list
    const [customers, setCustomers] = useState([]);

    const [products, setProducts] = useState([]);

    const [items, setItems] = useState([]);


    // Form data
    const [formData, setFormData] = useState({
        customer_id: "",
        issue_date: "",
        due_date: "",
        status: "",
        paid_amount: 0,
    });


    // UI states
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");


    // Load invoice + customers
    useEffect(() => {

        const fetchData = async () => {

            try {

                setLoading(true);
                setError("");


                const invoiceResponse = await getInvoiceById(id);

                const customersResponse = await getCustomers();

                const productsResponse = await getProducts();


                const invoiceData = invoiceResponse.data;



                setInvoice(invoiceData);

                setCustomers(customersResponse.data || []);

                setProducts(productsResponse.data || []);

                setItems(invoiceData.items || []);


                // Put existing invoice data into form
                setFormData({
                    customer_id: invoiceData.customer_id,
                    issue_date: new Date(invoiceData.issue_date).toLocaleDateString("en-CA"),
                    due_date: new Date(invoiceData.due_date).toLocaleDateString("en-CA"),
                    status: invoiceData.status,
                    paid_amount: Number(invoiceData.paid_amount || 0),
                });


            } catch (error) {

                console.error(
                    "Load edit invoice error:",
                    error
                );

                setError(
                    error.message ||
                    "Failed to load invoice"
                );

            } finally {

                setLoading(false);

            }

        };


        fetchData();

    }, [id]);


    // Handle input changes
    const handleChange = (event) => {

        const { name, value } = event.target;


        setFormData((current) => ({
            ...current,
            [name]: value,
        }));

    };

    const handleAddItem = () => {
        setItems((currentItems) => [
            ...currentItems,
            {
                product_id: "",
                name: "",
                quantity: 1,
                unit_price: 0,
                tax_rate: 0,
                discount_type: "fixed",
                discount_value: 0,
                line_total: 0,
            },
        ]);
    };

    const handleRemoveItem = (indexToRemove) => {
        setItems((currentItems) =>
            currentItems.filter(
                (_, index) => index !== indexToRemove
            )
        );
    };

    const calculateInvoiceTotals = () => {
        let subtotal = 0;
        let itemDiscountAmount = 0;
        let taxAmount = 0;

        items.forEach((item) => {
            const quantity = Number(item.quantity || 0);
            const unitPrice = Number(item.unit_price || 0);
            const taxRate = Number(item.tax_rate || 0);
            const discountValue = Number(item.discount_value || 0);

            const itemSubtotal = quantity * unitPrice;

            let itemDiscount = 0;

            if (item.discount_type === "percentage") {
                itemDiscount =
                    (itemSubtotal * discountValue) / 100;
            } else {
                itemDiscount = discountValue;
            }

            itemDiscount = Math.min(
                itemDiscount,
                itemSubtotal
            );

            const taxableAmount =
                itemSubtotal - itemDiscount;

            const itemTax =
                (taxableAmount * taxRate) / 100;

            subtotal += itemSubtotal;
            itemDiscountAmount += itemDiscount;
            taxAmount += itemTax;
        });

        // Amount after item-level discounts
        const amountAfterItemDiscount =
            subtotal - itemDiscountAmount;

        // Invoice-level discount
        const invoiceDiscountValue =
            Number(invoice.discount_value || 0);

        let invoiceDiscountAmount = 0;

        if (invoice.discount_type === "percentage") {
            invoiceDiscountAmount =
                (amountAfterItemDiscount * invoiceDiscountValue) / 100;
        } else {
            invoiceDiscountAmount = invoiceDiscountValue;
        }

        invoiceDiscountAmount = Math.min(
            invoiceDiscountAmount,
            amountAfterItemDiscount
        );

        const totalDiscount =
            itemDiscountAmount + invoiceDiscountAmount;

        const totalAmount =
            subtotal - totalDiscount + taxAmount;

        return {
            subtotal,
            itemDiscountAmount,
            invoiceDiscountAmount,
            totalDiscount,
            taxAmount,
            totalAmount,
        };
    };


    // Submit updated invoice
    const handleSubmit = async (event) => {

        event.preventDefault();


        try {

            setSaving(true);
            setError("");

            if (items.length === 0) {
                setError("Invoice must have at least one item.");
                return;
            }

            const invalidItem = items.find(
                (item) => !item.product_id || Number(item.quantity) <= 0
            );

            if (invalidItem) {
                setError("Please select a product and enter a valid quantity.");
                return;
            }


            await updateInvoice(id, {

                ...formData,


                // Keep existing values for now
                discount_type: invoice.discount_type,

                discount_value: invoice.discount_value,

                currency: invoice.currency,

                notes: invoice.notes,

                terms_and_conditions:
                    invoice.terms_and_conditions,

                payment_instructions:
                    invoice.payment_instructions,


                // Keep existing invoice items
                items: items.map((item) => ({
                    product_id: item.product_id,
                    quantity: item.quantity,
                    discount_type: item.discount_type,
                    discount_value: item.discount_value,
                })),

            });


            alert("Invoice updated successfully");


            navigate(`/invoices/${id}`);


        } catch (error) {

            console.error(
                "Update invoice error:",
                error
            );

            setError(
                error.message ||
                "Failed to update invoice"
            );

        } finally {

            setSaving(false);

        }

    };


    // Loading
    if (loading) {

        return <h1>Loading invoice...</h1>;

    }


    // Error
    if (error && !invoice) {

        return <h1>{error}</h1>;

    }


    // Invoice not found
    if (!invoice) {

        return <h1>Invoice not found</h1>;

    }


    return (

        <div>

            <h1>Edit Invoice</h1>


            {error && (
                <p>{error}</p>
            )}


            <form onSubmit={handleSubmit}>


                {/* Customer */}

                <div>

                    <label htmlFor="customer_id">
                        Customer
                    </label>


                    <select
                        id="customer_id"
                        name="customer_id"
                        value={formData.customer_id}
                        onChange={handleChange}
                        required
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


                {/* Issue Date */}

                <div>

                    <label htmlFor="issue_date">
                        Issue Date
                    </label>


                    <input
                        id="issue_date"
                        type="date"
                        name="issue_date"
                        value={formData.issue_date}
                        onChange={handleChange}
                        required
                    />

                </div>


                {/* Due Date */}

                <div>

                    <label htmlFor="due_date">
                        Due Date
                    </label>


                    <input
                        id="due_date"
                        type="date"
                        name="due_date"
                        value={formData.due_date}
                        onChange={handleChange}
                        required
                    />

                </div>


                {/* Status */}

                <div>

                    <label htmlFor="status">
                        Status
                    </label>


                    <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        required
                    >

                        <option value="draft">
                            Draft
                        </option>

                        <option value="sent">
                            Sent
                        </option>

                        <option value="paid">
                            Paid
                        </option>

                        <option value="partial">
                            Partial
                        </option>

                        <option value="overdue">
                            Overdue
                        </option>

                        <option value="cancelled">
                            Cancelled
                        </option>

                    </select>

                </div>

                <div>
                    <label htmlFor="paid_amount">
                        Paid Amount
                    </label>

                    <input
                        id="paid_amount"
                        type="number"
                        min="0"
                        step="0.01"
                        name="paid_amount"
                        value={formData.paid_amount}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <h2>Invoice Items</h2>

                    {items.length === 0 ? (
                        <p>No items found.</p>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Quantity</th>
                                    <th>Unit Price</th>
                                    <th>Tax %</th>
                                    <th>Discount</th>
                                    <th>Line Total</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {items.map((item, index) => (
                                    <tr key={item.id || index}>
                                        <td>
                                            <select
                                                value={item.product_id}
                                                onChange={(event) => {
                                                    const productId = Number(event.target.value);

                                                    setItems((currentItems) =>
                                                        currentItems.map((currentItem, currentIndex) => {
                                                            if (currentIndex !== index) {
                                                                return currentItem;
                                                            }

                                                            const selectedProduct = products.find(
                                                                (product) => product.id === productId
                                                            );

                                                            const quantity = Number(currentItem.quantity || 1);
                                                            const unitPrice = Number(selectedProduct?.price || 0);
                                                            const taxRate = Number(selectedProduct?.tax_rate || 0);

                                                            const itemSubtotal = quantity * unitPrice;

                                                            const discountValue = Number(
                                                                currentItem.discount_value || 0
                                                            );

                                                            let discountAmount = 0;

                                                            if (currentItem.discount_type === "percentage") {
                                                                discountAmount =
                                                                    (itemSubtotal * discountValue) / 100;
                                                            } else {
                                                                discountAmount = discountValue;
                                                            }

                                                            discountAmount = Math.min(
                                                                discountAmount,
                                                                itemSubtotal
                                                            );

                                                            const taxableAmount =
                                                                itemSubtotal - discountAmount;

                                                            const taxAmount =
                                                                (taxableAmount * taxRate) / 100;

                                                            const lineTotal =
                                                                taxableAmount + taxAmount;

                                                            return {
                                                                ...currentItem,
                                                                product_id: productId,
                                                                name: selectedProduct?.name || "",
                                                                unit_price: unitPrice,
                                                                tax_rate: taxRate,
                                                                discount_amount: discountAmount,
                                                                tax_amount: taxAmount,
                                                                line_total: lineTotal,
                                                                unit: selectedProduct?.unit || "",
                                                            };
                                                        })
                                                    );
                                                }}
                                            >
                                                <option value="">Select Product</option>

                                                {products.map((product) => (
                                                    <option key={product.id} value={product.id}>
                                                        {product.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>

                                        <td>
                                            <input
                                                type="number"
                                                min="0.01"
                                                step="0.01"
                                                value={item.quantity}
                                                onChange={(event) => {
                                                    const quantity = Number(event.target.value);

                                                    setItems((currentItems) =>
                                                        currentItems.map((currentItem, currentIndex) => {
                                                            if (currentIndex !== index) {
                                                                return currentItem;
                                                            }

                                                            const unitPrice = Number(currentItem.unit_price || 0);
                                                            const taxRate = Number(currentItem.tax_rate || 0);

                                                            const itemSubtotal = quantity * unitPrice;

                                                            const discountValue = Number(
                                                                currentItem.discount_value || 0
                                                            );

                                                            let discountAmount = 0;

                                                            if (currentItem.discount_type === "percentage") {
                                                                discountAmount =
                                                                    (itemSubtotal * discountValue) / 100;
                                                            } else {
                                                                discountAmount = discountValue;
                                                            }

                                                            discountAmount = Math.min(
                                                                discountAmount,
                                                                itemSubtotal
                                                            );

                                                            const taxableAmount =
                                                                itemSubtotal - discountAmount;

                                                            const taxAmount =
                                                                (taxableAmount * taxRate) / 100;

                                                            const lineTotal =
                                                                taxableAmount + taxAmount;

                                                            return {
                                                                ...currentItem,
                                                                quantity,
                                                                discount_amount: discountAmount,
                                                                tax_amount: taxAmount,
                                                                line_total: lineTotal,
                                                            };
                                                        })
                                                    );
                                                }}
                                            />
                                        </td>

                                        <td>
                                            ₹{Number(item.unit_price || 0).toFixed(2)}
                                        </td>

                                        <td>
                                            {Number(item.tax_rate || 0).toFixed(2)}%
                                        </td>

                                        <td>
                                            <select
                                                value={item.discount_type || "fixed"}
                                                onChange={(event) => {
                                                    const discountType = event.target.value;

                                                    setItems((currentItems) =>
                                                        currentItems.map((currentItem, currentIndex) =>
                                                            currentIndex === index
                                                                ? {
                                                                    ...currentItem,
                                                                    discount_type: discountType,
                                                                }
                                                                : currentItem
                                                        )
                                                    );
                                                }}
                                            >
                                                <option value="fixed">₹ Fixed</option>
                                                <option value="percentage">% Percentage</option>
                                            </select>

                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={item.discount_value || 0}
                                                onChange={(event) => {
                                                    const discountValue = Number(event.target.value);

                                                    setItems((currentItems) =>
                                                        currentItems.map((currentItem, currentIndex) => {
                                                            if (currentIndex !== index) {
                                                                return currentItem;
                                                            }

                                                            const quantity = Number(currentItem.quantity || 0);
                                                            const unitPrice = Number(currentItem.unit_price || 0);
                                                            const taxRate = Number(currentItem.tax_rate || 0);

                                                            const itemSubtotal = quantity * unitPrice;

                                                            let discountAmount = 0;

                                                            if (currentItem.discount_type === "percentage") {
                                                                discountAmount =
                                                                    (itemSubtotal * discountValue) / 100;
                                                            } else {
                                                                discountAmount = discountValue;
                                                            }

                                                            discountAmount = Math.min(
                                                                discountAmount,
                                                                itemSubtotal
                                                            );

                                                            const taxableAmount =
                                                                itemSubtotal - discountAmount;

                                                            const taxAmount =
                                                                (taxableAmount * taxRate) / 100;

                                                            const lineTotal =
                                                                taxableAmount + taxAmount;

                                                            return {
                                                                ...currentItem,
                                                                discount_value: discountValue,
                                                                discount_amount: discountAmount,
                                                                tax_amount: taxAmount,
                                                                line_total: lineTotal,
                                                            };
                                                        })
                                                    );
                                                }}
                                            />
                                        </td>

                                        <td>
                                            ₹{Number(item.line_total || 0).toFixed(2)}
                                        </td>

                                        <td>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveItem(index)}
                                            >
                                                Remove
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <div>
                    <h2>Invoice Discount</h2>

                    <select
                        value={invoice.discount_type || "fixed"}
                        onChange={(event) => {
                            setInvoice((current) => ({
                                ...current,
                                discount_type: event.target.value,
                            }));
                        }}
                    >
                        <option value="fixed">₹ Fixed</option>
                        <option value="percentage">% Percentage</option>
                    </select>

                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={invoice.discount_value || 0}
                        onChange={(event) => {
                            setInvoice((current) => ({
                                ...current,
                                discount_value: Number(event.target.value),
                            }));
                        }}
                    />
                </div>


                <div>
                    <h2>Invoice Summary</h2>

                    <p>
                        <strong>Subtotal:</strong>{" "}
                        ₹{calculateInvoiceTotals().subtotal.toFixed(2)}
                    </p>

                    <p>
                        <strong>Item Discount:</strong>{" "}
                        ₹{calculateInvoiceTotals().itemDiscountAmount.toFixed(2)}
                    </p>

                    <p>
                        <strong>Invoice Discount:</strong>{" "}
                        ₹{calculateInvoiceTotals().invoiceDiscountAmount.toFixed(2)}
                    </p>

                    <p>
                        <strong>Tax:</strong>{" "}
                        ₹{calculateInvoiceTotals().taxAmount.toFixed(2)}
                    </p>

                    <p>
                        <strong>Total:</strong>{" "}
                        ₹{calculateInvoiceTotals().totalAmount.toFixed(2)}
                    </p>
                </div>


                {/* Add Item */}



                <button
                    type="button"
                    onClick={handleAddItem}
                >
                    + Add Item
                </button>

                {/* Saving */}

                <button type="submit" disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                </button>


            </form>

        </div>

    );

}


export default EditInvoice;