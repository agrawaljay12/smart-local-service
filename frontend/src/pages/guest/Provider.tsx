import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { FaTimes, FaPhone, FaMapMarkerAlt, FaArrowLeft, FaEnvelope} from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";
import { PROVIDER_ENDPOINTS } from "../../config/provider";


interface ApiProvider {
  _id: string;
  location: string;
  experience?: string;
  price: string;
  description: string;
  rating?: number;

  name?: string;
  email?: string;
  phone_no?: string;
}

interface Provider {
  _id: string;
  name: string;
  price: number;
  location: string;
  phone: string;
  email: string;
  experience: number;
  bio: string;
  rating?:number;
}

const PRIMARY_COLOR = '#0891b2';

export function ProviderListing() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<Provider[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('price');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState('');

  const serviceName = searchParams.get('service') || 'Service';

  type SortField = 'price' | 'experience' | 'rating';
  type SortOrder = 'asc' | 'desc';

  useEffect(() => {
  const fetchProviders = async () => {
    setLoading(true);
    setServerError('');

    try {
      const response = await fetch(PROVIDER_ENDPOINTS.fetchAll);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || 'Failed to fetch providers');
      }

      const list: ApiProvider[] = data?.data?.providers || [];

      const mapped: Provider[] = list.map((provider) => ({
        _id: provider._id,

        name: provider.name || "Unknown Provider",
        email: provider.email || "N/A",
        phone: provider.phone_no || "N/A",

        price: Number(provider.price ?? 0),
        experience: Number(provider.experience ?? 0),
        location: provider.location || "N/A",

        bio: provider.description || "",
        responseTime: "N/A",

        rating: Number(provider.rating ?? 0)
      }));

      setProviders(mapped);
      setFilteredProviders(mapped);

    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Connection error';

      setServerError(errorMessage);
      setProviders([]);
      setFilteredProviders([]);
    } finally {
      setLoading(false);
    }
  };

  fetchProviders();
}, []);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = providers.filter(provider =>
      provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.bio.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Apply sorting
    filtered.sort((a, b) => {
      let valueA = a[sortField] ?? 0;
      let valueB = b[sortField] ?? 0;

      if (sortOrder === 'asc') {
        return valueA - valueB;
      } else {
        return valueB - valueA;
      }
    });

    setFilteredProviders(filtered);
  }, [searchTerm, sortField, sortOrder, providers]);

  const handleProviderClick = (provider: Provider) => {
    setSelectedProvider(provider);
    setShowDetail(true);
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    setSelectedProvider(null);
  };

  const handleContactProvider = (provider: Provider) => {
    alert(`Contacting ${provider.name}\nPhone: ${provider.phone}\n\nThis feature will be implemented soon!`);
  };

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

  const modalBg = {
    backgroundColor: theme === 'dark' ? '#111111' : '#ffffff',
    color: theme === 'dark' ? '#ffffff' : '#000000'
  };

  return (
    <div style={containerBg} className="page-container">
      {/* Header */}
      <div style={headerStyle} className="page-header sticky top-0 z-40">
        <div className="px-6 py-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-2">
            <button
              onClick={() => navigate(-1)}
              className="text-2xl hover:opacity-70 transition-opacity"
              title="Go back"
            >
              <FaArrowLeft />
            </button>
            <div>
              <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-outfit)' }}>
                {serviceName} Providers
              </h1>
              <p className="text-sm mt-1" style={{ color: theme === 'dark' ? '#aaaaaa' : '#666666', fontFamily: 'var(--font-worksans)' }}>
                Browse and connect with verified professionals
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-8 max-w-5xl mx-auto w-full">
        {/* Filters Section */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          
            {/* Search Bar */}
              <input
                type="text"
                placeholder="Search providers by name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={inputStyle}
                className="px-4 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />

              {/* Sort Dropdown */}

            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as SortField)}
              style={inputStyle}
              className="px-4 py-3 rounded-lg border"
            >
              <option value="price">Price</option>
              <option value="experience">Experience</option>
              <option value="rating">Rating</option>
            </select>

            {/* Sort Order */}
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as SortOrder)}
              style={inputStyle}
              className="px-4 py-3 rounded-lg border"
            >
              <option value="asc">Low → High</option>
              <option value="desc">High → Low</option>
            </select>

        </div>

        {/* Results Count */}
        <p style={{ fontFamily: 'var(--font-worksans)', opacity: 0.7, marginBottom: '1.5rem' }}>
          {loading ? 'Loading providers...' : `Showing ${filteredProviders.length} ${filteredProviders.length === 1 ? 'provider' : 'providers'}`}
        </p>

        {serverError && (
          <div className="mb-6 p-4 rounded-lg border" style={{ borderColor: '#ef4444', color: '#ef4444', fontFamily: 'var(--font-worksans)' }}>
            {serverError}
          </div>
        )}

        {/* Providers List */}
        <div className="space-y-4">
            {!loading && filteredProviders.length === 0 && !serverError && (
              <div className="p-6 rounded-lg border-2" style={cardStyle}>
                <p style={{ fontFamily: 'var(--font-worksans)', opacity: 0.8 }}>
                  No providers found.
                </p>
              </div>
            )}
            {filteredProviders.map((provider) => (
              <div
                key={provider._id}
                style={cardStyle}
                className="p-6 rounded-lg border-2 transition-all hover:shadow-lg hover:border-cyan-500 cursor-pointer animate-fadeIn flex items-center justify-between"
                onClick={() => handleProviderClick(provider)}
              >
                {/* Left Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold" style={{ fontFamily: 'var(--font-outfit)' }}>
                        {provider.name}
                      </h3>
                      {provider.email !== 'N/A' && (
                        <p style={{ fontFamily: 'var(--font-worksans)', fontSize: '12px', opacity: 0.7, marginTop: '4px' }}>
                          {provider.email}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p style={{ fontFamily: 'var(--font-outfit)', fontSize: '20px', fontWeight: 'bold', color: PRIMARY_COLOR }}>
                        ${provider.price}/hr
                      </p>
                      <p style={{ fontFamily: 'var(--font-worksans)', fontSize: '12px', opacity: 0.7 }}>
                        {provider.experience}+ years
                      </p>
                    </div>
                  </div>

                  {/* Info Row */}
                  <div className="flex flex-wrap gap-4 mb-2">
                  <div className="flex items-center gap-2" style={{ fontFamily: 'var(--font-worksans)' }}>
                    <FaMapMarkerAlt size={14} style={{ opacity: 0.6 }} />
                    <span style={{ fontSize: '14px' }}>{provider.location}</span>
                  </div>
                  </div>

                  <p style={{ fontFamily: 'var(--font-worksans)', fontSize: '13px', opacity: 0.7 }}>
                    {provider.bio}
                  </p>
                </div>

                {/* CTA Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleContactProvider(provider);
                  }}
                  className="ml-4 px-6 py-3 rounded-lg font-bold transition-all hover:shadow-md active:scale-95 whitespace-nowrap"
                  style={{
                    backgroundColor: PRIMARY_COLOR,
                    color: 'white',
                    fontFamily: 'var(--font-worksans)'
                  }}
                >
                  Contact
                </button>
              </div>
            ))}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetail && selectedProvider && (
        <div className="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div style={modalBg} className="modal-content rounded-lg shadow-xl max-w-2xl w-full animate-scaleIn">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b" style={{ borderColor: theme === 'dark' ? '#333333' : '#e5e7eb' }}>
              <div>
                <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-outfit)' }}>
                  {selectedProvider.name}
                </h2>
                {selectedProvider.email !== 'N/A' && (
                  <p style={{ fontFamily: 'var(--font-worksans)', fontSize: '12px', opacity: 0.7, marginTop: '4px' }}>
                    {selectedProvider.email}
                  </p>
                )}
              </div>
              <button
                onClick={handleCloseDetail}
                className="text-2xl hover:opacity-70 transition-opacity"
              >
                <FaTimes />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Bio */}
              <div>
                <h3 className="font-bold mb-2" style={{ fontFamily: 'var(--font-outfit)' }}>About</h3>
                <p style={{ fontFamily: 'var(--font-worksans)', opacity: 0.8 }}>
                  {selectedProvider.bio}
                </p>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#f5f5f5' }} className="p-4 rounded-lg">
                  <p style={{ fontFamily: 'var(--font-worksans)', fontSize: '12px', opacity: 0.7 }} className="mb-1">Service Charge</p>
                  <p style={{ fontFamily: 'var(--font-outfit)', fontSize: '18px', fontWeight: 'bold', color: PRIMARY_COLOR }}>
                    ${selectedProvider.price}
                  </p>
                </div>
                <div style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#f5f5f5' }} className="p-4 rounded-lg">
                  <p style={{ fontFamily: 'var(--font-worksans)', fontSize: '12px', opacity: 0.7 }} className="mb-1">Experience</p>
                  <p style={{ fontFamily: 'var(--font-outfit)', fontSize: '18px', fontWeight: 'bold' }}>
                    {selectedProvider.experience}+ yrs
                  </p>
                </div>
                {/* <div style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#f5f5f5' }} className="p-4 rounded-lg">
                  <p style={{ fontFamily: 'var(--font-worksans)', fontSize: '12px', opacity: 0.7 }} className="mb-1">Response Time</p>
                  <p style={{ fontFamily: 'var(--font-outfit)', fontSize: '18px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                    {selectedProvider.responseTime}
                  </p>
                </div> */}
              </div>

              {/* Contact Info */}
              <div>
                <h3 className="font-bold mb-3" style={{ fontFamily: 'var(--font-outfit)' }}>Contact Information</h3>
                <div style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#f5f5f5' }} className="p-4 rounded-lg space-y-2">
                  <div className="flex items-center gap-3">
                    <FaPhone size={16} style={{ color: PRIMARY_COLOR }} />
                    <span style={{ fontFamily: 'var(--font-worksans)' }}>{selectedProvider.phone}</span>
                  </div>
                  {selectedProvider.email !== 'N/A' && (
                    <div className="flex items-center gap-3">
                      <FaEnvelope size={16} style={{ color: PRIMARY_COLOR }} />
                      <span style={{ fontFamily: 'var(--font-worksans)' }}>{selectedProvider.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <FaMapMarkerAlt size={16} style={{ color: PRIMARY_COLOR }} />
                    <span style={{ fontFamily: 'var(--font-worksans)' }}>{selectedProvider.location}</span>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    handleContactProvider(selectedProvider);
                    handleCloseDetail();
                  }}
                  className="px-6 py-3 rounded-lg font-bold transition-all hover:shadow-lg"
                  style={{
                    backgroundColor: PRIMARY_COLOR,
                    color: 'white',
                    fontFamily: 'var(--font-worksans)'
                  }}
                >
                  Contact Provider
                </button>
                <button
                  onClick={handleCloseDetail}
                  className="px-6 py-3 rounded-lg font-bold transition-all"
                  style={{
                    backgroundColor: theme === 'dark' ? '#1f2937' : '#f5f5f5',
                    color: theme === 'dark' ? '#ffffff' : '#000000',
                    fontFamily: 'var(--font-worksans)',
                    border: `1px solid ${theme === 'dark' ? '#333333' : '#e5e7eb'}`
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProviderListing;
