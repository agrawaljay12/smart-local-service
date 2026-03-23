import { useTheme } from "../../context/ThemeContext";

const PRIMARY_COLOR = "#0891b2";

export function UserAbout() {
  const { theme } = useTheme();

  const bg = theme === "dark" ? "#000" : "#fff";
  const section = theme === "dark" ? "#0a0a0a" : "#f9f9f9";
  const text = theme === "dark" ? "#fff" : "#000";

  return (
    <div style={{ backgroundColor: bg, color: text }} className="min-h-screen">

      {/* Hero */}
      <section className="py-20 text-center px-6">
        <h1 className="text-5xl font-bold mb-4">About Smart Local</h1>
        <p className="max-w-3xl mx-auto opacity-70 text-lg">
          Smart Local is a platform that connects customers with trusted local service providers quickly and easily.
        </p>
      </section>

      {/* Mission */}
      <section style={{ backgroundColor: section }} className="py-16 px-6 text-center">
        <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
        <p className="max-w-3xl mx-auto opacity-70">
          To simplify the process of finding reliable local services and empower professionals to grow their business.
        </p>
      </section>

      {/* Vision */}
      <section className="py-16 px-6 text-center">
        <h2 className="text-3xl font-bold mb-4">Our Vision</h2>
        <p className="max-w-3xl mx-auto opacity-70">
          To become the most trusted platform for local service discovery worldwide.
        </p>
      </section>

      {/* Why Choose Us */}
      <section style={{ backgroundColor: section }} className="py-20 px-6">
        <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us?</h2>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto text-center">

          <div>
            <h3 style={{ color: PRIMARY_COLOR }} className="text-xl font-bold mb-2">
              Verified Professionals
            </h3>
            <p className="opacity-70">
              All service providers are verified for quality and trust.
            </p>
          </div>

          <div>
            <h3 style={{ color: PRIMARY_COLOR }} className="text-xl font-bold mb-2">
              Fast & Easy
            </h3>
            <p className="opacity-70">
              Find and book services quickly with just a few clicks.
            </p>
          </div>

          <div>
            <h3 style={{ color: PRIMARY_COLOR }} className="text-xl font-bold mb-2">
              Secure Platform
            </h3>
            <p className="opacity-70">
              Your data and transactions are fully protected.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center px-6">
        <h2 className="text-3xl font-bold mb-4">
          Join Smart Local Today
        </h2>
        <p className="opacity-70 mb-6">
          Discover trusted services or grow your business with us.
        </p>

        <a
          href="/auth/signup"
          style={{ backgroundColor: PRIMARY_COLOR }}
          className="px-6 py-3 text-white rounded font-bold"
        >
          Get Started
        </a>
      </section>
    </div>
  );
}