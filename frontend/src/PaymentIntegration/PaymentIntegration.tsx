import { useState } from "react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function PaymentTest() {
  const [loading, setLoading] = useState(false);

  const API_KEY = import.meta.env.VITE_RAZORPAY_API_KEY;

  const handlePayment = async () => {
    try {
      setLoading(true);

      // 1️⃣ Create Order from Backend
      const res = await fetch("http://127.0.0.1:8000/api/v1/booking/create", {
        method: "POST",
      });

      const order = await res.json();

      if (!order.id) {
        alert("Failed to create order");
        setLoading(false);
        return;
      }

      // 2️⃣ Razorpay Options
      const options = {
        key: API_KEY, // 🔥 Replace with your KEY_ID
        amount: order.amount,
        currency: order.currency,
        order_id: order.id,

        name: "Smart Local Service",
        description: "Test Payment",

        handler: async function (response: any) {
          console.log("Payment Success Response:", response);

          // 3️⃣ Verify Payment
          const verifyRes = await fetch(
            "http://127.0.0.1:8000/api/v1/booking/verify",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(response),
            }
          );

          const verifyData = await verifyRes.json();

          console.log("Verification:", verifyData);

          if (verifyData.status === "success") {
            alert("Payment Successful ✅");
          } else {
            alert("Payment Failed ❌");
          }
        },

        prefill: {
          name: "Test User",
          email: "test@gmail.com",
          contact: "9999999999",
        },

        theme: {
          color: "#0ea5e9",
        },
      };

      // 4️⃣ Open Razorpay
      const rzp = new window.Razorpay(options);
      rzp.open();

      rzp.on("payment.failed", function (response: any) {
        console.error("Payment Failed:", response.error);
        alert("Payment Failed ❌");
      });

    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg text-center w-[350px]">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">
          Test Payment
        </h1>

        <p className="text-gray-600 mb-6">
          Click below to test Razorpay payment
        </p>

        <button
          onClick={handlePayment}
          disabled={loading}
          className={`w-full py-3 rounded-lg text-white font-semibold transition ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Processing..." : "Pay ₹500"}
        </button>
      </div>
    </div>
  );
}