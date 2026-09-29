import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getQuotationById,
  updateQuotation,
} from "../services/quotationService";
import { getCustomers } from "../services/customerService";
import { getProducts } from "../services/productService";

import Button from "../components/Button";
import Input from "../components/Input";
import "./EditQuotation.css";

const EditQuotation = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    customer_id: "",
    quotation_number: "",
    issue_date: "",
    valid_until: "",
    status: "draft",
    discount_type: "fixed",
    discount_value: 0,
    notes: "",
    terms_and_conditions: "",
  });

  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [quotationResponse, customersResponse, productsResponse] =
        await Promise.all([
          getQuotationById(id),
          getCustomers(),
          getProducts(),
        ]);

      const quotation = quotationResponse.data;
      const customerList = customersResponse.data;
      const productList = productsResponse.data;

      setCustomers(customerList);
      setProducts(productList);

      setFormData({
        customer_id: quotation.customer_id,
        quotation_number: quotation.quotation_number,
        issue_date: quotation.issue_date?.split("T")[0] || "",
        valid_until: quotation.valid_until?.split("T")[0] || "",
        status: quotation.status || "draft",
        discount_type: quotation.discount_type || "fixed",
        discount_value: quotation.discount_value || 0,
        notes: quotation.notes || "",
        terms_and_conditions: quotation.terms_and_conditions || "",
      });

      setItems(
        quotation.items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          discount_type: item.discount_type || "fixed",
          discount_value: item.discount_value || 0,
        })),
      );
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load quotation");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      if (!formData.customer_id) {
        setError("Please select a customer.");
        return;
      }

      if (!formData.quotation_number.trim()) {
        setError("Quotation number is required.");
        return;
      }

      if (!formData.issue_date) {
        setError("Issue date is required.");
        return;
      }

      if (items.length === 0) {
        setError("Please add at least one item.");
        return;
      }

      const hasInvalidItem = items.some(
        (item) => !item.product_id || Number(item.quantity) <= 0,
      );

      if (hasInvalidItem) {
        setError("Please select a product and valid quantity for every item.");
        return;
      }

      const quotationData = {
        customer_id: Number(formData.customer_id),
        quotation_number: formData.quotation_number,
        issue_date: formData.issue_date,
        valid_until: formData.valid_until || null,
        status: formData.status,
        discount_type: formData.discount_type,
        discount_value: Number(formData.discount_value) || 0,
        notes: formData.notes,
        terms_and_conditions: formData.terms_and_conditions,

        items: items.map((item) => ({
          product_id: Number(item.product_id),
          quantity: Number(item.quantity),
          discount_type: item.discount_type,
          discount_value: Number(item.discount_value) || 0,
        })),
      };

      await updateQuotation(id, quotationData);

      navigate(`/quotations/${id}`);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to update quotation");
    } finally {
      setSaving(false);
    }
  };

  //Calculate items

  const calculateItem = (item) => {
    const product = products.find(
      (product) => Number(product.id) === Number(item.product_id),
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
    const discountValue = Number(item.discount_value) || 0;
    const taxRate = Number(product.tax_rate) || 0;

    const subtotal = quantity * price;

    let discount = 0;

    if (item.discount_type === "percentage") {
      discount = (subtotal * discountValue) / 100;
    } else {
      discount = discountValue;
    }

    discount = Math.min(discount, subtotal);

    const taxableAmount = subtotal - discount;
    const tax = (taxableAmount * taxRate) / 100;
    const total = taxableAmount + tax;

    return {
      subtotal,
      discount,
      taxableAmount,
      tax,
      total,
    };
  };

  const calculatedItems = items.map(calculateItem);

  const quotationSubtotal = calculatedItems.reduce(
    (sum, item) => sum + item.subtotal,
    0,
  );

  const itemDiscount = calculatedItems.reduce(
    (sum, item) => sum + item.discount,
    0,
  );

  const quotationTax = calculatedItems.reduce((sum, item) => sum + item.tax, 0);

  const beforeQuotationDiscount =
    quotationSubtotal - itemDiscount + quotationTax;

  let quotationLevelDiscount = 0;

  const quotationDiscountValue = Number(formData.discount_value) || 0;

  if (formData.discount_type === "percentage") {
    quotationLevelDiscount =
      ((quotationSubtotal - itemDiscount) * quotationDiscountValue) / 100;
  } else {
    quotationLevelDiscount = quotationDiscountValue;
  }

  quotationLevelDiscount = Math.min(
    quotationLevelDiscount,
    quotationSubtotal - itemDiscount,
  );

  const finalQuotationTotal = beforeQuotationDiscount - quotationLevelDiscount;

  if (loading) {
    return <p>Loading quotation...</p>;
  }

  return (
    <div className="edit-quotation-page">
      <div className="edit-quotation-header">
        <div>
          <h1>Edit Quotation</h1>
          <p>Update quotation details, items and pricing information.</p>
        </div>
      </div>

      {error && <p className="form-error">{error}</p>}

      <form className="edit-quotation-form" onSubmit={handleSubmit}>
        {/* Quotation Details */}

        {/* Quotation Details */}

        <div className="edit-quotation-section">
          <div className="edit-quotation-section-header">
            <div>
              <h2>Quotation Details</h2>
              <p>Update customer, dates, status and quotation discount.</p>
            </div>
          </div>

          <div className="edit-quotation-fields">
            {/* Customer */}
            <div className="edit-quotation-field">
              <label>Customer</label>

              <select
                value={formData.customer_id}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    customer_id: e.target.value,
                  })
                }
              >
                <option value="">Select Customer</option>

                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Quotation Number */}
            <div className="edit-quotation-field">
              <Input
                label="Quotation Number"
                value={formData.quotation_number}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    quotation_number: e.target.value,
                  })
                }
              />
            </div>

            {/* Issue Date */}
            <div className="edit-quotation-field">
              <label>Issue Date</label>

              <input
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

            {/* Valid Until */}
            <div className="edit-quotation-field">
              <label>Valid Until</label>

              <input
                type="date"
                value={formData.valid_until}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    valid_until: e.target.value,
                  })
                }
              />
            </div>

            {/* Status */}
            <div className="edit-quotation-field">
              <label>Status</label>

              {formData.status === "accepted" ? (
                <input
                  type="text"
                  value="Accepted — Converted to Invoice"
                  disabled
                />
              ) : (
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value,
                    })
                  }
                >
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="rejected">Rejected</option>
                  <option value="expired">Expired</option>
                </select>
              )}
            </div>

            {/* Discount Type */}
            <div className="edit-quotation-field">
              <label>Discount Type</label>

              <select
                value={formData.discount_type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    discount_type: e.target.value,
                  })
                }
              >
                <option value="fixed">Fixed</option>
                <option value="percentage">Percentage</option>
              </select>
            </div>

            {/* Discount Value */}
            <div className="edit-quotation-field">
              <Input
                label="Discount Value"
                type="number"
                min="0"
                value={formData.discount_value}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    discount_value: e.target.value,
                  })
                }
              />
            </div>

            {/* Notes */}
            <div className="edit-quotation-field edit-quotation-field-full">
              <label>Notes</label>

              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    notes: e.target.value,
                  })
                }
                rows="4"
              />
            </div>

            {/* Terms & Conditions */}
            <div className="edit-quotation-field edit-quotation-field-full">
              <label>Terms & Conditions</label>

              <textarea
                value={formData.terms_and_conditions}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    terms_and_conditions: e.target.value,
                  })
                }
                rows="4"
              />
            </div>
          </div>
        </div>

        {/* Quotation Items */}
        <div className="edit-quotation-section">
          <div className="edit-quotation-section-header">
            <div>
              <h2>Quotation Items</h2>
              <p>Manage products, quantities and item discounts.</p>
            </div>
          </div>

          {items.map((item, index) => (
            <div key={index} className="edit-quotation-item">
              {/* Product / Service */}
              <div className="edit-quotation-item-field edit-quotation-product">
                <label>Product / Service</label>

                <select
                  value={item.product_id}
                  onChange={(e) => {
                    const updatedItems = [...items];

                    updatedItems[index].product_id = e.target.value;

                    setItems(updatedItems);
                  }}
                >
                  <option value="">Select Product / Service</option>

                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity */}
              <div className="edit-quotation-item-field">
                <Input
                  label="Quantity"
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => {
                    const updatedItems = [...items];

                    updatedItems[index].quantity = e.target.value;

                    setItems(updatedItems);
                  }}
                />
              </div>

              {/* Discount Type */}
              <div className="edit-quotation-item-field">
                <label>Discount Type</label>

                <select
                  value={item.discount_type}
                  onChange={(e) => {
                    const updatedItems = [...items];

                    updatedItems[index].discount_type = e.target.value;

                    setItems(updatedItems);
                  }}
                >
                  <option value="fixed">Fixed</option>
                  <option value="percentage">Percentage</option>
                </select>
              </div>

              {/* Discount Value */}
              <div className="edit-quotation-item-field">
                <Input
                  label="Discount Value"
                  type="number"
                  min="0"
                  value={item.discount_value}
                  onChange={(e) => {
                    const updatedItems = [...items];

                    updatedItems[index].discount_value = e.target.value;

                    setItems(updatedItems);
                  }}
                />
              </div>

              {/* Remove */}
              <div className="edit-quotation-item-action">
                <Button
                  type="button"
                  variant="secondary"
                  className="edit-quotation-remove-btn"
                  onClick={() => {
                    setItems(items.filter((_, i) => i !== index));
                  }}
                >
                  Remove
                </Button>
              </div>

              <Button
                type="button"
                className="edit-quotation-add-btn"
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
              </Button>
            </div>
          ))}
        </div>

        {/* Quotation Summary */}

        <div className="edit-quotation-summary">
          <div className="edit-quotation-section-header">
            <div>
              <h2>Quotation Summary</h2>
              <p>Review the calculated amounts before saving.</p>
            </div>
          </div>

          <p>Subtotal: ₹{quotationSubtotal.toFixed(2)}</p>

          <p>Item Discount: ₹{itemDiscount.toFixed(2)}</p>

          <p>Tax: ₹{quotationTax.toFixed(2)}</p>

          <p>Quotation Discount: ₹{quotationLevelDiscount.toFixed(2)}</p>

          <h3>Final Total: ₹{finalQuotationTotal.toFixed(2)}</h3>
        </div>

        {/* Actions */}
        <div className="edit-quotation-actions">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(`/quotations/${id}`)}
          >
            Cancel
          </Button>

          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditQuotation;
