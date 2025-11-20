import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navigation } from "./components/Navigation";
import { AuthModal } from "./components/AuthModal";
import { AuthCallback } from "./components/AuthCallback";
import { HeroSection } from "./components/HeroSection";
import { DashboardSection } from "./components/DashboardSection";
import { FeaturesSection } from "./components/FeaturesSection";
import { UploadSection } from "./components/UploadSection";
import { TaxOptimizerSection } from "./components/TaxOptimizerSection";
import { CibilAdvisorSection } from "./components/CibilAdvisorSection";
import { ReportsSection } from "./components/ReportsSection";
import { ProfileSection } from "./components/ProfileSection";
import { FAQSection } from "./components/FAQSection";
import { Footer } from "./components/Footer";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Toaster } from "./components/ui/sonner";

function MainApp() {
  const { user } = useAuth();
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleLogin = () => {
    setIsAuthModalOpen(false);
    setIsDemoMode(false);
  };

  const handleDemo = () => {
    setIsDemoMode(true);
    // Smooth scroll to features section  
    const element = document.querySelector('#features');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleExploreDemo = () => {
    setIsDemoMode(true);
    // Smooth scroll to features section
    const element = document.querySelector('#features');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLoginClick = () => {
    setIsAuthModalOpen(true);
  };

  // Listen for custom auth modal events
  useEffect(() => {
    const handleOpenAuthModal = () => {
      setIsAuthModalOpen(true);
    };

    window.addEventListener('openAuthModal', handleOpenAuthModal);

    return () => {
      window.removeEventListener('openAuthModal', handleOpenAuthModal);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navigation 
        isLoggedIn={!!user} 
        onLoginClick={handleLoginClick}
        onDemoClick={handleExploreDemo}
      />
      
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handleLogin}
        onDemo={handleDemo}
      />
    
      <main>
        {user ? (
          // Authenticated user view with personalized dashboard
          <>
            <DashboardSection />
            <UploadSection />
            <TaxOptimizerSection />
            <CibilAdvisorSection />
            <ReportsSection />
            <ProfileSection />
            <FAQSection />
          </>
        ) : (
          // Non-authenticated user view with hero section
          <>
            <HeroSection 
              onExploreDemo={handleExploreDemo}
              onLoginClick={handleLoginClick}
            />
            <FeaturesSection />
            <UploadSection />
            <TaxOptimizerSection />
            <CibilAdvisorSection />
            <ReportsSection />
            <ProfileSection />
            <FAQSection />
          </>
        )}
      </main>
      
      <Footer />

      {/* Demo Mode Indicator */}
      {isDemoMode && (
        <div className="fixed top-20 right-4 bg-lemon-green/90 text-wine px-4 py-2 rounded-lg shadow-lg z-40 backdrop-blur-sm">
          <div className="font-medium">Demo Mode Active</div>
          <div className="text-sm opacity-80">Exploring with sample data</div>
        </div>
      )}
      
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/*" element={<MainApp />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}