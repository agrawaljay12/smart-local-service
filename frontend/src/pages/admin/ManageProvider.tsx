import { useEffect, useState } from "react";
import { USER_ENDPOINTS } from "../../config/api";
import { useTheme } from "../../context/ThemeContext";
import { getAuthHeaderForFormData } from "../../utils/authHelper";

export function ManageProvider() {
  const { theme } = useTheme();

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // FETCH USERS (ADMIN ONLY)
  const fetchUsers = async () => {
    try {
      const res = await fetch(USER_ENDPOINTS.fetch_all_provider, {
        method: "GET",  
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaderForFormData() // TOKEN HERE
        }
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Unauthorized or failed");
      }

      setUsers(data.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // DELETE USER
  const handleDelete = async (userId: string) => {
    const confirmDelete = window.confirm("Delete this user?");
    if (!confirmDelete) return;

    try {
      const url = USER_ENDPOINTS.delete_user_by_id.replace(
        "{user_id}",
        userId
      );

      const res = await fetch(url, {
        method: "DELETE",
        headers: {
          ...getAuthHeaderForFormData() // ✅ TOKEN HERE
        }
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Delete failed");
      }

      // ✅ Remove from UI instantly
      setUsers((prev) => prev.filter((u) => u.id !== userId));

    } catch (err: any) {
      alert(err.message);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="p-6">

      {/* Title */}
      <h1 className="text-2xl font-bold mb-6">
        Manage Users
      </h1>

      {/* Loading */}
      {loading && <p>Loading users...</p>}

      {/* Error */}
      {error && (
        <div className="text-red-500 mb-4">{error}</div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {users.map((user) => (
          <div
            key={user.id}
            className="p-5 rounded-xl shadow border hover:shadow-lg transition flex flex-col justify-between h-full"
            style={{
              backgroundColor: theme === "dark" ? "#0a0a0a" : "#fff",
              borderColor: "rgba(0,0,0,0.1)"
            }}
          >
            {/* Avatar */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold">
                {user.name?.charAt(0)?.toUpperCase() || "U"}
              </div>

              <div>
                <h2 className="font-semibold text-lg">
                  {user.name || "No Name"}
                </h2>
                <p className="text-sm text-gray-400">
                  {user.email}
                </p>
              </div>
            </div>

            {/* Info */}
            <div className="text-sm space-y-2">
              <p>
                <strong>Phone:</strong> {user.phone_no || "N/A"}
              </p>
              <p>
                <strong>Address:</strong> {user.address || "N/A"}
              </p>
            </div>

            {/* Delete Button */}
            <button
              onClick={() => handleDelete(user.id)}
              className="mt-5 w-full py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition"
            >
              Delete User
            </button>
          </div>
        ))}

      </div>

      {/* Empty */}
      {!loading && users.length === 0 && (
        <p className="text-center text-gray-400 mt-10">
          No users found
        </p>
      )}
    </div>
  );
}