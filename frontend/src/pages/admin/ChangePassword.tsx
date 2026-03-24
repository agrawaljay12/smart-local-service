import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { USER_ENDPOINTS } from "../../config/api";
import { getCurrentUser } from "../../utils/authHelper";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export function AdminChangePassword() {
  const { theme } = useTheme();

  const user = getCurrentUser();
  const userId = user?.user_id; 

  const [form, setForm] = useState({
    old_password: "",
    new_password: "",
    confirm_password: ""
  });

  const [showPassword, setShowPassword] = useState({
    old: false,
    new: false,
    confirm: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const inputStyle = {
    backgroundColor: theme === "dark" ? "#111" : "#f5f5f5",
    color: theme === "dark" ? "#fff" : "#000",
    borderColor: "#0891b2"
  };

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!userId) {
      setError("User not authenticated");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const url = USER_ENDPOINTS.change_password.replace(
        "{user_id}",
        userId
      );

      const response = await fetch(url, {
        method: "PUT", // ✅ match backend
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          old_password: form.old_password,
          new_password: form.new_password,
          confirm_password: form.confirm_password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Failed to change password");
        return;
      }

      setSuccess("Password changed successfully!");

      setForm({
        old_password: "",
        new_password: "",
        confirm_password: ""
      });

    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        backgroundColor: theme === "dark" ? "#000" : "#fff",
        color: theme === "dark" ? "#fff" : "#000"
      }}
    >
      <div className="w-full max-w-md p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800">

        <h2 className="text-2xl font-bold mb-6 text-center">
          Change Password
        </h2>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 text-sm rounded bg-red-100 text-red-600">
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="mb-4 p-3 text-sm rounded bg-green-100 text-green-600">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Old Password */}
          <div>
            <label className="block text-sm mb-1">Old Password</label>
            <input
              type={showPassword.old ? "text" : "password"}
              name="old_password"
              value={form.old_password}
              onChange={handleChange}
              style={inputStyle}
              className="w-full px-4 py-2 rounded border focus:outline-none"
            />
            <span
                className="absolute right-3 top-9 cursor-pointer text-gray-500"
                onClick={() =>
                setShowPassword({ ...showPassword, old: !showPassword.old })
                }
            >
                {showPassword.old? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm mb-1">New Password</label>
            <input
              type={showPassword.new?"text":"password"}
              name="new_password"
              value={form.new_password}
              onChange={handleChange}
              style={inputStyle}
              className="w-full px-4 py-2 rounded border focus:outline-none"
            />
              <span
                className="absolute right-3 top-9 cursor-pointer text-gray-500"
                onClick={() =>
                setShowPassword({ ...showPassword, new: !showPassword.new})
                }
            >
                {showPassword.new? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm mb-1">Confirm Password</label>
            <input
              type={showPassword.confirm? "text":"password"}
              name="confirm_password"
              value={form.confirm_password}
              onChange={handleChange}
              style={inputStyle}
              className="w-full px-4 py-2 rounded border focus:outline-none"
            />
            <span
                className="absolute right-3 top-9 cursor-pointer text-gray-500"
                onClick={() =>
                setShowPassword({ ...showPassword, confirm: !showPassword.confirm })
                }
            >
                {showPassword.confirm? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded text-white font-semibold bg-gradient-to-r from-[#0891b2] to-[#06b6d4] hover:opacity-90 transition"
          >
            {loading ? "Updating..." : "Change Password"}
          </button>

        </form>
      </div>
    </div>
  );
}