import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Users,
  Award,
} from "lucide-react";
import { format } from "date-fns";
import api from "../../api";

const MerchantDashboard = () => {
  const [plans, setPlans] = useState([]);
  const [analytics, setAnalytics] = useState({
    total_revenue: 0,
    active_plans: 0,
    overdue_installments: 0,
    completed_plans: 0,
    success_rate: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [plansResponse, analyticsResponse] = await Promise.all([
        api.get("/api/plans/"),
        api.get("/api/analytics/dashboard/"),
      ]);

      setPlans(plansResponse.data.results || plansResponse.data);
      setAnalytics(analyticsResponse.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      active: "status-active",
      completed: "status-completed",
      overdue: "status-late",
    };

    return (
      <span
        className={`status-badge ${statusClasses[status] || "status-pending"}`}
      >
        {status}
      </span>
    );
  };

  const calculateProgress = (plan) => {
    const paidInstallments =
      plan.installments?.filter((i) => i.status === "paid").length || 0;
    const totalInstallments =
      plan.installments?.length || plan.installment_count || 0;
    return totalInstallments > 0
      ? (paidInstallments / totalInstallments) * 100
      : 0;
  };

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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "32px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "32px",
              fontWeight: "700",
              color: "#333",
              marginBottom: "8px",
            }}
          >
            Merchant Dashboard
          </h1>
          <p style={{ color: "#666", fontSize: "16px" }}>
            Manage your payment plans and track performance
          </p>
        </div>
        <Link to="/merchant/create-plan" className="btn btn-primary">
          <Plus size={20} />
          Create New Plan
        </Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Analytics Cards */}
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
                Total Revenue
              </p>
              <p style={{ fontSize: "24px", fontWeight: "700", color: "#333" }}>
                {analytics.total_revenue.toLocaleString()} ريال
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
              <DollarSign size={24} color="#1890ff" />
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
                Active Plans
              </p>
              <p style={{ fontSize: "24px", fontWeight: "700", color: "#333" }}>
                {analytics.active_plans}
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
              <TrendingUp size={24} color="#52c41a" />
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
                Completed Plans
              </p>
              <p style={{ fontSize: "24px", fontWeight: "700", color: "#333" }}>
                {analytics.completed_plans}
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
                Success Rate
              </p>
              <p style={{ fontSize: "24px", fontWeight: "700", color: "#333" }}>
                {analytics.success_rate.toLocaleString()} %
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
              <Award size={24} color="#52c41a" />
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
                Overdue Installments
              </p>
              <p style={{ fontSize: "24px", fontWeight: "700", color: "#333" }}>
                {analytics.overdue_installments}
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

      {/* Payment Plans Table */}
      <div className="card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <h2 style={{ fontSize: "20px", fontWeight: "600", color: "#333" }}>
            Payment Plans
          </h2>
          <span style={{ color: "#666", fontSize: "14px" }}>
            {plans.length} total plans
          </span>
        </div>

        {plans.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "48px 24px",
              color: "#666",
            }}
          >
            <Users size={48} style={{ marginBottom: "16px", opacity: 0.5 }} />
            <p style={{ fontSize: "16px", marginBottom: "8px" }}>
              No payment plans yet
            </p>
            <p style={{ fontSize: "14px", marginBottom: "24px" }}>
              Create your first payment plan to get started
            </p>
            <Link to="/merchant/create-plan" className="btn btn-primary">
              <Plus size={16} />
              Create Plan
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Installments</th>
                  <th>Progress</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Next Due</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((plan) => {
                  const progress = calculateProgress(plan);
                  const nextDueInstallment = plan.installments?.find(
                    (i) => i.status === "pending"
                  );

                  return (
                    <tr key={plan.id}>
                      <td>
                        <div>
                          <div style={{ fontWeight: "500", color: "#333" }}>
                            {plan.customer_name || plan.customer_email}
                          </div>
                          {plan.customer_name && (
                            <div style={{ fontSize: "12px", color: "#666" }}>
                              {plan.customer_email}
                            </div>
                          )}
                        </div>
                      </td>
                      <td style={{ fontWeight: "500" }}>
                        {plan.total_amount.toLocaleString()} ريال
                      </td>
                      <td>
                        <span
                          style={{
                            background: "#f8f9fa",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontSize: "12px",
                            fontWeight: "500",
                          }}
                        >
                          {plan.installments?.filter((i) => i.status === "paid")
                            .length || 0}{" "}
                          / {plan.installment_count}
                        </span>
                      </td>
                      <td>
                        <div style={{ width: "100px" }}>
                          <div
                            className="progress-bar"
                            style={{ height: "6px" }}
                          >
                            <div
                              className="progress-fill"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#666",
                              marginTop: "4px",
                            }}
                          >
                            {Math.round(progress)}%
                          </div>
                        </div>
                      </td>
                      <td>{getStatusBadge(plan.status)}</td>
                      <td style={{ color: "#666", fontSize: "14px" }}>
                        {format(new Date(plan.created_at), "MMM dd, yyyy")}
                      </td>
                      <td>
                        {nextDueInstallment ? (
                          <div style={{ fontSize: "14px" }}>
                            <div style={{ color: "#333", fontWeight: "500" }}>
                              {format(
                                new Date(nextDueInstallment.due_date),
                                "MMM dd"
                              )}
                            </div>
                            <div style={{ color: "#666", fontSize: "12px" }}>
                              {nextDueInstallment.amount.toLocaleString()} ريال
                            </div>
                          </div>
                        ) : (
                          <span style={{ color: "#999", fontSize: "14px" }}>
                            -
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MerchantDashboard;
