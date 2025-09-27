import { Button } from "./ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="text-2xl font-bold text-green-600">ClearTax</div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-gray-700 hover:text-green-600 transition-colors">File ITR</a>
            <a href="#" className="text-gray-700 hover:text-green-600 transition-colors">GST</a>
            <a href="#" className="text-green-600 border-b-2 border-green-600 pb-1">Invest</a>
            <a href="#" className="text-gray-700 hover:text-green-600 transition-colors">Business</a>
            <a href="#" className="text-gray-700 hover:text-green-600 transition-colors">Help</a>
          </nav>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" className="text-gray-700">Login</Button>
            <Button className="bg-green-600 hover:bg-green-700 text-white">Get Started</Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-4">
              <a href="#" className="text-gray-700 hover:text-green-600 transition-colors">File ITR</a>
              <a href="#" className="text-gray-700 hover:text-green-600 transition-colors">GST</a>
              <a href="#" className="text-green-600">Invest</a>
              <a href="#" className="text-gray-700 hover:text-green-600 transition-colors">Business</a>
              <a href="#" className="text-gray-700 hover:text-green-600 transition-colors">Help</a>
              <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
                <Button variant="ghost" className="text-gray-700 justify-start">Login</Button>
                <Button className="bg-green-600 hover:bg-green-700 text-white justify-start">Get Started</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}