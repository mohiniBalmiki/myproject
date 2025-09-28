// Comprehensive Integration Service for TaxWise Platform
// Connects AI services with backend data and provides unified functionality

import { LLMService, FinancialContext } from './llmService';
import { MLService } from './mlService';
import { AIAnalysisService, Transaction } from './aiAnalysisService';
import { DatabaseAPI, API_CONFIG } from './supabase/client';

export interface IntegratedAnalysisResult {
  summary: {
    totalTransactions: number;
    totalIncome: number;
    totalExpenses: number;
    netSavings: number;
    savingsRate: number;
    financialHealthScore: number;
    lastUpdated: Date;
  };
  aiInsights: {
    llmInsights: any[];
    mlPredictions: any;
    traditionalInsights: any[];
    combinedRecommendations: string[];
    confidenceScore: number;
  };
  categorization: {
    improved: { [transactionId: string]: string };
    suggestions: { [transactionId: string]: any };
    accuracyScore: number;
  };
  patterns: {
    spending: any;
    income: any;
    savings: any;
    investments: any;
    anomalies: any[];
  };
  taxOptimization: {
    currentUtilization: any;
    recommendations: any[];
    potentialSavings: number;
    actionPlan: string[];
  };
  predictions: {
    futureSpending: any;
    trendAnalysis: any;
    riskFactors: string[];
  };
  performance: {
    modelMetrics: any;
    processingTime: number;
    dataQuality: number;
  };
}

export class IntegrationService {
  private static isInitialized = false;
  private static cache = new Map<string, any>();
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Initialize all AI services
   */
  static async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('🤖 Initializing AI Integration Service...');
      
      await Promise.all([
        LLMService.initialize(),
        MLService.initialize()
      ]);

      this.isInitialized = true;
      console.log('✅ AI Integration Service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize AI Integration Service:', error);
      throw error;
    }
  }

  /**
   * Comprehensive financial analysis using all AI services
   */
  static async performComprehensiveAnalysis(
    userId: string,
    accessToken: string,
    forceRefresh = false
  ): Promise<IntegratedAnalysisResult> {
    await this.initialize();

    const cacheKey = `analysis_${userId}`;
    
    // Check cache first
    if (!forceRefresh && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.CACHE_DURATION) {
        console.log('📋 Returning cached analysis results');
        return cached.data;
      }
    }

    console.log('🔄 Starting comprehensive financial analysis...');
    const startTime = Date.now();

    try {
      // 1. Fetch transaction data from backend
      console.log('📊 Fetching transaction data...');
      const transactionsResponse = await fetch(
        `${API_CONFIG.BASE_URL}/api/data/transactions/${userId}?per_page=1000`,
        {
          headers: API_CONFIG.getAuthHeaders(accessToken)
        }
      );

      if (!transactionsResponse.ok) {
        throw new Error('Failed to fetch transaction data');
      }

      const transactionsData = await transactionsResponse.json();
      const rawTransactions = transactionsData.transactions || [];

      // Convert to standardized format
      const transactions: Transaction[] = rawTransactions.map((txn: any) => ({
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

      console.log(`📈 Processing ${transactions.length} transactions...`);

      // 2. Calculate basic metrics
      const totalIncome = transactions
        .filter(t => t.transaction_type === 'credit')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const totalExpenses = transactions
        .filter(t => t.transaction_type === 'debit')
        .reduce((sum, t) => sum + t.amount, 0);

      const netSavings = totalIncome - totalExpenses;
      const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

      // 3. Traditional AI Analysis
      console.log('🧠 Running traditional AI analysis...');
      const financialPatterns = AIAnalysisService.analyzeSpendingPatterns(transactions);
      const traditionalInsights = AIAnalysisService.generateAIInsights(transactions, financialPatterns);
      const taxOptimization = AIAnalysisService.generateTaxOptimization(transactions);
      const cibilFactors = AIAnalysisService.analyzeCIBILFactors(transactions, financialPatterns);

      // 4. ML-Powered Analysis
      console.log('🤖 Running ML analysis...');
      const mlPromises = [
        MLService.categorizeTransactionsBatch(
          transactions.map(t => ({ id: t.id, description: t.description, amount: t.amount }))
        ),
        MLService.analyzeSpendingPatternsML(transactions),
        MLService.predictFutureSpending(transactions, 6),
        MLService.detectFraudulentTransactions(transactions),
        MLService.getModelMetrics()
      ];

      const [mlPredictions, mlPatterns, futureSpending, fraudDetection, modelMetrics] = 
        await Promise.all(mlPromises);

      // 5. LLM-Powered Insights
      console.log('💭 Generating LLM insights...');
      const financialContext: FinancialContext = {
        totalIncome,
        totalExpenses,
        savingsRate,
        categories: this.calculateCategoryBreakdown(transactions),
        patterns: financialPatterns,
        demographics: {},
        goals: ['Tax Optimization', 'Wealth Building', 'Financial Security']
      };

      const llmInsights = await LLMService.generatePersonalizedInsights(financialContext);

      // 6. Calculate financial health score
      const financialHealthScore = this.calculateFinancialHealthScore({
        savingsRate,
        incomeStability: this.calculateIncomeStability(transactions),
        expenseControl: this.calculateExpenseControl(transactions),
        investmentRate: this.calculateInvestmentRate(transactions, totalIncome),
        debtRatio: this.calculateDebtRatio(transactions, totalIncome)
      });

      // 7. Enhanced categorization with ML suggestions
      const categorization = this.generateCategorizationSuggestions(transactions, mlPredictions);

      // 8. Combined recommendations
      const combinedRecommendations = this.generateCombinedRecommendations(
        traditionalInsights,
        llmInsights,
        mlPatterns,
        taxOptimization
      );

      // 9. Risk analysis and predictions
      const predictions = {
        futureSpending,
        trendAnalysis: this.analyzeTrends(transactions, mlPatterns),
        riskFactors: this.identifyRiskFactors(transactions, fraudDetection, mlPatterns)
      };

      // 10. Performance metrics
      const processingTime = Date.now() - startTime;
      const dataQuality = this.assessDataQuality(transactions);
      const confidenceScore = this.calculateOverallConfidence(modelMetrics, dataQuality, transactions.length);

      const result: IntegratedAnalysisResult = {
        summary: {
          totalTransactions: transactions.length,
          totalIncome,
          totalExpenses,
          netSavings,
          savingsRate,
          financialHealthScore,
          lastUpdated: new Date()
        },
        aiInsights: {
          llmInsights,
          mlPredictions,
          traditionalInsights,
          combinedRecommendations,
          confidenceScore
        },
        categorization,
        patterns: {
          spending: mlPatterns,
          income: this.analyzeIncomePatterns(transactions),
          savings: this.analyzeSavingsPatterns(transactions),
          investments: this.analyzeInvestmentPatterns(transactions),
          anomalies: (fraudDetection as any).suspicious || []
        },
        taxOptimization: {
          currentUtilization: this.calculateCurrentTaxUtilization(taxOptimization),
          recommendations: taxOptimization,
          potentialSavings: taxOptimization.reduce((sum: number, opt: any) => sum + opt.potentialSavings, 0),
          actionPlan: this.generateTaxActionPlan(taxOptimization)
        },
        predictions,
        performance: {
          modelMetrics,
          processingTime,
          dataQuality
        }
      };

      // Cache the result
      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });

      console.log(`✅ Analysis completed in ${processingTime}ms`);
      return result;

    } catch (error) {
      console.error('❌ Comprehensive analysis failed:', error);
      throw error;
    }
  }

  /**
   * Update transaction category with ML feedback
   */
  static async updateTransactionCategory(
    transactionId: string,
    newCategory: string,
    userId: string,
    accessToken: string
  ): Promise<void> {
    try {
      // Update in backend
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/api/data/transactions/${transactionId}`,
        {
          method: 'PATCH',
          headers: {
            ...API_CONFIG.getAuthHeaders(accessToken),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ category: newCategory })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update transaction category');
      }

      // Provide feedback to ML model
      const transaction = await this.getTransactionById(transactionId, userId, accessToken);
      if (transaction) {
        await MLService.learnFromFeedback(
          transactionId,
          transaction.category,
          newCategory,
          { description: transaction.description, amount: transaction.amount }
        );
      }

      // Invalidate cache
      this.cache.delete(`analysis_${userId}`);

    } catch (error) {
      console.error('Failed to update transaction category:', error);
      throw error;
    }
  }

  /**
   * Generate real-time insights for dashboard
   */
  static async generateDashboardInsights(
    userId: string,
    accessToken: string
  ): Promise<any[]> {
    try {
      const analysis = await this.performComprehensiveAnalysis(userId, accessToken);
      
      const insights = [];

      // Financial health insight
      if (analysis.summary.financialHealthScore > 80) {
        insights.push({
          type: 'financial',
          message: `Excellent financial health score of ${analysis.summary.financialHealthScore}/100!`,
          impact: 'low',
          action_required: false
        });
      } else if (analysis.summary.financialHealthScore < 60) {
        insights.push({
          type: 'financial',
          message: `Your financial health score is ${analysis.summary.financialHealthScore}/100. Let's improve it!`,
          impact: 'high',
          action_required: true
        });
      }

      // Savings rate insight
      if (analysis.summary.savingsRate > 30) {
        insights.push({
          type: 'savings',
          message: `Outstanding ${analysis.summary.savingsRate.toFixed(1)}% savings rate! Consider increasing investments.`,
          impact: 'medium',
          action_required: false
        });
      } else if (analysis.summary.savingsRate < 10) {
        insights.push({
          type: 'savings',
          message: `Low savings rate of ${analysis.summary.savingsRate.toFixed(1)}%. Review your expenses urgently.`,
          impact: 'high',
          action_required: true
        });
      }

      // Tax optimization insight
      if (analysis.taxOptimization.potentialSavings > 25000) {
        insights.push({
          type: 'tax',
          message: `You could save ₹${analysis.taxOptimization.potentialSavings.toLocaleString()} in taxes this year!`,
          impact: 'high',
          action_required: true
        });
      }

      // ML-powered anomaly detection
      if (analysis.patterns.anomalies.length > 0) {
        insights.push({
          type: 'security',
          message: `Found ${analysis.patterns.anomalies.length} unusual transaction(s). Please review for security.`,
          impact: 'high',
          action_required: true
        });
      }

      return insights.slice(0, 5); // Limit to 5 insights

    } catch (error) {
      console.error('Failed to generate dashboard insights:', error);
      return [];
    }
  }

  // Private helper methods

  private static calculateCategoryBreakdown(transactions: Transaction[]): { [key: string]: number } {
    const breakdown: { [key: string]: number } = {};
    transactions.forEach(txn => {
      const category = txn.category;
      if (!breakdown[category]) {
        breakdown[category] = 0;
      }
      breakdown[category] += txn.amount;
    });
    return breakdown;
  }

  private static calculateFinancialHealthScore(factors: {
    savingsRate: number;
    incomeStability: number;
    expenseControl: number;
    investmentRate: number;
    debtRatio: number;
  }): number {
    const weights = {
      savingsRate: 0.3,
      incomeStability: 0.2,
      expenseControl: 0.2,
      investmentRate: 0.2,
      debtRatio: 0.1
    };

    // Normalize scores to 0-100 scale
    const normalizedScores = {
      savingsRate: Math.min(100, Math.max(0, (factors.savingsRate / 30) * 100)),
      incomeStability: factors.incomeStability,
      expenseControl: factors.expenseControl,
      investmentRate: Math.min(100, (factors.investmentRate / 20) * 100),
      debtRatio: Math.max(0, 100 - (factors.debtRatio * 2)) // Lower debt ratio is better
    };

    const score = Object.entries(weights).reduce((total, [key, weight]) => {
      return total + (normalizedScores[key as keyof typeof normalizedScores] * weight);
    }, 0);

    return Math.round(score);
  }

  private static calculateIncomeStability(transactions: Transaction[]): number {
    const incomeTransactions = transactions.filter(t => t.transaction_type === 'credit');
    if (incomeTransactions.length < 3) return 50;

    const amounts = incomeTransactions.map(t => t.amount);
    const avg = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length;
    const variance = amounts.reduce((sum, amt) => sum + Math.pow(amt - avg, 2), 0) / amounts.length;
    const coefficientOfVariation = Math.sqrt(variance) / avg;

    return Math.max(0, Math.min(100, (1 - coefficientOfVariation) * 100));
  }

  private static calculateExpenseControl(transactions: Transaction[]): number {
    const expenseTransactions = transactions.filter(t => t.transaction_type === 'debit');
    if (expenseTransactions.length < 5) return 50;

    const monthlyExpenses = this.groupTransactionsByMonth(expenseTransactions);
    const monthlyAmounts = Object.values(monthlyExpenses);
    
    if (monthlyAmounts.length < 2) return 50;

    const trend = this.calculateTrendDirection(monthlyAmounts);
    if (trend === 'decreasing') return 85;
    if (trend === 'stable') return 70;
    return 45;
  }

  private static calculateInvestmentRate(transactions: Transaction[], totalIncome: number): number {
    const investmentTransactions = transactions.filter(t => 
      t.category.toLowerCase().includes('sip') ||
      t.category.toLowerCase().includes('mutual') ||
      t.category.toLowerCase().includes('investment') ||
      t.category.toLowerCase().includes('equity')
    );

    const totalInvestments = investmentTransactions.reduce((sum, t) => sum + t.amount, 0);
    return totalIncome > 0 ? (totalInvestments / totalIncome) * 100 : 0;
  }

  private static calculateDebtRatio(transactions: Transaction[], totalIncome: number): number {
    const debtTransactions = transactions.filter(t => 
      t.category.toLowerCase().includes('emi') ||
      t.category.toLowerCase().includes('loan') ||
      t.category.toLowerCase().includes('credit')
    );

    const totalDebt = debtTransactions.reduce((sum, t) => sum + t.amount, 0);
    return totalIncome > 0 ? (totalDebt / totalIncome) * 100 : 0;
  }

  private static generateCategorizationSuggestions(
    transactions: Transaction[],
    mlPredictions: any
  ): { improved: { [transactionId: string]: string }, suggestions: any, accuracyScore: number } {
    const improved: { [transactionId: string]: string } = {};
    const suggestions: { [transactionId: string]: any } = {};
    let correctPredictions = 0;

    Object.entries(mlPredictions).forEach(([transactionId, prediction]: [string, any]) => {
      if (prediction.confidence > 0.8) {
        const transaction = transactions.find(t => t.id === transactionId);
        if (transaction && transaction.category !== prediction.category) {
          improved[transactionId] = prediction.category;
          suggestions[transactionId] = prediction;
        }
      }

      if (prediction.confidence > 0.7) {
        correctPredictions++;
      }
    });

    const accuracyScore = (correctPredictions / Object.keys(mlPredictions).length) * 100;

    return { improved, suggestions, accuracyScore };
  }

  private static generateCombinedRecommendations(
    traditionalInsights: any[],
    llmInsights: any[],
    mlPatterns: any,
    taxOptimization: any[]
  ): string[] {
    const recommendations = new Set<string>();

    // Add traditional recommendations
    traditionalInsights.forEach((insight: any) => {
      if (insight.recommendations) {
        insight.recommendations.forEach((rec: string) => recommendations.add(rec));
      }
    });

    // Add LLM recommendations
    llmInsights.forEach((insight: any) => {
      if (insight.actionableSteps) {
        insight.actionableSteps.forEach((step: string) => recommendations.add(step));
      }
    });

    // Add tax optimization recommendations
    taxOptimization.forEach((opt: any) => {
      if (opt.recommendations) {
        opt.recommendations.forEach((rec: string) => recommendations.add(rec));
      }
    });

    // Add ML-based recommendations
    if (mlPatterns.trends) {
      mlPatterns.trends.forEach((trend: any) => {
        if (trend.trend === 'increasing' && trend.category.toLowerCase().includes('expense')) {
          recommendations.add(`Monitor and control ${trend.category} expenses - showing increasing trend`);
        }
      });
    }

    return Array.from(recommendations).slice(0, 10);
  }

  private static analyzeTrends(transactions: Transaction[], mlPatterns: any): any {
    const monthlyData = this.groupTransactionsByMonth(transactions);
    const trends = {
      income: this.calculateTrendDirection(Object.values(this.groupIncomeByMonth(transactions))),
      expenses: this.calculateTrendDirection(Object.values(this.groupExpensesByMonth(transactions))),
      savings: 'stable'
    };

    return trends;
  }

  private static identifyRiskFactors(transactions: Transaction[], fraudDetection: any, mlPatterns: any): string[] {
    const risks = [];

    if (fraudDetection.suspicious.length > 0) {
      risks.push(`${fraudDetection.suspicious.length} suspicious transactions detected`);
    }

    if (mlPatterns.anomalies && mlPatterns.anomalies.length > 0) {
      risks.push(`${mlPatterns.anomalies.length} spending anomalies identified`);
    }

    const highValueTransactions = transactions.filter(t => t.amount > 100000);
    if (highValueTransactions.length > 5) {
      risks.push('High frequency of large transactions');
    }

    return risks;
  }

  private static calculateCurrentTaxUtilization(taxOptimization: any[]): any {
    const utilization: any = {};
    
    taxOptimization.forEach(opt => {
      utilization[opt.section] = {
        current: opt.currentUtilization,
        limit: opt.maxLimit,
        percentage: (opt.currentUtilization / opt.maxLimit) * 100
      };
    });

    return utilization;
  }

  private static generateTaxActionPlan(taxOptimization: any[]): string[] {
    const actionPlan: string[] = [];

    taxOptimization
      .filter(opt => opt.priority === 'high')
      .forEach(opt => {
        actionPlan.push(`Maximize ${opt.section} deductions - potential savings: ₹${opt.potentialSavings.toLocaleString()}`);
        if (opt.recommendations && opt.recommendations.length > 0) {
          actionPlan.push(opt.recommendations[0]);
        }
      });

    return actionPlan.slice(0, 5);
  }

  private static calculateOverallConfidence(modelMetrics: any, dataQuality: number, transactionCount: number): number {
    let confidence = 0;

    // Model performance (40%)
    if (modelMetrics) {
      confidence += (modelMetrics.accuracy || 0.8) * 40;
    } else {
      confidence += 32; // Default 80% accuracy
    }

    // Data quality (30%)
    confidence += dataQuality * 30;

    // Sample size (30%)
    const sampleSizeScore = Math.min(1, transactionCount / 100); // 100 transactions = 100% score
    confidence += sampleSizeScore * 30;

    return Math.round(confidence);
  }

  private static assessDataQuality(transactions: Transaction[]): number {
    if (transactions.length === 0) return 0;

    let qualityScore = 0;
    const totalTransactions = transactions.length;

    // Check completeness
    const completeTransactions = transactions.filter(t => 
      t.description && t.description.trim() !== '' &&
      t.amount > 0 &&
      t.date &&
      t.category && t.category.trim() !== ''
    );

    qualityScore += (completeTransactions.length / totalTransactions) * 40;

    // Check category distribution
    const categories = new Set(transactions.map(t => t.category));
    const categoryDistribution = categories.size / Math.min(10, totalTransactions);
    qualityScore += Math.min(30, categoryDistribution * 30);

    // Check time span
    const dates = transactions.map(t => new Date(t.date)).sort();
    const timeSpanDays = (dates[dates.length - 1].getTime() - dates[0].getTime()) / (1000 * 60 * 60 * 24);
    const timeSpanScore = Math.min(30, (timeSpanDays / 365) * 30); // 1 year = full score
    qualityScore += timeSpanScore;

    return Math.round(qualityScore);
  }

  // Additional helper methods
  private static async getTransactionById(transactionId: string, userId: string, accessToken: string): Promise<Transaction | null> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/api/data/transactions/${userId}?transaction_id=${transactionId}`,
        {
          headers: API_CONFIG.getAuthHeaders(accessToken)
        }
      );

      if (response.ok) {
        const data = await response.json();
        return data.transaction;
      }
    } catch (error) {
      console.error('Failed to get transaction by ID:', error);
    }
    return null;
  }

  private static groupTransactionsByMonth(transactions: Transaction[]): { [month: string]: number } {
    const monthlyData: { [month: string]: number } = {};
    
    transactions.forEach(t => {
      const month = new Date(t.date).toISOString().substr(0, 7);
      if (!monthlyData[month]) monthlyData[month] = 0;
      monthlyData[month] += t.amount;
    });

    return monthlyData;
  }

  private static groupIncomeByMonth(transactions: Transaction[]): { [month: string]: number } {
    return this.groupTransactionsByMonth(transactions.filter(t => t.transaction_type === 'credit'));
  }

  private static groupExpensesByMonth(transactions: Transaction[]): { [month: string]: number } {
    return this.groupTransactionsByMonth(transactions.filter(t => t.transaction_type === 'debit'));
  }

  private static calculateTrendDirection(values: number[]): 'increasing' | 'decreasing' | 'stable' {
    if (values.length < 2) return 'stable';

    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(-Math.floor(values.length / 2));

    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;

    const change = (secondAvg - firstAvg) / firstAvg;

    if (Math.abs(change) < 0.1) return 'stable';
    return change > 0 ? 'increasing' : 'decreasing';
  }

  private static analyzeIncomePatterns(transactions: Transaction[]): any {
    const incomeTransactions = transactions.filter(t => t.transaction_type === 'credit');
    return {
      total: incomeTransactions.reduce((sum, t) => sum + t.amount, 0),
      frequency: this.calculateFrequency(incomeTransactions),
      stability: this.calculateIncomeStability(transactions)
    };
  }

  private static analyzeSavingsPatterns(transactions: Transaction[]): any {
    const totalIncome = transactions.filter(t => t.transaction_type === 'credit').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.transaction_type === 'debit').reduce((sum, t) => sum + t.amount, 0);
    
    return {
      totalSavings: totalIncome - totalExpenses,
      savingsRate: totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0,
      consistency: this.calculateSavingsConsistency(transactions)
    };
  }

  private static analyzeInvestmentPatterns(transactions: Transaction[]): any {
    const investmentTransactions = transactions.filter(t => 
      t.category.toLowerCase().includes('sip') ||
      t.category.toLowerCase().includes('mutual') ||
      t.category.toLowerCase().includes('investment')
    );

    return {
      totalInvestments: investmentTransactions.reduce((sum, t) => sum + t.amount, 0),
      frequency: this.calculateFrequency(investmentTransactions),
      diversification: new Set(investmentTransactions.map(t => t.category)).size
    };
  }

  private static calculateFrequency(transactions: Transaction[]): string {
    if (transactions.length < 2) return 'irregular';
    
    const dates = transactions.map(t => new Date(t.date)).sort();
    const intervals = [];
    
    for (let i = 1; i < dates.length; i++) {
      const daysDiff = (dates[i].getTime() - dates[i-1].getTime()) / (1000 * 60 * 60 * 24);
      intervals.push(daysDiff);
    }
    
    const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    
    if (avgInterval <= 7) return 'weekly';
    if (avgInterval <= 35) return 'monthly';
    if (avgInterval <= 90) return 'quarterly';
    return 'irregular';
  }

  private static calculateSavingsConsistency(transactions: Transaction[]): number {
    const monthlyData = this.groupTransactionsByMonth(transactions);
    const monthlySavings = Object.keys(monthlyData).map(month => {
      const income = transactions
        .filter(t => t.transaction_type === 'credit' && t.date.startsWith(month))
        .reduce((sum, t) => sum + t.amount, 0);
      const expenses = transactions
        .filter(t => t.transaction_type === 'debit' && t.date.startsWith(month))
        .reduce((sum, t) => sum + t.amount, 0);
      return income - expenses;
    });

    if (monthlySavings.length < 2) return 50;

    const avg = monthlySavings.reduce((sum, s) => sum + s, 0) / monthlySavings.length;
    const variance = monthlySavings.reduce((sum, s) => sum + Math.pow(s - avg, 2), 0) / monthlySavings.length;
    const coefficientOfVariation = Math.sqrt(variance) / Math.abs(avg);

    return Math.max(0, Math.min(100, (1 - coefficientOfVariation) * 100));
  }

  /**
   * Clear cache for specific user
   */
  static clearCache(userId: string): void {
    this.cache.delete(`analysis_${userId}`);
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): any {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}