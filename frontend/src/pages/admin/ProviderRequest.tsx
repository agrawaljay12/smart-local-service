import { useEffect, useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { getAuthHeader } from "../../utils/authHelper";

const API_BASE = "http://127.0.0.1:8000/api/v1/provider";

export function ProviderRequest() {
  const { theme } = useTheme();

  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ FETCH PENDING PROVIDERS
  const fetchProviders = async () => {
    try {
      const res = await fetch(`${API_BASE}/fetch_all/pending`, {
        method: "GET",
        headers: getAuthHeader()
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setProviders(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ APPROVE / REJECT
  const handleAction = async (id: string, status: "approved" | "rejected") => {
    try {
      const res = await fetch(
        `${API_BASE}/verify/${id}?status=${status}`,
        {
          method: "PUT",
          headers: getAuthHeader()
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      // ✅ Remove from UI instantly
      setProviders((prev) => prev.filter((p) => p._id !== id));

    } catch (err: any) {
      alert(err.message);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold mb-6">
        Pending Provider Requests
      </h1>

      {loading && <p>Loading...</p>}

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">

        {providers.map((provider) => (
          <div
            key={provider._id}
            className="p-5 rounded-xl shadow border flex flex-col justify-between h-full hover:shadow-lg transition"
            style={{
              backgroundColor: theme === "dark" ? "#0a0a0a" : "#fff"
            }}
          >
            {/* TOP CONTENT */}
            <div>

              <h2 className="text-lg font-semibold mb-2">
                {provider.location}
              </h2>

              <p className="text-sm text-gray-400 mb-2">
                {provider.description}
              </p>

              <p><strong>Experience:</strong> {provider.experience}</p>
              <p><strong>Price:</strong> ₹{provider.price}</p>

            </div>

            {/* 🔥 BUTTONS (ALWAYS SAME POSITION) */}
            <div className="flex gap-3 mt-6">

              <button
                onClick={() => handleAction(provider._id, "approved")}
                className="flex-1 py-2 rounded-lg bg-green-500 text-white font-semibold hover:bg-green-600 transition"
              >
                Approve
              </button>

              <button
                onClick={() => handleAction(provider._id, "rejected")}
                className="flex-1 py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition"
              >
                Reject
              </button>

            </div>

          </div>
        ))}

      </div>

      {!loading && providers.length === 0 && (
        <p className="text-center mt-10 text-gray-400">
          No pending requests
        </p>
      )}

    </div>
  );
}