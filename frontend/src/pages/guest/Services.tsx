import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { CATEGORY_ENDPOINTS, CATEGORY_ERRORS } from "../../config/category";
import { FaSpinner, FaTimes, FaArrowRight } from "react-icons/fa";
import { getAuthHeader } from "../../utils/authHelper";

interface Category {
  _id: string;
  service_name: string;
}

interface ApiResponse {
  message: string;
  data: Category[] | { id: string };
}

export function GuestServices() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(CATEGORY_ENDPOINTS.fetchAll, {
        method: 'GET',
        headers: getAuthHeader()
      });
      const data: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || CATEGORY_ERRORS.FETCH_ERROR);
      }

      if (Array.isArray(data.data)) {
        setCategories(data.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : CATEGORY_ERRORS.FETCH_ERROR);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(cat =>
    cat.service_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Theme styles
  const containerBg = {
    backgroundColor: theme === 'dark' ? '#000000' : '#ffffff',
    color: theme === 'dark' ? '#ffffff' : '#000000'
  };

  const headerStyle = {
    backgroundColor: theme === 'dark' ? '#111111' : '#f9fafb',
    color: theme === 'dark' ? '#ffffff' : '#000000',
    borderBottom: `1px solid ${theme === 'dark' ? '#333333' : '#e5e7eb'}`
  };

  const cardStyle = {
    backgroundColor: theme === 'dark' ? '#111111' : '#f9fafb',
    borderColor: theme === 'dark' ? '#333333' : '#e5e7eb'
  };

  const inputStyle = {
    backgroundColor: theme === 'dark' ? '#1f2937' : '#f5f5f5',
    color: theme === 'dark' ? '#ffffff' : '#000000',
    borderColor: theme === 'dark' ? '#444444' : '#d1d5db'
  };

  return (
    <div style={containerBg} className="page-container">
      {/* Header */}
      <div style={headerStyle} className="page-header sticky top-0 z-40">
        <div className="px-6 py-6 max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-outfit)' }}>
                Service Categories
              </h1>
              <p className="text-sm mt-1" style={{ color: theme === 'dark' ? '#aaaaaa' : '#666666', fontFamily: 'var(--font-worksans)' }}>
                Browse all available service categories
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-8 max-w-7xl mx-auto w-full">
        {/* Alert Messages */}
        {error && (
          <div className="alert alert-error mb-6 flex items-center justify-between p-4 rounded-lg animate-slideInDown" style={{
            backgroundColor: theme === 'dark' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
            color: '#ef4444',
            borderLeft: '4px solid #ef4444'
          }}>
            <span>{error}</span>
            <button onClick={() => setError('')} className="text-lg hover:opacity-70">
              <FaTimes />
            </button>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={inputStyle}
            className="w-full px-4 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <FaSpinner className="animate-spin text-3xl" style={{ color: '#0891b2' }} />
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-12">
            <p style={{ color: theme === 'dark' ? '#aaaaaa' : '#999999' }}>
              {searchTerm ? 'No categories match your search' : 'No service categories available'}
            </p>
          </div>
        ) : (
          /* Categories Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((category) => (
              <div
                key={category._id}
                style={cardStyle}
                className="p-6 rounded-lg border transition-all hover:shadow-lg hover:-translate-y-1 animate-fadeIn flex flex-col"
              >
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: 'var(--font-outfit)' }}>
                    {category.service_name}
                  </h3>
                  <p className="text-sm mb-4" style={{ color: theme === 'dark' ? '#aaaaaa' : '#666666', fontFamily: 'var(--font-worksans)' }}>
                    Explore and book professional {category.service_name.toLowerCase()} services from verified providers
                  </p>
                </div>
                <button
                  onClick={() => navigate(`/guest/provider?service=${encodeURIComponent(category.service_name)}`)}
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg font-semibold transition-all hover:shadow-md active:scale-95"
                  style={{
                    backgroundColor: '#0891b2',
                    color: 'white',
                    fontFamily: 'var(--font-worksans)'
                  }}
                >
                 View Provider
                  <FaArrowRight size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

