import { Navigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

const PrivateRoute = ({ children, requiredRoles = [] }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <div className="container mt-5">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles.length > 0 && user) {
    const userRoles = user.roles || [];
    const hasRequiredRole = requiredRoles.some((role) =>
      userRoles.includes(role)
    );

    if (!hasRequiredRole) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default PrivateRoute;

