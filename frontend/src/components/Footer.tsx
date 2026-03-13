import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram, FaMapMarkerAlt, FaPhone, FaEnvelope } from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { theme } = useTheme();

  const footerSections = [
    {
      title: "About Us",
      links: ["Our Story", "Team", "Careers", "Blog"],
    },
    {
      title: "Services",
      links: ["Local Services", "Support", "Pricing", "Documentation"],
    },
    {
      title: "Legal",
      links: ["Privacy Policy", "Terms of Service", "Cookie Policy", "Contact Us"],
    },
  ];

  return (
    <footer className="transition-colors duration-300" style={{ background: theme === 'dark' ? 'linear-gradient(135deg, #0a0a0a 0%, #000000 100%)' : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.95) 100%)', color: theme === 'dark' ? '#aaaaaa' : '#666666', borderTop: theme === 'dark' ? '1px solid rgba(8, 145, 178, 0.2)' : '1px solid rgba(8, 145, 178, 0.25)' }}>
      {/* Main Footer Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: '#0891b2' }}>
                <span style={{ fontFamily: 'var(--font-outfit)', color: '#ffffff' }} className="text-white font-black text-2xl">S</span>
              </div>
              <h3 style={{ fontFamily: 'var(--font-outfit)', color: theme === 'dark' ? '#ffffff' : '#000000', fontSize: '20px', fontWeight: 'bold' }} className="text-xl font-bold">Smart Local</h3>
            </div>
            <p style={{ fontFamily: 'var(--font-worksans)', color: theme === 'dark' ? '#888888' : '#666666' }} className="text-sm mb-6 leading-relaxed">
              Connecting you with trusted local services. Quality, reliability, and peace of mind in one place.
            </p>
            {/* Social Links */}
            <div className="flex space-x-5">
              <a href="#" className="w-10 h-10 rounded-full flex items-center justify-center bg-opacity-10 transition-all duration-200 hover:scale-110 hover:shadow-lg" style={{ backgroundColor: theme === 'dark' ? 'rgba(8, 145, 178, 0.2)' : 'rgba(8, 145, 178, 0.1)', color: '#0891b2' }}>
                <FaFacebook size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full flex items-center justify-center bg-opacity-10 transition-all duration-200 hover:scale-110 hover:shadow-lg" style={{ backgroundColor: theme === 'dark' ? 'rgba(8, 145, 178, 0.2)' : 'rgba(8, 145, 178, 0.1)', color: '#0891b2' }}>
                <FaTwitter size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full flex items-center justify-center bg-opacity-10 transition-all duration-200 hover:scale-110 hover:shadow-lg" style={{ backgroundColor: theme === 'dark' ? 'rgba(8, 145, 178, 0.2)' : 'rgba(8, 145, 178, 0.1)', color: '#0891b2' }}>
                <FaLinkedin size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full flex items-center justify-center bg-opacity-10 transition-all duration-200 hover:scale-110 hover:shadow-lg" style={{ backgroundColor: theme === 'dark' ? 'rgba(8, 145, 178, 0.2)' : 'rgba(8, 145, 178, 0.1)', color: '#0891b2' }}>
                <FaInstagram size={18} />
              </a>
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 style={{ fontFamily: 'var(--font-outfit)', color: theme === 'dark' ? '#ffffff' : '#000000', fontWeight: 'bold', fontSize: '18px' }} className="font-semibold mb-4">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link}>
                    <a href="#" style={{ fontFamily: 'var(--font-worksans)', color: '#0891b2' }} className="text-sm hover:opacity-70 transition-colors duration-200 hover:translate-x-1 inline-flex font-medium">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact Info */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-outfit)', color: theme === 'dark' ? '#ffffff' : '#000000', fontWeight: 'bold', fontSize: '18px' }} className="font-semibold mb-4">
              Contact
            </h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <FaMapMarkerAlt size={18} className="mt-1 shrink-0" style={{ color: '#0891b2' }} />
                <p style={{ fontFamily: 'var(--font-worksans)', color: theme === 'dark' ? '#888888' : '#666666' }} className="text-sm leading-relaxed">123 Main Street, Your City, ST 12345</p>
              </div>
              <div className="flex items-center space-x-4">
                <FaPhone size={16} className="shrink-0" style={{ color: '#0891b2' }} />
                <a href="tel:+1234567890" style={{ fontFamily: 'var(--font-worksans)', color: '#0891b2' }} className="text-sm hover:opacity-70 transition-colors duration-200 hover:underline font-medium">
                  +1 (234) 567-890
                </a>
              </div>
              <div className="flex items-center space-x-4">
                <FaEnvelope size={16} className="shrink-0" style={{ color: '#0891b2' }} />
                <a href="mailto:info@smartlocal.com" style={{ fontFamily: 'var(--font-worksans)', color: '#0891b2' }} className="text-sm hover:opacity-70 transition-colors duration-200 hover:underline font-medium">
                  info@smartlocal.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t mt-12 pt-8" style={{ borderTopColor: theme === 'dark' ? 'rgba(8, 145, 178, 0.25)' : 'rgba(8, 145, 178, 0.3)' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <p style={{ fontFamily: 'var(--font-worksans)', color: theme === 'dark' ? '#888888' : '#999999' }} className="text-sm">
              &copy; {currentYear} Smart Local Service. All rights reserved.
            </p>
            <div className="flex justify-start md:justify-end space-x-8 text-sm">
              <a href="#" style={{ fontFamily: 'var(--font-worksans)', color: '#0891b2' }} className="hover:opacity-70 transition-colors duration-200 font-medium hover:underline">
                Privacy
              </a>
              <a href="#" style={{ fontFamily: 'var(--font-worksans)', color: '#0891b2' }} className="hover:opacity-70 transition-colors duration-200 font-medium hover:underline">
                Terms
              </a>
              <a href="#" style={{ fontFamily: 'var(--font-worksans)', color: '#0891b2' }} className="hover:opacity-70 transition-colors duration-200 font-medium hover:underline">
                Settings
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
