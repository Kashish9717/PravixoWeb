import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "sonner";

import { AuthProvider } from "./components/auth/AuthProvider";
import { ThemeProvider } from "./components/theme/ThemeProvider";
import { SiteNavbar } from "./components/layout/SiteNavbar";
import { SiteFooter } from "./components/layout/SiteFooter";

import Home from "./routes/Home";
import About from "./routes/About";
import Addons from "./routes/Addons";
import Blog from "./routes/Blog";
import BlogDetails from "./routes/BlogDetails";
import Browse from "./routes/Browse";
import Careers from "./routes/Careers";
import Connections from "./routes/Connections";
import Contact from "./routes/Contact";
import Faq from "./routes/FAQ";
import Help from "./routes/Help";
import InfluencerDetails from "./routes/InfluencerDetails";
import Login from "./routes/Login";
import Messages from "./routes/Messages";
import Privacy from "./routes/Privacy";
import ProtectionInfo from "./routes/ProtectionInfo";
import Register from "./routes/Register";
import ResetPassword from "./routes/Reset-Password";
import Reviews from "./routes/Reviews";
import Tips from "./routes/Tips";
import OAuthCallback from "./routes/OAuthCallback";

import DashboardCustomer from "./routes/DashboardCustomer";
import DashboardInfluencer from "./routes/DashboardInfluencer";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-7xl font-bold text-gradient-sunset">
          404
        </h1>

        <p className="mt-3 text-muted-foreground">
          Page not found.
        </p>
      </div>
    </div>
  );
}

function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteNavbar />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/addons" element={<Addons />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogDetails />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/connections" element={<Connections />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/help" element={<Help />} />

          <Route
            path="/influencer/:id"
            element={<InfluencerDetails />}
          />

          <Route
            path="/brand/:id"
            element={<InfluencerDetails />}
          />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/reset-password"
            element={<ResetPassword />}
          />

          <Route path="/messages" element={<Messages />} />

          <Route path="/privacy" element={<Privacy />} />

          <Route
            path="/protection-info"
            element={<ProtectionInfo />}
          />

          <Route path="/reviews" element={<Reviews />} />
          <Route path="/tips" element={<Tips />} />

           <Route
            path="/dashboard/customer"
            element={<DashboardCustomer />}
          /> 

           <Route
            path="/dashboard/influencer"
            element={<DashboardInfluencer />}
          /> 

          <Route
            path="/dashboard"
            element={
              <Navigate
                to="/dashboard/influencer"
                replace
              />
            }
          />

          <Route
            path="/oauth/callback"
            element={<OAuthCallback />}
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <SiteFooter />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <ThemeProvider>
        <AuthProvider>
          <Layout />
          <Toaster position="top-center" richColors />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}