import { Navigate } from 'react-router-dom';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * AdminProtectedRoute component
 * Protects admin routes by checking for admin token
 * Only allows access if user is authenticated as admin
 */
export function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const adminToken = sessionStorage.getItem('access_token');
  const user = localStorage.getItem("user");

  if (!adminToken || !user) {
    return <Navigate to="/auth/signin" replace />;
  }

  try {
     const prasejson = JSON.parse(user);
     if (prasejson.role !=="admin") {
        return <Navigate to="/" replace />;
     }
  }
  catch{
    return <Navigate to="/auth/signin" replace />;
  }

  return <>{children}</>;
}
