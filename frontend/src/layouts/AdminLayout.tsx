import { useEffect, useState } from "react";
import { useNavigate, Routes, Route, Navigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { AdminSidebar } from "../components/admin/Sidebar";
import { AdminDashboard } from "../pages/admin/AdminDashboard";
import { AdminHeader } from "../components/admin/Header";
import { ManageService } from "../pages/admin/ManageService";
import { ManageUsers } from "../pages/admin/ManageUser";
import { ManageProvider } from "../pages/admin/ManageProvider";
import { AdminViewProfile } from "../pages/admin/ViewProfile";
import { AdminEditProfile } from "../pages/admin/EditProfile";
import { AdminChangePassword } from "../pages/admin/ChangePassword";
import { ProviderRequest } from "../pages/admin/ProviderRequest";

export const AdminLayout = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [isAuthed, setIsAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      navigate("/auth/signin", { replace: true }); // ✅ FIXED
      setIsAuthed(false);
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);

      if (parsedUser.role !== "admin") {
        navigate("/", { replace: true }); 
        setIsAuthed(false);
        return;
      }

      setIsAuthed(true);
    } catch {
      navigate("/auth/signin", { replace: true });
      setIsAuthed(false);
    }
  }, [navigate]);

  useEffect(() => {
    
    // Push current state
    window.history.pushState(null, "", window.location.href);

    const handlePopState = () => {
      // Prevent going back
      window.history.pushState(null, "", window.location.href);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  if (isAuthed === null) return null;

  // 🔥 Block rendering if not authed
  if (!isAuthed) return null;

  return (
    <div
      className="min-h-screen flex"
      style={{
        backgroundColor: theme === "dark" ? "#000" : "#f9fafb"
      }}
    >
      {/* Sidebar */}
      <AdminSidebar />

      {/* Right Side */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">

        {/* Header */}
        <div className="sticky top-0 z-40">
          <AdminHeader />
        </div>

        {/* Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Routes>
            <Route index element={<Navigate to="dashboard" replace />} /> 
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="manage-service" element={<ManageService />} />
            <Route path="manage-user" element={<ManageUsers />} />
            <Route path="manage-provider" element={<ManageProvider />} />
            <Route path="view-profile" element={<AdminViewProfile />} />
            <Route path="edit-profile" element={<AdminEditProfile />} />
            <Route path="change-password" element={<AdminChangePassword />} />
            <Route path="request" element={<ProviderRequest/>} />
          </Routes>
        </main>

      </div>
    </div>
  );
};