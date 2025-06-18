import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user?.user_type !== requiredRole) {
    const redirectPath =
      user?.user_type === "merchant"
        ? "/merchant/dashboard"
        : "/user/dashboard";
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
