import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/auth-context";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import BrowseTutorsPage from "./pages/BrowseTutorsPage";
import TutorProfilePage from "./pages/TutorProfilePage";
import PaymentPage from "./pages/PaymentPage";
import BecomeTutorPage from "./pages/BecomeTutorPage";
import StudentDashboard from "./pages/StudentDashboard";
import TutorDashboard from "./pages/TutorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import StudentStudyPlanner from "./pages/StudentStudyPlanner";
import TutorEnrolledStudents from "./pages/TutorEnrolledStudents";
import TutorLessonPlanner from "./pages/TutorLessonPlanner";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import TrustSafetyPage from "./pages/TrustSafetyPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/browse" element={<BrowseTutorsPage />} />
            <Route path="/become-tutor" element={<BecomeTutorPage />} />
            <Route path="/student" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
            <Route path="/student/study-planner" element={<ProtectedRoute allowedRoles={['student']}><StudentStudyPlanner /></ProtectedRoute>} />
            <Route path="/student/*" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
            <Route path="/tutor" element={<ProtectedRoute allowedRoles={['tutor']}><TutorDashboard /></ProtectedRoute>} />
            <Route path="/tutor/lesson-planner" element={<ProtectedRoute allowedRoles={['tutor']}><TutorLessonPlanner /></ProtectedRoute>} />
            <Route path="/tutor/students" element={<ProtectedRoute allowedRoles={['tutor']}><TutorEnrolledStudents /></ProtectedRoute>} />
            <Route path="/tutor/*" element={<ProtectedRoute allowedRoles={['tutor']}><TutorDashboard /></ProtectedRoute>} />
            <Route path="/tutors/:id" element={<TutorProfilePage />} />
            <Route path="/payment/:sessionId" element={<ProtectedRoute allowedRoles={['student']}><PaymentPage /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/*" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/trust-safety" element={<TrustSafetyPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
