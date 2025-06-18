import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { UserPlus, User, Building, Mail, Lock, Phone } from "lucide-react";
import api from "../../api";

const Register = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    password_confirm: "",
    user_type: "customer",
    phone: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { isAuthenticated, isMerchant } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated()) {
      navigate(isMerchant() ? "/merchant/dashboard" : "/user/dashboard", {
        replace: true,
      });
    }
  }, [isAuthenticated, isMerchant, navigate]);

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

  const validateForm = () => {
    if (
      !formData.email ||
      !formData.password ||
      !formData.password_confirm ||
      !formData.phone
    ) {
      setError("All fields are required");
      return false;
    }

    if (formData.password !== formData.password_confirm) {
      setError("Passwords do not match");
      return false;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    if (!phoneRegex.test(formData.phone)) {
      setError("Please enter a valid phone number");
      return false;
    }

    if (formData.phone.length > 15) {
      setError("Phone number should not be longer than 15 characters");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      await api.post("/api/auth/register/", {
        username: formData.email,
        password: formData.password,
        password_confirm: formData.password_confirm,
        user_type: formData.user_type,
        phone: formData.phone,
      });

      setSuccess(
        "Registration successful! You can now login with your credentials."
      );

      // Clear form
      setFormData({
        email: "",
        password: "",
        password_confirm: "",
        user_type: "customer",
        phone: "",
      });

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error("Registration error:", error);

      if (error.response?.data) {
        const errorData = error.response.data;

        // Handle field-specific errors
        if (
          typeof errorData === "object" &&
          !errorData.detail &&
          !errorData.error
        ) {
          const fieldErrors = Object.entries(errorData)
            .map(([field, messages]) => {
              const fieldName =
                field === "password_confirm"
                  ? "Password confirmation"
                  : field.charAt(0).toUpperCase() + field.slice(1);
              return `${fieldName}: ${
                Array.isArray(messages) ? messages.join(", ") : messages
              }`;
            })
            .join("\n");
          setError(fieldErrors);
        } else {
          // Handle general errors
          const errorMessage =
            errorData.detail ||
            errorData.error ||
            errorData.message ||
            "Registration failed. Please try again.";
          setError(errorMessage);
        }
      } else {
        setError(
          "Registration failed. Please check your connection and try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      <div
        className="card"
        style={{
          width: "100%",
          maxWidth: "450px",
          margin: "20px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "64px",
              height: "64px",
              background: "#28a745",
              borderRadius: "50%",
              marginBottom: "16px",
            }}
          >
            <UserPlus size={32} color="white" />
          </div>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: "600",
              color: "#333",
              marginBottom: "8px",
            }}
          >
            Create Account
          </h1>
          <p style={{ color: "#666", fontSize: "14px" }}>
            Join BNPL and start managing payments
          </p>
        </div>

        {error && (
          <div className="alert alert-error" style={{ whiteSpace: "pre-line" }}>
            {error}
          </div>
        )}

        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          {/* User Type Selection */}
          <div className="form-group">
            <label className="form-label">Account Type:</label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
              }}
            >
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "12px",
                  border: `2px solid ${
                    formData.user_type === "customer" ? "#28a745" : "#ddd"
                  }`,
                  borderRadius: "6px",
                  cursor: "pointer",
                  background:
                    formData.user_type === "customer" ? "#f0fff4" : "white",
                }}
              >
                <input
                  type="radio"
                  name="user_type"
                  value="customer"
                  checked={formData.user_type === "customer"}
                  onChange={handleChange}
                  style={{ display: "none" }}
                />
                <User size={20} style={{ marginRight: "8px" }} />
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  Customer
                </span>
              </label>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "12px",
                  border: `2px solid ${
                    formData.user_type === "merchant" ? "#28a745" : "#ddd"
                  }`,
                  borderRadius: "6px",
                  cursor: "pointer",
                  background:
                    formData.user_type === "merchant" ? "#f0fff4" : "white",
                }}
              >
                <input
                  type="radio"
                  name="user_type"
                  value="merchant"
                  checked={formData.user_type === "merchant"}
                  onChange={handleChange}
                  style={{ display: "none" }}
                />
                <Building size={20} style={{ marginRight: "8px" }} />
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  Merchant
                </span>
              </label>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              <Mail
                size={16}
                style={{ marginRight: "8px", verticalAlign: "middle" }}
              />
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone" className="form-label">
              <Phone
                size={16}
                style={{ marginRight: "8px", verticalAlign: "middle" }}
              />
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              className="form-control"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="+966 50 123 4567"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              <Lock
                size={16}
                style={{ marginRight: "8px", verticalAlign: "middle" }}
              />
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-control"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
              disabled={isLoading}
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password_confirm" className="form-label">
              <Lock
                size={16}
                style={{ marginRight: "8px", verticalAlign: "middle" }}
              />
              Confirm Password
            </label>
            <input
              type="password"
              id="password_confirm"
              name="password_confirm"
              className="form-control"
              value={formData.password_confirm}
              onChange={handleChange}
              required
              placeholder="Confirm your password"
              disabled={isLoading}
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className="btn btn-success"
            disabled={isLoading}
            style={{
              width: "100%",
              justifyContent: "center",
              marginTop: "8px",
            }}
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
                Creating Account...
              </>
            ) : (
              <>
                <UserPlus size={16} />
                Create Account
              </>
            )}
          </button>
        </form>

        {/* Login Link */}
        <div
          style={{
            textAlign: "center",
            marginTop: "24px",
            padding: "16px 0",
            borderTop: "1px solid #e9ecef",
          }}
        >
          <p style={{ color: "#666", fontSize: "14px", marginBottom: "0" }}>
            Already have an account?{" "}
            <Link
              to="/login"
              style={{
                color: "#007bff",
                textDecoration: "none",
                fontWeight: "500",
              }}
            >
              Sign In
            </Link>
          </p>
        </div>

        {/* Requirements */}
        <div
          style={{
            marginTop: "16px",
            padding: "16px",
            background: "#f8f9fa",
            borderRadius: "6px",
            fontSize: "12px",
            color: "#666",
          }}
        >
          <p style={{ marginBottom: "8px", fontWeight: "500" }}>
            Password Requirements:
          </p>
          <ul style={{ margin: "0", paddingLeft: "16px" }}>
            <li>Minimum 6 characters</li>
            <li>Must match confirmation</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Register;
