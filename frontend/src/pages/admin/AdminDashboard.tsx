import { useState, useEffect } from "react";
import { FaPlus, FaTrash, FaEdit, FaSpinner, FaTimes, FaSearch } from "react-icons/fa";
import { FaChartLine, FaCheckCircle, FaUsers, FaClock } from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";
import { CATEGORY_ENDPOINTS } from "../../config/category";
import { getAuthHeader } from "../../utils/authHelper";

interface Service {
  _id?: string;
  service_name: string;
}

interface ApiResponse {
  message: string;
  data: Service[] | { id: string };
}

interface StatCard {
  label: string;
  value: string | number;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
}

const PRIMARY_COLOR = '#0891b2';

interface AdminDashboardProps {
  activeTab?: string;
}

export function AdminDashboard({ activeTab = 'dashboard' }: AdminDashboardProps) {
  const { theme } = useTheme();
  
  // State Management
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ service_name: '' });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch Services
  useEffect(() => {
    fetchServices();
  }, []);

  // Clear success/error after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // API Calls
  const fetchServices = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(CATEGORY_ENDPOINTS.fetchAll, {
        method: 'GET',
        headers: getAuthHeader()
      });
      const data: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch services');
      }

      if (Array.isArray(data.data)) {
        setServices(data.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch services');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    const name = formData.service_name.trim();

    if (!name) {
      newErrors.service_name = 'Service name is required';
    } else if (name.length < 3) {
      newErrors.service_name = 'Service name must be at least 3 characters';
    } else if (name.length > 50) {
      newErrors.service_name = 'Service name must be less than 50 characters';
    } else if (!/^[a-zA-Z\s&'-]+$/.test(name)) {
      newErrors.service_name = 'Service name can only contain letters, spaces, &, apostrophe, and hyphen';
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateClick = () => {
    setFormData({ service_name: '' });
    setFormErrors({});
    setEditingId(null);
    setShowModal(true);
  };

  const handleEditClick = (service: Service) => {
    setFormData({ service_name: service.service_name });
    setFormErrors({});
    setEditingId(service._id || null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({ service_name: '' });
    setFormErrors({});
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      const endpoint = editingId 
        ? `${CATEGORY_ENDPOINTS.update}/${editingId}`
        : CATEGORY_ENDPOINTS.create;
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ service_name: formData.service_name.trim() })
      });

      const data: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Failed to ${editingId ? 'update' : 'create'} service`);
      }

      setSuccess(editingId ? 'Service updated successfully' : 'Service created successfully');
      handleCloseModal();
      await fetchServices();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this service?')) {
      return;
    }

    try {
      const response = await fetch(`${CATEGORY_ENDPOINTS.delete}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete service');
      }

      setSuccess('Service deleted successfully');
      await fetchServices();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete service');
    }
  };

  // Filtered Services
  const filteredServices = services.filter(s =>
    s.service_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Statistics
  const stats: StatCard[] = [
    {
      label: 'Total Services',
      value: services.length,
      icon: FaChartLine,
      color: '#0891b2',
      bgColor: 'rgba(8, 145, 178, 0.1)'
    },
    {
      label: 'Overall Rating',
      value: '4.8★',
      icon: FaCheckCircle,
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)'
    },
    {
      label: 'Active Providers',
      value: '48',
      icon: FaUsers,
      color: '#8b5cf6',
      bgColor: 'rgba(139, 92, 246, 0.1)'
    },
    {
      label: 'Avg Response',
      value: '2.5h',
      icon: FaClock,
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.1)'
    }
  ];

  // Theme Styles
  const contentBg = {
    backgroundColor: theme === 'dark' ? '#111111' : '#ffffff',
    borderColor: theme === 'dark' ? '#222222' : '#e2e8f0'
  };

  const cardStyle = {
    backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f9fafb',
    borderColor: theme === 'dark' ? '#333333' : '#e5e7eb'
  };

  const inputStyle = {
    backgroundColor: theme === 'dark' ? '#1f2937' : '#f5f5f5',
    color: theme === 'dark' ? '#ffffff' : '#000000',
    borderColor: theme === 'dark' ? '#444444' : '#d1d5db'
  };

  const modalBg = {
    backgroundColor: theme === 'dark' ? '#111111' : '#ffffff'
  };

  // Render Content Based on Active Tab
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={idx}
                    style={cardStyle}
                    className="p-6 rounded-xl border transition-all hover:shadow-lg hover:-translate-y-1"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p style={{ fontFamily: 'var(--font-worksans)', opacity: 0.6, fontSize: '12px',textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          {stat.label}
                        </p>
                        <p style={{ fontFamily: 'var(--font-outfit)', fontSize: '28px', fontWeight: 'bold', marginTop: '0.5rem' }}>
                          {stat.value}
                        </p>
                      </div>
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: stat.bgColor, color: stat.color }}
                      >
                        <Icon size={24} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Recent Activity */}
            <div style={contentBg} className="rounded-xl border p-6">
              <h3 style={{ fontFamily: 'var(--font-outfit)', fontSize: '18px', fontWeight: 'bold', marginBottom: '1.5rem' }}>
                Recent Services
              </h3>
              {services.length === 0 ? (
                <p style={{ fontFamily: 'var(--font-worksans)', opacity: 0.6 }}>
                  No services created yet
                </p>
              ) : (
                <div className="space-y-3">
                  {services.slice(0, 5).map((service) => (
                    <div
                      key={service._id}
                      className="p-4 rounded-lg flex items-center justify-between"
                      style={{ backgroundColor: theme === 'dark' ? '#0f0f0f' : '#f5f7fa' }}
                    >
                      <div>
                        <p style={{ fontFamily: 'var(--font-worksans)', fontWeight: '500' }}>
                          {service.service_name}
                        </p>
                        <p style={{ fontFamily: 'var(--font-worksans)', fontSize: '12px', opacity: 0.5 }}>
                          ID: {service._id?.slice(-8)}
                        </p>
                      </div>
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: PRIMARY_COLOR }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'services':
        return (
          <div className="space-y-6">
            {/* Header with Actions */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 style={{ fontFamily: 'var(--font-outfit)', fontSize: '24px', fontWeight: 'bold' }} className="mb-1">
                  Services Management
                </h2>
                <p style={{ fontFamily: 'var(--font-worksans)', opacity: 0.6 }}>
                  Manage all available services in your platform
                </p>
              </div>
              <button
                onClick={handleCreateClick}
                className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all hover:shadow-lg hover:-translate-y-0.5"
                style={{
                  backgroundColor: PRIMARY_COLOR,
                  color: 'white',
                  fontFamily: 'var(--font-worksans)'
                }}
              >
                <FaPlus size={16} />
                Add Service
              </button>
            </div>

            {/* Alerts */}
            {error && (
              <div className="p-4 rounded-lg flex items-center justify-between animate-slideInDown" style={{
                backgroundColor: theme === 'dark' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
                color: '#ef4444',
                borderLeft: '4px solid #ef4444'
              }}>
                <span style={{ fontFamily: 'var(--font-worksans)' }}>{error}</span>
                <button onClick={() => setError('')} className="text-lg hover:opacity-70">
                  <FaTimes />
                </button>
              </div>
            )}

            {success && (
              <div className="p-4 rounded-lg flex items-center justify-between animate-slideInDown" style={{
                backgroundColor: theme === 'dark' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.05)',
                color: '#22c55e',
                borderLeft: '4px solid #22c55e'
              }}>
                <span style={{ fontFamily: 'var(--font-worksans)' }}>{success}</span>
                <button onClick={() => setSuccess('')} className="text-lg hover:opacity-70">
                  <FaTimes />
                </button>
              </div>
            )}

            {/* Search Bar */}
            <div style={contentBg} className="rounded-lg border p-3 flex items-center gap-3">
              <FaSearch style={{ opacity: 0.5 }} />
              <input
                type="text"
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={inputStyle}
                className="flex-1 border-0 bg-transparent focus:outline-none focus:ring-0"
              />
            </div>

            {/* Services Table */}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <FaSpinner className="animate-spin text-3xl" style={{ color: PRIMARY_COLOR }} />
              </div>
            ) : filteredServices.length === 0 ? (
              <div style={contentBg} className="rounded-lg border p-12 text-center">
                <p style={{ fontFamily: 'var(--font-worksans)', opacity: 0.6, marginBottom: '1rem' }}>
                  {searchTerm ? 'No services match your search' : 'No services created yet'}
                </p>
                {!searchTerm && (
                  <button
                    onClick={handleCreateClick}
                    className="px-6 py-2 rounded-lg font-semibold transition-all"
                    style={{
                      backgroundColor: PRIMARY_COLOR,
                      color: 'white',
                      fontFamily: 'var(--font-worksans)'
                    }}
                  >
                    Create First Service
                  </button>
                )}
              </div>
            ) : (
              <div style={contentBg} className="rounded-lg border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full" style={{ fontFamily: 'var(--font-worksans)' }}>
                    <thead>
                      <tr style={{ backgroundColor: theme === 'dark' ? '#0f0f0f' : '#f9fafb', borderBottom: `2px solid ${theme === 'dark' ? '#333333' : '#e5e7eb'}` }}>
                        <th className="px-6 py-4 text-left font-semibold">Service Name</th>
                        <th className="px-6 py-4 text-left font-semibold">Service ID</th>
                        <th className="px-6 py-4 text-left font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredServices.map((service, idx) => (
                        <tr 
                          key={service._id} 
                          style={{ 
                            backgroundColor: idx % 2 === 0 ? 'transparent' : (theme === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'),
                            borderBottom: `1px solid ${theme === 'dark' ? '#333333' : '#e5e7eb'}`
                          }}
                        >
                          <td className="px-6 py-4 font-semibold">{service.service_name}</td>
                          <td className="px-6 py-4 text-sm" style={{ opacity: 0.6 }}>
                            {service._id?.slice(-12)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditClick(service)}
                                className="p-2 rounded-lg transition-all hover:scale-110"
                                style={{
                                  backgroundColor: '#3b82f6',
                                  color: 'white'
                                }}
                                title="Edit"
                              >
                                <FaEdit size={14} />
                              </button>
                              <button
                                onClick={() => handleDelete(service._id!)}
                                className="p-2 rounded-lg transition-all hover:scale-110"
                                style={{
                                  backgroundColor: '#ef4444',
                                  color: 'white'
                                }}
                                title="Delete"
                              >
                                <FaTrash size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-6">
            <div>
              <h2 style={{ fontFamily: 'var(--font-outfit)', fontSize: '24px', fontWeight: 'bold' }} className="mb-1">
                Analytics
              </h2>
              <p style={{ fontFamily: 'var(--font-worksans)', opacity: 0.6 }}>
                Platform performance and insights
              </p>
            </div>
            <div style={contentBg} className="rounded-lg border p-8 text-center">
              <p style={{ fontFamily: 'var(--font-worksans)', opacity: 0.6 }}>
                Analytics dashboard coming soon...
              </p>
            </div>
          </div>
        );

      case 'users':
        return (
          <div className="space-y-6">
            <div>
              <h2 style={{ fontFamily: 'var(--font-outfit)', fontSize: '24px', fontWeight: 'bold' }} className="mb-1">
                Users Management
              </h2>
              <p style={{ fontFamily: 'var(--font-worksans)', opacity: 0.6 }}>
                Manage platform users and providers
              </p>
            </div>
            <div style={contentBg} className="rounded-lg border p-8 text-center">
              <p style={{ fontFamily: 'var(--font-worksans)', opacity: 0.6 }}>
                Users management coming soon...
              </p>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6">
            <div>
              <h2 style={{ fontFamily: 'var(--font-outfit)', fontSize: '24px', fontWeight: 'bold' }} className="mb-1">
                Settings
              </h2>
              <p style={{ fontFamily: 'var(--font-worksans)', opacity: 0.6 }}>
                Platform configuration and settings
              </p>
            </div>
            <div style={contentBg} className="rounded-lg border p-8 text-center">
              <p style={{ fontFamily: 'var(--font-worksans)', opacity: 0.6 }}>
                Settings page coming soon...
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      {renderContent()}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div style={modalBg} className="modal-content rounded-lg shadow-2xl max-w-md w-full animate-scaleIn">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b" style={{ borderColor: theme === 'dark' ? '#333333' : '#e5e7eb' }}>
              <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-outfit)' }}>
                {editingId ? 'Edit Service' : 'Add New Service'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-2xl hover:opacity-70 transition-opacity"
              >
                <FaTimes />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ fontFamily: 'var(--font-worksans)' }}>
                  Service Name
                </label>
                <input
                  type="text"
                  value={formData.service_name}
                  onChange={(e) => {
                    setFormData({ service_name: e.target.value });
                    if (formErrors.service_name) setFormErrors({});
                  }}
                  placeholder="e.g., Plumbing, Electrical, Cleaning..."
                  style={inputStyle}
                  className="w-full px-4 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                {formErrors.service_name && (
                  <p className="text-sm mt-2" style={{ color: '#ef4444', fontFamily: 'var(--font-worksans)' }}>
                    {formErrors.service_name}
                  </p>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 pt-6 border-t" style={{ borderColor: theme === 'dark' ? '#333333' : '#e5e7eb' }}>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 rounded-lg font-semibold transition-all"
                  style={{
                    backgroundColor: theme === 'dark' ? '#333333' : '#e5e7eb',
                    color: theme === 'dark' ? '#ffffff' : '#000000',
                    fontFamily: 'var(--font-worksans)'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 rounded-lg font-semibold transition-all text-white flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: submitting ? '#666666' : PRIMARY_COLOR,
                    fontFamily: 'var(--font-worksans)'
                  }}
                >
                  {submitting ? (
                    <>
                      <FaSpinner className="animate-spin" size={14} />
                      Saving...
                    </>
                  ) : (
                    editingId ? 'Update' : 'Create'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
