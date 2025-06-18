import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { LogOut, User, Building, CreditCard } from "lucide-react";

const Navbar = () => {
  const { user, logout, isAuthenticated, isMerchant } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (
    !isAuthenticated() ||
    location.pathname === "/login" ||
    location.pathname === "/register"
  ) {
    return null;
  }

  return (
    <nav
      style={{
        background: "white",
        borderBottom: "1px solid #e9ecef",
        padding: "0",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          height: "64px",
        }}
      >
        {/* Logo/Brand */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <Link
            to={isMerchant() ? "/merchant/dashboard" : "/user/dashboard"}
            style={{
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
              color: "#333",
              fontSize: "20px",
              fontWeight: "600",
            }}
          >
            <CreditCard
              size={24}
              style={{ marginRight: "8px", color: "#007bff" }}
            />
            BNPL Dashboard
          </Link>
        </div>

        {/* User Menu */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 12px",
              background: "#f8f9fa",
              borderRadius: "6px",
            }}
          >
            {isMerchant() ? (
              <Building size={16} color="#666" />
            ) : (
              <User size={16} color="#666" />
            )}
            <span style={{ fontSize: "14px", color: "#666" }}>
              {user?.first_name || user?.email}
            </span>
            <span
              style={{
                fontSize: "12px",
                color: "#999",
                textTransform: "capitalize",
              }}
            >
              ({user?.user_type})
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="btn btn-secondary"
            style={{
              padding: "8px 12px",
              fontSize: "14px",
            }}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
