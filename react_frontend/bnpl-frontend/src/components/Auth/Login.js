import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { LogIn } from "lucide-react";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { login, isAuthenticated, isMerchant } = useAuth();
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
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const result = await login(formData.email, formData.password);

    if (result.success) {
      const redirectPath =
        result.user.user_type === "merchant"
          ? "/merchant/dashboard"
          : "/user/dashboard";
      navigate(redirectPath, { replace: true });
    } else {
      setError(result.error);
    }

    setIsLoading(false);
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
          maxWidth: "400px",
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
              background: "#007bff",
              borderRadius: "50%",
              marginBottom: "16px",
            }}
          >
            <LogIn size={32} color="white" />
          </div>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: "600",
              color: "#333",
              marginBottom: "8px",
            }}
          >
            Welcome to BNPL
          </h1>
          <p style={{ color: "#666", fontSize: "14px" }}>
            Sign in to your account
          </p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
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
            <label htmlFor="password" className="form-label">
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
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
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
                Signing in...
              </>
            ) : (
              <>
                <LogIn size={16} />
                Sign In
              </>
            )}
          </button>
        </form>

        {/* Registration Link */}
        <div
          style={{
            textAlign: "center",
            marginTop: "24px",
            padding: "16px 0",
            borderTop: "1px solid #e9ecef",
          }}
        >
          <p style={{ color: "#666", fontSize: "14px", marginBottom: "0" }}>
            Don't have an account?{" "}
            <Link
              to="/register"
              style={{
                color: "#007bff",
                textDecoration: "none",
                fontWeight: "500",
              }}
            >
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
