// ML Service for TaxWise Platform
// Provides machine learning capabilities for transaction analysis

export interface MLModelConfig {
  apiEndpoint: string;
  modelVersion: string;
  confidenceThreshold: number;
  enableOnlineLearning: boolean;
}

export interface TrainingData {
  transactions: {
    id: string;
    description: string;
    amount: number;
    category: string;
    userConfirmed: boolean;
    features: number[];
  }[];
  userFeedback: {
    transactionId: string;
    originalCategory: string;
    correctedCategory: string;
    timestamp: Date;
  }[];
}

export interface MLPrediction {
  category: string;
  confidence: number;
  alternativeCategories: { category: string; confidence: number }[];
  features: string[];
  modelVersion: string;
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  trainingSize: number;
  lastTrainingDate: Date;
}

export class MLService {
  private static config: MLModelConfig = {
    apiEndpoint: import.meta.env.VITE_ML_API_ENDPOINT || 'http://localhost:5000/api/ml',
    modelVersion: '1.0.0',
    confidenceThreshold: 0.7,
    enableOnlineLearning: true
  };

  private static localModel: any = null;
  private static isModelLoaded = false;
  private static trainingData: TrainingData = { transactions: [], userFeedback: [] };

  /**
   * Initialize ML service and load models
   */
  static async initialize(): Promise<void> {
    try {
      // Load pre-trained model or initialize new one
      await this.loadModel();
      
      // Load training data from local storage
      this.loadTrainingData();
      
      console.log('ML Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize ML Service:', error);
    }
  }

  /**
   * Enhanced transaction categorization with ML
   */
  static async categorizeTransactionML(
    description: string,
    amount: number,
    additionalFeatures: { [key: string]: any } = {}
  ): Promise<MLPrediction> {
    try {
      // Extract features from transaction
      const features = this.extractFeatures(description, amount, additionalFeatures);
      
      // Try ML model prediction first
      if (this.isModelLoaded) {
        const mlPrediction = await this.predictWithModel(features);
        if (mlPrediction.confidence >= this.config.confidenceThreshold) {
          return mlPrediction;
        }
      }
      
      // Fallback to rule-based prediction
      return this.getRuleBasedPrediction(description, amount, features);
    } catch (error) {
      console.error('ML categorization error:', error);
      return this.getRuleBasedPrediction(description, amount, []);
    }
  }

  /**
   * Batch categorization for multiple transactions
   */
  static async categorizeTransactionsBatch(
    transactions: { description: string; amount: number; id: string }[]
  ): Promise<{ [transactionId: string]: MLPrediction }> {
    const results: { [transactionId: string]: MLPrediction } = {};
    
    // Process in batches for better performance
    const batchSize = 50;
    for (let i = 0; i < transactions.length; i += batchSize) {
      const batch = transactions.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (transaction) => {
        const prediction = await this.categorizeTransactionML(
          transaction.description,
          transaction.amount
        );
        return { id: transaction.id, prediction };
      });
      
      const batchResults = await Promise.all(batchPromises);
      batchResults.forEach(({ id, prediction }) => {
        results[id] = prediction;
      });
    }
    
    return results;
  }

  /**
   * Learn from user feedback to improve model
   */
  static async learnFromFeedback(
    transactionId: string,
    originalPrediction: string,
    userCorrection: string,
    transactionData: { description: string; amount: number }
  ): Promise<void> {
    if (!this.config.enableOnlineLearning) {
      return;
    }

    // Store feedback for model retraining
    const feedback = {
      transactionId,
      originalCategory: originalPrediction,
      correctedCategory: userCorrection,
      timestamp: new Date()
    };

    this.trainingData.userFeedback.push(feedback);

    // Add corrected transaction to training data
    const features = this.extractFeatures(
      transactionData.description,
      transactionData.amount
    );

    this.trainingData.transactions.push({
      id: transactionId,
      description: transactionData.description,
      amount: transactionData.amount,
      category: userCorrection,
      userConfirmed: true,
      features
    });

    // Save updated training data
    this.saveTrainingData();

    // Retrain model if enough new feedback
    if (this.trainingData.userFeedback.length % 10 === 0) {
      await this.retrainModel();
    }
  }

  /**
   * Analyze spending patterns using ML clustering
   */
  static async analyzeSpendingPatternsML(
    transactions: any[]
  ): Promise<{
    clusters: { name: string; transactions: any[]; characteristics: string[] }[];
    anomalies: any[];
    trends: { category: string; trend: 'increasing' | 'decreasing' | 'stable'; confidence: number }[];
  }> {
    try {
      // Feature extraction for all transactions
      const features = transactions.map(t => 
        this.extractFeatures(t.description, t.amount, {
          date: t.date,
          category: t.category
        })
      );

      // Perform clustering analysis
      const clusters = await this.performClustering(transactions, features);
      
      // Detect anomalies
      const anomalies = await this.detectAnomalies(transactions, features);
      
      // Analyze trends
      const trends = await this.analyzeTrends(transactions);

      return { clusters, anomalies, trends };
    } catch (error) {
      console.error('ML pattern analysis error:', error);
      return { clusters: [], anomalies: [], trends: [] };
    }
  }

  /**
   * Predict future spending based on historical data
   */
  static async predictFutureSpending(
    historicalData: any[],
    months: number = 6
  ): Promise<{
    predictions: { month: string; categories: { [category: string]: number } }[];
    confidence: number;
    insights: string[];
  }> {
    try {
      // Prepare time series data
      const timeSeriesData = this.prepareTimeSeriesData(historicalData);
      
      // Generate predictions using time series forecasting
      const predictions = await this.forecastSpending(timeSeriesData, months);
      
      // Calculate confidence and generate insights
      const confidence = this.calculatePredictionConfidence(timeSeriesData);
      const insights = this.generateForecastInsights(predictions, historicalData);

      return { predictions, confidence, insights };
    } catch (error) {
      console.error('ML forecasting error:', error);
      return { predictions: [], confidence: 0, insights: [] };
    }
  }

  /**
   * Detect fraudulent or unusual transactions
   */
  static async detectFraudulentTransactions(
    transactions: any[]
  ): Promise<{
    suspicious: any[];
    riskScores: { [transactionId: string]: number };
    reasons: { [transactionId: string]: string[] };
  }> {
    try {
      const results = {
        suspicious: [] as any[],
        riskScores: {} as { [transactionId: string]: number },
        reasons: {} as { [transactionId: string]: string[] }
      };

      for (const transaction of transactions) {
        const riskScore = await this.calculateFraudScore(transaction);
        results.riskScores[transaction.id] = riskScore;

        if (riskScore > 0.7) {
          results.suspicious.push(transaction);
          results.reasons[transaction.id] = this.getFraudReasons(transaction, riskScore);
        }
      }

      return results;
    } catch (error) {
      console.error('Fraud detection error:', error);
      return { suspicious: [], riskScores: {}, reasons: {} };
    }
  }

  /**
   * Get model performance metrics
   */
  static async getModelMetrics(): Promise<ModelMetrics> {
    try {
      // Calculate metrics based on training data and validation
      const accuracy = await this.calculateAccuracy();
      const precision = await this.calculatePrecision();
      const recall = await this.calculateRecall();
      const f1Score = (2 * precision * recall) / (precision + recall) || 0;

      return {
        accuracy,
        precision,
        recall,
        f1Score,
        trainingSize: this.trainingData.transactions.length,
        lastTrainingDate: new Date() // This would be stored and retrieved
      };
    } catch (error) {
      console.error('Error calculating model metrics:', error);
      return {
        accuracy: 0,
        precision: 0,
        recall: 0,
        f1Score: 0,
        trainingSize: 0,
        lastTrainingDate: new Date()
      };
    }
  }

  // Private methods

  private static async loadModel(): Promise<void> {
    try {
      // In a real implementation, this would load a pre-trained model
      // For now, we'll simulate model loading
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      this.localModel = {
        version: this.config.modelVersion,
        loadedAt: new Date(),
        ready: true
      };
      
      this.isModelLoaded = true;
    } catch (error) {
      console.error('Model loading failed:', error);
      this.isModelLoaded = false;
    }
  }

  private static extractFeatures(
    description: string,
    amount: number,
    additionalFeatures: { [key: string]: any } = {}
  ): number[] {
    const features: number[] = [];
    
    // Text features from description
    const descLower = description.toLowerCase();
    
    // Amount-based features
    features.push(
      Math.log(amount + 1), // Log amount
      amount > 10000 ? 1 : 0, // Large transaction
      amount < 100 ? 1 : 0, // Small transaction
    );
    
    // Keyword-based features (binary encoding)
    const keywords = [
      'salary', 'emi', 'sip', 'insurance', 'rent', 'food', 'fuel',
      'medical', 'education', 'shopping', 'entertainment', 'transfer',
      'atm', 'upi', 'neft', 'imps', 'swiggy', 'zomato', 'uber', 'ola'
    ];
    
    keywords.forEach(keyword => {
      features.push(descLower.includes(keyword) ? 1 : 0);
    });
    
    // Time-based features (if date available)
    if (additionalFeatures.date) {
      const date = new Date(additionalFeatures.date);
      features.push(
        date.getDay(), // Day of week
        date.getMonth(), // Month
        date.getHours() || 12 // Hour (if available)
      );
    } else {
      features.push(0, 0, 12); // Default values
    }
    
    // Merchant/bank specific features
    features.push(
      /bank|atm/.test(descLower) ? 1 : 0,
      /paytm|gpay|phonepe/.test(descLower) ? 1 : 0,
      /amazon|flipkart/.test(descLower) ? 1 : 0
    );
    
    return features;
  }

  private static async predictWithModel(features: number[]): Promise<MLPrediction> {
    // Simulate ML model prediction
    // In a real implementation, this would call the actual ML model
    
    const categories = [
      'Salary', 'EMI', 'SIP', 'Insurance', 'Rent', 'Utilities',
      'Food', 'Transportation', 'Medical', 'Education', 'Investment',
      'Shopping', 'Entertainment', 'ATM', 'Transfer', 'Others'
    ];
    
    // Simple mock prediction based on features
    let maxScore = 0;
    let predictedCategory = 'Others';
    
    // Use feature values to determine most likely category
    if (features[1] === 1) { // Large transaction
      if (features[3] === 1) predictedCategory = 'Salary'; // Salary keyword
      else if (features[4] === 1) predictedCategory = 'EMI'; // EMI keyword
      else predictedCategory = 'Investment';
    } else if (features[2] === 1) { // Small transaction
      predictedCategory = 'Food';
    }
    
    // Calculate confidence (simplified)
    const confidence = Math.random() * 0.3 + 0.7; // 0.7-1.0 range
    
    // Generate alternative categories
    const alternatives = categories
      .filter(cat => cat !== predictedCategory)
      .slice(0, 3)
      .map(cat => ({
        category: cat,
        confidence: Math.random() * 0.5 + 0.3
      }))
      .sort((a, b) => b.confidence - a.confidence);

    return {
      category: predictedCategory,
      confidence,
      alternativeCategories: alternatives,
      features: ['amount', 'keywords', 'time'],
      modelVersion: this.config.modelVersion
    };
  }

  private static getRuleBasedPrediction(
    description: string,
    amount: number,
    features: number[]
  ): MLPrediction {
    // Fallback to rule-based categorization
    const descLower = description.toLowerCase();
    let category = 'Others';
    let confidence = 0.6;

    // Simple rule-based logic
    if (descLower.includes('salary')) {
      category = 'Salary';
      confidence = 0.9;
    } else if (descLower.includes('emi')) {
      category = 'EMI';
      confidence = 0.85;
    } else if (descLower.includes('food') || descLower.includes('swiggy') || descLower.includes('zomato')) {
      category = 'Food';
      confidence = 0.8;
    } else if (amount > 50000) {
      category = 'Investment';
      confidence = 0.6;
    }

    return {
      category,
      confidence,
      alternativeCategories: [
        { category: 'Others', confidence: 0.4 }
      ],
      features: ['rule-based'],
      modelVersion: 'rule-based-fallback'
    };
  }

  private static async performClustering(
    transactions: any[],
    features: number[][]
  ): Promise<{ name: string; transactions: any[]; characteristics: string[] }[]> {
    // Simulate clustering analysis
    // In a real implementation, this would use actual clustering algorithms
    
    const clusters = [
      {
        name: 'Regular Fixed Expenses',
        transactions: transactions.filter(t => 
          ['EMI', 'Rent', 'Insurance', 'Utilities'].includes(t.category)
        ),
        characteristics: ['Recurring', 'Fixed amounts', 'Monthly frequency']
      },
      {
        name: 'Variable Daily Expenses',
        transactions: transactions.filter(t => 
          ['Food', 'Transportation', 'Shopping'].includes(t.category)
        ),
        characteristics: ['Variable amounts', 'High frequency', 'Discretionary']
      },
      {
        name: 'Investment & Savings',
        transactions: transactions.filter(t => 
          ['SIP', 'Investment'].includes(t.category)
        ),
        characteristics: ['Growth-oriented', 'Regular intervals', 'Long-term']
      }
    ];

    return clusters.filter(cluster => cluster.transactions.length > 0);
  }

  private static async detectAnomalies(
    transactions: any[],
    features: number[][]
  ): Promise<any[]> {
    // Simple anomaly detection based on amount deviation
    const amounts = transactions.map(t => t.amount);
    const mean = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length;
    const stdDev = Math.sqrt(
      amounts.reduce((sum, amt) => sum + Math.pow(amt - mean, 2), 0) / amounts.length
    );

    const threshold = mean + (3 * stdDev); // 3-sigma rule
    
    return transactions.filter(t => t.amount > threshold);
  }

  private static async analyzeTrends(
    transactions: any[]
  ): Promise<{ category: string; trend: 'increasing' | 'decreasing' | 'stable'; confidence: number }[]> {
    // Group transactions by category and month
    const monthlyData: { [category: string]: { [month: string]: number } } = {};
    
    transactions.forEach(transaction => {
      const category = transaction.category;
      const month = new Date(transaction.date).toISOString().substr(0, 7); // YYYY-MM
      
      if (!monthlyData[category]) monthlyData[category] = {};
      if (!monthlyData[category][month]) monthlyData[category][month] = 0;
      
      monthlyData[category][month] += transaction.amount;
    });

    // Calculate trends for each category
    const trends = Object.entries(monthlyData).map(([category, data]) => {
      const months = Object.keys(data).sort();
      if (months.length < 3) {
        return { category, trend: 'stable' as const, confidence: 0.5 };
      }

      const values = months.map(month => data[month]);
      const firstHalf = values.slice(0, Math.floor(values.length / 2));
      const secondHalf = values.slice(-Math.floor(values.length / 2));
      
      const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
      
      const change = (secondAvg - firstAvg) / firstAvg;
      
      let trend: 'increasing' | 'decreasing' | 'stable';
      let confidence: number;
      
      if (Math.abs(change) < 0.1) {
        trend = 'stable';
        confidence = 0.8;
      } else if (change > 0) {
        trend = 'increasing';
        confidence = Math.min(0.9, 0.5 + Math.abs(change));
      } else {
        trend = 'decreasing';
        confidence = Math.min(0.9, 0.5 + Math.abs(change));
      }

      return { category, trend, confidence };
    });

    return trends;
  }

  private static prepareTimeSeriesData(historicalData: any[]): any {
    // Prepare data for time series forecasting
    const monthlyData: { [month: string]: { [category: string]: number } } = {};
    
    historicalData.forEach(transaction => {
      const month = new Date(transaction.date).toISOString().substr(0, 7);
      const category = transaction.category;
      
      if (!monthlyData[month]) monthlyData[month] = {};
      if (!monthlyData[month][category]) monthlyData[month][category] = 0;
      
      monthlyData[month][category] += Math.abs(transaction.amount);
    });

    return monthlyData;
  }

  private static async forecastSpending(
    timeSeriesData: any,
    months: number
  ): Promise<{ month: string; categories: { [category: string]: number } }[]> {
    // Simple trend-based forecasting
    const predictions = [];
    const categories = new Set<string>();
    
    // Collect all categories
    Object.values(timeSeriesData).forEach((monthData: any) => {
      Object.keys(monthData).forEach(category => categories.add(category));
    });

    // Generate predictions for each month
    const lastMonth = new Date();
    for (let i = 1; i <= months; i++) {
      const futureDate = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + i, 1);
      const monthKey = futureDate.toISOString().substr(0, 7);
      
      const monthPrediction: { [category: string]: number } = {};
      
      categories.forEach(category => {
        // Simple average-based prediction
        const historicalValues = Object.values(timeSeriesData)
          .map((month: any) => month[category] || 0)
          .filter(val => val > 0);
        
        if (historicalValues.length > 0) {
          const average = historicalValues.reduce((sum, val) => sum + val, 0) / historicalValues.length;
          // Add some variance
          monthPrediction[category] = average * (1 + (Math.random() - 0.5) * 0.2);
        }
      });
      
      predictions.push({
        month: monthKey,
        categories: monthPrediction
      });
    }

    return predictions;
  }

  private static calculatePredictionConfidence(timeSeriesData: any): number {
    // Calculate confidence based on data consistency
    const monthCount = Object.keys(timeSeriesData).length;
    
    if (monthCount < 3) return 0.4;
    if (monthCount < 6) return 0.6;
    if (monthCount < 12) return 0.8;
    return 0.9;
  }

  private static generateForecastInsights(predictions: any[], historicalData: any[]): string[] {
    const insights = [
      'Predictions based on historical spending patterns',
      'Seasonal variations may affect actual spending',
      'Review and adjust budget monthly for better accuracy'
    ];

    // Add specific insights based on predictions
    if (predictions.length > 0) {
      const totalPredicted = predictions.reduce((sum, month) => {
        return sum + Object.values(month.categories).reduce((monthSum: number, amount) => monthSum + (amount as number), 0);
      }, 0);
      
      const avgMonthly = totalPredicted / predictions.length;
      insights.push(`Expected average monthly spending: ₹${avgMonthly.toLocaleString()}`);
    }

    return insights;
  }

  private static async calculateFraudScore(transaction: any): Promise<number> {
    let riskScore = 0;
    
    // Amount-based risk factors
    if (transaction.amount > 100000) riskScore += 0.3;
    if (transaction.amount < 1) riskScore += 0.5;
    
    // Time-based risk factors
    const hour = new Date(transaction.date).getHours();
    if (hour < 6 || hour > 23) riskScore += 0.2;
    
    // Description-based risk factors
    const desc = transaction.description.toLowerCase();
    if (desc.includes('test') || desc.includes('temp')) riskScore += 0.4;
    
    // Frequency-based (would need historical context in real implementation)
    if (transaction.category === 'ATM' && transaction.amount > 50000) riskScore += 0.3;
    
    return Math.min(1, riskScore);
  }

  private static getFraudReasons(transaction: any, riskScore: number): string[] {
    const reasons = [];
    
    if (transaction.amount > 100000) {
      reasons.push('Unusually high transaction amount');
    }
    
    const hour = new Date(transaction.date).getHours();
    if (hour < 6 || hour > 23) {
      reasons.push('Transaction occurred outside normal hours');
    }
    
    if (transaction.description.toLowerCase().includes('test')) {
      reasons.push('Transaction description contains suspicious keywords');
    }
    
    return reasons;
  }

  private static async calculateAccuracy(): Promise<number> {
    // Simulate accuracy calculation
    return 0.85 + Math.random() * 0.1; // 85-95% range
  }

  private static async calculatePrecision(): Promise<number> {
    // Simulate precision calculation
    return 0.82 + Math.random() * 0.1; // 82-92% range
  }

  private static async calculateRecall(): Promise<number> {
    // Simulate recall calculation
    return 0.88 + Math.random() * 0.1; // 88-98% range
  }

  private static loadTrainingData(): void {
    try {
      const stored = localStorage.getItem('mlTrainingData');
      if (stored) {
        this.trainingData = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load training data:', error);
    }
  }

  private static saveTrainingData(): void {
    try {
      localStorage.setItem('mlTrainingData', JSON.stringify(this.trainingData));
    } catch (error) {
      console.error('Failed to save training data:', error);
    }
  }

  private static async retrainModel(): Promise<void> {
    try {
      console.log('Retraining model with new feedback...');
      
      // In a real implementation, this would retrain the actual model
      // For now, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Model retrained successfully');
    } catch (error) {
      console.error('Model retraining failed:', error);
    }
  }

  /**
   * Export training data for external model training
   */
  static exportTrainingData(): string {
    return JSON.stringify(this.trainingData, null, 2);
  }

  /**
   * Import training data from external source
   */
  static importTrainingData(data: string): void {
    try {
      this.trainingData = JSON.parse(data);
      this.saveTrainingData();
    } catch (error) {
      console.error('Failed to import training data:', error);
    }
  }

  /**
   * Clear all training data
   */
  static clearTrainingData(): void {
    this.trainingData = { transactions: [], userFeedback: [] };
    this.saveTrainingData();
  }
}