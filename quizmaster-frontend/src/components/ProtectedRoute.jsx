import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, requireRole }) {
  const { user, role, loading } = useAuth();
  console.log('ProtectedRoute check:', { user, role, requireRole, loading });

  if (loading) return <p style={{padding:16}}>Loading…</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (requireRole && role !== requireRole) {
    console.log('Role mismatch:', { required: requireRole, actual: role });
    return <Navigate to="/" replace />;
  }

  return children;
}
