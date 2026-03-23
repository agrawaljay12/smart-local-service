import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { FaPhone, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";

const PRIMARY_COLOR = "#0891b2";

export function GuestContact() {
  const { theme } = useTheme();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData);
    alert("Message sent successfully!");
  };

  const bg = theme === "dark" ? "#000" : "#fff";
  const card = theme === "dark" ? "#111" : "#f5f5f5";
  const text = theme === "dark" ? "#fff" : "#000";

  return (
    <div style={{ backgroundColor: bg, color: text }} className="min-h-screen px-6 py-16">
      <div className="max-w-6xl mx-auto">

        {/* Title */}
        <h1 className="text-4xl font-bold mb-6 text-center">Contact Us</h1>
        <p className="text-center mb-12 opacity-70">
          Have questions or need help? Reach out to us anytime.
        </p>

        <div className="grid md:grid-cols-2 gap-10">

          {/* Contact Info */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <FaPhone style={{ color: PRIMARY_COLOR }} />
              <span>+91 98765 43210</span>
            </div>

            <div className="flex items-center gap-4">
              <FaEnvelope style={{ color: PRIMARY_COLOR }} />
              <span>support@smartlocal.com</span>
            </div>

            <div className="flex items-center gap-4">
              <FaMapMarkerAlt style={{ color: PRIMARY_COLOR }} />
              <span>Ahmedabad, Gujarat, India</span>
            </div>
          </div>

          {/* Contact Form */}
          <form
            onSubmit={handleSubmit}
            style={{ backgroundColor: card }}
            className="p-6 rounded-lg space-y-4 shadow"
          >
            <input
              type="text"
              placeholder="Your Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-3 rounded border"
              required
            />

            <input
              type="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full p-3 rounded border"
              required
            />

            <textarea
              placeholder="Your Message"
              rows={5}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full p-3 rounded border"
              required
            />

            <button
              type="submit"
              style={{ backgroundColor: PRIMARY_COLOR }}
              className="w-full text-white py-3 rounded font-bold"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}