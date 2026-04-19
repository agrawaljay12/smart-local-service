import { useEffect, useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { USER_ENDPOINTS } from "../../config/api";
import { getCurrentUser } from "../../utils/authHelper";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth } from "../../utils/fetch_auth";

export function EditProfile() {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const user = getCurrentUser();
  const userId = user?.user_id;

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone_no: "",
    address: "",
    profile: ""
  });

  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const inputStyle = {
    backgroundColor: theme === "dark" ? "#111" : "#f5f5f5",
    color: theme === "dark" ? "#fff" : "#000",
    borderColor: "#0891b2"
  };

  // ✅ Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) {
        setError("User not authenticated");
        return;
      }

      try {
        const url = USER_ENDPOINTS.fetch_user_by_id.replace(
          "{user_id}",
          userId
        );

        const res = await fetchWithAuth(url);
        const data = await res.json();

        if (!res.ok) {
          setError(data.detail || "Failed to fetch user");
          return;
        }

        const userData = data.data;

        setForm({
          name: userData.name || "",
          email: userData.email || "",
          phone_no: userData.phone_no || "",
          address: userData.address || "",
          profile: userData.profile || ""
        });

        // ✅ set profile preview
        if (userData.profile) {
          setPreview(userData.profile);
        }

      } catch (err: any) {
        setError(err.message);
      } finally {
        setFetchLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  // ✅ Submit update (FormData)
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
      const url = USER_ENDPOINTS.edit_user.replace(
        "{user_id}",
        userId
      );

      const formData = new FormData();

      if (form.name) formData.append("name", form.name);
      if (form.email) formData.append("email", form.email);
      if (form.phone_no) formData.append("phone_no", form.phone_no);
      if (form.address) formData.append("address", form.address);

      if (profileFile) {
        formData.append("file", profileFile);
      }

      const res = await fetchWithAuth(url, {
        method: "PUT",
        body: formData
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Update failed");
        return;
      }

      setSuccess("Profile updated successfully!");

      // ✅ optional: redirect after success
      setTimeout(() => navigate("/user/view-profile"), 1500);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        backgroundColor: theme === "dark" ? "#000" : "#fff",
        color: theme === "dark" ? "#fff" : "#000"
      }}
    >
      <div className="w-full max-w-2xl p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800">

        <h2 className="text-2xl font-bold mb-6 text-center">
          Edit Profile
        </h2>

        {/* Alerts */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-600 rounded text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-600 rounded text-sm">
            {success}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* PROFILE IMAGE */}
            <div className="md:col-span-2 flex flex-col items-center mb-4">
              <label className="cursor-pointer">
                <div className="w-28 h-28 rounded-full border-2 border-[#0891b2] overflow-hidden flex items-center justify-center">
                  {preview ? (
                    <img
                      src={
                          preview?.startsWith("http")
                            ? preview
                            : `https://servicehub-i8ef.onrender.com${preview}`
                        }
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-sm text-gray-400">Upload</span>
                  )}
                </div>

                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setProfileFile(file);
                      setPreview(URL.createObjectURL(file));
                    }
                  }}
                />
              </label>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm mb-1">Full Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                style={inputStyle}
                className="w-full px-4 py-2 rounded border"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm mb-1">Email</label>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                style={inputStyle}
                className="w-full px-4 py-2 rounded border"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm mb-1">Phone</label>
              <input
                name="phone_no"
                value={form.phone_no}
                onChange={handleChange}
                style={inputStyle}
                className="w-full px-4 py-2 rounded border"
              />
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-sm mb-1">Address</label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                rows={3}
                style={inputStyle}
                className="w-full px-4 py-2 rounded border"
              />
            </div>

          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-6">

            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 rounded text-white font-semibold bg-gradient-to-r from-[#0891b2] to-[#06b6d4]"
            >
              {loading ? "Updating..." : "Update Profile"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/user/profile")}
              className="flex-1 py-2 rounded border border-gray-400"
            >
              Cancel
            </button>

          </div>
        </form>
      </div>
    </div>
  );
}