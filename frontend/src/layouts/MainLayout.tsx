import { Routes, Route } from "react-router-dom";
import {Home} from "../pages/guest/home";
import {ServiceListing} from "../pages/user/ServiceListing";
import {ProviderListing} from "../pages/user/ProviderListing";
import { AdminAuth } from "../pages/admin/AdminAuth";
import { AdminLayout } from "./AdminLayout";
import { ProviderAuth } from "../pages/provider/ProviderAuth";
import { ProviderDashboard } from "../pages/provider/ProviderDashboard";
import { ProviderProtectedRoute } from "../pages/provider/ProviderProtectedRoute";
import { ProviderRegister } from "../pages/provider/ProviderRegister";
import { GuestServices } from "../pages/guest/Services";
import { GuestProviderListing } from "../pages/guest/Provider";
import { GuestContact} from "../pages/guest/Contact";
import { GuestAbout } from "../pages/guest/About";
import { UserContact } from "../pages/user/Contact";
import { UserAbout } from "../pages/user/About";

export const MainLayout = () => {
  return (
    <main className="grow">
      <Routes>

        {/* guest routes */}
        <Route path="/" element={<Home/>} />
        <Route path="/guest/services" element={<GuestServices/>} />
        <Route path="/guest/provider" element={<GuestProviderListing/>} />
        <Route path="/guest/contact" element={<GuestContact/>} />
        <Route path="/guest/about" element={<GuestAbout/>} />


        {/* user routes */}
        <Route path="/user/services" element={<ServiceListing />} />
        <Route path="/user/providers" element={<ProviderListing />} />
        <Route path="/user/contact" element={<UserContact/>} />
        <Route path="/user/about" element={<UserAbout/>} />
      
        {/* Admin Routes */}
        <Route path="/admin/auth" element={<AdminAuth />} />
        <Route path="/admin/*" element={<AdminLayout />} />

        {/* Provider Routes */}
        <Route path="/provider/auth" element={<ProviderAuth />} />
        <Route path="/provider/register" element={<ProviderRegister />} />
        <Route path="/provider/dashboard" element={<ProviderProtectedRoute><ProviderDashboard /></ProviderProtectedRoute>} />
        
        {/* <Route path="/about" element={<About />} />
        //<Route path="/project" element={<Projects />} />
        <Route path="/contact" element={<Contact/>} />
        <Route path="/skills" element={<TechnicalSkills/>} /> */}
      </Routes>
    </main>
  );
};
