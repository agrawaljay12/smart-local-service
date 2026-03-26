import { Navigate, Outlet } from "react-router-dom";
import { useEffect } from "react";

export function UserProtectedRoute() {
  const token = localStorage.getItem("access_token");
  const user = localStorage.getItem("user");

  let parsedUser = null;

  useEffect(() => {
    const handleBack = () => {
      window.history.pushState(null, "", window.location.href);
    };

    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handleBack);

    return () => {
      window.removeEventListener("popstate", handleBack);
    };
  }, []);

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