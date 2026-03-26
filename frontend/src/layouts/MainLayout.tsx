import { Routes, Route } from "react-router-dom";
import {Home} from "../pages/guest/home";
import {ServiceListing} from "../pages/user/ServiceListing";
import {ProviderListing} from "../pages/user/ProviderListing";
import { AdminAuth } from "../pages/admin/AdminAuth";
import { AdminLayout } from "./AdminLayout";
// import { ProviderAuth } from "../pages/provider/ProviderAuth";
import { ProviderDashboard } from "../pages/provider/ProviderDashboard";
import { ProviderProtectedRoute } from "../pages/provider/ProviderProtectedRoute";
import { ProviderRegister } from "../pages/provider/ProviderRegister";
import { GuestServices } from "../pages/guest/Services";
import { GuestProviderListing } from "../pages/guest/Provider";
import { GuestContact} from "../pages/guest/Contact";
import { GuestAbout } from "../pages/guest/About";
import { UserContact } from "../pages/user/Contact";
import { UserAbout } from "../pages/user/About";
import { ChangePassword } from "../pages/user/Changepassword";
import { ViewProfile } from "../pages/user/ViewProfile";
import { EditProfile } from "../pages/user/EditProfile";
import { ProviderChangePassword } from "../pages/provider/Changepassword";
import { ProviderEditProfile } from "../pages/provider/EditProfile";
import { ProviderViewProfile } from "../pages/provider/ViewProfile";
import { ProviderLayout } from "./ProviderLayout";
import { UserProtectedRoute } from "../pages/user/UserProtetedRoute";

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
        <Route path="/user" element={<UserProtectedRoute/>}>
            <Route path="/user/services" element={<ServiceListing />} />
            <Route path="/user/providers" element={<ProviderListing />} />
            <Route path="/user/contact" element={<UserContact/>} />
            <Route path="/user/about" element={<UserAbout/>} />
            <Route path="/user/change-password" element={<ChangePassword/>} />
            <Route path="/user/view-profile" element={<ViewProfile/>} />
            <Route path="/user/edit-profile" element={<EditProfile/>} />
        </Route>       
      
        {/* Admin Routes */}
        <Route path="/admin/auth" element={<AdminAuth />} />
        <Route path="/admin/*" element={<AdminLayout />} />

        <Route path="/provider/register" element={<ProviderRegister />} />
      
        {/* privider routes */}
        <Route path="/provider" element={<ProviderProtectedRoute />}>
          <Route element={<ProviderLayout />}>    
            <Route path="dashboard" element={<ProviderDashboard />} />
            <Route path="change-password" element={<ProviderChangePassword />} />
            <Route path="edit-profile" element={<ProviderEditProfile />} />
            <Route path="view-profile" element={<ProviderViewProfile />} />
          </Route>
        </Route>
      </Routes>
    </main>
  );
};
