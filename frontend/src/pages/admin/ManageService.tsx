import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaEdit, FaTrash, FaSpinner, FaTimes } from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";
import { CATEGORY_ENDPOINTS } from "../../config/category";
import { getAuthHeader } from "../../utils/authHelper";
import { fetchWithAuth } from "../../utils/fetch_auth";

interface Service {
  _id: string;
  service_name: string;
}

interface ApiResponse {
  message: string;
  data: Service[] | { id: string };
}

const PRIMARY_COLOR = '#0891b2';

export function ManageService() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [allowEdit, setAllowEdit] = useState(false);

  const [formData, setFormData] = useState({
    service_name: '',
    description: '',
    hourlyRate: 75,
    experience: 5,
    bio: ''
  });



  // Check authentication on mount
  useEffect(() => {
    const token = sessionStorage.getItem('access_token');
    if (!token) {
      navigate('/provider/auth');
      return;
    }
    fetchServices();
  }, [navigate]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetchWithAuth(CATEGORY_ENDPOINTS.fetchAll, {
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

  const handleOpenModal = (service?: Service) => {
    if (service) {
      setIsEditing(true);
      setSelectedService(service);
      setFormData({
        service_name: service.service_name,
        description: `Description for ${service.service_name}`,
        hourlyRate: 75,
        experience: 5,
        bio: `I am a skilled professional offering ${service.service_name.toLowerCase()} services`
      });
      setAllowEdit(true);
    } else {
      setIsEditing(false);
      setSelectedService(null);
      setFormData({
        service_name: '',
        description: '',
        hourlyRate: 75,
        experience: 5,
        bio: ''
      });
      setAllowEdit(true);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedService(null);
    setIsEditing(false);
    setFormData({
      service_name: '',
      description: '',
      hourlyRate: 75,
      experience: 5,
      bio: ''
    });
    setAllowEdit(false);
  };

  const validateForm = () => {
    if (!formData.service_name.trim()) {
      setError('Service name is required');
      return false;
    }
    if (formData.service_name.length < 3 || formData.service_name.length > 50) {
      setError('Service name must be 3-50 characters');
      return false;
    }
    if (!/^[a-zA-Z0-9&'\- ]+$/.test(formData.service_name)) {
      setError('Service name contains invalid characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    try {
      if (isEditing && selectedService) {
        // Update service
        const response = await fetchWithAuth(`${CATEGORY_ENDPOINTS.update}/${selectedService._id}`, {
          method: 'PUT',
          headers: {
            ...getAuthHeader(),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ service_name: formData.service_name })
        });

        const data: ApiResponse = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to update service');
        }

        setSuccess('Service updated successfully!');
        handleCloseModal();
        // Update local state
        setServices(services.map(s => 
          s._id === selectedService._id 
            ? { ...s, service_name: formData.service_name }
            : s
        ));
      } else {
        // Create new service
        const response = await fetch(CATEGORY_ENDPOINTS.create, {
          method: 'POST',
          headers: {
            ...getAuthHeader(),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ service_name: formData.service_name })
        });

        const data: ApiResponse = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to create service');
        }

        setSuccess('Service created successfully!');
        handleCloseModal();
        fetchServices(); // Refresh list
      }

      // Auto-dismiss success message
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed');
    }
  };

  const handleDelete = async (service: Service) => {
    if (!confirm(`Are you sure you want to delete "${service.service_name}"?`)) {
      return;
    }

    try {
      setError('');
      const response = await fetch(`${CATEGORY_ENDPOINTS.delete}/${service._id}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      });

      const data: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete service');
      }

      setSuccess('Service deleted successfully!');
      setServices(services.filter(s => s._id !== service._id));

      // Auto-dismiss success message
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete service');
    }
  };



  const containerBg = {
    backgroundColor: theme === 'dark' ? '#000000' : '#ffffff',
    color: theme === 'dark' ? '#ffffff' : '#000000'
  };

  const cardStyle = {
    backgroundColor: theme === 'dark' ? '#111111' : '#f9fafb',
    borderColor: theme === 'dark' ? '#333333' : '#e5e7eb'
  };

  const modalBg = {
    backgroundColor: theme === 'dark' ? '#111111' : '#ffffff',
    color: theme === 'dark' ? '#ffffff' : '#000000'
  };

  const inputStyle = {
    backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
    color: theme === 'dark' ? '#ffffff' : '#000000',
    borderColor: theme === 'dark' ? '#444444' : '#d1d5db'
  };

  return (
    <div style={containerBg}>

      {/* Main Content */}
      <div className="px-6 py-8 max-w-7xl mx-auto">
        {/* Success Alert */}
        {success && (
          <div className="alert alert-success mb-6 p-4 rounded-lg flex items-center justify-between animate-slideInDown" style={{
            backgroundColor: theme === 'dark' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.05)',
            color: '#22c55e',
            borderLeft: '4px solid #22c55e'
          }}>
            <span style={{ fontFamily: 'var(--font-worksans)' }}>{success}</span>
            <button onClick={() => setSuccess('')} className="text-lg">
              <FaTimes />
            </button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="alert alert-error mb-6 p-4 rounded-lg flex items-center justify-between animate-slideInDown" style={{
            backgroundColor: theme === 'dark' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
            color: '#ef4444',
            borderLeft: '4px solid #ef4444'
          }}>
            <span style={{ fontFamily: 'var(--font-worksans)' }}>{error}</span>
            <button onClick={() => setError('')} className="text-lg">
              <FaTimes />
            </button>
          </div>
        )}

        {/* Action Button */}
        <div className="mb-6">
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all hover:shadow-lg active:scale-95"
            style={{
              backgroundColor: PRIMARY_COLOR,
              color: 'white',
              fontFamily: 'var(--font-worksans)'
            }}
          >
            <FaPlus /> Add Service
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <FaSpinner className="animate-spin text-3xl" style={{ color: PRIMARY_COLOR }} />
          </div>
        ) : services.length === 0 ? (
          <div
            className="text-center py-12 rounded-lg"
            style={{
              backgroundColor: theme === 'dark' ? '#111111' : '#f9fafb',
              border: `1px solid ${theme === 'dark' ? '#333333' : '#e5e7eb'}`
            }}
          >
            <p style={{ color: theme === 'dark' ? '#aaaaaa' : '#999999', fontFamily: 'var(--font-worksans)' }}>
              No services yet. Create your first service to get started!
            </p>
          </div>
        ) : (
          /* Services Table */
          <div style={cardStyle} className="rounded-lg border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#f5f5f5', borderBottom: `1px solid ${theme === 'dark' ? '#333333' : '#e5e7eb'}` }}>
                  <th className="text-left px-6 py-4 font-bold" style={{ fontFamily: 'var(--font-outfit)' }}>Service Name</th>
                  <th className="text-center px-6 py-4 font-bold" style={{ fontFamily: 'var(--font-outfit)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service, index) => (
                  <tr
                    key={service._id}
                    style={{ borderBottom: `1px solid ${theme === 'dark' ? '#333333' : '#e5e7eb'}` }}
                    className={index % 2 === 1 ? (theme === 'dark' ? '' : '') : (theme === 'dark' ? '' : '')}
                  >
                    <td className="px-6 py-4" style={{ fontFamily: 'var(--font-worksans)' }}>
                      {service.service_name}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleOpenModal(service)}
                          className="flex items-center gap-2 px-3 py-2 rounded transition-all hover:opacity-70"
                          style={{
                            backgroundColor: theme === 'dark' ? '#1f2937' : '#e5e7eb',
                            fontFamily: 'var(--font-worksans)',
                            fontSize: '12px'
                          }}
                          title="Edit service"
                        >
                          <FaEdit /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(service)}
                          className="flex items-center gap-2 px-3 py-2 rounded transition-all hover:opacity-70 text-red-500"
                          style={{ fontFamily: 'var(--font-worksans)', fontSize: '12px' }}
                          title="Delete service"
                        >
                          <FaTrash /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div style={modalBg} className="modal-content rounded-lg shadow-xl max-w-md w-full animate-scaleIn">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b" style={{ borderColor: theme === 'dark' ? '#333333' : '#e5e7eb' }}>
              <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--font-outfit)' }}>
                {isEditing ? 'Edit Service' : 'Add New Service'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-2xl hover:opacity-70 transition-opacity"
              >
                <FaTimes />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Service Name */}
                <div>
                  <label style={{ fontFamily: 'var(--font-worksans)' }} className="block text-sm font-bold mb-1">
                    Service Name
                  </label>
                  <input
                    type="text"
                    value={formData.service_name}
                    onChange={(e) => setFormData({ ...formData, service_name: e.target.value })}
                    placeholder="e.g., Web Design"
                    disabled={!allowEdit}
                    style={inputStyle}
                    className="w-full px-3 py-2 rounded border transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
                  />
                </div>

                

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-4 py-2 rounded font-bold transition-all"
                    style={{
                      backgroundColor: theme === 'dark' ? '#1f2937' : '#e5e7eb',
                      color: theme === 'dark' ? '#ffffff' : '#000000',
                      fontFamily: 'var(--font-worksans)'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 rounded font-bold transition-all hover:shadow-lg active:scale-95"
                    style={{
                      backgroundColor: PRIMARY_COLOR,
                      color: 'white',
                      fontFamily: 'var(--font-worksans)'
                    }}
                  >
                    {isEditing ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


