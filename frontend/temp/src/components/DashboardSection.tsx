import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  IndianRupee, 
  FileText, 
  BarChart3, 
  PieChart, 
  Calculator,
  CreditCard,
  Building2,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Loader2,
  AlertCircle,
  Upload,
  Bot
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../contexts/AuthContext";
import { DatabaseAPI } from "../utils/supabase/client";
import { toast } from "sonner";

interface DashboardData {
  user_info: {
    name: string;
    email: string;
    member_since: string;
  };
  financial_summary: {
    total_income: number;
    total_expenses: number;
    net_savings: number;
    monthly_income: number;
    monthly_expenses: number;
    savings_rate: number;
  };
  tax_summary: {
    financial_year: string;
    gross_income: number;
    tax_liability: number;
    recommended_regime: string;
    potential_savings: number;
    deductions_utilized: number;
    last_calculated: string;
  };
  cibil_summary: {
    current_score: number;
    previous_score: number;
    trend: string;
    score_category: string;
    last_updated: string;
  };
  recent_activity: Array<{
    id: string;
    type: string;
    description: string;
    amount?: number;
    date: string;
  }>;
  insights: Array<{
    type: string;
    message: string;
    impact: string;
    action_required: boolean;
  }>;
  last_updated: string;
}

export function DashboardSection() {
  const { user, session } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && session?.access_token) {
      loadDashboardData();
    }
  }, [user, session]);

  const loadDashboardData = async () => {
    if (!user || !session?.access_token) return;

    setLoading(true);
    setError(null);

    try {
      const response = await DatabaseAPI.getDashboardOverview(user.id, session.access_token);
      setDashboardData(response.dashboard);
    } catch (error: any) {
      console.error('Dashboard loading error:', error);
      setError(error.message);
      toast.error("Failed to load dashboard data", {
        description: "Please try refreshing the page"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  if (loading) {
    return (
      <section className="py-16 lg:py-24 bg-gradient-to-br from-white via-lemon-green/5 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Loader2 size={48} className="animate-spin text-plum mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-wine mb-2">Loading Your Dashboard</h2>
            <p className="text-wine/70">Fetching your personalized financial insights...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 lg:py-24 bg-gradient-to-br from-white via-lemon-green/5 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-wine mb-2">Dashboard Error</h2>
            <p className="text-wine/70 mb-4">{error}</p>
            <Button 
              onClick={loadDashboardData}
              className="bg-plum hover:bg-plum/90 text-white"
            >
              Try Again
            </Button>
          </div>
        </div>
      </section>
    );
  }

  if (!dashboardData) {
    return null;
  }

  const { financial_summary, tax_summary, cibil_summary, recent_activity, insights } = dashboardData;

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-br from-white via-lemon-green/5 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl lg:text-4xl font-bold text-wine mb-4">
            Welcome back, {dashboardData.user_info.name}! 👋
          </h1>
          <p className="text-xl text-wine/70 max-w-2xl mx-auto">
            Here's your personalized financial dashboard with real-time insights and recommendations.
          </p>
          <Badge variant="outline" className="mt-4 text-wine/60">
            Member since {dashboardData.user_info.member_since}
          </Badge>
        </motion.div>

        {/* Key Metrics Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Income */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="border border-wine/20 bg-gradient-to-br from-green-50 to-green-100/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700">Total Income</p>
                    <p className="text-2xl font-bold text-green-800">
                      {formatCurrency(financial_summary.total_income)}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      ₹{formatNumber(financial_summary.monthly_income)} monthly avg
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-green-200 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-green-700" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Total Expenses */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="border border-wine/20 bg-gradient-to-br from-red-50 to-red-100/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-700">Total Expenses</p>
                    <p className="text-2xl font-bold text-red-800">
                      {formatCurrency(financial_summary.total_expenses)}
                    </p>
                    <p className="text-xs text-red-600 mt-1">
                      ₹{formatNumber(financial_summary.monthly_expenses)} monthly avg
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-red-200 rounded-full flex items-center justify-center">
                    <TrendingDown className="h-6 w-6 text-red-700" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Net Savings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="border border-wine/20 bg-gradient-to-br from-blue-50 to-blue-100/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700">Net Savings</p>
                    <p className="text-2xl font-bold text-blue-800">
                      {formatCurrency(financial_summary.net_savings)}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      {financial_summary.savings_rate}% savings rate
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-blue-200 rounded-full flex items-center justify-center">
                    <IndianRupee className="h-6 w-6 text-blue-700" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* CIBIL Score */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="border border-wine/20 bg-gradient-to-br from-purple-50 to-purple-100/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-700">CIBIL Score</p>
                    <p className="text-2xl font-bold text-purple-800">
                      {cibil_summary.current_score}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      {cibil_summary.trend === 'improving' ? (
                        <ArrowUpRight className="h-3 w-3 text-green-600" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 text-red-600" />
                      )}
                      <p className="text-xs text-purple-600">
                        {cibil_summary.score_category}
                      </p>
                    </div>
                  </div>
                  <div className="h-12 w-12 bg-purple-200 rounded-full flex items-center justify-center">
                    <CreditCard className="h-6 w-6 text-purple-700" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Dashboard Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Tax Summary */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Card className="border border-wine/20">
              <CardHeader>
                <CardTitle className="text-wine flex items-center gap-2">
                  <Calculator size={24} />
                  Tax Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gradient-to-r from-plum/10 to-lemon-green/10 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-wine/70">FY {tax_summary.financial_year}</span>
                    <Badge variant="outline" className="text-wine">
                      {tax_summary.recommended_regime} Regime
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-wine/70">Gross Income</span>
                      <span className="font-medium text-wine">
                        {formatCurrency(tax_summary.gross_income)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-wine/70">Tax Liability</span>
                      <span className="font-medium text-wine">
                        {formatCurrency(tax_summary.tax_liability)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-sm font-medium text-green-700">Potential Savings</span>
                      <span className="font-bold text-green-700">
                        {formatCurrency(tax_summary.potential_savings)}
                      </span>
                    </div>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full border-plum text-plum hover:bg-plum hover:text-white"
                  onClick={() => {
                    const element = document.querySelector('#tax-optimizer');
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  Optimize Tax Further
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Card className="border border-wine/20">
              <CardHeader>
                <CardTitle className="text-wine flex items-center gap-2">
                  <Activity size={24} />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  <AnimatePresence>
                    {recent_activity.map((activity, index) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex items-center justify-between p-3 bg-gray-50/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            activity.type === 'upload' ? 'bg-blue-100' :
                            activity.type === 'calculation' ? 'bg-green-100' :
                            activity.type === 'report' ? 'bg-purple-100' : 'bg-gray-100'
                          }`}>
                            {activity.type === 'upload' && <FileText size={16} className="text-blue-600" />}
                            {activity.type === 'calculation' && <Calculator size={16} className="text-green-600" />}
                            {activity.type === 'report' && <BarChart3 size={16} className="text-purple-600" />}
                            {activity.type === 'transaction' && <IndianRupee size={16} className="text-gray-600" />}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-wine">
                              {activity.description}
                            </p>
                            <p className="text-xs text-wine/60">
                              {new Date(activity.date).toLocaleDateString('en-IN')}
                            </p>
                          </div>
                        </div>
                        {activity.amount && (
                          <span className="text-sm font-medium text-wine">
                            {formatCurrency(activity.amount)}
                          </span>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                {recent_activity.length === 0 && (
                  <div className="text-center py-8 text-wine/60">
                    <Activity size={32} className="mx-auto mb-2 opacity-50" />
                    <p>No recent activity</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* AI Insights */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <Card className="border-2 border-lemon-green/50 bg-gradient-to-br from-lemon-green/5 to-lemon-green/10">
              <CardHeader>
                <CardTitle className="text-wine flex items-center gap-2">
                  <PieChart size={24} />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  <AnimatePresence>
                    {insights.map((insight, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className={`p-3 rounded-lg border ${
                          insight.type === 'tax' ? 'bg-blue-50 border-blue-200' :
                          insight.type === 'savings' ? 'bg-green-50 border-green-200' :
                          insight.type === 'credit' ? 'bg-purple-50 border-purple-200' :
                          'bg-yellow-50 border-yellow-200'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {insight.action_required && (
                            <AlertCircle size={16} className="text-orange-500 mt-0.5 flex-shrink-0" />
                          )}
                          <div>
                            <p className="text-sm font-medium text-wine mb-1">
                              {insight.message}
                            </p>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                insight.impact === 'high' ? 'border-red-300 text-red-700' :
                                insight.impact === 'medium' ? 'border-yellow-300 text-yellow-700' :
                                'border-green-300 text-green-700'
                              }`}
                            >
                              {insight.impact} impact
                            </Badge>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                {insights.length === 0 && (
                  <div className="text-center py-8 text-wine/60">
                    <PieChart size={32} className="mx-auto mb-2 opacity-50" />
                    <p>No insights available</p>
                    <p className="text-xs">Upload financial data to get personalized insights</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-12"
        >
          <div className="text-center mb-12">
            <h3 className="text-2xl lg:text-3xl font-bold text-wine mb-4">
              Quick Actions
            </h3>
            <p className="text-lg text-wine/70 max-w-2xl mx-auto">
              Jump straight to the features you need most. Everything is designed to work seamlessly with your personal data.
            </p>
          </div>

          {/* Feature Cards Grid - Same style as demo page */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Upload Documents */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              whileHover={{ y: -5 }}
              className="cursor-pointer"
              onClick={() => {
                const element = document.querySelector('#upload');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              <Card className="group hover:shadow-xl transition-all duration-300 border border-wine/10 hover:border-plum/30 bg-white h-full">
                <CardContent className="p-8 text-center">
                  {/* Icon */}
                  <div className="w-16 h-16 rounded-2xl bg-lemon-green/20 text-plum flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Upload size={32} />
                  </div>
                  
                  {/* Content */}
                  <h4 className="text-xl font-semibold text-wine mb-4 group-hover:text-plum transition-colors">
                    Upload Bank & Card Statements
                  </h4>
                  <p className="text-wine/60 leading-relaxed">
                    Securely upload your financial documents. Our AI automatically categorizes transactions and identifies tax-saving opportunities.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Calculate Tax */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              whileHover={{ y: -5 }}
              className="cursor-pointer"
              onClick={() => {
                const element = document.querySelector('#tax-optimizer');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              <Card className="group hover:shadow-xl transition-all duration-300 border border-wine/10 hover:border-plum/30 bg-white h-full">
                <CardContent className="p-8 text-center">
                  {/* Icon */}
                  <div className="w-16 h-16 rounded-2xl bg-lemon-green/20 text-plum flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Bot size={32} />
                  </div>
                  
                  {/* Content */}
                  <h4 className="text-xl font-semibold text-wine mb-4 group-hover:text-plum transition-colors">
                    Optimize Tax Automatically
                  </h4>
                  <p className="text-wine/60 leading-relaxed">
                    Smart AI analysis compares old vs new tax regimes, suggests deductions, and maximizes your savings without any manual work.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Check CIBIL */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.1 }}
              whileHover={{ y: -5 }}
              className="cursor-pointer"
              onClick={() => {
                const element = document.querySelector('#cibil-advisor');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              <Card className="group hover:shadow-xl transition-all duration-300 border border-wine/10 hover:border-plum/30 bg-white h-full">
                <CardContent className="p-8 text-center">
                  {/* Icon */}
                  <div className="w-16 h-16 rounded-2xl bg-lemon-green/20 text-plum flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp size={32} />
                  </div>
                  
                  {/* Content */}
                  <h4 className="text-xl font-semibold text-wine mb-4 group-hover:text-plum transition-colors">
                    Track & Improve Your CIBIL Score
                  </h4>
                  <p className="text-wine/60 leading-relaxed">
                    Monitor your credit health in real-time. Get personalized recommendations to improve your score and financial wellness.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Generate Reports */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              whileHover={{ y: -5 }}
              className="cursor-pointer"
              onClick={() => {
                const element = document.querySelector('#reports');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              <Card className="group hover:shadow-xl transition-all duration-300 border border-wine/10 hover:border-plum/30 bg-white h-full">
                <CardContent className="p-8 text-center">
                  {/* Icon */}
                  <div className="w-16 h-16 rounded-2xl bg-lemon-green/20 text-plum flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <FileText size={32} />
                  </div>
                  
                  {/* Content */}
                  <h4 className="text-xl font-semibold text-wine mb-4 group-hover:text-plum transition-colors">
                    Download Personalized Reports
                  </h4>
                  <p className="text-wine/60 leading-relaxed">
                    Get detailed tax reports, credit analysis, and financial insights in beautiful PDFs ready for filing or sharing.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>

        {/* Last Updated */}
        <div className="text-center mt-8">
          <p className="text-sm text-wine/60">
            Last updated: {new Date(dashboardData.last_updated).toLocaleString('en-IN')}
          </p>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={loadDashboardData}
            className="mt-2 text-wine/60 hover:text-wine"
          >
            Refresh Data
          </Button>
        </div>
      </div>
    </section>
  );
}