import { Button } from "./ui/button";
import { ArrowRight, Download } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-16 lg:py-24 bg-gradient-to-r from-green-600 to-blue-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl lg:text-4xl font-bold mb-6">
          Ready to Start Your Investment Journey?
        </h2>
        <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
          Join millions of Indians who trust ClearTax for their investments. 
          Start with as low as ₹500 and build wealth systematically.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100">
            Start Investing Now
            <ArrowRight size={20} className="ml-2" />
          </Button>
          <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-600">
            Download App
            <Download size={20} className="ml-2" />
          </Button>
        </div>
        
        {/* Trust Indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto opacity-90">
          <div className="text-center">
            <div className="font-bold mb-1">SEBI Registered</div>
            <div className="text-sm opacity-75">Investment Advisor</div>
          </div>
          <div className="text-center">
            <div className="font-bold mb-1">ISO 27001</div>
            <div className="text-sm opacity-75">Certified Security</div>
          </div>
          <div className="text-center">
            <div className="font-bold mb-1">₹10,000+ Cr</div>
            <div className="text-sm opacity-75">Assets Under Advisory</div>
          </div>
          <div className="text-center">
            <div className="font-bold mb-1">50L+ Users</div>
            <div className="text-sm opacity-75">Trust ClearTax</div>
          </div>
        </div>
      </div>
    </section>
  );
}