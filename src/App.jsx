import { Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import SelectPlan from "./pages/SelectPlan.jsx";
import Paywall from "./pages/Paywall.jsx";
import Pricing from "./pages/Pricing.jsx";
import ReviewPage from "./pages/ReviewPage.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import PrivacyPolicy from "./pages/PrivacyPolicy.jsx";
import TermsOfService from "./pages/TermsOfService.jsx";
import RefundPolicy from "./pages/RefundPolicy.jsx";
import CookiePolicy from "./pages/CookiePolicy.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-of-service" element={<TermsOfService />} />
      <Route path="/refund-policy" element={<RefundPolicy />} />
      <Route path="/cookie-policy" element={<CookiePolicy />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/select-plan"
        element={
          <ProtectedRoute>
            <SelectPlan />
          </ProtectedRoute>
        }
      />
      <Route
        path="/paywall"
        element={
          <ProtectedRoute>
            <Paywall />
          </ProtectedRoute>
        }
      />
      <Route path="/r/:id" element={<ReviewPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
