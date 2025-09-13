import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const ProtectedRoutes = () => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return <div className="text-center text-white">Loading...</div>;
  }

  if (!user || !token) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoutes;
