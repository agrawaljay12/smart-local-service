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

export const AdminLayout = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [isAuthed, setIsAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      navigate("/admin/auth");
      setIsAuthed(false);
      return;
    }

    const parsedUser = JSON.parse(userData);

    // ✅ Role check
    if (parsedUser.role !== "admin") {
      navigate("/");
      setIsAuthed(false);
      return;
    }

    setIsAuthed(true);
  }, [navigate]);

  if (isAuthed === null) return null;
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

    {/* Right Side (Header + Content) */}
    <div className="flex-1 ml-64 flex flex-col min-h-screen">

      {/* Header */}
      <div className="sticky top-0 z-40">
        <AdminHeader />
      </div>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <Routes>
          <Route index element={<Navigate to="dashboard" />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="manage-service" element={<ManageService />} />
          <Route path="manage-user" element={<ManageUsers />} />
          <Route path="manage-provider" element={<ManageProvider/>} />
          <Route path="view-profile" element={<AdminViewProfile/>} />
          <Route path="edit-profile" element={<AdminEditProfile/>} />
          <Route path="change-password" element={<AdminChangePassword/>} />
        </Routes>
      </main>

    </div>
  </div>
);
};