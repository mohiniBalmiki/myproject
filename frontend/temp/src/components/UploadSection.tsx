import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Upload, FileSpreadsheet, CheckCircle2, Loader2, X, TrendingUp, TrendingDown, PieChart, AlertTriangle, Info, Target, Activity, Brain, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { DatabaseAPI, API_CONFIG } from "../utils/supabase/client";
import { AIAnalysisService, Transaction } from "../utils/aiAnalysisService";
import { toast } from "sonner";

// AI Analysis Interfaces
interface AIAnalysisResult {
  summary: {
    totalTransactions: number;
    totalIncome: number;
    totalExpenses: number;
    netSavings: number;
    savingsRate: number;
    filesProcessed: number;
  };
  patterns: {
    [key: string]: {
      count: number;
      amount: number;
      transactions: any[];
      emiToIncomeRatio?: string;
      investmentRate?: string;
      confidence?: number;
      frequency?: string;
    };
  };
  categories: { [key: string]: number };
  insights: {
    type: 'positive' | 'warning' | 'info' | 'critical';
    title: string;
    description: string;
    impact: string;
    priority?: 'high' | 'medium' | 'low';
    actionable?: boolean;
    recommendations?: string[];
  }[];
  taxOptimization: {
    section80C: {
      current: number;
      limit: number;
      potential: number;
    };
    section80D: {
      current: number;
      limit: number;
      potential: number;
    };
  };
  cibilFactors?: any;
  financialPatterns?: any[];
}

interface ProcessedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  processingStage: string;
}

export function UploadSection() {
  const { user, session } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isProcessed, setIsProcessed] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [transactionAnalysis, setTransactionAnalysis] = useState<AIAnalysisResult | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [analysisTab, setAnalysisTab] = useState<"patterns" | "categories" | "insights">("patterns");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isValidFileType = (file: File): boolean => {
    const validTypes = [
      "application/pdf",
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ];
    const validExtensions = [".pdf", ".csv", ".xls", ".xlsx"];
    return validTypes.includes(file.type) || validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
  };

  // Advanced AI-Powered Analysis Functions
  const analyzeTransactionsWithAI = async (transactions: any[]): Promise<AIAnalysisResult> => {
    try {
      // Convert backend transactions to AI service format
      const aiTransactions: Transaction[] = transactions.map(txn => ({
        id: txn.id || `txn_${Date.now()}_${Math.random()}`,
        date: txn.date,
        description: txn.description || 'Unknown Transaction',
        amount: Math.abs(parseFloat(txn.amount) || 0),
        transaction_type: txn.transaction_type as 'credit' | 'debit',
        category: txn.category || 'Others',
        subcategory: txn.subcategory,
        is_recurring: txn.is_recurring,
        recurring_frequency: txn.recurring_frequency,
        tax_relevant: txn.tax_relevant,
        tax_section: txn.tax_section
      }));

      // Use AI service for advanced pattern analysis
      const financialPatterns = AIAnalysisService.analyzeSpendingPatterns(aiTransactions);
      const aiInsights = AIAnalysisService.generateAIInsights(aiTransactions, financialPatterns);
      const taxOptimizations = AIAnalysisService.generateTaxOptimization(aiTransactions);
      const cibilFactors = AIAnalysisService.analyzeCIBILFactors(aiTransactions, financialPatterns);

      // Calculate summary metrics
      const totalIncome = aiTransactions
        .filter(t => t.transaction_type === 'credit')
        .reduce((sum, t) => sum + t.amount, 0);
      const totalExpenses = aiTransactions
        .filter(t => t.transaction_type === 'debit')
        .reduce((sum, t) => sum + t.amount, 0);
      const netSavings = totalIncome - totalExpenses;
      const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;
      
      // Convert financial patterns to expected format
      const patterns: { [key: string]: any } = {};
      financialPatterns.forEach(pattern => {
        const key = pattern.patternType.toLowerCase().replace(' ', '_');
        patterns[key] = {
          count: pattern.transactions.length,
          amount: pattern.totalAmount,
          transactions: pattern.transactions,
          confidence: pattern.confidence,
          frequency: pattern.frequency
        };
        
        // Add specific ratios for EMI and SIP
        if (pattern.patternType === 'EMI' && totalIncome > 0) {
          patterns[key].emiToIncomeRatio = ((pattern.totalAmount / totalIncome) * 100).toFixed(1);
        }
        if (pattern.patternType === 'SIP' && totalIncome > 0) {
          patterns[key].investmentRate = ((pattern.totalAmount / totalIncome) * 100).toFixed(1);
        }
      });

      // Calculate category breakdown
      const categories: { [key: string]: number } = {};
      aiTransactions.forEach(txn => {
        const category = txn.category;
        if (!categories[category]) {
          categories[category] = 0;
        }
        categories[category] += txn.amount;
      });

      // Convert insights to expected format
      const insights = aiInsights.map(insight => ({
        type: insight.type,
        title: insight.title,
        description: insight.description,
        impact: insight.impact,
        priority: insight.priority,
        actionable: insight.actionable,
        recommendations: insight.recommendations
      }));

      // Convert tax optimizations to expected format
      const taxOptimization = {
        section80C: {
          current: 0,
          limit: 150000,
          potential: 0
        },
        section80D: {
          current: 0,
          limit: 25000,
          potential: 0
        }
      };
      taxOptimizations.forEach(opt => {
        if (opt.section === '80C') {
          taxOptimization.section80C = {
            current: opt.currentUtilization,
            limit: opt.maxLimit,
            potential: opt.maxLimit - opt.currentUtilization
          };
        } else if (opt.section === '80D') {
          taxOptimization.section80D = {
            current: opt.currentUtilization,
            limit: opt.maxLimit,
            potential: opt.maxLimit - opt.currentUtilization
          };
        }
      });

      return {
        summary: {
          totalTransactions: aiTransactions.length,
          totalIncome,
          totalExpenses,
          netSavings,
          savingsRate: parseFloat(savingsRate.toFixed(1)),
          filesProcessed: uploadedFiles.length
        },
        patterns,
        categories,
        insights,
        taxOptimization,
        cibilFactors, // Additional AI analysis
        financialPatterns // Raw pattern data for advanced views
      };
    } catch (error) {
      console.error('AI Analysis Error:', error);
      // Fallback to basic analysis if AI service fails
      return await basicTransactionAnalysis(transactions);
    }
  };

  // Fallback basic analysis for error handling
  const basicTransactionAnalysis = async (transactions: any[]): Promise<AIAnalysisResult> => {
    const totalIncome = transactions
      .filter(t => t.transaction_type === 'credit')
      .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount) || 0), 0);
    const totalExpenses = transactions
      .filter(t => t.transaction_type === 'debit')
      .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount) || 0), 0);
    const netSavings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;
    
    // Basic categorization
    const categories: { [key: string]: number } = {};
    const patterns: { [key: string]: any } = {
      salary: { count: 0, amount: 0, transactions: [] },
      emi: { count: 0, amount: 0, transactions: [] },
      utilities: { count: 0, amount: 0, transactions: [] },
      others: { count: 0, amount: 0, transactions: [] }
    };
    
    transactions.forEach(txn => {
      const amount = Math.abs(parseFloat(txn.amount) || 0);
      const category = txn.category || 'Others';
      categories[category] = (categories[category] || 0) + amount;
      
      // Basic pattern mapping
      const patternKey = category.toLowerCase().includes('salary') ? 'salary' :
                         category.toLowerCase().includes('emi') ? 'emi' :
                         category.toLowerCase().includes('electric') || category.toLowerCase().includes('water') ? 'utilities' :
                         'others';
      
      patterns[patternKey].count++;
      patterns[patternKey].amount += amount;
      patterns[patternKey].transactions.push(txn);
    });
    
    return {
      summary: {
        totalTransactions: transactions.length,
        totalIncome,
        totalExpenses,
        netSavings,
        savingsRate: parseFloat(savingsRate.toFixed(1)),
        filesProcessed: uploadedFiles.length
      },
      patterns,
      categories,
      insights: [
        {
          type: savingsRate > 20 ? 'positive' : savingsRate > 10 ? 'warning' : 'critical',
          title: 'Savings Analysis',
          description: `Your savings rate is ${savingsRate.toFixed(1)}%`,
          impact: savingsRate > 20 ? 'Good financial health' : 'Needs improvement',
          priority: savingsRate < 10 ? 'high' : 'medium'
        }
      ],
      taxOptimization: {
        section80C: { current: 0, limit: 150000, potential: 150000 },
        section80D: { current: 0, limit: 25000, potential: 25000 }
      }
    };
  };

  const processFiles = async (files: File[]) => {
    if (!user || !session?.access_token) {
      toast.error("Please log in to upload files");
      return;
    }
    
    const validFiles = files.filter(isValidFileType);
    
    if (validFiles.length === 0) {
      toast.error("Please upload valid files: Bank statements (PDF), Credit card bills, or CSV files");
      return;
    }
    
    setUploadedFiles(validFiles);
    setIsProcessing(true);
    setUploadProgress({});
    setProcessingError(null);
    
    try {
      const processedFiles: ProcessedFile[] = [];
      
      // Process each file with real backend API
      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        const fileId = `file_${Date.now()}_${i}`;
        
        setUploadProgress(prev => ({ ...prev, [file.name]: 10 }));
        
        try {
          // Step 1: Upload file to backend
          const formData = new FormData();
          formData.append('file', file);
          formData.append('user_id', user.id);
          formData.append('file_type', determineFileType(file));
          
          setUploadProgress(prev => ({ ...prev, [file.name]: 30 }));
          
          const uploadResponse = await fetch(`${API_CONFIG.BASE_URL}/api/data/upload`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session.access_token}`
            },
            body: formData
          });
          
          if (!uploadResponse.ok) {
            throw new Error(`Upload failed: ${uploadResponse.statusText}`);
          }
          
          const uploadResult = await uploadResponse.json();
          setUploadProgress(prev => ({ ...prev, [file.name]: 60 }));
          
          // Step 2: Wait for processing completion
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          setUploadProgress(prev => ({ ...prev, [file.name]: 80 }));
          
          processedFiles.push({
            id: uploadResult.file_id || fileId,
            name: file.name,
            size: file.size,
            type: determineFileType(file),
            processingStage: 'completed'
          });
          
          setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
        } catch (fileError: any) {
          console.error(`Error processing file ${file.name}:`, fileError);
          setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
          
          // Continue with other files even if one fails
          processedFiles.push({
            id: fileId,
            name: file.name,
            size: file.size,
            type: determineFileType(file),
            processingStage: 'error'
          });
        }
      }
      
      // Step 3: Fetch transactions and analyze with AI
      if (processedFiles.some(f => f.processingStage === 'completed')) {
        try {
          const transactionsResponse = await fetch(
            `${API_CONFIG.BASE_URL}/api/data/transactions/${user.id}?per_page=1000`,
            {
              headers: API_CONFIG.getAuthHeaders(session.access_token)
            }
          );
          
          if (transactionsResponse.ok) {
            const transactionsData = await transactionsResponse.json();
            const transactions = transactionsData.transactions || [];
            
            // Perform AI analysis on the real transaction data
            const analysis = await analyzeTransactionsWithAI(transactions);
            setTransactionAnalysis(analysis);
            
            toast.success(`Successfully analyzed ${validFiles.length} file(s)!`, {
              description: `Identified ${analysis.summary.totalTransactions} transactions with AI-powered categorization`
            });
          } else {
            throw new Error('Failed to fetch transaction data');
          }
        } catch (analysisError: any) {
          console.error('AI analysis error:', analysisError);
          toast.error('Files uploaded but analysis failed', {
            description: 'Files were processed but AI analysis encountered an error'
          });
        }
      }
      
      setIsProcessed(true);
    } catch (error: any) {
      console.error("File processing error:", error);
      setProcessingError(error.message || "Failed to process files");
      toast.error("Failed to process files", {
        description: error.message || "Please try again with valid financial documents"
      });
    } finally {
      setIsProcessing(false);
      setUploadProgress({});
    }
  };

  const determineFileType = (file: File): string => {
    const fileName = file.name.toLowerCase();
    if (fileName.includes('bank') || fileName.includes('statement')) {
      return 'bank_statement';
    } else if (fileName.includes('credit') || fileName.includes('card')) {
      return 'credit_card';
    } else {
      return 'csv';
    }
  };
  
  const handleFileUpload = () => {
    if (!user) {
      window.dispatchEvent(new CustomEvent("openAuthModal"));
      return;
    }
    fileInputRef.current?.click();
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      processFiles(files);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (!user) {
      window.dispatchEvent(new CustomEvent("openAuthModal"));
      return;
    }
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processFiles(files);
    }
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const resetUpload = () => {
    setIsProcessed(false);
    setUploadedFiles([]);
    setTransactionAnalysis(null);
    setProcessingError(null);
  };

  return (
    <section id="upload" className="py-16 lg:py-24 bg-lavender/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-wine mb-4">
            Smart Financial Data Upload
          </h2>
          <p className="text-xl text-wine/70 max-w-2xl mx-auto">
            Upload your financial documents and get AI-powered transaction analysis with tax optimization insights.
          </p>
        </div>
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Upload Area */}
          <Card className="border border-wine/20">
            <CardHeader>
              <CardTitle className="text-wine flex items-center gap-2">
                <Upload size={24} />
                Upload Financial Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                  isDragOver 
                    ? "border-plum bg-plum/5" 
                    : isProcessed 
                      ? "border-green-300 bg-green-50" 
                      : processingError
                        ? "border-red-300 bg-red-50"
                        : "border-wine/30 hover:border-wine/50"
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                {!user ? (
                  <div className="space-y-4">
                    <Upload size={48} className="text-wine/60 mx-auto" />
                    <p className="text-wine/70">Please log in to upload files</p>
                    <Button 
                      onClick={() => window.dispatchEvent(new CustomEvent("openAuthModal"))}
                      className="bg-plum hover:bg-plum/90 text-white"
                    >
                      Login to Continue
                    </Button>
                  </div>
                ) : processingError ? (
                  <div className="space-y-4">
                    <X size={48} className="text-red-600 mx-auto" />
                    <p className="text-red-700 font-medium">Failed to process files</p>
                    <p className="text-sm text-red-600">{processingError}</p>
                    <Button onClick={resetUpload} className="bg-plum hover:bg-plum/90 text-white">
                      Try Again
                    </Button>
                  </div>
                ) : isProcessing ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-3">
                      <Brain size={48} className="text-plum animate-pulse" />
                      <Zap size={24} className="text-wine animate-bounce" />
                    </div>
                    <p className="text-wine/70 font-medium">AI is analyzing your financial documents...</p>
                    <p className="text-sm text-wine/60">Our AI engine is extracting transactions, identifying patterns, and generating personalized insights</p>
                    
                    {Object.entries(uploadProgress).map(([fileName, progress]) => (
                      <div key={fileName} className="space-y-2">
                        <div className="flex justify-between text-xs text-wine/60">
                          <span className="font-medium">{fileName}</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <div className="text-xs text-wine/50">
                          {progress < 20 ? '📄 Extracting transaction data...' :
                           progress < 40 ? '🧠 AI parsing financial patterns...' :
                           progress < 60 ? '🔍 Analyzing spending behavior...' :
                           progress < 80 ? '💡 Calculating tax optimization...' :
                           progress < 95 ? '✨ Generating personalized insights...' : 
                           '✅ AI analysis complete!'}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : isProcessed ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle2 size={48} className="text-green-600" />
                      <Brain size={24} className="text-plum" />
                    </div>
                    <p className="text-green-700 font-medium">AI Analysis Complete!</p>
                    <div className="text-sm text-wine/60 space-y-1">
                      <p>📊 {uploadedFiles.length} file(s) processed</p>
                      <p>🔢 {transactionAnalysis?.summary.totalTransactions || 0} transactions analyzed</p>
                      <p>🧠 {transactionAnalysis ? Object.keys(transactionAnalysis.patterns || {}).filter(k => transactionAnalysis.patterns?.[k]?.count > 0).length : 0} patterns identified</p>
                      <p>💡 {transactionAnalysis?.insights.length || 0} AI insights generated</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={resetUpload}
                      className="border-wine/30 text-wine/70 hover:bg-wine/5"
                    >
                      Upload More Files
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-3">
                      <Upload size={48} className="text-wine/60" />
                      <Brain size={32} className="text-plum" />
                    </div>
                    <p className="text-wine/70 font-medium">
                      Upload your financial documents for AI-powered analysis
                    </p>
                    <div className="text-sm text-wine/60 space-y-1">
                      <p>🧠 AI automatically extracts and categorizes transactions</p>
                      <p>📊 Identifies spending patterns and investment habits</p>
                      <p>💡 Provides personalized tax optimization suggestions</p>
                      <p>📈 Generates CIBIL improvement recommendations</p>
                    </div>
                    <p className="text-xs text-wine/50">
                      Supports: Bank statements (PDF), Credit card bills, CSV files
                    </p>
                    <Button 
                      onClick={handleFileUpload}
                      className="bg-plum hover:bg-plum/90 text-white"
                    >
                      <Brain size={16} className="mr-2" />
                      Start AI Analysis
                    </Button>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.csv,.xls,.xlsx"
                onChange={handleFileSelect}
                className="hidden"
              />
            </CardContent>
          </Card>
          
          {/* Transaction Analysis Results */}
          <Card className="border border-wine/20">
            <CardHeader>
              <CardTitle className="text-wine flex items-center gap-2">
                <Brain size={24} />
                AI-Powered Transaction Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isProcessing ? (
                <div className="text-center py-12">
                  <Loader2 size={48} className="text-plum mx-auto animate-spin mb-4" />
                  <p className="text-wine/70">Analyzing transaction patterns...</p>
                </div>
              ) : transactionAnalysis ? (
                <div className="space-y-6">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp size={20} className="text-green-600" />
                        <span className="text-sm font-medium text-green-800">Total Income</span>
                      </div>
                      <div className="text-xl font-bold text-green-900">
                        ₹{transactionAnalysis.summary.totalIncome.toLocaleString()}
                      </div>
                    </div>
                    
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingDown size={20} className="text-red-600" />
                        <span className="text-sm font-medium text-red-800">Total Expenses</span>
                      </div>
                      <div className="text-xl font-bold text-red-900">
                        ₹{transactionAnalysis.summary.totalExpenses.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  {/* Analysis Tabs */}
                  <div className="border-b border-wine/20">
                    <div className="flex space-x-8">
                      {(["patterns", "categories", "insights"] as const).map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setAnalysisTab(tab)}
                          className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            analysisTab === tab
                              ? "border-plum text-plum"
                              : "border-transparent text-wine/60 hover:text-wine/80"
                          }`}
                        >
                          {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Tab Content */}
                  <AnimatePresence mode="wait">
                    {analysisTab === "patterns" && (
                      <motion.div
                        key="patterns"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4"
                      >
                        <div className="space-y-3">
                          {Object.entries(transactionAnalysis.patterns).map(([pattern, data]: [string, any]) => (
                            data.count > 0 && (
                              <div key={pattern} className="flex items-center justify-between p-3 bg-wine/5 rounded-lg">
                                <div>
                                  <div className="font-medium text-wine">
                                    {pattern.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                                  </div>
                                  <div className="text-sm text-wine/60">
                                    {data.count} transaction{data.count > 1 ? "s" : ""}
                                    {data.emiToIncomeRatio && ` • ${data.emiToIncomeRatio}% of income`}
                                    {data.investmentRate && ` • ${data.investmentRate}% investment rate`}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold text-wine">
                                    ₹{Math.abs(data.amount).toLocaleString()}
                                  </div>
                                </div>
                              </div>
                            )
                          ))}
                        </div>
                      </motion.div>
                    )}
                    {analysisTab === "categories" && (
                      <motion.div
                        key="categories"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4"
                      >
                        {Object.entries(transactionAnalysis.categories).map(([category, amount]: [string, any]) => {
                          const percentage = ((amount / transactionAnalysis.summary.totalExpenses) * 100).toFixed(1);
                          return (
                            <div key={category} className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-wine">{category}</span>
                                <span className="text-sm text-wine/60">{percentage}%</span>
                              </div>
                              <Progress value={parseFloat(percentage)} className="h-2" />
                              <div className="text-right text-sm font-medium text-wine">
                                ₹{amount.toLocaleString()}
                              </div>
                            </div>
                          );
                        })}
                      </motion.div>
                    )}
                    {analysisTab === "insights" && (
                      <motion.div
                        key="insights"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4"
                      >
                        {transactionAnalysis.insights.map((insight: any, index: number) => {
                          const getInsightStyles = (type: string) => {
                            switch (type) {
                              case 'positive':
                                return {
                                  bg: 'bg-green-50 border-green-200',
                                  iconBg: 'bg-green-100',
                                  icon: <CheckCircle2 size={16} className="text-green-600" />,
                                  titleColor: 'text-green-800',
                                  descColor: 'text-green-700',
                                  impactColor: 'text-green-600'
                                };
                              case 'warning':
                                return {
                                  bg: 'bg-yellow-50 border-yellow-200',
                                  iconBg: 'bg-yellow-100',
                                  icon: <AlertTriangle size={16} className="text-yellow-600" />,
                                  titleColor: 'text-yellow-800',
                                  descColor: 'text-yellow-700',
                                  impactColor: 'text-yellow-600'
                                };
                              case 'critical':
                                return {
                                  bg: 'bg-red-50 border-red-200',
                                  iconBg: 'bg-red-100',
                                  icon: <X size={16} className="text-red-600" />,
                                  titleColor: 'text-red-800',
                                  descColor: 'text-red-700',
                                  impactColor: 'text-red-600'
                                };
                              default:
                                return {
                                  bg: 'bg-blue-50 border-blue-200',
                                  iconBg: 'bg-blue-100',
                                  icon: <Info size={16} className="text-blue-600" />,
                                  titleColor: 'text-blue-800',
                                  descColor: 'text-blue-700',
                                  impactColor: 'text-blue-600'
                                };
                            }
                          };
                          
                          const styles = getInsightStyles(insight.type);
                          
                          return (
                            <div key={index} className={`p-4 rounded-lg border ${styles.bg}`}>
                              <div className="flex items-start gap-3">
                                <div className={`p-1 rounded-full ${styles.iconBg}`}>
                                  {styles.icon}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-2">
                                    <h4 className={`font-medium ${styles.titleColor}`}>
                                      {insight.title}
                                    </h4>
                                    {insight.priority && (
                                      <Badge
                                        variant="outline"
                                        className={`text-xs ${
                                          insight.priority === 'high' ? 'border-red-300 text-red-700' :
                                          insight.priority === 'medium' ? 'border-yellow-300 text-yellow-700' :
                                          'border-gray-300 text-gray-700'
                                        }`}
                                      >
                                        {insight.priority} priority
                                      </Badge>
                                    )}
                                  </div>
                                  <p className={`text-sm mb-2 ${styles.descColor}`}>
                                    {insight.description}
                                  </p>
                                  <p className={`text-xs mb-3 ${styles.impactColor}`}>
                                    💡 {insight.impact}
                                  </p>
                                  {insight.recommendations && insight.recommendations.length > 0 && (
                                    <div className="mt-3">
                                      <p className={`text-xs font-medium mb-2 ${styles.titleColor}`}>
                                        🎯 Recommendations:
                                      </p>
                                      <ul className={`text-xs space-y-1 ${styles.descColor}`}>
                                        {insight.recommendations.slice(0, 3).map((rec: string, recIndex: number) => (
                                          <li key={recIndex} className="flex items-start gap-1">
                                            <span className="text-[10px] mt-0.5">•</span>
                                            <span>{rec}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="text-center py-12 text-wine/60">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <PieChart size={48} className="opacity-50" />
                    <Brain size={32} className="opacity-50" />
                  </div>
                  <p className="mb-2 font-medium">Ready for AI Analysis</p>
                  <p className="text-sm">Upload your financial documents to unlock:</p>
                  <div className="text-xs mt-2 space-y-1">
                    <p>🔍 Smart transaction categorization</p>
                    <p>📈 Spending pattern recognition</p>
                    <p>💰 Tax optimization opportunities</p>
                    <p>🎯 Personalized financial insights</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Tax Optimization Section */}
        {transactionAnalysis && (
          <Card className="border border-wine/20">
            <CardHeader>
              <CardTitle className="text-wine flex items-center gap-2">
                <Target size={24} />
                <Brain size={20} className="text-plum" />
                AI Tax Optimization Engine
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-4">Section 80C</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-700">Current Investment</span>
                      <span className="font-medium text-blue-900">₹{transactionAnalysis.taxOptimization.section80C.current.toLocaleString()}</span>
                    </div>
                    <Progress 
                      value={(transactionAnalysis.taxOptimization.section80C.current / transactionAnalysis.taxOptimization.section80C.limit) * 100} 
                      className="h-2" 
                    />
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-700">Limit</span>
                      <span className="font-medium text-blue-900">₹{transactionAnalysis.taxOptimization.section80C.limit.toLocaleString()}</span>
                    </div>
                    {transactionAnalysis.taxOptimization.section80C.potential > 0 && (
                      <div className="mt-3 p-3 bg-blue-100 rounded-lg">
                        <p className="text-xs text-blue-800">
                          💡 You can save additional ₹{(transactionAnalysis.taxOptimization.section80C.potential * 0.3).toLocaleString()} in taxes by investing ₹{transactionAnalysis.taxOptimization.section80C.potential.toLocaleString()} more
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-green-900 mb-4">Section 80D (Health)</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-green-700">Current Premium</span>
                      <span className="font-medium text-green-900">₹{transactionAnalysis.taxOptimization.section80D.current.toLocaleString()}</span>
                    </div>
                    <Progress 
                      value={(transactionAnalysis.taxOptimization.section80D.current / transactionAnalysis.taxOptimization.section80D.limit) * 100} 
                      className="h-2" 
                    />
                    <div className="flex justify-between text-sm">
                      <span className="text-green-700">Limit</span>
                      <span className="font-medium text-green-900">₹{transactionAnalysis.taxOptimization.section80D.limit.toLocaleString()}</span>
                    </div>
                    {transactionAnalysis.taxOptimization.section80D.potential > 0 && (
                      <div className="mt-3 p-3 bg-green-100 rounded-lg">
                        <p className="text-xs text-green-800">
                          💚 Consider additional health coverage for ₹{(transactionAnalysis.taxOptimization.section80D.potential * 0.3).toLocaleString()} tax savings
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
}