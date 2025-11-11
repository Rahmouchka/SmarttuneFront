import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Register from "./pages/register/Register.tsx";
import RegisterUser from "./pages/register/RegisterUser.tsx";
import RegisterArtist from "./pages/register/RegisterArtist.tsx";
import Login from "./pages/login/Login.tsx";
import NotFound from "./pages/NotFound";
import ForgotPassword from "./pages/login/ForgotPassword.tsx"
import ResetPassword from "./pages/login/ResetPassword.tsx"
import UserDashboard from "./pages/user/dashboard/UserDashboard.tsx"
import ArtistDashboard from "./pages/artist/dashboard/ArtistDashboard.tsx"
import AdminDashboard from "./pages/admin/dashboard/AdminDashboard.tsx"
import ArtistPending from "./pages/register/ArtistPending.tsx"

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register/user" element={<RegisterUser />} />
          <Route path="/register/artist" element={<RegisterArtist />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/register/pending" element={<ArtistPending />} />

          <Route path="/user/dashboard" element={<UserDashboard />} />
          <Route path="/artist/dashboard" element={<ArtistDashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
