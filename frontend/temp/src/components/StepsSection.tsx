import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { UserCheck, CreditCard, TrendingUp, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: UserCheck,
    step: "01",
    title: "Complete KYC",
    description: "Verify your identity with Aadhaar and PAN in just 2 minutes. Completely digital and paperless.",
    time: "2 mins"
  },
  {
    icon: CreditCard,
    step: "02", 
    title: "Add Funds",
    description: "Link your bank account and add money to your ClearTax wallet securely.",
    time: "1 min"
  },
  {
    icon: TrendingUp,
    step: "03",
    title: "Start Investing",
    description: "Choose from our curated investment options and start your SIP with as low as ₹500.",
    time: "30 secs"
  }
];

export function StepsSection() {
  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Start Investing in 3 Simple Steps
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get started with your investment journey in less than 5 minutes. 
            No paperwork, no branch visits required.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12 mb-12">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <Card className="text-center border border-gray-200 hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-8">
                  {/* Step Number */}
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 text-green-600 rounded-full mb-6 font-bold">
                    {step.step}
                  </div>
                  
                  {/* Icon */}
                  <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center mx-auto mb-6">
                    <step.icon size={32} className="text-gray-600" />
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{step.title}</h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">{step.description}</p>
                  
                  {/* Time */}
                  <div className="inline-flex items-center px-3 py-1 bg-green-50 text-green-700 rounded-full font-medium">
                    ⏱️ {step.time}
                  </div>
                </CardContent>
              </Card>
              
              {/* Arrow between steps */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-6 lg:-right-8 transform -translate-y-1/2">
                  <ArrowRight size={24} className="text-gray-300" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white">
            Get Started Now
            <ArrowRight size={20} className="ml-2" />
          </Button>
          <p className="text-gray-500 mt-4">
            Join 50+ lakh satisfied investors. No hidden charges.
          </p>
        </div>
      </div>
    </section>
  );
}