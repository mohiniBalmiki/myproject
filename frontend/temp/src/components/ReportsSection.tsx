import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { BarChart, LineChart, Download, TrendingUp, AlertTriangle, Info, FileText, Calculator, CreditCard, PieChart, Target, Users, IndianRupee } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useAuth } from "../contexts/AuthContext";
import { DatabaseAPI } from "../utils/supabase/client";
import { toast } from "sonner@2.0.3";

const insights = [
  {
    type: "info",
    icon: Info,
    title: "Insurance Premium Qualifies",
    description: "Your health insurance premium of ₹25,000 qualifies for full deduction under Section 80D.",
    color: "text-blue-600 bg-blue-50 border-blue-200"
  },
  {
    type: "warning", 
    icon: AlertTriangle,
    title: "High Credit Utilization Detected",
    description: "Your credit utilization is at 75%. Keep it below 30% to improve your CIBIL score.",
    color: "text-yellow-600 bg-yellow-50 border-yellow-200"
  },
  {
    type: "success",
    icon: TrendingUp,
    title: "Excellent Payment History",
    description: "You've made all payments on time for the last 24 months. Keep it up!",
    color: "text-green-600 bg-green-50 border-green-200"
  }
];

const reportTypes = [
  {
    title: "Tax Summary Report",
    description: "Comprehensive tax analysis with regime comparison and deduction breakdown",
    format: "PDF",
    pages: "12 pages",
    icon: BarChart,
    color: "bg-plum/10 text-plum"
  },
  {
    title: "Credit Health Report", 
    description: "Detailed CIBIL score analysis with improvement recommendations",
    format: "PDF",
    pages: "8 pages", 
    icon: LineChart,
    color: "bg-wine/10 text-wine"
  },
  {
    title: "Financial Wellness Report",
    description: "Complete financial overview with spending patterns and savings insights",
    format: "PDF", 
    pages: "15 pages",
    icon: TrendingUp,
    color: "bg-lemon-green/20 text-wine"
  }
];

// Mock comprehensive data that would be generated from uploaded files
const generateComprehensiveData = () => ({
  taxOptimization: {
    currentRegimeTax: 45000,
    newRegimeTax: 52000,
    recommendedRegime: "Old Regime",
    savings: 7000,
    deductions: {
      section80C: 150000,
      section80D: 25000,
      hra: 180000,
      standardDeduction: 50000
    }
  },
  cibilScore: {
    current: 782,
    previous: 767,
    trend: "improving",
    factors: {
      paymentHistory: 95,
      creditUtilization: 28,
      creditAge: 65,
      newInquiries: 2
    }
  },
  financialWellness: {
    monthlyIncome: 85000,
    monthlyExpenses: 62000,
    savingsRate: 27,
    investmentAllocation: {
      equity: 45,
      debt: 30,
      gold: 10,
      cash: 15
    },
    emergencyFundMonths: 6.2
  },
  insights: [
    {
      type: "tax",
      title: "Switch to Old Tax Regime",
      description: "You can save ₹7,000 annually by switching to the old tax regime and claiming HRA deduction.",
      impact: "high",
      savings: 7000
    },
    {
      type: "credit",
      title: "Excellent Credit Management",
      description: "Your credit utilization of 28% is optimal. This helps maintain your high CIBIL score.",
      impact: "positive"
    },
    {
      type: "investment",
      title: "Increase SIP Amount",
      description: "Consider increasing your SIP by ₹5,000 to reach your retirement goal 3 years earlier.",
      impact: "medium",
      recommendation: 5000
    }
  ]
});

export function ReportsSection() {
  const { user, session } = useAuth();
  const [hasUploadedFiles, setHasUploadedFiles] = useState(false);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [comprehensiveData, setComprehensiveData] = useState(generateComprehensiveData());

  useEffect(() => {
    // Check if files are uploaded
    const checkFiles = () => {
      const files = sessionStorage.getItem('uploadedFiles');
      setHasUploadedFiles(!!files);
    };

    checkFiles();

    // Listen for file upload events
    const handleFilesUploaded = () => {
      setHasUploadedFiles(true);
      // Regenerate data based on new files
      setComprehensiveData(generateComprehensiveData());
    };

    window.addEventListener('filesUploaded', handleFilesUploaded);
    return () => window.removeEventListener('filesUploaded', handleFilesUploaded);
  }, []);

  const handleDownload = async (reportType: string) => {
    if (!hasUploadedFiles) {
      alert('Please upload your financial documents first to generate personalized reports.');
      return;
    }

    setIsDownloading(reportType);
    
    // Simulate report generation and download
    setTimeout(() => {
      const reportContent = generateReportContent(reportType);
      downloadReport(reportType, reportContent);
      setIsDownloading(null);
    }, 2000);
  };

  const generateReportContent = (reportType: string) => {
    const data = comprehensiveData;
    
    switch (reportType) {
      case "Tax Summary Report":
        return {
          title: "Tax Summary Report",
          sections: [
            "Tax Regime Comparison",
            "Deduction Analysis",
            "Savings Opportunities",
            "Quarterly Tax Planning"
          ],
          keyMetrics: {
            "Tax Savings": `₹${data.taxOptimization.savings.toLocaleString()}`,
            "Recommended Regime": data.taxOptimization.recommendedRegime,
            "Total Deductions": `₹${Object.values(data.taxOptimization.deductions).reduce((a, b) => a + b, 0).toLocaleString()}`
          }
        };
      
      case "Credit Health Report":
        return {
          title: "Credit Health Report",
          sections: [
            "CIBIL Score Analysis",
            "Credit Utilization Breakdown",
            "Payment History Review",
            "Improvement Recommendations"
          ],
          keyMetrics: {
            "Current Score": data.cibilScore.current,
            "Score Improvement": `+${data.cibilScore.current - data.cibilScore.previous}`,
            "Credit Utilization": `${data.cibilScore.factors.creditUtilization}%`
          }
        };
      
      case "Financial Wellness Report":
        return {
          title: "Financial Wellness Report",
          sections: [
            "Income & Expense Analysis",
            "Investment Portfolio Review",
            "Savings Rate Assessment",
            "Financial Goal Planning"
          ],
          keyMetrics: {
            "Savings Rate": `${data.financialWellness.savingsRate}%`,
            "Emergency Fund": `${data.financialWellness.emergencyFundMonths} months`,
            "Monthly Surplus": `₹${(data.financialWellness.monthlyIncome - data.financialWellness.monthlyExpenses).toLocaleString()}`
          }
        };
      
      default:
        return { title: reportType, sections: [], keyMetrics: {} };
    }
  };

  const downloadReport = async (reportType: string, content: any) => {
    // Check if user is authenticated
    if (!user) {
      toast.error("Please log in to download reports", {
        description: "Create an account to save and download your financial reports"
      });
      window.dispatchEvent(new CustomEvent('openAuthModal'));
      return;
    }

    // Create a blob with report data (in real implementation, this would be a PDF)
    const reportData = JSON.stringify(content, null, 2);
    const blob = new Blob([reportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create temporary download link
    const link = document.createElement('a');
    link.href = url;
    link.download = `${reportType.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Save to database (user is already authenticated at this point)
    if (session?.access_token) {
      try {
        const newReport = {
          name: reportType,
          type: reportType.includes('Tax') ? 'Tax Summary' : 
                reportType.includes('Credit') ? 'CIBIL Analysis' : 'Quarterly Report',
          date: new Date().toLocaleDateString('en-GB', { 
            day: '2-digit', 
            month: 'short', 
            year: 'numeric' 
          }),
          size: `${(blob.size / (1024 * 1024)).toFixed(1)} MB`,
          content: content
        };

        await DatabaseAPI.saveReport(user.id, newReport, session.access_token);
        
        // Also store in sessionStorage for immediate access
        const generatedReports = JSON.parse(sessionStorage.getItem('generatedReports') || '[]');
        generatedReports.push({ ...newReport, id: Date.now().toString() });
        sessionStorage.setItem('generatedReports', JSON.stringify(generatedReports));
        
      } catch (error) {
        console.error('Failed to save report to database:', error);
        // Fallback to localStorage
        const newReport = {
          id: Date.now().toString(),
          name: reportType,
          type: reportType.includes('Tax') ? 'Tax Summary' : 
                reportType.includes('Credit') ? 'CIBIL Analysis' : 'Quarterly Report',
          date: new Date().toLocaleDateString('en-GB', { 
            day: '2-digit', 
            month: 'short', 
            year: 'numeric' 
          }),
          size: `${(blob.size / (1024 * 1024)).toFixed(1)} MB`
        };

        const existingSavedReports = JSON.parse(localStorage.getItem('savedReports') || '[]');
        const updatedSavedReports = [...existingSavedReports, newReport];
        localStorage.setItem('savedReports', JSON.stringify(updatedSavedReports));

        const generatedReports = JSON.parse(sessionStorage.getItem('generatedReports') || '[]');
        generatedReports.push(newReport);
        sessionStorage.setItem('generatedReports', JSON.stringify(generatedReports));
        
        toast.error("Failed to save to your account", {
          description: "Report downloaded but couldn't be saved to your profile."
        });
      }
    }
  };

  return (
    <section id="reports" className="py-16 lg:py-24 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-wine mb-4">
            Interactive Reports & Insights
          </h2>
          <p className="text-xl text-wine/70 max-w-2xl mx-auto">
            Get detailed insights about your financial health with beautiful, 
            downloadable reports and real-time analytics.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Chart Placeholders */}
          <Card className="border border-wine/20">
            <CardHeader>
              <CardTitle className="text-wine flex items-center gap-2">
                <BarChart size={24} />
                Spending Trend Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              {hasUploadedFiles ? (
                <div className="space-y-4">
                  {/* Spending Categories */}
                  <div className="space-y-3">
                    {[
                      { category: "Housing", amount: 25000, percentage: 40, color: "bg-plum" },
                      { category: "Food & Dining", amount: 12000, percentage: 19, color: "bg-wine" },
                      { category: "Transportation", amount: 8000, percentage: 13, color: "bg-lemon-green" },
                      { category: "Entertainment", amount: 5000, percentage: 8, color: "bg-plum/60" },
                      { category: "Utilities", amount: 4000, percentage: 6, color: "bg-wine/60" },
                      { category: "Others", amount: 8000, percentage: 14, color: "bg-lemon-green/60" }
                    ].map((item, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-wine font-medium">{item.category}</span>
                          <span className="text-wine">₹{item.amount.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${item.percentage}%` }}
                            transition={{ duration: 1, delay: index * 0.1 }}
                            className={`h-2 rounded-full ${item.color}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-64 bg-gradient-to-br from-plum/5 to-lemon-green/10 rounded-lg border-2 border-dashed border-wine/20 flex items-center justify-center">
                  <div className="text-center text-wine/60">
                    <BarChart size={48} className="mx-auto mb-2" />
                    <div className="font-medium">Upload files to see spending analysis</div>
                    <div className="text-sm">Real-time data visualization</div>
                  </div>
                </div>
              )}
              
              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="font-bold text-wine">
                    ₹{hasUploadedFiles ? comprehensiveData.financialWellness.monthlyExpenses.toLocaleString() : '--'}
                  </div>
                  <div className="text-sm text-wine/60">This Month</div>
                </div>
                <div>
                  <div className="font-bold text-green-600">
                    {hasUploadedFiles ? '-12%' : '--'}
                  </div>
                  <div className="text-sm text-wine/60">vs Last Month</div>
                </div>
                <div>
                  <div className="font-bold text-plum">
                    ₹{hasUploadedFiles ? (comprehensiveData.financialWellness.monthlyIncome - comprehensiveData.financialWellness.monthlyExpenses).toLocaleString() : '--'}
                  </div>
                  <div className="text-sm text-wine/60">Savings</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-wine/20">
            <CardHeader>
              <CardTitle className="text-wine flex items-center gap-2">
                <LineChart size={24} />
                CIBIL Score & Tax Optimization
              </CardTitle>
            </CardHeader>
            <CardContent>
              {hasUploadedFiles ? (
                <div className="space-y-6">
                  {/* CIBIL Score Circular Progress */}
                  <div className="flex items-center justify-center">
                    <div className="relative w-32 h-32">
                      <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 144 144">
                        <circle
                          cx="72"
                          cy="72"
                          r="60"
                          stroke="#f3f4f6"
                          strokeWidth="8"
                          fill="none"
                        />
                        <motion.circle
                          cx="72"
                          cy="72"
                          r="60"
                          stroke="#610A35"
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={`${(comprehensiveData.cibilScore.current / 900) * 377} 377`}
                          initial={{ strokeDasharray: "0 377" }}
                          animate={{ strokeDasharray: `${(comprehensiveData.cibilScore.current / 900) * 377} 377` }}
                          transition={{ duration: 2 }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-wine">{comprehensiveData.cibilScore.current}</div>
                          <div className="text-xs text-wine/60">CIBIL Score</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tax Optimization Summary */}
                  <div className="bg-lemon-green/10 rounded-lg p-4 border border-lemon-green/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Calculator size={16} className="text-plum" />
                      <span className="font-medium text-wine">Tax Optimization</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-wine/60">Recommended:</span>
                        <div className="font-semibold text-plum">{comprehensiveData.taxOptimization.recommendedRegime}</div>
                      </div>
                      <div>
                        <span className="text-wine/60">Annual Savings:</span>
                        <div className="font-semibold text-green-600">₹{comprehensiveData.taxOptimization.savings.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-64 bg-gradient-to-br from-wine/5 to-plum/10 rounded-lg border-2 border-dashed border-wine/20 flex items-center justify-center">
                  <div className="text-center text-wine/60">
                    <LineChart size={48} className="mx-auto mb-2" />
                    <div className="font-medium">Upload files to see detailed analysis</div>
                    <div className="text-sm">CIBIL score & tax insights</div>
                  </div>
                </div>
              )}
              
              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="font-bold text-green-600">
                    {hasUploadedFiles ? comprehensiveData.cibilScore.current : '--'}
                  </div>
                  <div className="text-sm text-wine/60">Current Score</div>
                </div>
                <div>
                  <div className="font-bold text-green-600">
                    {hasUploadedFiles ? `+${comprehensiveData.cibilScore.current - comprehensiveData.cibilScore.previous}` : '--'}
                  </div>
                  <div className="text-sm text-wine/60">This Month</div>
                </div>
                <div>
                  <div className="font-bold text-plum">
                    {hasUploadedFiles ? comprehensiveData.cibilScore.previous : '--'}
                  </div>
                  <div className="text-sm text-wine/60">6 Months Ago</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Download Reports */}
        <Card className="mb-8 border border-wine/20">
          <CardHeader>
            <CardTitle className="text-wine">Download Personalized Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              {reportTypes.map((report, index) => (
                <div key={index} className="border border-wine/10 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className={`w-12 h-12 rounded-lg ${report.color} flex items-center justify-center mb-4`}>
                    <report.icon size={24} />
                  </div>
                  
                  <h3 className="font-semibold text-wine mb-2">{report.title}</h3>
                  <p className="text-wine/60 text-sm mb-4">{report.description}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="outline" className="text-wine/60">
                      {report.format}
                    </Badge>
                    <span className="text-sm text-wine/60">{report.pages}</span>
                  </div>
                  
                  <Button 
                    onClick={() => handleDownload(report.title)}
                    disabled={!hasUploadedFiles || isDownloading === report.title}
                    className="w-full bg-plum hover:bg-plum/90 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isDownloading === report.title ? (
                      <>
                        <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Download size={16} className="mr-2" />
                        Download
                      </>
                    )}
                  </Button>
                  
                  {!hasUploadedFiles && (
                    <p className="text-xs text-wine/60 mt-2 text-center">
                      Upload files to enable download
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card className="border-2 border-lemon-green/50 bg-gradient-to-r from-lemon-green/5 to-lemon-green/10">
          <CardHeader>
            <CardTitle className="text-wine">AI-Powered Financial Insights</CardTitle>
          </CardHeader>
          <CardContent>
            {hasUploadedFiles ? (
              <div className="space-y-4">
                {comprehensiveData.insights.map((insight, index) => (
                  <motion.div 
                    key={index} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`p-4 rounded-lg border ${
                      insight.type === 'tax' ? 'text-blue-600 bg-blue-50 border-blue-200' :
                      insight.type === 'credit' ? 'text-green-600 bg-green-50 border-green-200' :
                      'text-purple-600 bg-purple-50 border-purple-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex-shrink-0">
                        {insight.type === 'tax' && <Calculator size={20} />}
                        {insight.type === 'credit' && <CreditCard size={20} />}
                        {insight.type === 'investment' && <TrendingUp size={20} />}
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">{insight.title}</h4>
                        <p className="text-sm opacity-80">{insight.description}</p>
                        {insight.savings && (
                          <div className="mt-2 text-sm font-medium">
                            Potential Savings: ₹{insight.savings.toLocaleString()}
                          </div>
                        )}
                        {insight.recommendation && (
                          <div className="mt-2 text-sm font-medium">
                            Recommended Action: +₹{insight.recommendation.toLocaleString()} monthly
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Additional Comprehensive Insights */}
                <div className="grid md:grid-cols-2 gap-4 mt-6">
                  <div className="bg-white rounded-lg p-4 border border-wine/20">
                    <h5 className="font-semibold text-wine mb-3 flex items-center gap-2">
                      <Target size={16} />
                      Financial Health Score
                    </h5>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-wine/70">Overall Score</span>
                        <span className="font-semibold text-wine">8.2/10</span>
                      </div>
                      <Progress value={82} className="h-2" />
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-wine/20">
                    <h5 className="font-semibold text-wine mb-3 flex items-center gap-2">
                      <IndianRupee size={16} />
                      Monthly Analysis
                    </h5>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-wine/70">Income</span>
                        <span className="font-medium text-green-600">₹{comprehensiveData.financialWellness.monthlyIncome.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-wine/70">Expenses</span>
                        <span className="font-medium text-wine">₹{comprehensiveData.financialWellness.monthlyExpenses.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-wine/70">Savings Rate</span>
                        <span className="font-medium text-plum">{comprehensiveData.financialWellness.savingsRate}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-wine/60">
                <Info size={48} className="mx-auto mb-3" />
                <div className="font-medium mb-2">Upload your financial documents</div>
                <div className="text-sm">Get personalized AI insights based on your actual data</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}