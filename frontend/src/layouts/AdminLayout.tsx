import { useState, useEffect } from "react";
import { useNavigate, Routes, Route, Navigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import AdminSidebar, { AdminMobileHeader } from "../pages/admin/AdminSidebar";
import { AdminDashboard } from "../pages/admin/AdminDashboard";

export const AdminLayout = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [isAuthed, setIsAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      navigate('/admin/auth');
      setIsAuthed(false);
      return;
    }

    const parsedUser = JSON.parse(userData);

    // ✅ Role check
    if (parsedUser.role !== "admin") {
      navigate('/');
      setIsAuthed(false);
      return;
    }

    setAdminUser(parsedUser);
    setIsAuthed(true);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    navigate('/admin/auth');
  };

  if (isAuthed === null) return null;
  if (!isAuthed) return null;

  return (
    <div className="min-h-screen flex flex-col md:flex-row">

      <div className="hidden md:block">
        <AdminSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onLogout={handleLogout}
          adminUser={adminUser}
        />
      </div>

      <div className="flex-1 flex flex-col">
        <AdminMobileHeader
          onMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          theme={theme}
          adminUser={adminUser}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Routes>
            <Route index element={<Navigate to="dashboard" />} />
            <Route path="dashboard" element={<AdminDashboard activeTab={activeTab} />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};