import { Facebook, Twitter, Linkedin, Instagram, Mail, Phone, MapPin } from "lucide-react";

const footerLinks = {
  "Product": [
    "Tax Filing",
    "CIBIL Score",
    "Financial Reports",
    "AI Optimization",
    "Demo Mode",
    "Mobile App"
  ],
  "Company": [
    "About Us",
    "Careers",
    "Press",
    "Blog",
    "Partners",
    "Contact"
  ],
  "Support": [
    "Help Center",
    "Documentation",
    "API Docs",
    "Community",
    "Status Page",
    "Report Bug"
  ],
  "Legal": [
    "Privacy Policy",
    "Terms of Service",
    "Cookie Policy",
    "Data Protection",
    "Disclaimer",
    "Compliance"
  ]
};

const trustBadges = [
  "ISO 27001 Certified",
  "SOC 2 Compliant", 
  "RBI Guidelines",
  "256-bit SSL Encryption"
];

export function Footer() {
  return (
    <footer className="bg-wine text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="text-2xl font-bold text-lemon-green mb-6">TaxWise</div>
            <p className="text-white/80 mb-6 max-w-md leading-relaxed">
              India's most trusted platform for smart tax filing and credit health monitoring. 
              Join 5+ million users who trust us with their financial wellness.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center text-white/80">
                <Mail size={18} className="mr-3 text-lemon-green" />
                <span>support@taxhealth.com</span>
              </div>
              <div className="flex items-center text-white/80">
                <Phone size={18} className="mr-3 text-lemon-green" />
                <span>1800-123-4567</span>
              </div>
              <div className="flex items-center text-white/80">
                <MapPin size={18} className="mr-3 text-lemon-green" />
                <span>Bangalore, Karnataka, India</span>
              </div>
            </div>
            
            {/* Social Media */}
            <div className="flex space-x-4">
              <div className="w-10 h-10 bg-white/10 hover:bg-lemon-green/20 rounded-lg flex items-center justify-center cursor-pointer transition-colors">
                <Facebook size={20} />
              </div>
              <div className="w-10 h-10 bg-white/10 hover:bg-lemon-green/20 rounded-lg flex items-center justify-center cursor-pointer transition-colors">
                <Twitter size={20} />
              </div>
              <div className="w-10 h-10 bg-white/10 hover:bg-lemon-green/20 rounded-lg flex items-center justify-center cursor-pointer transition-colors">
                <Linkedin size={20} />
              </div>
              <div className="w-10 h-10 bg-white/10 hover:bg-lemon-green/20 rounded-lg flex items-center justify-center cursor-pointer transition-colors">
                <Instagram size={20} />
              </div>
            </div>
          </div>
          
          {/* Footer Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-semibold mb-4 text-lemon-green">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-white/80 hover:text-lemon-green transition-colors text-sm">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        {/* Trust Badges */}
        <div className="border-t border-white/20 mt-12 pt-8">
          <div className="flex flex-wrap gap-6 justify-center mb-8">
            {trustBadges.map((badge) => (
              <div key={badge} className="text-center">
                <div className="text-lemon-green font-medium text-sm">{badge}</div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-white/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-white/60 mb-4 md:mb-0 text-sm">
              © 2024 TaxWise. All rights reserved.
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-white/60">
              <span>Trusted by 5M+ users</span>
              <span>•</span>
              <span>Bank-level encryption</span>
              <span>•</span>
              <span>Privacy First</span>
            </div>
          </div>
          
          {/* Regulatory Disclaimer */}
          <div className="mt-6 text-xs text-white/50 leading-relaxed">
            <p className="mb-2">
              TaxWise is committed to protecting your financial data. We comply with all RBI guidelines and use industry-standard security measures.
            </p>
            <p>
              Tax calculations are for informational purposes only. Please consult a qualified tax professional for complex tax situations. 
              CIBIL score monitoring does not impact your credit history.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}