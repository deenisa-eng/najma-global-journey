import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import StudyAbroad from "./pages/StudyAbroad.tsx";
import Hajj from "./pages/Hajj.tsx";
import Umrah from "./pages/Umrah.tsx";
import MedicalTourism from "./pages/MedicalTourism.tsx";
import Booking from "./pages/Booking.tsx";
import Contact from "./pages/Contact.tsx";
import Admin from "./pages/Admin.tsx";
import NotFound from "./pages/NotFound.tsx";

import { AuthProvider } from "./hooks/useAuth";
import Auth from "./pages/Auth.tsx";
import AdminLogin from "./pages/AdminLogin.tsx";
import ScrollToTop from "./components/ScrollToTop.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/study-abroad" element={<StudyAbroad />} />
            <Route path="/hajj" element={<Hajj />} />
            <Route path="/umrah" element={<Umrah />} />
            <Route path="/medical-tourism" element={<MedicalTourism />} />
            <Route path="/booking" element={<ProtectedRoute><Booking /></ProtectedRoute>} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
