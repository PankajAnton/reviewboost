import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ children }) {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <div className="flex flex-col items-center gap-4 rounded-2xl bg-white px-10 py-12 shadow-md">
          <div
            className="h-10 w-10 animate-spin rounded-full border-2 border-[#f97316] border-t-transparent"
            aria-hidden
          />
          <p className="text-sm font-medium text-stone-600">Loading…</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
