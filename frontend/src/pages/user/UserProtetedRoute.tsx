import { Navigate, Outlet } from "react-router-dom";

export function ProviderProtectedRoute() {
  const token = localStorage.getItem("access_token");
  const user = localStorage.getItem("user");

  let parsedUser = null;

  try {
    parsedUser = user ? JSON.parse(user) : null;
  } catch {
    parsedUser = null;
  }

  // If not logged in → ALWAYS redirect
  if (!token) {
    return <Navigate to="/auth/signin" replace />;
  }

  // Wrong role
  if (parsedUser?.role !== "user") {
    return <Navigate to="/auth/signin" replace />;
  }

  return <Outlet />;
}