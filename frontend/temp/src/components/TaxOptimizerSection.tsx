import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { TrendingUp, Calculator, FileText, Lightbulb, Lock } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const taxComparison = {
  old: {
    regime: "Old Tax Regime",
    taxableIncome: "₹12,00,000",
    deductions: "₹1,50,000",
    netTaxable: "₹10,50,000",
    tax: "₹1,95,000",
    savings: "Standard deductions available"
  },
  new: {
    regime: "New Tax Regime",
    taxableIncome: "₹12,00,000",
    deductions: "₹50,000",
    netTaxable: "₹11,50,000",
    tax: "₹1,75,000",
    savings: "Lower tax rates, fewer deductions"
  }
};

const deductions = [
  { section: "80C", description: "ELSS, PPF, Insurance", claimed: "₹1,50,000", limit: "₹1,50,000" },
  { section: "80D", description: "Health Insurance Premium", claimed: "₹25,000", limit: "₹25,000" },
  { section: "80G", description: "Donations to Charity", claimed: "₹10,000", limit: "No limit" },
  { section: "24(b)", description: "Home Loan Interest", claimed: "₹2,00,000", limit: "₹2,00,000" }
];

export function TaxOptimizerSection() {
  const { user } = useAuth();
  return (
    <section id="tax-optimizer" className="py-16 lg:py-24 bg-gray-50/50 relative">


      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-wine mb-4">
            AI Tax Optimization
          </h2>
          <p className="text-xl text-wine/70 max-w-2xl mx-auto">
            Compare tax regimes, maximize deductions, and get personalized recommendations 
            to minimize your tax liability.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Old vs New Regime Comparison */}
          <Card className="border border-wine/20">
            <CardHeader>
              <CardTitle className="text-wine flex items-center gap-2">
                <Calculator size={24} />
                Tax Regime Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Old Regime */}
                <div className="space-y-4">
                  <div className="text-center">
                    <Badge variant="outline" className="border-wine text-wine">
                      {taxComparison.old.regime}
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-wine/70">Taxable Income</span>
                      <span className="font-semibold text-wine">{taxComparison.old.taxableIncome}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-wine/70">Deductions</span>
                      <span className="font-semibold text-green-600">-{taxComparison.old.deductions}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-wine/70">Net Taxable</span>
                      <span className="font-semibold text-wine">{taxComparison.old.netTaxable}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-wine/70">Total Tax</span>
                      <span className="font-bold text-red-600">{taxComparison.old.tax}</span>
                    </div>
                  </div>
                </div>

                {/* New Regime */}
                <div className="space-y-4">
                  <div className="text-center">
                    <Badge className="bg-plum text-white">
                      {taxComparison.new.regime} ✓
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-wine/70">Taxable Income</span>
                      <span className="font-semibold text-wine">{taxComparison.new.taxableIncome}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-wine/70">Deductions</span>
                      <span className="font-semibold text-green-600">-{taxComparison.new.deductions}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-wine/70">Net Taxable</span>
                      <span className="font-semibold text-wine">{taxComparison.new.netTaxable}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-wine/70">Total Tax</span>
                      <span className="font-bold text-green-600">{taxComparison.new.tax}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-lemon-green/10 rounded-lg border border-lemon-green/30">
                <div className="text-center">
                  <div className="font-bold text-plum">You save ₹20,000 with New Tax Regime!</div>
                  <div className="text-wine/70 text-sm mt-1">Recommended based on your income profile</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Deduction Breakdown */}
          <Card className="border border-wine/20">
            <CardHeader>
              <CardTitle className="text-wine flex items-center gap-2">
                <TrendingUp size={24} />
                Deduction Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {deductions.map((deduction, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50/50 rounded-lg">
                    <div>
                      <div className="font-semibold text-wine">Section {deduction.section}</div>
                      <div className="text-sm text-wine/70">{deduction.description}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-plum">{deduction.claimed}</div>
                      <div className="text-xs text-wine/60">Limit: {deduction.limit}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Suggestion Box */}
        <Card className="border-2 border-lemon-green/50 bg-gradient-to-r from-lemon-green/5 to-lemon-green/10">
          <CardContent className="p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-lemon-green/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Lightbulb size={24} className="text-wine" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-wine mb-2">AI Tax Recommendation</h3>
                <p className="text-wine/70 mb-4">
                  Based on your income and spending pattern, we recommend investing 
                  <span className="font-semibold text-plum"> ₹50,000 in ELSS funds</span> to save 
                  <span className="font-semibold text-plum"> ₹15,400 in taxes</span> under Section 80C.
                </p>
                {user ? (
                  <Button className="bg-plum hover:bg-plum/90 text-white">
                    <FileText size={18} className="mr-2" />
                    Generate Tax Report
                  </Button>
                ) : (
                  <Button 
                    onClick={() => window.dispatchEvent(new CustomEvent('openAuthModal'))}
                    variant="outline" 
                    className="border-plum text-plum hover:bg-plum hover:text-white"
                  >
                    <Lock size={18} className="mr-2" />
                    Login to Generate Report
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}