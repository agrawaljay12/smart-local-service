import { useEffect, useState } from "react";
import { USER_ENDPOINTS } from "../../config/api";
import { useTheme } from "../../context/ThemeContext";

export function ManageUsers() {
  const { theme } = useTheme();

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ Fetch Users
  const fetchUsers = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(USER_ENDPOINTS.fetchAll);
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to fetch users");
        return;
      }

      setUsers(data.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Delete User
  const handleDelete = async (userId: string) => {
    const confirmDelete = window.confirm("Are you sure to delete?");
    if (!confirmDelete) return;

    try {
      const url = USER_ENDPOINTS.delete_user_by_id.replace(
        "{user_id}",
        userId
      );

      const res = await fetch(url, {
        method: "DELETE"
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Delete failed");
        return;
      }

      // ✅ Remove user from UI
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err: any) {
      alert(err.message);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div
      className="p-6 min-h-screen"
      style={{
        backgroundColor: theme === "dark" ? "#000" : "#f9fafb",
        color: theme === "dark" ? "#fff" : "#000"
      }}
    >
      <h2 className="text-2xl font-bold mb-6">All Users</h2>

      {/* Loading */}
      {loading && <p>Loading users...</p>}

      {/* Error */}
      {error && (
        <div className="p-3 mb-4 bg-red-100 text-red-600 rounded">
          {error}
        </div>
      )}

      {/* Users Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <div
            key={user.id}
            className="p-5 rounded-xl shadow-md border transition hover:shadow-lg"
            style={{
              backgroundColor: theme === "dark" ? "#0a0a0a" : "#fff"
            }}
          >
            {/* Avatar */}
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-cyan-500 flex items-center justify-center text-white text-xl font-bold">
                {user.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
            </div>

            {/* Info */}
            <div className="text-center space-y-1">
              <h3 className="text-lg font-semibold">
                {user.name || "No Name"}
              </h3>
              <p className="text-sm text-gray-500">
                {user.email || "No Email"}
              </p>
              <p className="text-sm text-gray-500">
                {user.phone_no || "No Phone"}
              </p>
              <p className="text-sm text-gray-500">
                {user.address || "No Address"}
              </p>
            </div>

            {/* Actions */}
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => handleDelete(user.id)}
                className="px-4 py-2 text-sm rounded bg-red-500 text-white hover:bg-red-600 transition"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {!loading && users.length === 0 && (
        <p className="text-center mt-10 text-gray-500">
          No users found
        </p>
      )}
    </div>
  );
}