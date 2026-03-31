import { useEffect, useState } from "react";
import { BOOKING_ENDPOINTS } from "../../config/booking";
import { getAuthHeader } from "../../utils/authHelper";
import { FaCalendarAlt, FaUser, FaRupeeSign } from "react-icons/fa";
import { ReviewModal } from "./Review_Model";

export interface Booking {
  booking_id: string;
  provider_name: string;
  provider_id: string; 
  service_name: string; 
  price: number;
  booking_status: string;
  payment_status: string;
  booking_date: string;
  payment_date?: string;
  has_review?: boolean;
}

export function BookingHistory() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [sortBy, setSortBy] = useState("booking_date");
  const [sortOrder, setSortOrder] = useState(1);

  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(false);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // ✅ debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // ✅ fetch bookings
  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams({
          page: String(page),
          limit: String(limit),
          sort_by: sortBy,
          sort_order: String(sortOrder),
          status: "completed", //  only show completed bookings
        });

        if (debouncedSearch.trim()) {
          query.append("search", debouncedSearch);
        }

        const res = await fetch(
          `${BOOKING_ENDPOINTS.current_user_bookings}?${query}`,
          {
            headers: getAuthHeader(),
          }
        );

        if (!res.ok) {
            const text = await res.text();
            console.error("API ERROR:", text);
            return;
        }

        const data = await res.json();

        setBookings(data?.data?.bookings || []);
        setTotalPages(data?.data?.pagination?.total_pages || 1);

      } catch (err) {
        console.error("Fetch booking error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [page, sortBy, sortOrder, debouncedSearch]);

  // ✅ SAFE DATE FORMAT
  const formatDate = (date?: string) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString();
  };

  const handleReview = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowReviewModal(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">

      {/* 🔥 Header */}
      <h1 className="text-3xl font-bold mb-6">My Bookings</h1>

      {/* 🔍 Filters */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">

        <input
          type="text"
          placeholder="Search booking..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-3 border rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none"
        />

        <select
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value);
            setPage(1);
          }}
          className="px-4 py-3 border rounded-lg"
        >
          <option value="booking_date">Booking Date</option>
          <option value="price">Price</option>
          <option value="booking_status">Status</option>
        </select>

        <select
          value={sortOrder}
          onChange={(e) => {
            setSortOrder(Number(e.target.value));
            setPage(1);
          }}
          className="px-4 py-3 border rounded-lg"
        >
          <option value={1}>Ascending</option>
          <option value={-1}>Descending</option>
        </select>
      </div>

      {/* 📊 STATES */}
      {loading && <p className="text-gray-500">Loading...</p>}

      {!loading && bookings.length === 0 && (
        <p className="text-gray-500">No bookings found</p>
      )}

      {/* 🧾 GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {bookings.map((b) => (
          <div
            key={b.booking_id}
            className="border rounded-xl p-5 shadow-sm hover:shadow-md transition bg-white"
          >
            {/* ✅ SERVICE NAME (MAIN TITLE) */}
            <h2 className="text-xl font-semibold mb-2">
              {b.service_name || "N/A"}
            </h2>

            {/* Provider */}
            <p className="text-sm text-gray-600 flex items-center gap-2 mb-2">
              <FaUser /> {b.provider_name || "N/A"}
            </p>

            {/* Price */}
            <p className="flex items-center gap-2 text-cyan-600 font-medium mb-2">
              <FaRupeeSign /> {b.price ?? "N/A"}
            </p>

            {/* Booking Date */}
            <p className="text-sm text-gray-500 flex items-center gap-2 mb-2">
              <FaCalendarAlt />
              {formatDate(b.booking_date)}
            </p>

            {/* Payment Date */}
            {b.payment_date && (
              <p className="text-xs text-gray-400">
                Paid on: {formatDate(b.payment_date)}
              </p>
            )}

            {/* Status */}
            <div className="flex justify-between mt-3">
              <span
                className={`text-xs px-2 py-1 rounded ${
                  b.booking_status === "completed"
                    ? "bg-green-100 text-green-600"
                    : "bg-yellow-100 text-yellow-600"
                }`}
              >
                {b.booking_status || "N/A"}
              </span>

              <span
                className={`text-xs px-2 py-1 rounded ${
                  b.payment_status === "success"
                    ? "bg-green-100 text-green-600"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {b.payment_status || "N/A"}
              </span>
            </div>

            {/* review button */}
            {b.booking_status === "completed" && !b.has_review && (
                <button
                  onClick={() => handleReview(b)}
                  className="mt-4 w-full bg-cyan-600 text-white py-2 rounded hover:bg-cyan-700"
                >
                  Write Review
                </button>
            )}

          </div>
        ))}
      </div>

      {/* 📄 Pagination */}
      <div className="flex justify-center gap-2 mt-8 flex-wrap">

        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-3 py-1 border rounded disabled:opacity-40"
        >
          Prev
        </button>

        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            onClick={() => setPage(i + 1)}
            className={`px-3 py-1 border rounded ${
              page === i + 1
                ? "bg-cyan-600 text-white"
                : "hover:bg-gray-100"
            }`}
          >
            {i + 1}
          </button>
        ))}

        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-1 border rounded disabled:opacity-40"
        >
          Next
        </button>
      </div>
      
      {/* 📝 Review Modal */}
      {showReviewModal && selectedBooking && (
        <ReviewModal
          booking={selectedBooking}
          onClose={() => setShowReviewModal(false)}
          onSuccess={() => {
            // 🔄 refresh bookings after review
            setPage(1);
          }}
        />
      )}

    </div>
      
  );

  
}