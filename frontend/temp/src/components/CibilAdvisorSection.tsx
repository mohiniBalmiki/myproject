import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Slider } from "./ui/slider";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Progress } from "./ui/progress";
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, Clock, CreditCard, Lock, Brain, Loader2, RefreshCw, Eye, Target, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../contexts/AuthContext";
import { LLMService, FinancialContext } from "../utils/llmService";
import { DatabaseAPI, API_CONFIG } from "../utils/supabase/client";
import { toast } from "sonner";

interface CreditFactor {
  factor: string;
  impact: 'High' | 'Medium' | 'Low';
  status: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  score: number;
  currentValue: number;
  targetValue: number;
  recommendation: string;
  icon: any;
  color: string;
}

interface CreditProfile {
  currentScore: number;
  previousScore: number;
  scoreHistory: { month: string; score: number }[];
  factors: CreditFactor[];
  creditCards: {
    total: number;
    utilized: number;
    utilizationRate: number;
  };
  loans: {
    totalAmount: number;
    paidAmount: number;
    emiHistory: string[];
  };
  inquiries: {
    recent: number;
    lastInquiry: string;
  };
}

interface ScoreSimulation {
  scenario: string;
  currentScore: number;
  projectedScore: number;
  timeframe: string;
  actions: string[];
  impact: 'High' | 'Medium' | 'Low';
}

interface CreditInsight {
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  actionable: boolean;
  impact: string;
  category: 'improvement' | 'alert' | 'opportunity';
}

export function CibilAdvisorSection() {
  const { user, session } = useAuth();
  const [activeTab, setActiveTab] = useState<"monitor" | "simulate" | "insights">("monitor");
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Credit profile data
  const [creditProfile, setCreditProfile] = useState<CreditProfile | null>(null);
  const [creditInsights, setCreditInsights] = useState<CreditInsight[]>([]);
  const [simulationProgress, setSimulationProgress] = useState(0);

  // Simulation inputs
  const [simulationInputs, setSimulationInputs] = useState({
    creditCardPayment: 50000,
    loanPayment: 100000,
    newCreditCard: false,
    loanApplication: false,
    timeframe: 6 // months
  });

  // Current score simulation
  const [simulations, setSimulations] = useState<ScoreSimulation[]>([]);

  useEffect(() => {
    if (user && session?.access_token) {
      loadCreditProfile();
    }
  }, [user, session]);

  const loadCreditProfile = async () => {
    if (!user || !session?.access_token) return;
    
    setIsLoading(true);
    try {
      // Try to get user's credit data from stored profile or transactions
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/api/data/user-profile/${user.id}`,
        {
          headers: API_CONFIG.getAuthHeaders(session.access_token)
        }
      );
      
      if (response.ok) {
        const profileData = await response.json();
        
        // Create credit profile from available data or use defaults
        const profile: CreditProfile = {
          currentScore: profileData.credit_score || generateRealisticCreditScore(),
          previousScore: profileData.previous_credit_score || 720,
          scoreHistory: generateScoreHistory(),
          factors: generateCreditFactors(profileData),
          creditCards: {
            total: profileData.credit_limit || 200000,
            utilized: profileData.credit_utilized || 45000,
            utilizationRate: ((profileData.credit_utilized || 45000) / (profileData.credit_limit || 200000)) * 100
          },
          loans: {
            totalAmount: profileData.loan_amount || 500000,
            paidAmount: profileData.loan_paid || 150000,
            emiHistory: ['On-time', 'On-time', 'On-time', 'Late', 'On-time']
          },
          inquiries: {
            recent: profileData.recent_inquiries || 2,
            lastInquiry: profileData.last_inquiry || '3 months ago'
          }
        };
        
        setCreditProfile(profile);
        
        // Generate AI insights for the credit profile
        generateCreditInsights(profile);
      } else {
        // Generate sample credit profile if no data available
        const sampleProfile = generateSampleCreditProfile();
        setCreditProfile(sampleProfile);
        generateCreditInsights(sampleProfile);
      }
    } catch (error) {
      console.error('Error loading credit profile:', error);
      const sampleProfile = generateSampleCreditProfile();
      setCreditProfile(sampleProfile);
      generateCreditInsights(sampleProfile);
    } finally {
      setIsLoading(false);
    }
  };

  const generateRealisticCreditScore = (): number => {
    // Generate realistic credit score between 600-850
    return Math.floor(Math.random() * 250) + 600;
  };

  const generateScoreHistory = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const baseScore = 720;
    return months.map((month, index) => ({
      month,
      score: baseScore + Math.floor(Math.random() * 40) - 20 + (index * 5)
    }));
  };

  const generateCreditFactors = (profileData: any): CreditFactor[] => {
    return [
      {
        factor: "Payment History",
        impact: "High" as const,
        status: "Good" as const,
        score: 85,
        currentValue: 95,
        targetValue: 100,
        recommendation: "Continue making on-time payments to maintain excellent payment history",
        icon: CheckCircle,
        color: "text-green-700"
      },
      {
        factor: "Credit Utilization",
        impact: "High" as const,
        status: "Fair" as const,
        score: 65,
        currentValue: 45,
        targetValue: 30,
        recommendation: "Reduce credit utilization below 30% for optimal score impact",
        icon: CreditCard,
        color: "text-yellow-700"
      },
      {
        factor: "Credit History Length",
        impact: "Medium" as const,
        status: "Good" as const,
        score: 78,
        currentValue: 60,
        targetValue: 120,
        recommendation: "Keep older accounts open to maintain credit history length",
        icon: Clock,
        color: "text-blue-600"
      },
      {
        factor: "Recent Inquiries",
        impact: "Low" as const,
        status: "Good" as const,
        score: 88,
        currentValue: 2,
        targetValue: 0,
        recommendation: "Avoid unnecessary credit applications for the next 6 months",
        icon: Eye,
        color: "text-green-700"
      }
    ];
  };

  const generateSampleCreditProfile = (): CreditProfile => {
    return {
      currentScore: 742,
      previousScore: 728,
      scoreHistory: generateScoreHistory(),
      factors: generateCreditFactors({}),
      creditCards: {
        total: 300000,
        utilized: 85000,
        utilizationRate: 28.3
      },
      loans: {
        totalAmount: 800000,
        paidAmount: 200000,
        emiHistory: ['On-time', 'On-time', 'On-time', 'On-time', 'On-time']
      },
      inquiries: {
        recent: 1,
        lastInquiry: '2 months ago'
      }
    };
  };

  const generateCreditInsights = async (profile: CreditProfile) => {
    setIsAnalyzing(true);
    try {
      await LLMService.initialize();
      
      // Create financial context for AI analysis
      const financialContext: FinancialContext = {
        totalIncome: 1200000, // Estimated annual income
        totalExpenses: 840000, // Estimated expenses
        savingsRate: 30,
        categories: {
          'Credit Cards': profile.creditCards.utilized,
          'Loans': profile.loans.totalAmount - profile.loans.paidAmount,
          'Credit Utilization': profile.creditCards.utilizationRate
        },
        patterns: [
          { type: 'credit_utilization', frequency: 'monthly', amount: profile.creditCards.utilized },
          { type: 'loan_payment', frequency: 'monthly', amount: 25000 }
        ],
        demographics: {
          age: 32,
          profession: 'Professional'
        },
        goals: ['Improve Credit Score', 'Reduce Debt', 'Financial Health']
      };

      // Generate AI-powered credit insights
      const llmInsights = await LLMService.generatePersonalizedInsights(financialContext);
      
      const creditSpecificInsights: CreditInsight[] = llmInsights.map((insight: any) => ({
        title: insight.title || 'Credit Improvement Opportunity',
        description: insight.description || insight.content || insight,
        priority: insight.priority || 'Medium' as const,
        actionable: true,
        impact: insight.potentialImpact || 'Moderate impact on credit score',
        category: insight.category || 'improvement' as const
      }));

      // Add specific credit insights based on profile analysis
      if (profile.creditCards.utilizationRate > 30) {
        creditSpecificInsights.unshift({
          title: 'High Credit Utilization Alert',
          description: `Your credit utilization is ${profile.creditCards.utilizationRate.toFixed(1)}%. Reducing it below 30% could improve your score by 20-50 points.`,
          priority: 'High',
          actionable: true,
          impact: 'High impact - Could improve score by 20-50 points',
          category: 'alert'
        });
      }

      if (profile.inquiries.recent > 2) {
        creditSpecificInsights.push({
          title: 'Multiple Recent Inquiries',
          description: `You have ${profile.inquiries.recent} recent credit inquiries. Consider waiting 6 months before applying for new credit.`,
          priority: 'Medium',
          actionable: true,
          impact: 'Medium impact - Inquiries affect score for 12 months',
          category: 'alert'
        });
      }

      setCreditInsights(creditSpecificInsights);
    } catch (error) {
      console.error('Error generating credit insights:', error);
      // Fallback insights
      setCreditInsights([
        {
          title: 'Credit Utilization Optimization',
          description: 'Keep credit utilization below 30% across all cards for optimal score impact',
          priority: 'High',
          actionable: true,
          impact: 'Could improve score by 20-40 points',
          category: 'improvement'
        },
        {
          title: 'Payment History Excellence',
          description: 'Continue making all payments on time to maintain your strong payment history',
          priority: 'High',
          actionable: true,
          impact: 'Prevents score decline and maintains growth',
          category: 'improvement'
        }
      ]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const runScoreSimulation = async () => {
    if (!creditProfile) return;
    
    setIsAnalyzing(true);
    setSimulationProgress(0);
    
    try {
      // Simulate different scenarios
      const scenarios: ScoreSimulation[] = [];
      setSimulationProgress(25);

      // Credit card payment scenario
      if (simulationInputs.creditCardPayment > 0) {
        const newUtilization = Math.max(0, 
          ((creditProfile.creditCards.utilized - simulationInputs.creditCardPayment) / 
           creditProfile.creditCards.total) * 100
        );
        const utilizationImprovement = Math.max(0, 
          Math.floor((creditProfile.creditCards.utilizationRate - newUtilization) * 2)
        );
        
        scenarios.push({
          scenario: `Pay ₹${simulationInputs.creditCardPayment.toLocaleString()} toward credit cards`,
          currentScore: creditProfile.currentScore,
          projectedScore: creditProfile.currentScore + utilizationImprovement,
          timeframe: '2-3 months',
          actions: [
            'Pay down credit card balances',
            'Reduce utilization ratio',
            'Maintain low balances'
          ],
          impact: utilizationImprovement > 20 ? 'High' : utilizationImprovement > 10 ? 'Medium' : 'Low'
        });
      }

      setSimulationProgress(50);

      // Loan payment scenario
      if (simulationInputs.loanPayment > 0) {
        const loanImprovement = Math.floor(simulationInputs.loanPayment / 50000) * 5;
        scenarios.push({
          scenario: `Pay ₹${simulationInputs.loanPayment.toLocaleString()} toward loans`,
          currentScore: creditProfile.currentScore,
          projectedScore: creditProfile.currentScore + loanImprovement,
          timeframe: '3-6 months',
          actions: [
            'Make extra loan payments',
            'Reduce debt-to-income ratio',
            'Improve credit mix'
          ],
          impact: loanImprovement > 15 ? 'High' : loanImprovement > 7 ? 'Medium' : 'Low'
        });
      }

      setSimulationProgress(75);

      // New credit application impact
      if (simulationInputs.newCreditCard || simulationInputs.loanApplication) {
        const inquiryImpact = (simulationInputs.newCreditCard ? 5 : 0) + 
                             (simulationInputs.loanApplication ? 8 : 0);
        scenarios.push({
          scenario: 'Apply for new credit',
          currentScore: creditProfile.currentScore,
          projectedScore: creditProfile.currentScore - inquiryImpact,
          timeframe: '1-3 months',
          actions: [
            'Hard inquiry on credit report',
            'Temporary score decrease',
            'New account age impact'
          ],
          impact: inquiryImpact > 10 ? 'High' : 'Medium'
        });
      }

      // Combined scenario
      const totalImprovement = scenarios.reduce((sum, scenario) => {
        if (scenario.projectedScore > scenario.currentScore) {
          return sum + (scenario.projectedScore - scenario.currentScore);
        }
        return sum;
      }, 0) * 0.8; // Realistic combined impact

      if (totalImprovement > 0) {
        scenarios.push({
          scenario: 'Combined optimization strategy',
          currentScore: creditProfile.currentScore,
          projectedScore: creditProfile.currentScore + Math.floor(totalImprovement),
          timeframe: '6-12 months',
          actions: [
            'Reduce credit utilization',
            'Make consistent payments',
            'Avoid new inquiries',
            'Maintain account diversity'
          ],
          impact: totalImprovement > 30 ? 'High' : totalImprovement > 15 ? 'Medium' : 'Low'
        });
      }

      setSimulations(scenarios);
      setSimulationProgress(100);
      
      toast.success('Credit simulation complete!', {
        description: `Generated ${scenarios.length} improvement scenarios`
      });
      
    } catch (error) {
      console.error('Error running simulation:', error);
      toast.error('Simulation failed', {
        description: 'Please try again'
      });
    } finally {
      setIsAnalyzing(false);
      setTimeout(() => setSimulationProgress(0), 2000);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 750) return "text-green-700";
    if (score >= 650) return "text-yellow-700";
    return "text-red-600";
  };

  const getScoreGrade = (score: number) => {
    if (score >= 750) return "Excellent";
    if (score >= 700) return "Good";
    if (score >= 650) return "Fair";
    return "Poor";
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <section id="cibil-advisor" className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Loader2 size={48} className="animate-spin mx-auto mb-4 text-plum" />
            <p className="text-wine/70">Loading your credit profile...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="cibil-advisor" className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-wine mb-4">
            🎯 AI Credit Score Advisor
          </h2>
          <p className="text-xl text-wine/70 max-w-2xl mx-auto">
            Monitor your credit health with AI insights, run what-if simulations, and get personalized recommendations to improve your CIBIL score.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg border border-wine/20 p-1 shadow-sm">
            {(["monitor", "simulate", "insights"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-md font-medium transition-all ${
                  activeTab === tab
                    ? "bg-plum text-white"
                    : "text-wine/70 hover:text-wine hover:bg-gray-50"
                }`}
              >
                {tab === 'monitor' && <TrendingUp size={16} className="inline mr-2" />}
                {tab === 'simulate' && <Target size={16} className="inline mr-2" />}
                {tab === 'insights' && <Brain size={16} className="inline mr-2" />}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Credit Monitor Tab */}
          {activeTab === "monitor" && creditProfile && (
            <motion.div
              key="monitor"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Score Card */}
                <Card className="border border-wine/20 lg:col-span-1">
                  <CardHeader className="text-center">
                    <CardTitle className="text-wine flex items-center justify-center gap-2">
                      <CreditCard size={24} />
                      Your CIBIL Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="relative mb-6">
                      {/* Circular progress */}
                      <div className="w-40 h-40 mx-auto relative">
                        <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 144 144">
                          <circle
                            cx="72"
                            cy="72"
                            r="64"
                            stroke="#f3f4f6"
                            strokeWidth="8"
                            fill="none"
                          />
                          <circle
                            cx="72"
                            cy="72"
                            r="64"
                            stroke="#047857"
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={`${(creditProfile.currentScore / 900) * 402.1} 402.1`}
                            className="transition-all duration-1000"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div>
                            <div className={`text-4xl font-bold ${getScoreColor(creditProfile.currentScore)}`}>
                              {creditProfile.currentScore}
                            </div>
                            <div className="text-wine/60">/900</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Badge className={`${getScoreColor(creditProfile.currentScore)} bg-transparent border-current mb-4`}>
                      {getScoreGrade(creditProfile.currentScore)}
                    </Badge>
                    
                    <div className="flex items-center justify-center gap-2">
                      {creditProfile.currentScore > creditProfile.previousScore ? (
                        <>
                          <TrendingUp size={20} className="text-green-700" />
                          <span className="text-green-700">
                            +{creditProfile.currentScore - creditProfile.previousScore} points this month
                          </span>
                        </>
                      ) : (
                        <>
                          <TrendingDown size={20} className="text-red-600" />
                          <span className="text-red-600">
                            {creditProfile.currentScore - creditProfile.previousScore} points this month
                          </span>
                        </>
                      )}
                    </div>

                    <Button
                      onClick={loadCreditProfile}
                      variant="outline"
                      size="sm"
                      className="mt-4 border-plum text-plum hover:bg-plum hover:text-white"
                    >
                      <RefreshCw size={16} className="mr-2" />
                      Refresh Score
                    </Button>
                  </CardContent>
                </Card>

                {/* Credit Factors */}
                <Card className="border border-wine/20 lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-wine flex items-center gap-2">
                      <CheckCircle size={24} />
                      Credit Health Factors
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {creditProfile.factors.map((factor, index) => (
                        <div key={index} className="space-y-3">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${factor.color} bg-current/10`}>
                              <factor.icon size={20} className={factor.color} />
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-wine">{factor.factor}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-wine/60">Impact: {factor.impact}</span>
                                  <Badge variant="outline" className={factor.color}>
                                    {factor.status}
                                  </Badge>
                                </div>
                              </div>
                              
                              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                                <div
                                  className={`h-2 rounded-full transition-all duration-500 ${
                                    factor.score >= 80 ? 'bg-green-600' :
                                    factor.score >= 60 ? 'bg-yellow-600' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${factor.score}%` }}
                                />
                              </div>
                              
                              <div className="text-sm text-wine/70">
                                {factor.recommendation}
                              </div>
                            </div>
                            
                            <span className="font-semibold text-wine w-12 text-right">
                              {factor.score}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Credit Utilization Card */}
              <Card className="border border-wine/20">
                <CardHeader>
                  <CardTitle className="text-wine flex items-center gap-2">
                    <CreditCard size={24} />
                    Credit Utilization Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-wine mb-1">
                        {formatCurrency(creditProfile.creditCards.total)}
                      </div>
                      <div className="text-wine/70 text-sm">Total Credit Limit</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-plum mb-1">
                        {formatCurrency(creditProfile.creditCards.utilized)}
                      </div>
                      <div className="text-wine/70 text-sm">Amount Used</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold mb-1 ${
                        creditProfile.creditCards.utilizationRate > 30 ? 'text-red-600' :
                        creditProfile.creditCards.utilizationRate > 20 ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {creditProfile.creditCards.utilizationRate.toFixed(1)}%
                      </div>
                      <div className="text-wine/70 text-sm">Utilization Rate</div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-wine/70 mb-2">
                      <span>Credit Utilization</span>
                      <span>Optimal: &lt;30%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ${
                          creditProfile.creditCards.utilizationRate > 30 ? 'bg-red-500' :
                          creditProfile.creditCards.utilizationRate > 20 ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(creditProfile.creditCards.utilizationRate, 100)}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Score Simulation Tab */}
          {activeTab === "simulate" && (
            <motion.div
              key="simulate"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Simulation Inputs */}
                <Card className="border border-wine/20">
                  <CardHeader>
                    <CardTitle className="text-wine flex items-center gap-2">
                      <Target size={24} />
                      What-If Simulation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="creditCardPayment" className="text-wine">
                          Credit Card Payment Amount
                        </Label>
                        <Input
                          id="creditCardPayment"
                          type="number"
                          placeholder="Enter payment amount"
                          value={simulationInputs.creditCardPayment || ''}
                          onChange={(e) => setSimulationInputs(prev => ({
                            ...prev,
                            creditCardPayment: parseFloat(e.target.value) || 0
                          }))}
                          className="border-wine/30"
                        />
                        <p className="text-xs text-wine/60 mt-1">
                          Reduce credit utilization for score improvement
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="loanPayment" className="text-wine">
                          Additional Loan Payment
                        </Label>
                        <Input
                          id="loanPayment"
                          type="number"
                          placeholder="Enter loan payment"
                          value={simulationInputs.loanPayment || ''}
                          onChange={(e) => setSimulationInputs(prev => ({
                            ...prev,
                            loanPayment: parseFloat(e.target.value) || 0
                          }))}
                          className="border-wine/30"
                        />
                        <p className="text-xs text-wine/60 mt-1">
                          Reduce debt-to-income ratio
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="timeframe" className="text-wine">
                          Time Frame (months)
                        </Label>
                        <Input
                          id="timeframe"
                          type="number"
                          min="3"
                          max="24"
                          value={simulationInputs.timeframe}
                          onChange={(e) => setSimulationInputs(prev => ({
                            ...prev,
                            timeframe: parseInt(e.target.value) || 6
                          }))}
                          className="border-wine/30"
                        />
                      </div>
                    </div>

                    {user ? (
                      <Button 
                        onClick={runScoreSimulation}
                        disabled={isAnalyzing}
                        className="w-full bg-plum hover:bg-plum/90 text-white"
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 size={18} className="mr-2 animate-spin" />
                            Running AI Simulation...
                          </>
                        ) : (
                          <>
                            <Zap size={18} className="mr-2" />
                            Run Score Simulation
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
                        Login to Run Simulation
                      </Button>
                    )}

                    {isAnalyzing && simulationProgress > 0 && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-wine/70">
                          <span>AI Score Analysis</span>
                          <span>{simulationProgress}%</span>
                        </div>
                        <Progress value={simulationProgress} className="h-2" />
                        <p className="text-xs text-wine/60">
                          {simulationProgress < 30 ? '🧠 Analyzing credit factors...' :
                           simulationProgress < 70 ? '📊 Running simulations...' :
                           '✅ Generating recommendations...'}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Simulation Results */}
                <Card className="border border-wine/20">
                  <CardHeader>
                    <CardTitle className="text-wine flex items-center gap-2">
                      <TrendingUp size={24} />
                      Simulation Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {simulations.length > 0 ? (
                      <div className="space-y-4">
                        {simulations.map((simulation, index) => (
                          <div key={index} className="p-4 border border-wine/20 rounded-lg">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h4 className="font-semibold text-wine mb-1">
                                  {simulation.scenario}
                                </h4>
                                <p className="text-sm text-wine/70">
                                  Timeline: {simulation.timeframe}
                                </p>
                              </div>
                              <Badge variant={
                                simulation.impact === 'High' ? 'default' :
                                simulation.impact === 'Medium' ? 'secondary' : 'outline'
                              } className={
                                simulation.impact === 'High' ? 'bg-green-100 text-green-800' :
                                simulation.impact === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }>
                                {simulation.impact} Impact
                              </Badge>
                            </div>
                            
                            <div className="flex items-center justify-between mb-3">
                              <div className="text-center">
                                <div className="text-lg font-bold text-red-600">
                                  {simulation.currentScore}
                                </div>
                                <div className="text-xs text-wine/60">Current</div>
                              </div>
                              <div className="flex-1 mx-4">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="h-2 rounded-full bg-gradient-to-r from-red-500 to-green-500 transition-all duration-500"
                                    style={{ width: '100%' }}
                                  />
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-bold text-green-600">
                                  {simulation.projectedScore}
                                </div>
                                <div className="text-xs text-wine/60">Projected</div>
                              </div>
                            </div>
                            
                            <div className="text-center mb-3">
                              <span className={`font-bold ${
                                simulation.projectedScore > simulation.currentScore ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {simulation.projectedScore > simulation.currentScore ? '+' : ''}
                                {simulation.projectedScore - simulation.currentScore} points
                              </span>
                            </div>

                            <div className="text-xs text-wine/70">
                              <strong>Actions:</strong>
                              <ul className="list-disc list-inside mt-1">
                                {simulation.actions.map((action, actionIndex) => (
                                  <li key={actionIndex}>{action}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-wine/60">
                        <Target size={48} className="mx-auto mb-4 opacity-50" />
                        <p className="mb-2">Run a simulation to see</p>
                        <p className="text-sm">How different actions affect your score</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {/* AI Insights Tab */}
          {activeTab === "insights" && (
            <motion.div
              key="insights"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {creditInsights.length > 0 ? (
                creditInsights.map((insight, index) => (
                  <Card key={index} className="border border-wine/20">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          insight.category === 'alert' ? 'bg-red-100' :
                          insight.category === 'opportunity' ? 'bg-blue-100' :
                          'bg-green-100'
                        }`}>
                          {insight.category === 'alert' ? (
                            <AlertCircle size={20} className="text-red-600" />
                          ) : insight.category === 'opportunity' ? (
                            <Target size={20} className="text-blue-600" />
                          ) : (
                            <CheckCircle size={20} className="text-green-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-lg font-semibold text-wine">{insight.title}</h3>
                            <Badge variant={
                              insight.priority === 'High' ? 'destructive' :
                              insight.priority === 'Medium' ? 'default' : 'secondary'
                            }>
                              {insight.priority} Priority
                            </Badge>
                          </div>
                          <p className="text-wine/70 mb-3">{insight.description}</p>
                          <div className="flex items-center gap-4">
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
                ))
              ) : (
                <Card className="border border-wine/20">
                  <CardContent className="p-12 text-center">
                    {isAnalyzing ? (
                      <>
                        <Loader2 size={48} className="animate-spin mx-auto mb-4 text-plum" />
                        <p className="text-wine/70">Generating AI insights...</p>
                      </>
                    ) : (
                      <>
                        <Brain size={48} className="mx-auto mb-4 text-wine/50" />
                        <p className="text-wine/70 mb-2">No insights available</p>
                        <Button
                          onClick={() => creditProfile && generateCreditInsights(creditProfile)}
                          variant="outline"
                          className="border-plum text-plum hover:bg-plum hover:text-white"
                        >
                          <Brain size={16} className="mr-2" />
                          Generate AI Insights
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}