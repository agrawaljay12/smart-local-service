import { BrowserRouter, useLocation } from "react-router-dom";
import { Navigation } from "./components/Navigation";
import { Footer } from "./components/Footer";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthLayout } from "./layouts/AuthLayout";
import { MainLayout } from "./layouts/MainLayout";
import { UserNavigation } from "./components/UserNavigation"; 

function AppContent() {
  const location = useLocation();
  const isAuthPage = location.pathname.startsWith("/auth");
  const isAdminPage = location.pathname.startsWith("/admin");
  const isProviderPage = location.pathname.startsWith("/provider");
  const isUserPage = location.pathname.startsWith("/user");

  let navbar = null;

     if(!isAuthPage && !isAdminPage && !isProviderPage){       
        navbar = isUserPage?<UserNavigation/>:<Navigation/>
    }

  return (
 
    <div className="flex flex-col min-h-screen">
      {navbar}
      {isAuthPage ? <AuthLayout /> : <MainLayout />}
      {!isAuthPage && !isAdminPage && !isProviderPage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
