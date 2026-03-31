import { useState } from "react";
import { getAuthHeader } from "../../utils/authHelper";
import { type Booking } from "./Booking_History";

export function ReviewModal({
  booking,
  onClose,
  onSuccess,
}: {
  booking: Booking;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitReview = async () => {
    setError(null);

    // ✅ FRONTEND VALIDATION (MATCH BACKEND)
    if (!booking?.booking_id || !booking?.provider_id) {
      setError("Invalid booking data");
      return;
    }

    if (!rating || rating < 1 || rating > 5) {
      setError("Rating must be between 1 and 5");
      return;
    }

    if (!comment.trim()) {
      setError("Comment is required");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        booking_id: String(booking.booking_id),
        provider_id: String(booking.provider_id),
        rating: Number(rating),
        comment: comment.trim(),
      };

      const res = await fetch("http://127.0.0.1:8000/api/v1/reviews/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify(payload),
      });

      // ✅ SAFE PARSE (IMPORTANT)
      let data: any = null;
      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (!res.ok) {
        setError(data?.detail || "Failed to submit review");
        return;
      }

      // ✅ SUCCESS
      alert("Review submitted successfully ✅");

      onSuccess(); // refresh booking list
      onClose();   // close modal

    } catch (err) {
      console.error("Review error:", err);
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">

        {/* 🔥 Title */}
        <h2 className="text-xl font-semibold mb-4">
          Review {booking.service_name}
        </h2>

        {/* ⭐ Rating */}
        <div className="flex gap-2 mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              onClick={() => setRating(star)}
              className={`cursor-pointer text-3xl transition ${
                star <= rating ? "text-yellow-400" : "text-gray-300"
              }`}
            >
              ★
            </span>
          ))}
        </div>

        {/* Rating text */}
        <p className="text-sm text-gray-500 mb-4">
          {rating ? `You selected ${rating} star${rating > 1 ? "s" : ""}` : "Select rating"}
        </p>

        {/* ✍️ Comment */}
        <textarea
          placeholder="Write your review..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full border rounded-lg p-3 mb-3 outline-none focus:ring-2 focus:ring-cyan-500"
          rows={4}
        />

        {/* ❌ Error Message */}
        {error && (
          <p className="text-red-500 text-sm mb-3">{error}</p>
        )}

        {/* 🔘 Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>

          <button
            onClick={submitReview}
            disabled={loading}
            className="px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700 disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}