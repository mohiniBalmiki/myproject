import { Button } from "./ui/button";
import { Menu, X, Sparkles, LogOut } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner@2.0.3";

interface NavigationProps {
  isLoggedIn: boolean;
  onLoginClick: () => void;
  onDemoClick: () => void;
}

export function Navigation({ isLoggedIn, onLoginClick, onDemoClick }: NavigationProps) {
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "Features", href: "#features" },
    { label: "Upload", href: "#upload" },
    { label: "Tax Optimizer", href: "#tax-optimizer" },
    { label: "CIBIL Advisor", href: "#cibil-advisor" },
    { label: "Reports", href: "#reports" },
    { label: "Profile", href: "#profile" },
    { label: "FAQ", href: "#faq" }
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Successfully logged out");
      setIsMobileMenuOpen(false);
    } catch (error: any) {
      toast.error("Failed to log out", {
        description: error.message
      });
    }
  };

  // Listen for auth modal trigger from other components
  useState(() => {
    const handleOpenAuthModal = () => {
      onLoginClick();
    };

    window.addEventListener('openAuthModal', handleOpenAuthModal);
    return () => window.removeEventListener('openAuthModal', handleOpenAuthModal);
  });

  return (
    <nav className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-wine/10 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div 
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 bg-lemon-green rounded-full flex items-center justify-center"
            >
              <Sparkles size={16} className="text-wine" />
            </motion.div>
            <div className="text-2xl font-bold text-wine">TaxWise</div>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navItems.map((item, index) => (
              <motion.button
                key={item.label}
                onClick={() => scrollToSection(item.href)}
                className="text-wine/70 hover:text-wine transition-colors duration-200 relative"
                whileHover={{ y: -2 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                {item.label}
                <motion.div
                  className="absolute bottom-0 left-0 w-full h-0.5 bg-lemon-green origin-left"
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
            ))}
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {!user ? (
              <>
                <Button variant="ghost" onClick={onDemoClick} className="text-wine hover:text-wine/80">
                  Explore Demo
                </Button>
                <Button onClick={onLoginClick} className="bg-plum hover:bg-plum/90 text-white">
                  Login / Sign Up
                </Button>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <div className="text-sm text-wine/70">
                  Welcome, {user.user_metadata?.name || user.email?.split('@')[0]}
                </div>
                <Button 
                  variant="ghost"
                  onClick={handleSignOut}
                  className="text-wine hover:text-wine/80"
                >
                  <LogOut size={16} className="mr-2" />
                  Logout
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-wine"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-wine/10 py-4">
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => scrollToSection(item.href)}
                  className="text-wine/70 hover:text-wine transition-colors text-left"
                >
                  {item.label}
                </button>
              ))}
              <div className="flex flex-col space-y-2 pt-4 border-t border-wine/10">
                {!user ? (
                  <>
                    <Button variant="ghost" onClick={onDemoClick} className="text-wine justify-start">
                      Explore Demo
                    </Button>
                    <Button onClick={onLoginClick} className="bg-plum hover:bg-plum/90 text-white justify-start">
                      Login / Sign Up
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="text-sm text-wine/70 px-3 pb-2">
                      Welcome, {user.user_metadata?.name || user.email?.split('@')[0]}
                    </div>
                    <Button 
                      variant="ghost"
                      onClick={handleSignOut}
                      className="text-wine justify-start"
                    >
                      <LogOut size={16} className="mr-2" />
                      Logout
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}