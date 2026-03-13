import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "./content/home";
import { Navigation } from "./components/Navigation";
import { Footer } from "./components/Footer";
import { ThemeProvider } from "./context/ThemeContext";
import { SignUp } from "./auth/SignUp";
import { SignIn } from "./auth/SignIn";
import { ForgotPassword } from "./auth/ForgotPassword";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth/signup" element={<SignUp />} />
          <Route path="/auth/signin" element={<SignIn />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />
          {/* <Route path="/about" element={<About />} />
          <Route path="/project" element={<Projects />} />
          <Route path="/contact" element={<Contact/>} />
          <Route path="/skills" element={<TechnicalSkills/>} /> */}
        </Routes>
        <Footer />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
