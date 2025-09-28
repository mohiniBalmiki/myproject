import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Progress } from "./ui/progress";
import { TrendingUp, Calculator, FileText, Lightbulb, Lock, Brain, Loader2, CheckCircle2, AlertTriangle, IndianRupee } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../contexts/AuthContext";
import { DatabaseAPI, API_CONFIG } from "../utils/supabase/client";
import { LLMService, FinancialContext } from "../utils/llmService";
import { toast } from "sonner";

interface TaxCalculationData {
  grossIncome: number;
  basicSalary: number;
  hra: number;
  lta: number;
  professionalTax: number;
  providentFund: number;
  section80C: number;
  section80D: number;
  homeLoanInterest: number;
  otherDeductions: number;
}

interface TaxRegimeResult {
  totalTax: number;
  taxAfterDeductions: number;
  deductionsUsed: number;
  effectiveRate: number;
  breakdown: { [key: string]: number };
}

interface TaxResults {
  oldRegime: TaxRegimeResult;
  newRegime: TaxRegimeResult;
  recommendation: {
    regime: 'old' | 'new';
    savings: number;
    reason: string;
    optimizations: string[];
  };
  aiInsights: {
    title: string;
    description: string;
    impact: string;
    actionable: boolean;
  }[];
}

export function TaxOptimizerSection() {
  const { user, session } = useAuth();
  const [activeTab, setActiveTab] = useState<"calculator" | "comparison" | "insights">("calculator");
  const [isCalculating, setIsCalculating] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  
  // Tax calculation form data
  const [taxData, setTaxData] = useState<TaxCalculationData>({
    grossIncome: 0,
    basicSalary: 0,
    hra: 0,
    lta: 0,
    professionalTax: 0,
    providentFund: 0,
    section80C: 0,
    section80D: 0,
    homeLoanInterest: 0,
    otherDeductions: 0
  });
  
  // Tax calculation results
  const [taxResults, setTaxResults] = useState<TaxResults | null>(null);
  const [calculationProgress, setCalculationProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Load user financial profile if available
  useEffect(() => {
    if (user && session?.access_token) {
      loadUserFinancialProfile();
    }
  }, [user, session]);

  const loadUserFinancialProfile = async () => {
    if (!user || !session?.access_token) return;
    
    setIsLoadingProfile(true);
    try {
      // Try to get user's financial data from transactions
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/api/data/transactions/${user.id}?per_page=1000`,
        {
          headers: API_CONFIG.getAuthHeaders(session.access_token)
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        const transactions = data.transactions || [];
        
        // Auto-populate form based on transaction analysis
        const salaryTransactions = transactions.filter((t: any) => 
          t.transaction_type === 'credit' && 
          (t.category?.toLowerCase().includes('salary') || t.description?.toLowerCase().includes('salary'))
        );
        
        const monthlyIncome = salaryTransactions.length > 0 ? 
          salaryTransactions.reduce((sum: number, t: any) => sum + Math.abs(parseFloat(t.amount) || 0), 0) / 
          Math.max(1, salaryTransactions.length) : 0;
        
        const annualIncome = monthlyIncome * 12;
        
        if (annualIncome > 0) {
          setTaxData(prev => ({
            ...prev,
            grossIncome: annualIncome,
            basicSalary: annualIncome * 0.6, // Estimate 60% as basic
            hra: annualIncome * 0.25, // Estimate 25% as HRA
            providentFund: Math.min(annualIncome * 0.12, 21600) // 12% of basic, max 1.8L
          }));
          
          toast.success('Financial profile loaded', {
            description: 'Pre-filled form with your transaction data'
          });
        }
      }
    } catch (error) {
      console.error('Error loading financial profile:', error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // Tax calculation functions
  const calculateOldRegimeTax = (data: TaxCalculationData): TaxRegimeResult => {
    let taxableIncome = data.grossIncome;
    
    // Standard deduction
    taxableIncome -= 50000;
    
    // HRA exemption (lowest of 3 values)
    const hraExemption = Math.min(
      data.hra,
      data.basicSalary * 0.5, // 50% of basic salary
      data.hra - (data.basicSalary * 0.1) // HRA - 10% of basic
    );
    taxableIncome -= hraExemption;
    
    // Other deductions
    taxableIncome -= data.section80C;
    taxableIncome -= data.section80D;
    taxableIncome -= data.homeLoanInterest;
    taxableIncome -= data.otherDeductions;
    taxableIncome -= data.providentFund;
    
    taxableIncome = Math.max(0, taxableIncome);
    
    // Calculate tax based on old regime slabs
    let tax = 0;
    if (taxableIncome <= 250000) {
      tax = 0;
    } else if (taxableIncome <= 500000) {
      tax = (taxableIncome - 250000) * 0.05;
    } else if (taxableIncome <= 1000000) {
      tax = 12500 + (taxableIncome - 500000) * 0.20;
    } else {
      tax = 112500 + (taxableIncome - 1000000) * 0.30;
    }
    
    // Add cess (4%)
    tax = tax * 1.04;
    
    const deductionsUsed = data.grossIncome - taxableIncome - 50000;
    
    return {
      totalTax: Math.round(tax),
      taxAfterDeductions: Math.round(tax),
      deductionsUsed: Math.round(deductionsUsed),
      effectiveRate: parseFloat(((tax / data.grossIncome) * 100).toFixed(2)),
      breakdown: {
        'Standard Deduction': 50000,
        'HRA Exemption': Math.round(hraExemption),
        'Section 80C': data.section80C,
        'Section 80D': data.section80D,
        'Home Loan Interest': data.homeLoanInterest,
        'Other Deductions': data.otherDeductions
      }
    };
  };

  const calculateNewRegimeTax = (data: TaxCalculationData): TaxRegimeResult => {
    let taxableIncome = data.grossIncome;
    
    // Standard deduction (₹50,000)
    taxableIncome -= 50000;
    taxableIncome = Math.max(0, taxableIncome);
    
    // Calculate tax based on new regime slabs
    let tax = 0;
    if (taxableIncome <= 300000) {
      tax = 0;
    } else if (taxableIncome <= 600000) {
      tax = (taxableIncome - 300000) * 0.05;
    } else if (taxableIncome <= 900000) {
      tax = 15000 + (taxableIncome - 600000) * 0.10;
    } else if (taxableIncome <= 1200000) {
      tax = 45000 + (taxableIncome - 900000) * 0.15;
    } else if (taxableIncome <= 1500000) {
      tax = 90000 + (taxableIncome - 1200000) * 0.20;
    } else {
      tax = 150000 + (taxableIncome - 1500000) * 0.30;
    }
    
    // Add cess (4%)
    tax = tax * 1.04;
    
    return {
      totalTax: Math.round(tax),
      taxAfterDeductions: Math.round(tax),
      deductionsUsed: 50000,
      effectiveRate: parseFloat(((tax / data.grossIncome) * 100).toFixed(2)),
      breakdown: {
        'Standard Deduction': 50000
      }
    };
  };

  const generateOptimizationSuggestions = (data: TaxCalculationData, oldRegime: TaxRegimeResult, newRegime: TaxRegimeResult): string[] => {
    const suggestions: string[] = [];
    
    if (oldRegime.totalTax < newRegime.totalTax) {
      if (data.section80C < 150000) {
        suggestions.push(`Increase Section 80C investments by ₹${(150000 - data.section80C).toLocaleString()} to save more tax`);
      }
      if (data.section80D < 25000) {
        suggestions.push(`Consider health insurance premium up to ₹${(25000 - data.section80D).toLocaleString()} under Section 80D`);
      }
    } else {
      suggestions.push('New tax regime is more beneficial for your income level');
      suggestions.push('Consider switching to new regime and investing saved tax amount');
    }
    
    if (data.hra > 0 && data.basicSalary > 0) {
      const optimalHRA = data.basicSalary * 0.5;
      if (data.hra < optimalHRA) {
        suggestions.push(`You can claim HRA up to ₹${optimalHRA.toLocaleString()} for maximum benefit`);
      }
    }
    
    return suggestions;
  };

  const generateTaxOptimizationInsights = async (data: TaxCalculationData, oldRegime: TaxRegimeResult, newRegime: TaxRegimeResult) => {
    try {
      // Create proper FinancialContext structure
      const taxContext: FinancialContext = {
        totalIncome: data.grossIncome,
        totalExpenses: data.grossIncome - (data.grossIncome * 0.3), // Estimate expenses as 70% of income
        savingsRate: ((data.section80C + data.providentFund) / data.grossIncome) * 100,
        categories: {
          'Salary': data.grossIncome,
          'Tax Deductions': data.section80C + data.section80D + data.homeLoanInterest,
          'Insurance': data.section80D,
          'Investments': data.section80C,
          'Home Loan Interest': data.homeLoanInterest
        },
        patterns: [
          { type: 'tax_planning', frequency: 'annual', amount: data.section80C },
          { type: 'insurance', frequency: 'annual', amount: data.section80D }
        ],
        demographics: {
          age: 30, // Default age
          profession: 'Professional',
          familySize: 2
        },
        goals: [
          'Tax Optimization',
          'Wealth Building',
          data.homeLoanInterest > 0 ? 'Home Ownership' : 'Investment Growth'
        ].filter(Boolean),
        expenseBreakdown: {
          'Living Expenses': data.grossIncome * 0.4,
          'Tax Deductions': data.section80C + data.section80D,
          'Savings': data.section80C + data.providentFund
        }
      };

      const llmInsights = await LLMService.generateTaxOptimizationStrategies(taxContext, {
        currentTax: Math.min(oldRegime.totalTax, newRegime.totalTax),
        potentialSavings: Math.abs(oldRegime.totalTax - newRegime.totalTax),
        recommendedRegime: oldRegime.totalTax < newRegime.totalTax ? 'old' : 'new'
      });

      return llmInsights.map((insight: any) => ({
        title: insight.title || 'Tax Optimization Insight',
        description: insight.description || insight.content || insight,
        impact: insight.potentialImpact || insight.impact || 'Tax savings opportunity',
        actionable: true
      }));
    } catch (error) {
      console.error('Error generating AI insights:', error);
      return [
        {
          title: 'Tax Regime Analysis',
          description: oldRegime.totalTax < newRegime.totalTax ? 
            `Old tax regime saves you ₹${Math.abs(oldRegime.totalTax - newRegime.totalTax).toLocaleString()} annually with your current deductions. Continue maximizing Section 80C investments.` :
            `New tax regime saves you ₹${Math.abs(oldRegime.totalTax - newRegime.totalTax).toLocaleString()} annually due to lower tax slabs. Consider switching for better tax efficiency.`,
          impact: `Annual Tax Savings: ₹${Math.abs(oldRegime.totalTax - newRegime.totalTax).toLocaleString()}`,
          actionable: true
        },
        {
          title: 'Investment Opportunity',
          description: data.section80C < 150000 ? 
            `You can invest ₹${(150000 - data.section80C).toLocaleString()} more in ELSS/PPF under Section 80C to save additional tax.` :
            'You have maximized Section 80C deductions. Consider other tax-saving instruments like NPS or ULIP.',
          impact: data.section80C < 150000 ? 
            `Additional Tax Savings: ₹${((150000 - data.section80C) * 0.3).toLocaleString()}` :
            'Explore Section 80CCD for additional deductions',
          actionable: true
        }
      ];
    }
  };

  const saveTaxCalculation = async (calculationData: any) => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/tax/calculation`, {
        method: 'POST',
        headers: {
          ...API_CONFIG.getAuthHeaders(session!.access_token),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: user!.id,
          ...calculationData,
          calculation_date: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save calculation');
      }
    } catch (error) {
      console.error('Error saving tax calculation:', error);
    }
  };

  const calculateTax = async () => {
    if (!taxData.grossIncome || taxData.grossIncome <= 0) {
      toast.error('Please enter a valid gross income');
      return;
    }
    
    setIsCalculating(true);
    setError(null);
    setCalculationProgress(0);
    
    try {
      // Initialize AI service for optimization insights
      await LLMService.initialize();
      setCalculationProgress(20);
      
      // Perform comprehensive tax calculations
      const oldRegimeCalc = calculateOldRegimeTax(taxData);
      setCalculationProgress(40);
      
      const newRegimeCalc = calculateNewRegimeTax(taxData);
      setCalculationProgress(60);
      
      // Generate AI-powered optimization insights
      const aiInsights = await generateTaxOptimizationInsights(taxData, oldRegimeCalc, newRegimeCalc);
      setCalculationProgress(80);
      
      // Determine recommendation
      const recommendation = {
        regime: oldRegimeCalc.totalTax < newRegimeCalc.totalTax ? 'old' as const : 'new' as const,
        savings: Math.abs(oldRegimeCalc.totalTax - newRegimeCalc.totalTax),
        reason: oldRegimeCalc.totalTax < newRegimeCalc.totalTax ? 
          'Old regime offers better tax savings with your deductions' :
          'New regime is more beneficial due to lower tax slabs',
        optimizations: generateOptimizationSuggestions(taxData, oldRegimeCalc, newRegimeCalc)
      };
      
      setTaxResults({
        oldRegime: oldRegimeCalc,
        newRegime: newRegimeCalc,
        recommendation,
        aiInsights
      });
      
      setCalculationProgress(100);
      setShowResults(true);
      
      // Save calculation to backend for future reference
      if (user && session?.access_token) {
        saveTaxCalculation({
          ...taxData,
          oldRegimeTax: oldRegimeCalc.totalTax,
          newRegimeTax: newRegimeCalc.totalTax,
          recommendedRegime: recommendation.regime,
          potentialSavings: recommendation.savings
        });
      }
      
      toast.success('Tax calculation complete!', {
        description: `Recommended: ${recommendation.regime.toUpperCase()} regime (Save ₹${recommendation.savings.toLocaleString()})`
      });
      
    } catch (error: any) {
      console.error('Tax calculation error:', error);
      setError(error.message || 'Failed to calculate tax');
      toast.error('Tax calculation failed', {
        description: 'Please check your inputs and try again'
      });
    } finally {
      setIsCalculating(false);
      setCalculationProgress(0);
    }
  };

  const handleInputChange = (field: keyof TaxCalculationData, value: string) => {
    const numValue = parseFloat(value) || 0;
    setTaxData(prev => ({ ...prev, [field]: numValue }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <section id="tax-optimizer" className="py-16 lg:py-24 bg-gray-50/50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-wine mb-4">
            🤖 AI Tax Optimization Engine
          </h2>
          <p className="text-xl text-wine/70 max-w-2xl mx-auto">
            Smart tax calculation with AI-powered regime comparison and personalized optimization strategies.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg border border-wine/20 p-1">
            {(["calculator", "comparison", "insights"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-md font-medium transition-all ${
                  activeTab === tab
                    ? "bg-plum text-white"
                    : "text-wine/70 hover:text-wine hover:bg-gray-50"
                }`}
              >
                {tab === 'calculator' && <Calculator size={16} className="inline mr-2" />}
                {tab === 'comparison' && <TrendingUp size={16} className="inline mr-2" />}
                {tab === 'insights' && <Brain size={16} className="inline mr-2" />}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Tax Calculator Tab */}
          {activeTab === "calculator" && (
            <motion.div
              key="calculator"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Input Form */}
                <Card className="border border-wine/20">
                  <CardHeader>
                    <CardTitle className="text-wine flex items-center gap-2">
                      <Calculator size={24} />
                      Income & Deduction Details
                      {isLoadingProfile && <Loader2 size={16} className="animate-spin" />}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="grossIncome">Gross Annual Income *</Label>
                        <Input
                          id="grossIncome"
                          type="number"
                          placeholder="Enter gross income"
                          value={taxData.grossIncome || ''}
                          onChange={(e) => handleInputChange('grossIncome', e.target.value)}
                          className="border-wine/30"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="basicSalary">Basic Salary</Label>
                        <Input
                          id="basicSalary"
                          type="number"
                          placeholder="Enter basic salary"
                          value={taxData.basicSalary || ''}
                          onChange={(e) => handleInputChange('basicSalary', e.target.value)}
                          className="border-wine/30"
                        />
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="hra">HRA Received</Label>
                        <Input
                          id="hra"
                          type="number"
                          placeholder="Enter HRA amount"
                          value={taxData.hra || ''}
                          onChange={(e) => handleInputChange('hra', e.target.value)}
                          className="border-wine/30"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="providentFund">Provident Fund</Label>
                        <Input
                          id="providentFund"
                          type="number"
                          placeholder="Enter PF contribution"
                          value={taxData.providentFund || ''}
                          onChange={(e) => handleInputChange('providentFund', e.target.value)}
                          className="border-wine/30"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold text-wine">Tax Deductions</h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="section80C">Section 80C (Max ₹1.5L)</Label>
                          <Input
                            id="section80C"
                            type="number"
                            placeholder="ELSS, PPF, Insurance"
                            value={taxData.section80C || ''}
                            onChange={(e) => handleInputChange('section80C', e.target.value)}
                            className="border-wine/30"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="section80D">Section 80D (Max ₹25K)</Label>
                          <Input
                            id="section80D"
                            type="number"
                            placeholder="Health insurance premium"
                            value={taxData.section80D || ''}
                            onChange={(e) => handleInputChange('section80D', e.target.value)}
                            className="border-wine/30"
                          />
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="homeLoanInterest">Home Loan Interest</Label>
                          <Input
                            id="homeLoanInterest"
                            type="number"
                            placeholder="Interest on home loan"
                            value={taxData.homeLoanInterest || ''}
                            onChange={(e) => handleInputChange('homeLoanInterest', e.target.value)}
                            className="border-wine/30"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="otherDeductions">Other Deductions</Label>
                          <Input
                            id="otherDeductions"
                            type="number"
                            placeholder="Other tax deductions"
                            value={taxData.otherDeductions || ''}
                            onChange={(e) => handleInputChange('otherDeductions', e.target.value)}
                            className="border-wine/30"
                          />
                        </div>
                      </div>
                    </div>

                    {user ? (
                      <Button 
                        onClick={calculateTax}
                        disabled={isCalculating || !taxData.grossIncome}
                        className="w-full bg-plum hover:bg-plum/90 text-white"
                      >
                        {isCalculating ? (
                          <>
                            <Loader2 size={18} className="mr-2 animate-spin" />
                            Calculating with AI...
                          </>
                        ) : (
                          <>
                            <Brain size={18} className="mr-2" />
                            Calculate Tax with AI
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => window.dispatchEvent(new CustomEvent('openAuthModal'))}
                        variant="outline" 
                        className="w-full border-plum text-plum hover:bg-plum hover:text-white"
                      >
                        <Lock size={18} className="mr-2" />
                        Login to Calculate Tax
                      </Button>
                    )}

                    {isCalculating && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-wine/70">
                          <span>AI Tax Analysis</span>
                          <span>{calculationProgress}%</span>
                        </div>
                        <Progress value={calculationProgress} className="h-2" />
                        <p className="text-xs text-wine/60">
                          {calculationProgress < 30 ? '🧠 Analyzing income structure...' :
                           calculationProgress < 60 ? '📊 Comparing tax regimes...' :
                           calculationProgress < 90 ? '💡 Generating optimization insights...' :
                           '✅ Finalizing recommendations...'}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Preview */}
                <Card className="border border-wine/20">
                  <CardHeader>
                    <CardTitle className="text-wine flex items-center gap-2">
                      <IndianRupee size={24} />
                      Tax Calculation Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {showResults && taxResults ? (
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                            <div className="text-sm text-red-700 mb-1">Old Regime</div>
                            <div className="text-2xl font-bold text-red-800">
                              {formatCurrency(taxResults.oldRegime.totalTax)}
                            </div>
                            <div className="text-xs text-red-600">
                              {taxResults.oldRegime.effectiveRate}% effective rate
                            </div>
                          </div>
                          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <div className="text-sm text-green-700 mb-1">New Regime</div>
                            <div className="text-2xl font-bold text-green-800">
                              {formatCurrency(taxResults.newRegime.totalTax)}
                            </div>
                            <div className="text-xs text-green-600">
                              {taxResults.newRegime.effectiveRate}% effective rate
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-lemon-green/10 rounded-lg border border-lemon-green/30">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 size={20} className="text-green-600" />
                            <span className="font-semibold text-wine">AI Recommendation</span>
                          </div>
                          <div className="text-lg font-bold text-plum mb-1">
                            Choose {taxResults.recommendation.regime.toUpperCase()} Tax Regime
                          </div>
                          <div className="text-wine/70 text-sm mb-2">{taxResults.recommendation.reason}</div>
                          <div className="text-green-600 font-medium">
                            💰 Save {formatCurrency(taxResults.recommendation.savings)} annually
                          </div>
                        </div>

                        <Button 
                          onClick={() => setActiveTab('comparison')}
                          variant="outline"
                          className="w-full border-plum text-plum hover:bg-plum hover:text-white"
                        >
                          View Detailed Comparison
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-wine/60">
                        <Calculator size={48} className="mx-auto mb-4 opacity-50" />
                        <p className="mb-2">Enter your income details</p>
                        <p className="text-sm">Get AI-powered tax optimization recommendations</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {/* Tax Comparison Tab */}
          {activeTab === "comparison" && taxResults && (
            <motion.div
              key="comparison"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Old Regime */}
                <Card className="border border-wine/20">
                  <CardHeader>
                    <CardTitle className="text-wine flex items-center justify-between">
                      <span>Old Tax Regime</span>
                      <Badge variant="outline" className="border-wine text-wine">
                        Traditional
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-wine/70">Gross Income</span>
                        <span className="font-semibold text-wine">{formatCurrency(taxData.grossIncome)}</span>
                      </div>
                      {Object.entries(taxResults.oldRegime.breakdown).map(([key, value]) => (
                        value > 0 && (
                          <div key={key} className="flex justify-between">
                            <span className="text-wine/70">{key}</span>
                            <span className="font-semibold text-green-600">-{formatCurrency(value)}</span>
                          </div>
                        )
                      ))}
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-wine/70">Taxable Income</span>
                        <span className="font-semibold text-wine">
                          {formatCurrency(taxData.grossIncome - taxResults.oldRegime.deductionsUsed)}
                        </span>
                      </div>
                      <div className="flex justify-between text-lg">
                        <span className="text-wine/70">Total Tax</span>
                        <span className="font-bold text-red-600">{formatCurrency(taxResults.oldRegime.totalTax)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-wine/70">Effective Rate</span>
                        <span className="font-medium text-wine">{taxResults.oldRegime.effectiveRate}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* New Regime */}
                <Card className="border border-wine/20">
                  <CardHeader>
                    <CardTitle className="text-wine flex items-center justify-between">
                      <span>New Tax Regime</span>
                      <Badge className="bg-plum text-white">
                        Simplified
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-wine/70">Gross Income</span>
                        <span className="font-semibold text-wine">{formatCurrency(taxData.grossIncome)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-wine/70">Standard Deduction</span>
                        <span className="font-semibold text-green-600">-{formatCurrency(50000)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-wine/70">Taxable Income</span>
                        <span className="font-semibold text-wine">{formatCurrency(taxData.grossIncome - 50000)}</span>
                      </div>
                      <div className="flex justify-between text-lg">
                        <span className="text-wine/70">Total Tax</span>
                        <span className="font-bold text-green-600">{formatCurrency(taxResults.newRegime.totalTax)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-wine/70">Effective Rate</span>
                        <span className="font-medium text-wine">{taxResults.newRegime.effectiveRate}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recommendation */}
              <Card className="border-2 border-lemon-green/50 bg-gradient-to-r from-lemon-green/5 to-lemon-green/10">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-lemon-green/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Brain size={24} className="text-wine" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-wine mb-2">AI Tax Recommendation</h3>
                      <div className="mb-4">
                        <div className="text-2xl font-bold text-plum mb-2">
                          Choose {taxResults.recommendation.regime.toUpperCase()} Tax Regime
                        </div>
                        <p className="text-wine/70 mb-3">{taxResults.recommendation.reason}</p>
                        <div className="text-lg font-semibold text-green-600">
                          💰 Annual Savings: {formatCurrency(taxResults.recommendation.savings)}
                        </div>
                      </div>
                      
                      {taxResults.recommendation.optimizations.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-semibold text-wine mb-2">💡 Optimization Suggestions:</h4>
                          <ul className="space-y-1">
                            {taxResults.recommendation.optimizations.map((suggestion, index) => (
                              <li key={index} className="text-sm text-wine/70 flex items-start gap-2">
                                <span className="text-plum">•</span>
                                <span>{suggestion}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <Button className="bg-plum hover:bg-plum/90 text-white">
                        <FileText size={18} className="mr-2" />
                        Generate Tax Report
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* AI Insights Tab */}
          {activeTab === "insights" && taxResults && (
            <motion.div
              key="insights"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {taxResults.aiInsights.map((insight, index) => (
                <Card key={index} className="border border-wine/20">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-plum/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Brain size={20} className="text-plum" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-wine mb-2">{insight.title}</h3>
                        <p className="text-wine/70 mb-3">{insight.description}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="border-green-300 text-green-700">
                            {insight.impact}
                          </Badge>
                          {insight.actionable && (
                            <Badge variant="outline" className="border-blue-300 text-blue-700">
                              Actionable
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Display */}
        {error && (
          <Card className="border-2 border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <AlertTriangle size={24} className="text-red-600" />
                <div>
                  <h3 className="font-semibold text-red-800">Calculation Error</h3>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
}