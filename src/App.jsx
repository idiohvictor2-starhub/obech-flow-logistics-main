import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "@/lib/query-client";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import PageNotFound from "@/lib/PageNotFound";
import ScrollToTop from "@/components/ScrollToTop";

import Home from "@/pages/Home";
import Services from "@/pages/Services";
import Tracking from "@/pages/Tracking";
import Quote from "@/pages/Quote";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import SiteLayout from "@/components/layout/SiteLayout";

import AdminLogin from "@/pages/admin/AdminLogin";
import AdminLayout from "@/pages/admin/AdminLayout";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminBookings from "@/pages/admin/AdminBookings";
import AdminTracking from "@/pages/admin/AdminTracking";
import AdminPhotos from "@/pages/admin/AdminPhotos";
import AdminDrivers from "@/pages/admin/AdminDrivers";
import AdminVehicles from "@/pages/admin/AdminVehicles";
import AdminReports from "@/pages/admin/AdminReports";
import AdminSettings from "@/pages/admin/AdminSettings";
import AdminLocations from "@/pages/admin/AdminLocations";
import AdminPricing from "@/pages/admin/AdminPricing";

function App() {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <Router>
        <ScrollToTop />

        <Routes>
          <Route element={<SiteLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/track" element={<Tracking />} />
            <Route path="/quote" element={<Quote />} />
            <Route path="/booking" element={<Quote />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
          </Route>

          <Route path="/admin/login" element={<AdminLogin />} />
          
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/bookings" element={<AdminBookings />} />
            <Route path="/admin/tracking" element={<AdminTracking />} />
            <Route path="/admin/photos" element={<AdminPhotos />} />
            <Route path="/admin/drivers" element={<AdminDrivers />} />
            <Route path="/admin/vehicles" element={<AdminVehicles />} />
            <Route path="/admin/reports" element={<AdminReports />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/admin/locations" element={<AdminLocations />} />
            <Route path="/admin/pricing" element={<AdminPricing />} />
          </Route>

          <Route path="*" element={<PageNotFound />} />
        </Routes>

        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}

export default App;