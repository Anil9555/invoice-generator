import { useEffect, useState } from "react";
import { getCustomers } from "../services/customerService";
import { getProducts } from "../services/productService";
import { createInvoice } from "../services/invoiceService";
import { useNavigate } from "react-router-dom";


//helper function
const getDefaultDueDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 7);

    return date.toISOString().split("T")[0];
};

function CreateInvoice() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        customer_id: "",
        invoice_number: "",
        issue_date: new Date().toISOString().split("T")[0],
        due_date: getDefaultDueDate(),
    });

    const [customers, setCustomers] = useState([]);
    const [customersLoading, setCustomersLoading] = useState(true); 

    const [products, setProducts] = useState([]);
    const [productsLoading, setProductsLoading] = useState(true);

    const [items, setItems] = useState([
        {
            product_id: "",
            quantity: 1,
            discount_type: "fixed",
            discount_value: 0,
        },
    ]);

    const [invoiceDiscountType, setInvoiceDiscountType] = useState("fixed");
    const [invoiceDiscountValue, setInvoiceDiscountValue] = useState(0);

    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState("");

    

    //invoice summary

    const subtotal = items.reduce((total, item) => {
        const product = products.find(
            (product) =>
                Number(product.id) === Number(item.product_id)
        );

        if (!product) {
            return total;
        }

        const itemSubtotal =
            Number(item.quantity || 0) * Number(product.price || 0);

        let discount = 0;

        if (item.discount_type === "percentage") {
            discount =
                itemSubtotal *
                (Number(item.discount_value || 0) / 100);
        } else {
            discount = Number(item.discount_value || 0);
        }

        const itemTotal = Math.max(0, itemSubtotal - discount);

        return total + itemTotal;
    }, 0);

    //invoice-level discount calculation

    let invoiceDiscount = 0;

    if (invoiceDiscountType === "percentage") {
        invoiceDiscount =
            subtotal *
            (Number(invoiceDiscountValue || 0) / 100);
    } else {
        invoiceDiscount = Number(invoiceDiscountValue || 0);
    }

    invoiceDiscount = Math.min(invoiceDiscount, subtotal);

    const taxableAmount = Math.max(
        0,
        subtotal - invoiceDiscount
    );

    //individual products ke tax_rate
    const taxAmount = items.reduce((total, item) => {
        const product = products.find(
            (product) =>
                Number(product.id) === Number(item.product_id)
        );

        if (!product) {
            return total;
        }

        const itemSubtotal =
            Number(item.quantity || 0) *
            Number(product.price || 0);

        let itemDiscount = 0;

        if (item.discount_type === "percentage") {
            itemDiscount =
                itemSubtotal *
                (Number(item.discount_value || 0) / 100);
        } else {
            itemDiscount = Number(item.discount_value || 0);
        }

        itemDiscount = Math.min(itemDiscount, itemSubtotal);

        const itemTaxableAmount =
            itemSubtotal - itemDiscount;

        const taxRate = Number(product.tax_rate || 0);

        const itemTax =
            itemTaxableAmount * (taxRate / 100);

        return total + itemTax;
    }, 0);

    const grandTotal = taxableAmount + taxAmount;

    //fatch customers

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                setCustomersLoading(true);

                const response = await getCustomers();

                setCustomers(response.data || []);
            } catch (error) {
                console.error("Fetch customers error:", error);
            } finally {
                setCustomersLoading(false);
            }
        };

        fetchCustomers();
    }, []);

    //fatch products

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setProductsLoading(true);

                const response = await getProducts();

                setProducts(response.data || []);
            } catch (error) {
                console.error("Fetch products error:", error);
            } finally {
                setProductsLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setFormError("");

        if (!formData.customer_id) {
            setFormError("Please select a customer.");
            return;
        }

        if (!formData.invoice_number.trim()) {
            setFormError("Please enter invoice number.");
            return;
        }

        if (!formData.issue_date) {
            setFormError("Please select issue date.");
            return;
        }

        if (!formData.due_date) {
            setFormError("Please select due date.");
            return;
        }

        if (formData.due_date < formData.issue_date) {
            setFormError("Due date cannot be before issue date.");
            return;
        }

        const validItems = items.filter(
            (item) => item.product_id
        );

        //prevent discount 100%

        const hasInvalidItemDiscount = validItems.some((item) => {
            const product = products.find(
                (product) =>
                    Number(product.id) === Number(item.product_id)
            );

            if (!product) {
                return false;
            }

            const itemSubtotal =
                Number(item.quantity || 0) *
                Number(product.price || 0);

            const discountValue = Number(item.discount_value || 0);

            if (item.discount_type === "percentage") {
                return discountValue >= 100;
            }

            return discountValue >= itemSubtotal;
        });

        if (hasInvalidItemDiscount) {
            setFormError(
                "Item discount cannot reduce the item total to zero."
            );
            return;
        }

        const invalidQuantity = validItems.some(
            (item) => Number(item.quantity) <= 0
        );

        if (invalidQuantity) {
            setFormError("Item quantity must be greater than 0.");
            return;
        }

        if (
            invoiceDiscountType === "percentage" &&
            Number(invoiceDiscountValue) >= 100
        ) {
            setFormError("Invoice discount must be less than 100%.");
            return;
        }

        if (
            invoiceDiscountType === "fixed" &&
            Number(invoiceDiscountValue) >= subtotal &&
            subtotal > 0
        ) {
            setFormError(
                "Invoice discount cannot reduce the invoice total to zero."
            );
            return;
        }

        if (validItems.length === 0) {
            setFormError("Please add at least one product or service.");
            return;
        }

        try {
            setSaving(true);

            if (grandTotal <= 0) {
                setFormError(
                    "Invoice total must be greater than ₹0."
                );
                return;
            }

            const invoiceData = {
                customer_id: Number(formData.customer_id),
                invoice_number: formData.invoice_number.trim(),
                issue_date: formData.issue_date,
                due_date: formData.due_date,

                discount_type: invoiceDiscountType,
                discount_value: Number(invoiceDiscountValue || 0),

                items: validItems,
            };

            console.log("Invoice data:", invoiceData);

            const response = await createInvoice(invoiceData);

            console.log("Create invoice response:", response);

            if (response?.success && response?.data?.id) {
                navigate(`/invoices/${response.data.id}`);
            };
        } catch (error) {
            console.error("Create invoice error:", error);
            setFormError(
                error.message || "Failed to create invoice."
            );
        } finally {
            setSaving(false);
        }
    };

    
    return (
        <form className="page" onSubmit={handleSubmit}>
            <div className="page-header">
                <div>
                    <h1>Create Invoice</h1>
                    <p>Create a new invoice for your customer.</p>
                </div>
            </div>

            <div className="card">
                <h2>Customer & Invoice Information</h2>

                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="customer_id">Customer</label>

                        <select
                            id="customer_id"
                            value={formData.customer_id}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    customer_id: e.target.value,
                                })
                            }
                        >
                            <option value="">
                                {customersLoading ? "Loading customers..." : "Select customer"}
                            </option>

                            {customers.map((customer) => (
                                <option key={customer.id} value={customer.id}>
                                    {customer.name}
                                    {customer.company_name ? ` - ${customer.company_name}` : ""}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="invoice_number">Invoice Number</label>

                        <input
                            id="invoice_number"
                            type="text"
                            value={formData.invoice_number}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    invoice_number: e.target.value,
                                })
                            }
                            placeholder="e.g. INV-0007"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="issue_date">Issue Date</label>

                        <input
                            id="issue_date"
                            type="date"
                            value={formData.issue_date}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    issue_date: e.target.value,
                                })
                            }
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="due_date">Due Date</label>

                        <input
                            id="due_date"
                            type="date"
                            value={formData.due_date}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    due_date: e.target.value,
                                })
                            }
                        />
                    </div>
                </div>

            
                //invoice items
                <div className="card">
                    <div className="card-header">
                        <div>
                            <h2>Invoice Items</h2>
                            <p>Add products or services to this invoice.</p>
                        </div>
                    </div>

                    <div className="invoice-items">
                        {items.map((item, index) => (
                            <div className="invoice-item-row" key={index}>
                                <div className="form-group">
                                    <label>Product / Service</label>

                                    <select
                                        value={item.product_id}
                                        onChange={(e) => {
                                            const updatedItems = [...items];

                                            updatedItems[index] = {
                                                ...updatedItems[index],
                                                product_id: e.target.value,
                                            };

                                            setItems(updatedItems);
                                        }}
                                    >
                                        <option value="">
                                            {productsLoading
                                                ? "Loading products..."
                                                : "Select product or service"}
                                        </option>

                                        {products.map((product) => (
                                            <option key={product.id} value={product.id}>
                                                {product.name}
                                                {product.item_type === "service"
                                                    ? " (Service)"
                                                    : " (Product)"}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Quantity</label>

                                    <input
                                        type="number"
                                        min="1"
                                        value={item.quantity}
                                        onChange={(e) => {
                                            const updatedItems = [...items];

                                            updatedItems[index] = {
                                                ...updatedItems[index],
                                                quantity: Number(e.target.value),
                                            };

                                            setItems(updatedItems);
                                        }}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Unit Price</label>

                                    <input
                                        type="text"
                                        value={
                                            products.find(
                                                (product) => Number(product.id) === Number(item.product_id)
                                            )?.price || ""
                                        }
                                        readOnly
                                        placeholder="₹0.00"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Line Total</label>

                                    <input
                                        type="text"
                                        value={(() => {
                                            const product = products.find(
                                                (product) =>
                                                    Number(product.id) === Number(item.product_id)
                                            );

                                            if (!product) {
                                                return "";
                                            }

                                            const subtotal =
                                                Number(item.quantity || 0) * Number(product.price || 0);

                                            let discount = 0;

                                            if (item.discount_type === "percentage") {
                                                discount =
                                                    subtotal *
                                                    (Number(item.discount_value || 0) / 100);
                                            } else {
                                                discount = Number(item.discount_value || 0);
                                            }

                                            const finalTotal = Math.max(0, subtotal - discount);

                                            return finalTotal.toFixed(2);
                                        })()}
                                        readOnly
                                        placeholder="₹0.00"
                                    />
                                </div>




                                <div className="form-group">
                                    <label>Discount Type</label>

                                    <select
                                        value={item.discount_type}
                                        onChange={(e) => {
                                            const updatedItems = [...items];

                                            updatedItems[index] = {
                                                ...updatedItems[index],
                                                discount_type: e.target.value,
                                            };

                                            setItems(updatedItems);
                                        }}
                                    >
                                        <option value="fixed">Fixed (₹)</option>
                                        <option value="percentage">Percentage (%)</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Discount</label>

                                    <input
                                        type="number"
                                        min="0"
                                        value={item.discount_value}
                                        onChange={(e) => {
                                            const updatedItems = [...items];

                                            updatedItems[index] = {
                                                ...updatedItems[index],
                                                discount_value: Number(e.target.value),
                                            };

                                            setItems(updatedItems);
                                        }}
                                        placeholder="0"
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setItems(items.filter((_, i) => i !== index));
                                    }}
                                    disabled={items.length === 1}
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            setItems([
                                ...items,
                                {
                                    product_id: "",
                                    quantity: 1,
                                    discount_type: "fixed",
                                    discount_value: 0,
                                },
                            ]);
                        }}
                    >
                        + Add Item
                    </button>
                </div>

                <div className="card">
                    <h2>Invoice Discount</h2>

                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="invoice_discount_type">
                                Discount Type
                            </label>

                            <select
                                id="invoice_discount_type"
                                value={invoiceDiscountType}
                                onChange={(e) =>
                                    setInvoiceDiscountType(e.target.value)
                                }
                            >
                                <option value="fixed">Fixed (₹)</option>
                                <option value="percentage">Percentage (%)</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="invoice_discount_value">
                                Discount
                            </label>

                            <input
                                id="invoice_discount_value"
                                type="number"
                                min="0"
                                value={invoiceDiscountValue}
                                onChange={(e) =>
                                    setInvoiceDiscountValue(
                                        Number(e.target.value)
                                    )
                                }
                                placeholder="0"
                            />
                        </div>
                    </div>
                </div>

                <div className="card invoice-summary">
                    <div className="invoice-summary-row">
                        <span>Subtotal</span>
                        <strong>
                            ₹{subtotal.toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </strong>
                    </div>

                    <div className="invoice-summary-row">
                        <span>
                            Invoice Discount
                            {invoiceDiscountType === "percentage"
                                ? ` (${invoiceDiscountValue}%)`
                                : ""}
                        </span>

                        <strong>
                            - ₹{invoiceDiscount.toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </strong>
                    </div>

                    <div className="invoice-summary-row">
                        <span>Taxable Amount</span>

                        <strong>
                            ₹{taxableAmount.toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </strong>
                    </div>

                    <div className="invoice-summary-row">
                        <span>Tax</span>

                        <strong>
                            ₹{taxAmount.toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </strong>
                    </div>

                    <div className="invoice-summary-total">
                        <span>Grand Total</span>

                        <strong>
                            ₹{grandTotal.toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </strong>
                    </div>
                </div>

                {formError && (
                    <div className="form-error">
                        {formError}
                    </div>
                )}

                <div className="form-actions">
                    <button
                        type="button"
                        onClick={() => navigate("/invoices")}
                        disabled={saving}
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={saving}
                    >
                        {saving ? "Creating Invoice..." : "Create Invoice"}
                    </button>
                </div>
            </div>
        </form>
    );
}

export default CreateInvoice;