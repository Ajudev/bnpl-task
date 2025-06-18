import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calculator,
  Calendar,
  Mail,
  DollarSign,
} from "lucide-react";
import { format, addMonths } from "date-fns";
import api from "../../api";

const CreatePlan = () => {
  const [formData, setFormData] = useState({
    customer_email: "",
    total_amount: "",
    number_of_installments: 4,
    start_date: format(new Date(), "yyyy-MM-dd"),
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear messages when user starts typing
    if (error) setError("");
    if (success) setSuccess("");
  };

  const calculateInstallmentAmount = () => {
    const amount = parseFloat(formData.total_amount);
    const installments = parseInt(formData.number_of_installments);

    if (amount && installments) {
      return (amount / installments).toFixed(2);
    }
    return "0.00";
  };

  const generateInstallmentDates = () => {
    const dates = [];
    const startDate = new Date(formData.start_date);

    for (let i = 0; i < formData.number_of_installments; i++) {
      dates.push(addMonths(startDate, i));
    }

    return dates;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      await api.post("/api/plans/", {
        customer_email: formData.customer_email,
        total_amount: parseFloat(formData.total_amount),
        installment_count: parseInt(formData.number_of_installments),
        start_date: formData.start_date,
      });

      setSuccess("Payment plan created successfully!");

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate("/merchant/dashboard");
      }, 2000);
    } catch (error) {
      console.error("Error creating plan:", error);
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.error ||
        Object.values(error.response?.data || {})
          .flat()
          .join(", ") ||
        "Failed to create payment plan. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const installmentAmount = calculateInstallmentAmount();
  const installmentDates = generateInstallmentDates();

  return (
    <div
      className="container"
      style={{ paddingTop: "24px", paddingBottom: "24px" }}
    >
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <button
          onClick={() => navigate("/merchant/dashboard")}
          className="btn btn-secondary"
          style={{ marginBottom: "16px" }}
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>

        <h1
          style={{
            fontSize: "32px",
            fontWeight: "700",
            color: "#333",
            marginBottom: "8px",
          }}
        >
          Create Payment Plan
        </h1>
        <p style={{ color: "#666", fontSize: "16px" }}>
          Set up a new BNPL payment plan for your customer
        </p>
      </div>

      <div className="grid grid-2" style={{ alignItems: "start" }}>
        {/* Form */}
        <div className="card">
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "600",
              marginBottom: "24px",
            }}
          >
            Plan Details
          </h2>

          {error && <div className="alert alert-error">{error}</div>}

          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="customer_email" className="form-label">
                <Mail
                  size={16}
                  style={{ marginRight: "8px", verticalAlign: "middle" }}
                />
                Customer Email
              </label>
              <input
                type="email"
                id="customer_email"
                name="customer_email"
                className="form-control"
                value={formData.customer_email}
                onChange={handleChange}
                required
                placeholder="customer@example.com"
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="total_amount" className="form-label">
                <DollarSign
                  size={16}
                  style={{ marginRight: "8px", verticalAlign: "middle" }}
                />
                Total Amount (ريال)
              </label>
              <input
                type="number"
                id="total_amount"
                name="total_amount"
                className="form-control"
                value={formData.total_amount}
                onChange={handleChange}
                required
                min="1"
                step="0.01"
                placeholder="1000.00"
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="number_of_installments" className="form-label">
                <Calculator
                  size={16}
                  style={{ marginRight: "8px", verticalAlign: "middle" }}
                />
                Number of Installments
              </label>
              <select
                id="number_of_installments"
                name="number_of_installments"
                className="form-control"
                value={formData.number_of_installments}
                onChange={handleChange}
                disabled={isLoading}
              >
                <option value={2}>2 installments</option>
                <option value={3}>3 installments</option>
                <option value={4}>4 installments</option>
                <option value={6}>6 installments</option>
                <option value={12}>12 installments</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="start_date" className="form-label">
                <Calendar
                  size={16}
                  style={{ marginRight: "8px", verticalAlign: "middle" }}
                />
                Start Date
              </label>
              <input
                type="date"
                id="start_date"
                name="start_date"
                className="form-control"
                value={formData.start_date}
                onChange={handleChange}
                required
                min={format(new Date(), "yyyy-MM-dd")}
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={
                isLoading || !formData.customer_email || !formData.total_amount
              }
              style={{ width: "100%", justifyContent: "center" }}
            >
              {isLoading ? (
                <>
                  <div
                    className="spinner"
                    style={{
                      width: "16px",
                      height: "16px",
                      borderWidth: "2px",
                    }}
                  />
                  Creating Plan...
                </>
              ) : (
                "Create Payment Plan"
              )}
            </button>
          </form>
        </div>

        {/* Preview */}
        <div className="card">
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "600",
              marginBottom: "24px",
            }}
          >
            Plan Preview
          </h2>

          <div style={{ marginBottom: "24px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "8px",
              }}
            >
              <span style={{ color: "#666" }}>Total Amount:</span>
              <span style={{ fontWeight: "600" }}>
                {formData.total_amount
                  ? parseFloat(formData.total_amount).toLocaleString()
                  : "0"}{" "}
                ريال
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "8px",
              }}
            >
              <span style={{ color: "#666" }}>Installments:</span>
              <span style={{ fontWeight: "600" }}>
                {formData.number_of_installments}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "8px",
              }}
            >
              <span style={{ color: "#666" }}>Amount per installment:</span>
              <span style={{ fontWeight: "600", color: "#007bff" }}>
                {parseFloat(installmentAmount).toLocaleString()} ريال
              </span>
            </div>
          </div>

          <div>
            <h3
              style={{
                fontSize: "16px",
                fontWeight: "600",
                marginBottom: "16px",
                color: "#333",
              }}
            >
              Payment Schedule
            </h3>

            <div style={{ maxHeight: "300px", overflowY: "auto" }}>
              {installmentDates.map((date, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 16px",
                    background: "#f8f9fa",
                    borderRadius: "6px",
                    marginBottom: "8px",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: "500", color: "#333" }}>
                      Installment {index + 1}
                    </div>
                    <div style={{ fontSize: "12px", color: "#666" }}>
                      Due: {format(date, "MMM dd, yyyy")}
                    </div>
                  </div>
                  <div
                    style={{
                      fontWeight: "600",
                      color: "#007bff",
                      fontSize: "14px",
                    }}
                  >
                    {parseFloat(installmentAmount).toLocaleString()} ريال
                  </div>
                </div>
              ))}
            </div>
          </div>

          {formData.total_amount && (
            <div
              style={{
                marginTop: "24px",
                padding: "16px",
                background: "#f0f7ff",
                borderRadius: "6px",
                border: "1px solid #cce5ff",
              }}
            >
              <div style={{ fontSize: "14px", color: "#004085" }}>
                <strong>Note:</strong> The customer will receive an email
                notification about this payment plan once created.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatePlan;
