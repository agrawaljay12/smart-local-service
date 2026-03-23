import { useState, useMemo, memo, useEffect } from "react";
import { FaArrowRight, FaStar, FaSpinner } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { CATEGORY_ENDPOINTS } from "../../config/category";
import { getAuthHeader } from "../../utils/authHelper";

// Constants
const PRIMARY_COLOR = '#0891b2';
const DARK_BG = '#000000';
const LIGHT_BG = '#ffffff';
const DARK_SECTION = '#0a0a0a';
const LIGHT_SECTION = '#f9f9f9';
const DARK_CARD = '#111111';
const LIGHT_CARD = '#f5f5f5';

// Utility function to get theme colors
const getThemeColors = (theme: string) => ({
  bg: theme === 'dark' ? DARK_BG : LIGHT_BG,
  text: theme === 'dark' ? LIGHT_BG : DARK_BG,
  card: theme === 'dark' ? DARK_CARD : LIGHT_CARD,
  section: theme === 'dark' ? DARK_SECTION : LIGHT_SECTION,
  border: theme === 'dark' ? 'rgba(8, 145, 178, 0.15)' : 'rgba(8, 145, 178, 0.2)',
  borderLight: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
  hover: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
});

// Service Item Component
const ServiceItem = memo(({ service, theme, onServiceClick }: { service: { name: string; icon: string; description: string }; theme: string; onServiceClick: (serviceName: string) => void }) => {
  const colors = getThemeColors(theme);
  
  return (
    <button
      onClick={() => onServiceClick(service.name)}
      className="group p-6 md:p-8 text-center rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 hover:-translate-y-2 cursor-pointer"
      style={{
        backgroundColor: colors.card,
        borderColor: colors.border,
        borderWidth: '1px',
      }}
      aria-label={`${service.name} service - ${service.description}`}
    >
      <div className="text-5xl md:text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
        {service.icon}
      </div>
      <h3 style={{ fontFamily: 'var(--font-outfit)' }} className="text-xl font-bold mb-2">
        {service.name}
      </h3>
      <p style={{ fontFamily: 'var(--font-worksans)', opacity: 0.6 }} className="text-sm leading-relaxed">
        {service.description}
      </p>
    </button>
  );
});

// Stat Item Component
const StatItem = memo(({ stat }: { stat: { label: string; value: string } }) => (
  <div>
    <div style={{ fontFamily: 'var(--font-outfit)', color: PRIMARY_COLOR }} className="text-4xl md:text-5xl font-bold mb-2">
      {stat.value}
    </div>
    <p style={{ fontFamily: 'var(--font-worksans)', opacity: 0.6 }} className="text-sm md:text-base">
      {stat.label}
    </p>
  </div>
));

// Why Choose Item Component - Enhanced with better visuals
const WhyChooseItem = memo(({ item, theme }: { item: { title: string; text: string; icon: string }; theme: string }) => {
  const colors = getThemeColors(theme);
  
  return (
    <div className="flex flex-col items-center text-center p-8 rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1" style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}` }}>
      <div className="text-5xl mb-4">
        {item.icon}
      </div>
      <h3 style={{ fontFamily: 'var(--font-outfit)' }} className="text-2xl font-bold mb-3">
        {item.title}
      </h3>
      <p style={{ fontFamily: 'var(--font-worksans)', opacity: 0.6 }} className="text-base leading-relaxed">
        {item.text}
      </p>
    </div>
  );
});

export function Home() {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [services, setServices] = useState<Array<{ name: string; icon: string; description: string }>>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const colors = useMemo(() => getThemeColors(theme), [theme]);

  // Fetch services from backend
  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoadingServices(true);
      const response = await fetch(CATEGORY_ENDPOINTS.fetchAll, {
        method: 'GET',
        headers: getAuthHeader()
      });
      
      const data = await response.json();
      
      if (response.ok && Array.isArray(data.data)) {
        // Transform backend data to match component needs
        const transformedServices = data.data.map((service: any) => ({
          name: service.service_name || 'Service',
          icon: getServiceIcon(service.service_name),
          description: getServiceDescription(service.service_name)
        }));
        setServices(transformedServices);
      } else {
        // Fallback to default services if fetch fails
        setServices(getDefaultServices());
      }
    } catch (err) {
      console.error('Error fetching services:', err);
      // Fallback to default services
      setServices(getDefaultServices());
    } finally {
      setLoadingServices(false);
    }
  };

  // Helper function to get default services
  const getDefaultServices = () => [
    { name: "Plumbing", icon: "🔧", description: "Leaks, repairs, installations" },
    { name: "Electrical", icon: "⚡", description: "Wiring, repairs, upgrades" },
    { name: "Cleaning", icon: "🧹", description: "Home & office cleaning" },
    { name: "Carpentry", icon: "🪛", description: "Furniture, repairs, building" },
    { name: "Painting", icon: "🎨", description: "Interior & exterior painting" },
    { name: "HVAC", icon: "❄️", description: "Heating, cooling, maintenance" },
    { name: "Landscaping", icon: "🌿", description: "Lawn care, landscaping" },
    { name: "Moving", icon: "🚚", description: "Local & long distance moves" },
  ];

  // Helper function to get icon for service
  const getServiceIcon = (serviceName: string): string => {
    const iconMap: Record<string, string> = {
      plumbing: "🔧",
      electrical: "⚡",
      cleaning: "🧹",
      carpentry: "🪛",
      painting: "🎨",
      hvac: "❄️",
      landscaping: "🌿",
      moving: "🚚",
    };
    return iconMap[serviceName.toLowerCase()] || "🏠";
  };

  // Helper function to get description for service
  const getServiceDescription = (serviceName: string): string => {
    const descriptionMap: Record<string, string> = {
      plumbing: "Leaks, repairs, installations",
      electrical: "Wiring, repairs, upgrades",
      cleaning: "Home & office cleaning",
      carpentry: "Furniture, repairs, building",
      painting: "Interior & exterior painting",
      hvac: "Heating, cooling, maintenance",
      landscaping: "Lawn care, landscaping",
      moving: "Local & long distance moves",
    };
    return descriptionMap[serviceName.toLowerCase()] || "Professional services";
  };

  const handleServiceClick = (serviceName: string) => {
    // Navigate to category listing with service as query param
    navigate(`/guest/services?category=${encodeURIComponent(serviceName)}`);
  };

 

  const testimonials = useMemo(() => [
    {
      name: "Sarah Johnson",
      role: "Homeowner",
      text: "Smart Local made finding a plumber so easy. Great service and very responsive!",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Service Provider",
      text: "I've gotten so many clients through this platform. Highly recommend!",
      rating: 5,
    },
    {
      name: "Emma Davis",
      role: "Homeowner",
      text: "Professional, reliable, and trustworthy. Best experience ever!",
      rating: 5,
    },
  ], []);

  const stats = useMemo(() => [
    { label: "Services Completed", value: "10K+" },
    { label: "Happy Customers", value: "5K+" },
    { label: "Verified Professionals", value: "1K+" },
    { label: "Average Rating", value: "4.9★" },
  ], []);

  const whyChooseItems = useMemo(() => [
    { title: "Easy Search", text: "Find local services quickly and easily with our intuitive search functionality. Browse by category or location.", icon: "🔍" },
    { title: "Verified Professionals", text: "All service providers are thoroughly vetted and verified by our community. Trust badges and reviews included.", icon: "✓" },
    { title: "Fast Responses", text: "Get quick quotes and immediate responses from professionals ready to help in your area today.", icon: "⚡" },
    { title: "Secure & Safe", text: "Your information is protected with industry-leading security standards. Transparent pricing, no hidden fees.", icon: "🔒" },
  ], []);

  return (
    <div style={{ backgroundColor: colors.bg, color: colors.text }} className="scroll-smooth">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden pt-20">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, ' + PRIMARY_COLOR + ', transparent 50%)', pointerEvents: 'none' }}></div>
        <div className="max-w-6xl mx-auto text-center space-y-10 relative z-10">
          <div className="space-y-6">
            <h1 
              style={{ fontFamily: 'var(--font-outfit)' }} 
              className="text-5xl md:text-7xl lg:text-8xl font-black leading-tight animate-fade-in"
            >
              Find Trusted <br />
              <span style={{ color: PRIMARY_COLOR }} className="inline-block mt-3">Local Services</span>
            </h1>
            <p 
              style={{ fontFamily: 'var(--font-worksans)', opacity: 0.7 }} 
              className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed animate-fade-in-delay"
            >
              Connect with verified professionals in your area. Get quality service, fast responses, and complete peace of mind. No hidden fees. No surprises.
            </p>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center pt-4 animate-fade-in-delay animate-fade-in-delay-2">
            <div className="flex items-center gap-2" style={{ fontFamily: 'var(--font-worksans)', opacity: 0.7 }}>
              <span style={{ color: PRIMARY_COLOR }} className="font-bold">✓</span> 10K+ Services Completed
            </div>
            <div className="flex items-center gap-2" style={{ fontFamily: 'var(--font-worksans)', opacity: 0.7 }}>
              <span style={{ color: PRIMARY_COLOR }} className="font-bold">✓</span> Verified Professionals
            </div>
            <div className="flex items-center gap-2" style={{ fontFamily: 'var(--font-worksans)', opacity: 0.7 }}>
              <span style={{ color: PRIMARY_COLOR }} className="font-bold">✓</span> 4.9★ Avg Rating
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8 animate-fade-in-delay-2">
            <a
              href="/guest/services"
              style={{ fontFamily: 'var(--font-outfit)', backgroundColor: PRIMARY_COLOR, color: LIGHT_BG }}
              className="px-12 py-4 font-bold text-lg rounded-lg hover:opacity-85 transition-all duration-300 inline-flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2"
              role="button"
              tabIndex={0}
            >
              Explore Services <FaArrowRight size={16} />
            </a>
            <a
              href="#about"
              style={{ fontFamily: 'var(--font-outfit)', borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : PRIMARY_COLOR, color: theme === 'dark' ? LIGHT_BG : PRIMARY_COLOR, borderWidth: '2px' }}
              className="px-12 py-4 font-bold text-lg rounded-lg hover:bg-opacity-10 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2"
              role="button"
              tabIndex={0}
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section id="services" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 style={{ fontFamily: 'var(--font-outfit)' }} className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Popular Services
            </h2>
            <p style={{ fontFamily: 'var(--font-worksans)', opacity: 0.6 }} className="text-lg max-w-3xl mx-auto leading-relaxed">
              Choose from a wide range of trusted local services. Each professional is verified and rated by our community.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loadingServices ? (
              <div className="col-span-full flex justify-center items-center py-12">
                <FaSpinner className="animate-spin text-3xl" style={{ color: PRIMARY_COLOR }} />
              </div>
            ) : services.length > 0 ? (
              services.map((service, index) => (
                <ServiceItem 
                  key={`${service.name}-${index}`} 
                  service={service} 
                  theme={theme} 
                  onServiceClick={handleServiceClick} 
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12" style={{ color: colors.text }}>
                <p style={{ fontFamily: 'var(--font-worksans)' }}>No services available</p>
              </div>
            )}
          </div>

          <div className="text-center mt-16">
            <Link
              to="/guest/services"
              style={{ fontFamily: 'var(--font-outfit)', color: PRIMARY_COLOR, borderColor: PRIMARY_COLOR, borderWidth: '2px' }}
              className="inline-block px-8 py-3 font-bold rounded-lg hover:bg-opacity-10 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2"
            >
              View All Services
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: colors.section }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 style={{ fontFamily: 'var(--font-outfit)' }} className="text-4xl md:text-5xl font-bold mb-4">
              Why Choose Smart Local?
            </h2>
            <p style={{ fontFamily: 'var(--font-worksans)', opacity: 0.6 }} className="text-lg max-w-2xl mx-auto">
              We've made it simple to find quality service. Here's what makes us different.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyChooseItems.map((item, index) => (
              <WhyChooseItem key={`${item.title}-${index}`} item={item} theme={theme} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 style={{ fontFamily: 'var(--font-outfit)' }} className="text-4xl md:text-5xl font-bold mb-4">
              Loved by Our Users
            </h2>
            <p style={{ fontFamily: 'var(--font-worksans)', opacity: 0.6 }} className="text-lg max-w-2xl mx-auto">
              Join thousands of satisfied customers and service providers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={`${testimonial.name}-${index}`}
                className="p-8 rounded-xl transition-all duration-300 hover:shadow-xl hover:-translate-y-2"
                style={{
                  backgroundColor: colors.card,
                  borderColor: 'rgba(8, 145, 178, 0.2)',
                  borderWidth: '2px'
                }}
              >
                <div className="flex items-center mb-6 gap-1" aria-label={`${testimonial.rating} out of 5 stars`}>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FaStar key={i} style={{ color: '#fbbf24', fontSize: '16px' }} aria-hidden="true" />
                  ))}
                </div>
                <p style={{ fontFamily: 'var(--font-worksans)', opacity: 0.85 }} className="text-base mb-6 leading-relaxed italic">
                  "{testimonial.text}"
                </p>
                <div className="border-t" style={{ borderColor: colors.borderLight, paddingTop: '1rem' }}>
                  <p style={{ fontFamily: 'var(--font-outfit)' }} className="font-bold text-sm">
                    {testimonial.name}
                  </p>
                  <p style={{ opacity: 0.5, fontFamily: 'var(--font-worksans)', fontSize: '13px' }} className="mt-1">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: colors.section }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <StatItem key={`${stat.label}-${index}`} stat={stat} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="about" className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{ backgroundColor: PRIMARY_COLOR, color: LIGHT_BG }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.5), transparent 50%)', pointerEvents: 'none' }}></div>
        <div className="max-w-4xl mx-auto text-center space-y-10 relative z-10">
          <div className="space-y-6">
            <h2 style={{ fontFamily: 'var(--font-outfit)' }} className="text-5xl md:text-6xl lg:text-7xl font-black leading-tight">
              Ready to Find Your Perfect Service?
            </h2>
            <p style={{ fontFamily: 'var(--font-worksans)', opacity: 0.95 }} className="text-xl md:text-2xl leading-relaxed">
              Join thousands of satisfied customers who have found trusted professionals through Smart Local. Get started today with zero commitment.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link 
              to="/auth/signup"
              style={{ fontFamily: 'var(--font-outfit)', backgroundColor: LIGHT_BG, color: PRIMARY_COLOR }} 
              className="px-14 py-5 font-bold text-lg rounded-lg hover:opacity-90 transition-all duration-300 inline-block shadow-xl hover:shadow-2xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2"
            >
              Sign Up Free
            </Link>
            <Link
              to="/"
              style={{
                fontFamily: 'var(--font-outfit)',
                borderColor: LIGHT_BG,
                borderWidth: '2px',
                color: LIGHT_BG,
                backgroundColor: 'transparent'
              }}
              className="px-14 py-5 font-bold text-lg rounded-lg hover:bg-white/20 transition-all duration-300 inline-block focus:outline-none focus:ring-2 focus:ring-offset-2"
            >
              See How It Works
            </Link>
          </div>

          <p style={{ fontFamily: 'var(--font-worksans)', opacity: 0.8, marginTop: '1rem' }} className="text-sm">
            ✓ No credit card required · ✓ 5 minutes to get started · ✓ Cancel anytime
          </p>
        </div>
      </section>
    </div>
  );
}
