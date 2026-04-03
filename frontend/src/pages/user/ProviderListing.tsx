import { useState, useEffect } from "react";
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaStar } from "react-icons/fa";
import { PROVIDER_ENDPOINTS } from "../../config/provider";
import { useSearchParams } from "react-router-dom";
import { fetchWithAuth } from "../../utils/fetch_auth";


declare global {
  interface Window {
    Razorpay: any;
  }
}

interface Provider {
  _id: string;
  service_id: string; // ✅ IMPORTANT
  service_name:string;
  name: string;
  email: string;
  phone: string;
  price: number;
  location: string;
  experience: number;
  bio: string;
  rating: number;
}

export function ProviderListing() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [sortField, setSortField] = useState("price");
  const [sortOrder, setSortOrder] = useState("asc");

  const [page, setPage] = useState(1);
  const limit = 12;
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(false);
  const [payingId, setPayingId] = useState<string | null>(null);
  const[, setPaymentStatus] = useState<string | null>(null);

  const [searchParams] = useSearchParams();
  const service_id = searchParams.get("service_id"); // 🔥 important

  const [selectedProviderReviews, setSelectedProviderReviews] = useState<any[]>([]);
  const [showReviews, setShowReviews] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);

  // ✅ Debounce Search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // get reviews for a provider
  const fetchReviews = async (providerId: string) => {
    try {
      setLoadingReviews(true);

      const res = await fetchWithAuth(
        `http://127.0.0.1:8000/api/v1/reviews/fetch/provider/${providerId}`
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data?.detail || "Failed to fetch reviews");
        return;
      }

      setSelectedProviderReviews(data?.data || []);
      setShowReviews(true);

    } catch (err) {
      console.error("Review fetch error:", err);
    } finally {
      setLoadingReviews(false);
    }
  };

  // ✅ Fetch Providers
  useEffect(() => {
    const fetchProviders = async () => {
      setLoading(true);

      try {
        const query = new URLSearchParams();

        query.append("page", String(page));
        query.append("limit", String(limit));
        query.append("sort_by", sortField);
        query.append("sort_order", sortOrder);

        // ✅ FIX: Strong validation
        if (
          service_id &&
          service_id !== "null" &&
          service_id !== "undefined" &&
          service_id.length === 24
        ) {
          query.append("service_id", service_id);
        }

        // ✅ Clean search
        if (debouncedSearch.trim()) {
          query.append("location", debouncedSearch);
        }

        const url = `${PROVIDER_ENDPOINTS.fetchAll}?${query.toString()}`;

        console.log("🔥 API URL:", url);

        const res = await fetch(url);
        const data = await res.json();

        console.log("🔥 API RESPONSE:", data);

        const list = data?.data?.providers || [];

        const mapped = list.map((p: any) => ({
          _id: p._id,
          service_id: p.service_id,
          service_name: p.service_name || "Unknown Service",
          name: p.name || "Unknown",
          email: p.email || "N/A",
          phone: p.phone_no || "N/A",
          price: Number(p.price || 0),
          location: p.location,
          experience: Number(p.experience || 0),
          bio: p.description,
          rating: Number(p.rating || 0),
        }));

        setProviders(mapped);
        setTotal(data?.data?.total || 0);

      } catch (err) {
        console.error("❌ Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, [page, sortField, sortOrder, debouncedSearch, service_id]);

  // when the service_id changes, we should reset to page 1 to show relevant results
  useEffect(() => {
    setPage(1);
  }, [service_id]);

  const totalPages = Math.ceil(total / limit);

 
 const handleBooking = async (provider: Provider) => {
  try {
    setPayingId(provider._id);

    const token = sessionStorage.getItem("access_token");

    // 1️⃣ Create Booking (SEND provider_id ✅)
    const res = await fetchWithAuth("http://127.0.0.1:8000/api/v1/booking/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        provider_id: provider._id,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("API ERROR:", text);
      alert("Request failed");
      return;
    }

    const data = await res.json();

    if (!data?.data?.order_id) {
      alert("Order creation failed");
      return;
    }

    const { order_id, amount } = data.data;

    const API_KEY = import.meta.env.VITE_RAZORPAY_API_KEY;

    // 2️⃣ Razorpay Options
    const options = {
      key: API_KEY,
      amount: amount,
      currency: "INR",
      order_id: order_id,

      name: provider.name,
      description: "Service Booking",

    handler: async function (response: any) {
          try {
            setPaymentStatus("verifying");

            const verifyRes = await fetchWithAuth(
              "http://127.0.0.1:8000/api/v1/booking/verify",
              {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({
                  ...response,
                  provider_id: provider._id, 
                }),
              }
            );

            const verifyData = await verifyRes.json();

            if (verifyData?.data?.status === "success") {
              setPaymentStatus("success");
            } else {
              setPaymentStatus("failed");
            }

          } catch (err) {
            setPaymentStatus("error");
          }
        },

        // ✅ HANDLE USER CLOSE / CANCEL
        modal: {
          ondismiss: function () {
            console.log("❌ User closed payment popup");
            alert("Payment cancelled");
          },
        },

      prefill: {
        name: "User",
        email: "user@email.com",
        contact: "9999999999",
      },

      theme: {
        color: "#0891b2",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();

  } catch (err) {
    console.error(err);
    alert("Something went wrong");
  } finally {
    setPayingId(null);
  }
};
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">

      <h1 className="text-3xl font-bold mb-6">Service Providers</h1>

      {providers.length > 0 && (
        <h2 className="text-lg text-gray-500 mb-4">
          Showing providers for:{" "}
          <span className="font-semibold">
            {providers[0].service_name}
          </span>
        </h2>
      )}

      {/* 🔍 Filters */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-3 border rounded-lg"
        />

        <select
          value={sortField}
          onChange={(e) => {
            setSortField(e.target.value);
            setPage(1);
          }}
          className="px-4 py-3 border rounded-lg"
        >
          <option value="price">Price</option>
          <option value="experience">Experience</option>
          <option value="rating">Rating</option>
        </select>

        <select
          value={sortOrder}
          onChange={(e) => {
            setSortOrder(e.target.value);
            setPage(1);
          }}
          className="px-4 py-3 border rounded-lg"
        >
          <option value="asc">Low → High</option>
          <option value="desc">High → Low</option>
        </select>
      </div>

      <p className="text-gray-500 mb-4">
        {loading ? "Loading..." : `Total Providers: ${total}`}
      </p>

      {/* 🧑‍🔧 GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {providers.map((p) => (
          <div key={p._id} className="border rounded-xl p-5 shadow-sm bg-white">

            <h2 className="text-xl font-semibold mb-2">{p.name}</h2>

            <p className="text-sm text-gray-500 mb-2">Service: {p.service_name}</p>

            <p className="text-gray-600 text-sm mb-3">{p.bio}</p>

            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span className="flex items-center gap-1">
                <FaMapMarkerAlt /> {p.location}
              </span>
              <span className="flex items-center gap-1 text-yellow-500">
                <FaStar /> {p.rating}
              </span>
            </div>

            <div className="flex justify-between font-medium mb-3">
              <span className="text-cyan-600">₹{p.price}</span>
              <span>{p.experience} yrs</span>
            </div>

            <div className="text-sm text-gray-600 space-y-1">
              <p className="flex items-center gap-2">
                <FaPhone /> {p.phone}
              </p>
              <p className="flex items-center gap-2">
                <FaEnvelope /> {p.email}
              </p>
            </div>

            {/* 🔥 BOOK BUTTON */}
            <button
              onClick={() => handleBooking(p)}
              disabled={payingId === p._id}
              className="mt-4 w-full bg-cyan-600 text-white py-2 rounded-lg hover:bg-cyan-700 disabled:opacity-50"
            >
              {payingId === p._id ? "Processing..." : "Book Service"}
            </button>

            <button
              onClick={() => fetchReviews(p._id)}
              className="mt-2 w-full border border-cyan-600 text-cyan-600 py-2 rounded hover:bg-cyan-50"
            >
              View Reviews
            </button>
          </div>
        ))}

        {/* 📝 REVIEWS MODAL */}
        {showReviews && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-lg p-6 rounded-xl max-h-[80vh] overflow-y-auto">

              <h2 className="text-xl font-semibold mb-4">Reviews</h2>

              {loadingReviews ? (
                <p>Loading...</p>
              ) : selectedProviderReviews.length === 0 ? (
                <p className="text-gray-500">No reviews yet</p>
              ) : (
                selectedProviderReviews.map((r, i) => (
                  <div key={i} className="border-b py-3">

                    <p className="font-medium">{r.user_name}</p>

                    <p className="text-yellow-500">⭐ {r.rating}</p>

                    <p className="text-gray-600 text-sm">{r.comment}</p>

                    <p className="text-xs text-gray-400">
                      {new Date(r.created_at).toLocaleString()}
                    </p>

                  </div>
                ))
              )}

              <button
                onClick={() => setShowReviews(false)}
                className="mt-4 w-full bg-gray-200 py-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        )}

      </div>

      {/* 📄 Pagination */}
      <div className="flex justify-center gap-2 mt-8 flex-wrap">
        <button
          disabled={page === 1}
          onClick={() => setPage(p => p - 1)}
          className="px-3 py-1 border rounded"
        >
          Prev
        </button>

        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            onClick={() => setPage(i + 1)}
            className={`px-3 py-1 border rounded ${
              page === i + 1 ? "bg-cyan-600 text-white" : ""
            }`}
          >
            {i + 1}
          </button>
        ))}

        <button
          disabled={page === totalPages}
          onClick={() => setPage(p => p + 1)}
          className="px-3 py-1 border rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
}