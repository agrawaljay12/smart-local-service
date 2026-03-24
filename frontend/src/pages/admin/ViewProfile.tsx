import { useEffect, useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { USER_ENDPOINTS } from "../../config/api";
import { getCurrentUser } from "../../utils/authHelper";
import { useNavigate } from "react-router-dom";

export function AdminViewProfile() {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const user = getCurrentUser();
  const userId = user?.user_id;

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) {
        setError("User not authenticated");
        setLoading(false);
        return;
      }

      try {
        const url = USER_ENDPOINTS.fetch_user_by_id.replace(
          "{user_id}",
          userId
        );

        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
          setError(data.detail || "Failed to fetch user");
          return;
        }

        setProfile(data.data);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const containerStyle = {
    backgroundColor: theme === "dark" ? "#000" : "#fff",
    color: theme === "dark" ? "#fff" : "#000"
  };

  if (loading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 mt-10">{error}</div>;
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={containerStyle}
    >
      <div className="w-full max-w-lg p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800">

        {/* Profile Image */}
        <div className="flex flex-col items-center mb-6">
          <img
            src={profile?.profile || "/default.png"}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover border-2 border-[#0891b2]"
          />
          <h2 className="mt-3 text-xl font-bold">
            {profile?.name}
          </h2>
          <p className="text-sm text-gray-500">
            {profile?.email}
          </p>
        </div>

        {/* User Details */}
        <div className="space-y-4">

          <div className="flex justify-between">
            <span className="font-semibold">Phone</span>
            <span>{profile?.phone_no}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-semibold">Address</span>
            <span className="text-right">{profile?.address}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-semibold">Status</span>
            <span className="capitalize">{profile?.status}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-semibold">Role</span>
            <span className="capitalize">{profile?.role}</span>
          </div>

        </div>

        {/* Edit Button */}
        <button
          onClick={() => navigate("/admin/edit-profile")}
          className="w-full mt-6 py-2 rounded text-white font-semibold bg-gradient-to-r from-[#0891b2] to-[#06b6d4] hover:opacity-90 transition"
        >
          Edit Profile
        </button>

      </div>
    </div>
  );
}