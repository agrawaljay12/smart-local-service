import { FaArrowRight, FaStar } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

export function Home() {
  const { theme } = useTheme();

  const services = [
    { name: "Plumbing", icon: "🔧" },
    { name: "Electrical", icon: "⚡" },
    { name: "Cleaning", icon: "🧹" },
    { name: "Carpentry", icon: "🪛" },
    { name: "Painting", icon: "🎨" },
    { name: "HVAC", icon: "❄️" },
    { name: "Landscaping", icon: "🌿" },
    { name: "Moving", icon: "🚚" },
  ];

  const testimonials = [
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
  ];

  const stats = [
    { label: "Services Completed", value: "10K+" },
    { label: "Happy Customers", value: "5K+" },
    { label: "Verified Professionals", value: "1K+" },
    { label: "Average Rating", value: "4.9★" },
  ];

  return (
    <div style={{ backgroundColor: theme === 'dark' ? '#000000' : '#ffffff', color: theme === 'dark' ? '#ffffff' : '#000000' }}>
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <h1 style={{ fontFamily: 'var(--font-outfit)', color: theme === 'dark' ? '#ffffff' : '#000000' }} className="text-6xl md:text-7xl lg:text-8xl font-black leading-tight">
            Find Trusted <br />
            <span style={{ color: '#0891b2' }}>Local Services</span>
          </h1>
          <p style={{ fontFamily: 'var(--font-worksans)', color: theme === 'dark' ? '#cccccc' : '#000000', opacity: 0.7 }} className="text-xl md:text-2xl max-w-2xl mx-auto leading-relaxed">
            Connect with verified professionals in your area. Quality services, fast responses, peace of mind.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link
              to="#services"
              style={{ fontFamily: 'var(--font-outfit)', backgroundColor: '#0891b2', color: '#ffffff' }}
              className="px-10 py-4 font-bold rounded-lg hover:opacity-80 transition-opacity duration-300 inline-flex items-center justify-center gap-2"
            >
              Explore Services <FaArrowRight size={16} />
            </Link>
            <Link
              to="#about"
              style={{ fontFamily: 'var(--font-outfit)', borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : '#0891b2', color: theme === 'dark' ? '#ffffff' : '#0891b2', borderWidth: '2px' }}
              className="px-10 py-4 font-bold rounded-lg hover:bg-opacity-10 transition-all duration-300"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="space-y-8">
            <div className="text-center">
              <h2 style={{ fontFamily: 'var(--font-outfit)', color: theme === 'dark' ? '#ffffff' : '#000000' }} className="text-3xl md:text-4xl font-bold">
                What service do you need?
              </h2>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Search services..."
                style={{
                  fontFamily: 'var(--font-worksans)',
                  backgroundColor: theme === 'dark' ? '#111111' : '#f5f5f5',
                  color: theme === 'dark' ? '#ffffff' : '#000000',
                  borderColor: '#0891b2'
                }}
                className="flex-1 px-6 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <input
                type="text"
                placeholder="Your location..."
                style={{
                  fontFamily: 'var(--font-worksans)',
                  backgroundColor: theme === 'dark' ? '#111111' : '#f5f5f5',
                  color: theme === 'dark' ? '#ffffff' : '#000000',
                  borderColor: '#0891b2'
                }}
                className="flex-1 px-6 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <button style={{ backgroundColor: '#0891b2', color: '#ffffff', fontFamily: 'var(--font-outfit)' }} className="px-8 py-3 font-bold rounded-lg hover:opacity-80 transition-opacity duration-300 whitespace-nowrap">
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section id="services" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 style={{ fontFamily: 'var(--font-outfit)', color: theme === 'dark' ? '#ffffff' : '#000000' }} className="text-4xl md:text-5xl font-bold mb-4">
              Popular Services
            </h2>
            <p style={{ fontFamily: 'var(--font-worksans)', color: theme === 'dark' ? '#aaaaaa' : '#000000', opacity: 0.6 }} className="text-lg max-w-2xl mx-auto">
              Browse our wide range of trusted local services
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
            {services.map((service, index) => (
              <button
                key={index}
                className="group p-6 md:p-8 text-center hover:scale-105 transition-transform duration-300 rounded-xl"
                style={{
                  backgroundColor: theme === 'dark' ? '#111111' : '#f9f9f9',
                  borderColor: theme === 'dark' ? 'rgba(8, 145, 178, 0.2)' : 'rgba(8, 145, 178, 0.1)',
                  borderWidth: '1px'
                }}
              >
                <div className="text-4xl md:text-5xl mb-3 group-hover:scale-110 transition-transform duration-300">
                  {service.icon}
                </div>
                <h3 style={{ fontFamily: 'var(--font-outfit)', fontSize: '14px', color: theme === 'dark' ? '#ffffff' : '#000000' }} className="font-bold">
                  {service.name}
                </h3>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: theme === 'dark' ? '#0a0a0a' : '#f9f9f9' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <h2 style={{ fontFamily: 'var(--font-outfit)' }} className="text-4xl md:text-5xl font-bold mb-4">
              Why Smart Local?
            </h2>
            <p style={{ fontFamily: 'var(--font-worksans)', color: theme === 'dark' ? '#aaaaaa' : '#000000', opacity: 0.6 }} className="text-lg">
              Everything you need for quality local services
            </p>
          </div>

          <div className="space-y-6 md:space-y-8">
            {[
              { title: "Easy Search", text: "Find local services quickly and easily with our intuitive search functionality." },
              { title: "Verified Professionals", text: "All service providers are thoroughly verified and trusted by our community." },
              { title: "Fast Service", text: "Get quick responses from professionals ready to help in your area." },
              { title: "Secure & Safe", text: "Your information is protected with industry-leading security standards." },
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-6 pb-6 border-b border-opacity-20" style={{ borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }}>
                <div className="w-3 h-3 rounded-full mt-2" style={{ backgroundColor: '#0891b2', flexShrink: 0 }}></div>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-outfit)', color: theme === 'dark' ? '#ffffff' : '#000000' }} className="text-xl font-bold mb-2">
                    {item.title}
                  </h3>
                  <p style={{ fontFamily: 'var(--font-worksans)', color: theme === 'dark' ? '#aaaaaa' : '#000000', opacity: 0.6 }} className="text-base leading-relaxed">
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 style={{ fontFamily: 'var(--font-outfit)', color: theme === 'dark' ? '#ffffff' : '#000000' }} className="text-4xl md:text-5xl font-bold mb-4">
              Loved by Our Users
            </h2>
          </div>

          <div className="space-y-6">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="p-8 rounded-xl" style={{ backgroundColor: theme === 'dark' ? '#111111' : '#f9f9f9', borderLeftColor: '#0891b2', borderLeftWidth: '4px' }}>
                <div className="flex items-center mb-4 gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FaStar key={i} style={{ color: '#fbbf24', fontSize: '14px' }} />
                  ))}
                </div>
                <p style={{ fontFamily: 'var(--font-worksans)', color: theme === 'dark' ? '#cccccc' : '#000000', opacity: 0.8 }} className="text-base mb-4 leading-relaxed italic">
                  "{testimonial.text}"
                </p>
                <div>
                  <p style={{ fontFamily: 'var(--font-outfit)', color: theme === 'dark' ? '#ffffff' : '#000000' }} className="font-bold">
                    {testimonial.name}
                  </p>
                  <p style={{ opacity: 0.5, fontFamily: 'var(--font-worksans)', fontSize: '14px', color: theme === 'dark' ? '#999999' : '#000000' }}>
                    {testimonial.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: theme === 'dark' ? '#0a0a0a' : '#f9f9f9' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index}>
                <div style={{ fontFamily: 'var(--font-outfit)', color: '#0891b2' }} className="text-4xl md:text-5xl font-bold mb-2">
                  {stat.value}
                </div>
                <p style={{ fontFamily: 'var(--font-worksans)', color: theme === 'dark' ? '#aaaaaa' : '#000000', opacity: 0.6 }} className="text-sm md:text-base">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="about" className="py-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#0891b2', color: '#ffffff' }}>
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 style={{ fontFamily: 'var(--font-outfit)', color: '#ffffff' }} className="text-5xl md:text-6xl font-bold leading-tight">
            Ready to Get Started?
          </h2>
          <p style={{ fontFamily: 'var(--font-worksans)', color: '#ffffff', opacity: 0.9 }} className="text-lg md:text-xl leading-relaxed">
            Join thousands of satisfied customers who have found trusted service providers on Smart Local.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <button style={{ fontFamily: 'var(--font-outfit)', backgroundColor: '#ffffff', color: '#0891b2' }} className="px-10 py-4 font-bold rounded-lg hover:opacity-90 transition-opacity duration-300">
              Get Started
            </button>
            <button
              style={{
                fontFamily: 'var(--font-outfit)',
                borderColor: '#ffffff',
                borderWidth: '2px',
                color: '#ffffff',
                backgroundColor: 'transparent'
              }}
              className="px-10 py-4 font-bold rounded-lg hover:bg-white hover:bg-opacity-20 transition-all duration-300"
            >
              Learn More
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
