import { useState, useEffect } from "react";
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaStar } from "react-icons/fa";
import { PROVIDER_ENDPOINTS } from "../../config/provider";

interface Provider {
  _id: string;
  name: string;
  email: string;
  phone: string;
  price: number;
  location: string;
  experience: number;
  bio: string;
  rating: number;
}

export function GuestProviderListing() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [sortField, setSortField] = useState("price");
  const [sortOrder, setSortOrder] = useState("asc");

  const [page, setPage] = useState(1);
  const limit = 10;
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(false);

  // ✅ Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // ✅ Fetch providers
  useEffect(() => {
    const fetchProviders = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams({
          page: String(page),
          limit: String(limit),
          sort_by: sortField,
          sort_order: sortOrder,
        });

        //  Only add search if value exists
        if (debouncedSearch.trim()) {
          query.append("location", debouncedSearch);
          query.append("description", debouncedSearch);
        }

        const res = await fetch(`${PROVIDER_ENDPOINTS.fetchAll}?${query}`);
        const data = await res.json();

        const list = data?.data?.providers || [];

        const mapped = list.map((p: any) => ({
          _id: p._id,
          name: p.name || "Unknown",
          email: p.email || "N/A",
          phone: p.phone_no || "N/A",
          price: Number(p.price || 0),
          location: p.location,
          experience: Number(p.experience || 0),
          bio: p.description,
          rating: Number(p.rating || 0)
        }));

        setProviders(mapped);
        setTotal(data?.data?.total || 0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, [page, sortField, sortOrder, debouncedSearch]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">

      {/* 🔥 Header */}
      <h1 className="text-3xl font-bold mb-6">Service Providers</h1>

      {/* 🔍 Filters */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by location or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-3 border rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none"
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

      {/* 📊 Count */}
      <p className="text-gray-500 mb-4">
        {loading ? "Loading..." : `Total Providers: ${total}`}
      </p>

      {/* 🧑‍🔧 GRID (3 columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {providers.map((p) => (
          <div
            key={p._id}
            className="border rounded-xl p-5 shadow-sm hover:shadow-md transition duration-200 bg-white"
          >
            {/* Name */}
            <h2 className="text-xl font-semibold mb-2">{p.name}</h2>

            {/* Description */}
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {p.bio}
            </p>

            {/* Location + Rating */}
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span className="flex items-center gap-1">
                <FaMapMarkerAlt /> {p.location}
              </span>
              <span className="flex items-center gap-1 text-yellow-500">
                <FaStar /> {p.rating || 0}
              </span>
            </div>

            {/* Price + Experience */}
            <div className="flex justify-between font-medium mb-3">
              <span className="text-cyan-600">₹{p.price}</span>
              <span>{p.experience} yrs</span>
            </div>

            {/* Contact */}
            <div className="text-sm text-gray-600 space-y-1">
              <p className="flex items-center gap-2">
                <FaPhone /> {p.phone}
              </p>
              <p className="flex items-center gap-2">
                <FaEnvelope /> {p.email}
              </p>
            </div>
          </div>
        ))}

      </div>

      {/* 📄 Pagination */}
      <div className="flex justify-center items-center gap-2 mt-8 flex-wrap">

        <button
          disabled={page === 1}
          onClick={() => setPage(p => p - 1)}
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
          onClick={() => setPage(p => p + 1)}
          className="px-3 py-1 border rounded disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}