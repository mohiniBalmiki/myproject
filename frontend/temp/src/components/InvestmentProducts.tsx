import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { ArrowUpRight, Shield, Target, TrendingUp, Zap, PiggyBank, Calculator } from "lucide-react";

const products = [
  {
    icon: TrendingUp,
    title: "Mutual Funds",
    description: "Direct mutual funds with 0% commission. Choose from 1000+ funds across categories.",
    features: ["Zero Commission", "Expert Recommendations", "SIP Available"],
    returns: "12-15%",
    color: "bg-blue-50 text-blue-600"
  },
  {
    icon: Target,
    title: "Goal-Based SIP",
    description: "Systematic investment plans tailored to your financial goals and timeline.",
    features: ["Goal Planning", "Auto-Invest", "Tax Benefits"],
    returns: "10-14%",
    color: "bg-green-50 text-green-600"
  },
  {
    icon: Shield,
    title: "ELSS Funds",
    description: "Tax-saving mutual funds with Section 80C benefits and wealth creation.",
    features: ["Tax Deduction", "3-Year Lock-in", "Equity Returns"],
    returns: "13-18%",
    color: "bg-purple-50 text-purple-600"
  },
  {
    icon: Zap,
    title: "Smart Portfolios",
    description: "AI-curated portfolios based on your risk profile and investment horizon.",
    features: ["AI-Powered", "Auto-Rebalancing", "Low Risk"],
    returns: "8-12%",
    color: "bg-orange-50 text-orange-600"
  },
  {
    icon: PiggyBank,
    title: "Liquid Funds",
    description: "Park your emergency funds and earn better returns than savings accounts.",
    features: ["High Liquidity", "Low Risk", "Better than FD"],
    returns: "6-8%",
    color: "bg-cyan-50 text-cyan-600"
  },
  {
    icon: Calculator,
    title: "Tax Planning",
    description: "Complete tax planning solutions with investment recommendations.",
    features: ["Tax Calculator", "80C Planning", "Expert Advice"],
    returns: "Tax Savings",
    color: "bg-pink-50 text-pink-600"
  }
];

export function InvestmentProducts() {
  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Investment Products for Every Goal
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Whether you're planning for retirement, buying a house, or saving for your child's education, 
            we have the right investment solution for you.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-green-300">
              <CardHeader className="pb-4">
                <div className={`w-12 h-12 rounded-lg ${product.color} flex items-center justify-center mb-4`}>
                  <product.icon size={24} />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                  {product.title}
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {product.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-0">
                {/* Features */}
                <div className="space-y-2 mb-6">
                  {product.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-3"></div>
                      {feature}
                    </div>
                  ))}
                </div>
                
                {/* Returns */}
                <div className="flex items-center justify-between mb-6">
                  <span className="text-sm text-gray-500">Expected Returns</span>
                  <span className="font-semibold text-green-600">{product.returns}</span>
                </div>
                
                {/* CTA */}
                <Button 
                  variant="outline" 
                  className="w-full group-hover:bg-green-600 group-hover:text-white group-hover:border-green-600 transition-colors"
                >
                  Start Investing
                  <ArrowUpRight size={16} className="ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white">
            View All Investment Options
          </Button>
        </div>
      </div>
    </section>
  );
}