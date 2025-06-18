import { useState, useEffect } from "react";
import {
  CreditCard,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  DollarSign,
} from "lucide-react";
import { format, isAfter, parseISO } from "date-fns";
import api from "../../api";

const UserDashboard = () => {
  const [plans, setPlans] = useState([]);
  const [installments, setInstallments] = useState([]);
  const [summary, setSummary] = useState({
    total_debt: 0,
    upcoming_payments: 0,
    overdue_payments: 0,
    completed_payments: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentLoading, setPaymentLoading] = useState({});

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/api/plans/");
      const userPlans = response.data.results || response.data;

      setPlans(userPlans);

      // Flatten all installments from all plans
      const allInstallments = userPlans.flatMap((plan) =>
        (plan.installments || []).map((installment) => ({
          ...installment,
          plan_id: plan.id,
          plan_total: plan.total_amount,
          merchant_name: plan.merchant_name || "Merchant",
        }))
      );

      setInstallments(allInstallments);

      // Calculate summary
      const totalDebt = allInstallments
        .filter((i) => i.status === "pending" || i.status === "overdue")
        .reduce((sum, i) => sum + parseFloat(i.amount), 0);

      const upcomingPayments = allInstallments.filter(
        (i) =>
          i.status === "pending" && !isAfter(new Date(), parseISO(i.due_date))
      ).length;

      const overduePayments = allInstallments.filter(
        (i) =>
          i.status === "overdue" && isAfter(new Date(), parseISO(i.due_date))
      ).length;

      const completedPayments = allInstallments.filter(
        (i) => i.status === "paid"
      ).length;

      setSummary({
        total_debt: totalDebt,
        upcoming_payments: upcomingPayments,
        overdue_payments: overduePayments,
        completed_payments: completedPayments,
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
      setError("Failed to load your payment plans");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayInstallment = async (installmentId) => {
    setPaymentLoading((prev) => ({ ...prev, [installmentId]: true }));

    try {
      await api.post(`/api/plans/installments/pay/${installmentId}`);

      // Refresh data after successful payment
      await fetchUserData();
    } catch (error) {
      console.error("Payment error:", error);
      setError("Failed to process payment. Please try again.");
    } finally {
      setPaymentLoading((prev) => ({ ...prev, [installmentId]: false }));
    }
  };

  const getInstallmentStatus = (installment) => {
    if (installment.status === "paid") {
      return { class: "status-paid", text: "Paid", icon: CheckCircle };
    } else if (isAfter(new Date(), parseISO(installment.due_date))) {
      return { class: "status-late", text: "Overdue", icon: AlertCircle };
    } else {
      return { class: "status-pending", text: "Pending", icon: Clock };
    }
  };

  const calculatePlanProgress = (plan) => {
    const paidInstallments = (plan.installments || []).filter(
      (i) => i.status === "paid"
    ).length;
    const totalInstallments =
      plan.installments?.length || plan.number_of_installments || 0;
    return totalInstallments > 0
      ? (paidInstallments / totalInstallments) * 100
      : 0;
  };

  const sortedInstallments = installments.sort((a, b) => {
    // Sort by status (pending first) then by due date
    if (a.status !== b.status) {
      return a.status === "pending" ? -1 : 1;
    }
    return new Date(a.due_date) - new Date(b.due_date);
  });

  if (isLoading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div
      className="container"
      style={{ paddingTop: "24px", paddingBottom: "24px" }}
    >
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <h1
          style={{
            fontSize: "32px",
            fontWeight: "700",
            color: "#333",
            marginBottom: "8px",
          }}
        >
          My Payment Plans
        </h1>
        <p style={{ color: "#666", fontSize: "16px" }}>
          Track and manage your installment payments
        </p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Summary Cards */}
      <div className="grid grid-4" style={{ marginBottom: "32px" }}>
        <div className="card">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <p
                style={{ color: "#666", fontSize: "14px", marginBottom: "4px" }}
              >
                Total Outstanding
              </p>
              <p style={{ fontSize: "24px", fontWeight: "700", color: "#333" }}>
                {summary.total_debt.toLocaleString()} ريال
              </p>
            </div>
            <div
              style={{
                width: "48px",
                height: "48px",
                background: "#fff2f0",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <DollarSign size={24} color="#ff4d4f" />
            </div>
          </div>
        </div>

        <div className="card">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <p
                style={{ color: "#666", fontSize: "14px", marginBottom: "4px" }}
              >
                Upcoming Payments
              </p>
              <p style={{ fontSize: "24px", fontWeight: "700", color: "#333" }}>
                {summary.upcoming_payments}
              </p>
            </div>
            <div
              style={{
                width: "48px",
                height: "48px",
                background: "#e6f7ff",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Clock size={24} color="#1890ff" />
            </div>
          </div>
        </div>

        <div className="card">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <p
                style={{ color: "#666", fontSize: "14px", marginBottom: "4px" }}
              >
                Completed Payments
              </p>
              <p style={{ fontSize: "24px", fontWeight: "700", color: "#333" }}>
                {summary.completed_payments}
              </p>
            </div>
            <div
              style={{
                width: "48px",
                height: "48px",
                background: "#f6ffed",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CheckCircle size={24} color="#52c41a" />
            </div>
          </div>
        </div>

        <div className="card">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <p
                style={{ color: "#666", fontSize: "14px", marginBottom: "4px" }}
              >
                Overdue Payments
              </p>
              <p style={{ fontSize: "24px", fontWeight: "700", color: "#333" }}>
                {summary.overdue_payments}
              </p>
            </div>
            <div
              style={{
                width: "48px",
                height: "48px",
                background: "#fff2f0",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AlertCircle size={24} color="#ff4d4f" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-2">
        {/* Payment Plans Overview */}
        <div className="card">
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "600",
              marginBottom: "24px",
            }}
          >
            Payment Plans
          </h2>

          {plans.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "48px 24px",
                color: "#666",
              }}
            >
              <CreditCard
                size={48}
                style={{ marginBottom: "16px", opacity: 0.5 }}
              />
              <p style={{ fontSize: "16px", marginBottom: "8px" }}>
                No payment plans
              </p>
              <p style={{ fontSize: "14px" }}>
                You don't have any active payment plans at the moment.
              </p>
            </div>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              {plans.map((plan) => {
                const progress = calculatePlanProgress(plan);
                const paidAmount = (plan.installments || [])
                  .filter((i) => i.status === "paid")
                  .reduce((sum, i) => sum + parseFloat(i.amount), 0);

                return (
                  <div
                    key={plan.id}
                    style={{
                      padding: "16px",
                      border: "1px solid #e9ecef",
                      borderRadius: "8px",
                      background: "#f8f9fa",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "start",
                        marginBottom: "12px",
                      }}
                    >
                      <div>
                        <h3
                          style={{
                            fontSize: "16px",
                            fontWeight: "600",
                            marginBottom: "4px",
                          }}
                        >
                          {plan.merchant_name || "Payment Plan"}
                        </h3>
                        <p style={{ fontSize: "14px", color: "#666" }}>
                          {plan.total_amount.toLocaleString()} ريال •{" "}
                          {plan.number_of_installments} installments
                        </p>
                      </div>
                      <span
                        className={`status-badge ${
                          plan.status === "completed"
                            ? "status-completed"
                            : "status-active"
                        }`}
                      >
                        {plan.status}
                      </span>
                    </div>

                    <div style={{ marginBottom: "8px" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "12px",
                          color: "#666",
                          marginBottom: "4px",
                        }}
                      >
                        <span>Progress</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "12px",
                        color: "#666",
                      }}
                    >
                      <span>Paid: {paidAmount.toLocaleString()} ريال</span>
                      <span>
                        Remaining:{" "}
                        {(plan.total_amount - paidAmount).toLocaleString()} ريال
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Installments */}
        <div className="card">
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "600",
              marginBottom: "24px",
            }}
          >
            Payment Schedule
          </h2>

          {sortedInstallments.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "48px 24px",
                color: "#666",
              }}
            >
              <Calendar
                size={48}
                style={{ marginBottom: "16px", opacity: 0.5 }}
              />
              <p style={{ fontSize: "16px", marginBottom: "8px" }}>
                No payments scheduled
              </p>
              <p style={{ fontSize: "14px" }}>
                Your payment schedule will appear here.
              </p>
            </div>
          ) : (
            <div
              style={{
                maxHeight: "500px",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              {sortedInstallments.map((installment) => {
                const status = getInstallmentStatus(installment);
                const StatusIcon = status.icon;
                const isOverdue = status.text === "Overdue";
                const isPaid = installment.status === "paid";

                return (
                  <div
                    key={installment.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "16px",
                      border: `1px solid ${
                        isOverdue ? "#ffccc7" : isPaid ? "#b7eb8f" : "#d9d9d9"
                      }`,
                      borderRadius: "8px",
                      background: isOverdue
                        ? "#fff2f0"
                        : isPaid
                        ? "#f6ffed"
                        : "white",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginBottom: "4px",
                        }}
                      >
                        <StatusIcon
                          size={16}
                          style={{
                            marginRight: "8px",
                            color: isOverdue
                              ? "#ff4d4f"
                              : isPaid
                              ? "#52c41a"
                              : "#1890ff",
                          }}
                        />
                        <span style={{ fontWeight: "500", fontSize: "14px" }}>
                          {installment.merchant_name}
                        </span>
                      </div>

                      <div
                        style={{
                          fontSize: "12px",
                          color: "#666",
                          marginBottom: "4px",
                        }}
                      >
                        Due:{" "}
                        {format(parseISO(installment.due_date), "MMM dd, yyyy")}
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <span
                          style={{
                            fontWeight: "600",
                            fontSize: "16px",
                            color: "#333",
                          }}
                        >
                          {parseFloat(installment.amount).toLocaleString()} ريال
                        </span>
                        <span className={`status-badge ${status.class}`}>
                          {status.text}
                        </span>
                      </div>
                    </div>

                    {(installment.status === "pending" ||
                      installment.status === "overdue") && (
                      <button
                        onClick={() => handlePayInstallment(installment.id)}
                        disabled={paymentLoading[installment.id]}
                        className="btn btn-success"
                        style={{ marginLeft: "16px" }}
                      >
                        {paymentLoading[installment.id] ? (
                          <>
                            <div
                              className="spinner"
                              style={{
                                width: "16px",
                                height: "16px",
                                borderWidth: "2px",
                              }}
                            />
                            Paying...
                          </>
                        ) : (
                          <>
                            <CreditCard size={16} />
                            Pay Now
                          </>
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
