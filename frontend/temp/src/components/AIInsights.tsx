// Enhanced AI Insights Component
// Integrates both LLM and ML services for comprehensive financial analysis

import React, { useState, useEffect } from 'react';
import './AIInsights.css';
import { LLMService, LLMInsight, FinancialContext } from '../utils/llmService';
import { MLService, MLPrediction, ModelMetrics } from '../utils/mlService';

interface AIInsightsProps {
  transactions: any[];
  totalIncome: number;
  totalExpenses: number;
  onCategoryUpdate?: (transactionId: string, newCategory: string) => void;
  analysisData?: any;
}

interface InsightTab {
  id: string;
  label: string;
  icon: string;
}

const AIInsights: React.FC<AIInsightsProps> = ({
  transactions,
  totalIncome,
  totalExpenses,
  onCategoryUpdate,
  analysisData
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [llmInsights, setLlmInsights] = useState<LLMInsight[]>([]);
  const [mlPredictions, setMlPredictions] = useState<{ [key: string]: MLPrediction }>({});
  const [spendingPatterns, setSpendingPatterns] = useState<any>(null);
  const [futureSpending, setFutureSpending] = useState<any>(null);
  const [fraudDetection, setFraudDetection] = useState<any>(null);
  const [modelMetrics, setModelMetrics] = useState<ModelMetrics | null>(null);
  const [enhancedCategories, setEnhancedCategories] = useState<{ [key: string]: string }>({});

  const tabs: InsightTab[] = [
    { id: 'overview', label: 'AI Overview', icon: '🤖' },
    { id: 'categorization', label: 'Smart Categories', icon: '🏷️' },
    { id: 'patterns', label: 'Spending Patterns', icon: '📊' },
    { id: 'predictions', label: 'Future Insights', icon: '🔮' },
    { id: 'optimization', label: 'Tax Optimization', icon: '💰' },
    { id: 'security', label: 'Security Analysis', icon: '🛡️' },
    { id: 'performance', label: 'AI Performance', icon: '⚡' }
  ];

  useEffect(() => {
    initializeAI();
  }, []);

  useEffect(() => {
    if (transactions.length > 0) {
      generateInsights();
    } else if (analysisData) {
      // Use the provided analysis data if transactions are not available
      setLlmInsights(analysisData.insights || []);
    }
  }, [transactions, totalIncome, totalExpenses, analysisData]);

  const initializeAI = async () => {
    try {
      setIsLoading(true);
      
      // Initialize both AI services
      await Promise.all([
        LLMService.initialize(),
        MLService.initialize()
      ]);

      // Get model performance metrics
      const metrics = await MLService.getModelMetrics();
      setModelMetrics(metrics);
    } catch (error) {
      console.error('Failed to initialize AI services:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateInsights = async () => {
    if (transactions.length === 0) return;

    try {
      setIsLoading(true);

      const financialContext: FinancialContext = {
        totalIncome,
        totalExpenses,
        savingsRate: ((totalIncome - totalExpenses) / totalIncome) * 100,
        transactions: transactions.slice(0, 20), // Limit for API efficiency
        expenseBreakdown: calculateExpenseBreakdown(),
        monthlyTrends: calculateMonthlyTrends(),
        financialGoals: ['Emergency Fund', 'Tax Optimization', 'Investment Growth'],
        categories: calculateExpenseBreakdown(),
        patterns: [],
        demographics: {},
        goals: ['Emergency Fund', 'Tax Optimization', 'Investment Growth']
      };

      // Generate insights in parallel for better performance
      const [
        insights,
        mlCategories,
        patterns,
        predictions,
        fraudAnalysis
      ] = await Promise.all([
        LLMService.generatePersonalizedInsights(financialContext),
        MLService.categorizeTransactionsBatch(
          transactions.map(t => ({ 
            id: t.id, 
            description: t.description, 
            amount: t.amount 
          }))
        ),
        MLService.analyzeSpendingPatternsML(transactions),
        MLService.predictFutureSpending(transactions, 6),
        MLService.detectFraudulentTransactions(transactions)
      ]);

      setLlmInsights(insights);
      setMlPredictions(mlCategories);
      setSpendingPatterns(patterns);
      setFutureSpending(predictions);
      setFraudDetection(fraudAnalysis);

      // Process enhanced categorizations
      const enhanced: { [key: string]: string } = {};
      Object.entries(mlCategories).forEach(([transactionId, prediction]) => {
        if (prediction.confidence > 0.8) {
          enhanced[transactionId] = prediction.category;
        }
      });
      setEnhancedCategories(enhanced);

    } catch (error) {
      console.error('Failed to generate AI insights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryAcceptance = async (transactionId: string, newCategory: string) => {
    const transaction = transactions.find(t => t.id === transactionId);
    if (!transaction) return;

    // Update UI immediately
    if (onCategoryUpdate) {
      onCategoryUpdate(transactionId, newCategory);
    }

    // Provide feedback to ML model for learning
    const originalPrediction = mlPredictions[transactionId];
    if (originalPrediction) {
      await MLService.learnFromFeedback(
        transactionId,
        originalPrediction.category,
        newCategory,
        { description: transaction.description, amount: transaction.amount }
      );
    }

    // Remove from enhanced categories as it's been processed
    setEnhancedCategories(prev => {
      const updated = { ...prev };
      delete updated[transactionId];
      return updated;
    });
  };

  const calculateExpenseBreakdown = () => {
    const breakdown: { [category: string]: number } = {};
    transactions.forEach(transaction => {
      const category = transaction.category || 'Others';
      breakdown[category] = (breakdown[category] || 0) + Math.abs(transaction.amount);
    });
    return breakdown;
  };

  const calculateMonthlyTrends = () => {
    const trends: { [month: string]: number } = {};
    transactions.forEach(transaction => {
      const month = new Date(transaction.date).toISOString().substr(0, 7);
      trends[month] = (trends[month] || 0) + Math.abs(transaction.amount);
    });
    return trends;
  };

  const renderOverviewTab = () => (
    <div className="ai-overview">
      <div className="insights-grid">
        {llmInsights.length > 0 && (
          <div className="insight-card">
            <h3>💡 AI Financial Analysis</h3>
            <div className="health-score">
              <div className="score-circle">
                <span className="score-value">{Math.round(llmInsights[0].confidence * 100)}</span>
                <span className="score-label">%</span>
              </div>
              <div className="score-details">
                <p className="score-description">Confidence in AI analysis</p>
              </div>
            </div>
          </div>
        )}

        {llmInsights.length > 0 && (
          <div className="insight-card">
            <h3>🎯 AI Insights</h3>
            <ul className="insights-list">
              {llmInsights.slice(0, 5).map((insight: LLMInsight, index: number) => (
                <li key={index} className="insight-item">
                  <div className="insight-header">
                    <h4>{insight.title}</h4>
                    <span className={`priority ${insight.priority}`}>{insight.priority}</span>
                  </div>
                  <p className="insight-text">{insight.description}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {llmInsights.length > 0 && (
          <div className="insight-card">
            <h3>📋 Action Items</h3>
            <div className="recommendations-list">
              {llmInsights.slice(0, 4).map((insight: LLMInsight, index: number) => (
                <div key={index} className="recommendation-item">
                  <div className="rec-priority">{insight.priority}</div>
                  <div className="rec-content">
                    <h4>{insight.title}</h4>
                    <p>{insight.description}</p>
                    <div className="action-steps">
                      {insight.actionableSteps.map((step: string, stepIndex: number) => (
                        <span key={stepIndex} className="action-step">• {step}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {spendingPatterns && spendingPatterns.anomalies.length > 0 && (
          <div className="insight-card alert-card">
            <h3>⚠️ Unusual Transactions Detected</h3>
            <div className="anomalies-list">
              {spendingPatterns.anomalies.slice(0, 3).map((anomaly: any, index: number) => (
                <div key={index} className="anomaly-item">
                  <span className="anomaly-amount">₹{anomaly.amount.toLocaleString()}</span>
                  <span className="anomaly-desc">{anomaly.description}</span>
                  <span className="anomaly-date">{new Date(anomaly.date).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderCategorizationTab = () => (
    <div className="ai-categorization">
      <div className="categorization-header">
        <h3>🏷️ Smart Transaction Categorization</h3>
        <p>AI-powered suggestions to improve your transaction categories</p>
      </div>

      {Object.keys(enhancedCategories).length > 0 ? (
        <div className="category-suggestions">
          {Object.entries(enhancedCategories).map(([transactionId, suggestedCategory]) => {
            const transaction = transactions.find(t => t.id === transactionId);
            const prediction = mlPredictions[transactionId];
            
            if (!transaction) return null;

            return (
              <div key={transactionId} className="category-suggestion">
                <div className="transaction-info">
                  <span className="transaction-desc">{transaction.description}</span>
                  <span className="transaction-amount">₹{transaction.amount.toLocaleString()}</span>
                  <span className="current-category">Current: {transaction.category}</span>
                </div>
                
                <div className="suggestion-info">
                  <div className="suggested-category">
                    <span className="category-name">Suggested: {suggestedCategory}</span>
                    <span className="confidence">
                      {Math.round(prediction.confidence * 100)}% confident
                    </span>
                  </div>
                  
                  <div className="suggestion-actions">
                    <button 
                      className="accept-btn"
                      onClick={() => handleCategoryAcceptance(transactionId, suggestedCategory)}
                    >
                      Accept
                    </button>
                    <button 
                      className="reject-btn"
                      onClick={() => setEnhancedCategories(prev => {
                        const updated = { ...prev };
                        delete updated[transactionId];
                        return updated;
                      })}
                    >
                      Reject
                    </button>
                  </div>
                </div>

                {prediction.alternativeCategories.length > 0 && (
                  <div className="alternative-categories">
                    <span className="alt-label">Other options:</span>
                    {prediction.alternativeCategories.slice(0, 2).map((alt, index) => (
                      <button
                        key={index}
                        className="alt-category-btn"
                        onClick={() => handleCategoryAcceptance(transactionId, alt.category)}
                      >
                        {alt.category} ({Math.round(alt.confidence * 100)}%)
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="no-suggestions">
          <p>✅ All transactions are well categorized! The AI found no improvements to suggest.</p>
        </div>
      )}
    </div>
  );

  const renderPatternsTab = () => (
    <div className="ai-patterns">
      <h3>📊 Spending Pattern Analysis</h3>
      
      {spendingPatterns && (
        <div className="patterns-grid">
          {spendingPatterns.clusters.length > 0 && (
            <div className="pattern-card">
              <h4>🎯 Spending Clusters</h4>
              {spendingPatterns.clusters.map((cluster: any, index: number) => (
                <div key={index} className="cluster-item">
                  <h5>{cluster.name}</h5>
                  <p>{cluster.transactions.length} transactions</p>
                  <ul className="cluster-characteristics">
                    {cluster.characteristics.map((char: string, charIndex: number) => (
                      <li key={charIndex}>{char}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {spendingPatterns.trends.length > 0 && (
            <div className="pattern-card">
              <h4>📈 Category Trends</h4>
              {spendingPatterns.trends.map((trend: any, index: number) => (
                <div key={index} className="trend-item">
                  <span className="trend-category">{trend.category}</span>
                  <span className={`trend-direction ${trend.trend}`}>
                    {trend.trend === 'increasing' ? '📈' : trend.trend === 'decreasing' ? '📉' : '➡️'}
                    {trend.trend}
                  </span>
                  <span className="trend-confidence">{Math.round(trend.confidence * 100)}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderPredictionsTab = () => (
    <div className="ai-predictions">
      <h3>🔮 Future Spending Predictions</h3>
      
      {futureSpending && (
        <div className="predictions-content">
          <div className="prediction-summary">
            <div className="confidence-indicator">
              <span className="confidence-label">Prediction Confidence:</span>
              <div className="confidence-bar">
                <div 
                  className="confidence-fill" 
                  style={{ width: `${futureSpending.confidence * 100}%` }}
                ></div>
              </div>
              <span className="confidence-value">{Math.round(futureSpending.confidence * 100)}%</span>
            </div>
          </div>

          {futureSpending.predictions.length > 0 && (
            <div className="monthly-predictions">
              <h4>📅 Monthly Predictions</h4>
              <div className="predictions-grid">
                {futureSpending.predictions.slice(0, 6).map((month: any, index: number) => (
                  <div key={index} className="month-prediction">
                    <h5>{new Date(month.month + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</h5>
                    <div className="category-predictions">
                      {Object.entries(month.categories)
                        .sort(([,a], [,b]) => (b as number) - (a as number))
                        .slice(0, 5)
                        .map(([category, amount]) => (
                          <div key={category} className="category-prediction">
                            <span className="pred-category">{category}</span>
                            <span className="pred-amount">₹{(amount as number).toLocaleString()}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {futureSpending.insights.length > 0 && (
            <div className="prediction-insights">
              <h4>💡 Prediction Insights</h4>
              <ul>
                {futureSpending.insights.map((insight: string, index: number) => (
                  <li key={index}>{insight}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderOptimizationTab = () => (
    <div className="ai-optimization">
      <h3>💰 AI Tax Optimization</h3>
      {llmInsights.length > 0 && (
        <div className="optimization-tips">
          {llmInsights
            .filter((insight: LLMInsight) => insight.type === 'tax_optimization')
            .map((insight: LLMInsight, index: number) => (
            <div key={index} className="optimization-tip">
              <div className="tip-header">
                <h4>{insight.title}</h4>
                <span className="tip-savings">Impact: {insight.potentialImpact}</span>
              </div>
              <p className="tip-description">{insight.description}</p>
              <div className="tip-actions">
                {insight.actionableSteps.map((action: string, actionIndex: number) => (
                  <span key={actionIndex} className="action-item">• {action}</span>
                ))}
              </div>
              <div className="tip-timeframe">
                <span className="timeframe">Timeframe: {insight.timeframe}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderSecurityTab = () => (
    <div className="ai-security">
      <h3>🛡️ Security Analysis</h3>
      
      {fraudDetection && (
        <div className="security-content">
          {fraudDetection.suspicious.length > 0 ? (
            <div className="suspicious-transactions">
              <div className="alert-header">
                <span className="alert-icon">⚠️</span>
                <h4>Suspicious Transactions Detected</h4>
              </div>
              
              {fraudDetection.suspicious.map((transaction: any, index: number) => (
                <div key={index} className="suspicious-item">
                  <div className="transaction-details">
                    <span className="sus-desc">{transaction.description}</span>
                    <span className="sus-amount">₹{transaction.amount.toLocaleString()}</span>
                    <span className="sus-date">{new Date(transaction.date).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="risk-info">
                    <div className="risk-score">
                      Risk Score: {Math.round(fraudDetection.riskScores[transaction.id] * 100)}%
                    </div>
                    <div className="risk-reasons">
                      {fraudDetection.reasons[transaction.id]?.map((reason: string, reasonIndex: number) => (
                        <span key={reasonIndex} className="risk-reason">{reason}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="security-all-clear">
              <span className="success-icon">✅</span>
              <h4>All Clear!</h4>
              <p>No suspicious transactions detected in your recent activity.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderPerformanceTab = () => (
    <div className="ai-performance">
      <h3>⚡ AI Model Performance</h3>
      
      {modelMetrics && (
        <div className="metrics-grid">
          <div className="metric-card">
            <h4>🎯 Accuracy</h4>
            <div className="metric-value">{Math.round(modelMetrics.accuracy * 100)}%</div>
            <p>Overall prediction accuracy</p>
          </div>
          
          <div className="metric-card">
            <h4>🔍 Precision</h4>
            <div className="metric-value">{Math.round(modelMetrics.precision * 100)}%</div>
            <p>Accuracy of positive predictions</p>
          </div>
          
          <div className="metric-card">
            <h4>📊 Recall</h4>
            <div className="metric-value">{Math.round(modelMetrics.recall * 100)}%</div>
            <p>Coverage of actual positives</p>
          </div>
          
          <div className="metric-card">
            <h4>⚖️ F1 Score</h4>
            <div className="metric-value">{Math.round(modelMetrics.f1Score * 100)}%</div>
            <p>Balanced accuracy measure</p>
          </div>
          
          <div className="metric-card">
            <h4>📚 Training Size</h4>
            <div className="metric-value">{modelMetrics.trainingSize.toLocaleString()}</div>
            <p>Transactions learned from</p>
          </div>
          
          <div className="metric-card">
            <h4>🔄 Last Training</h4>
            <div className="metric-value">
              {modelMetrics.lastTrainingDate.toLocaleDateString()}
            </div>
            <p>Model last updated</p>
          </div>
        </div>
      )}
    </div>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'categorization':
        return renderCategorizationTab();
      case 'patterns':
        return renderPatternsTab();
      case 'predictions':
        return renderPredictionsTab();
      case 'optimization':
        return renderOptimizationTab();
      case 'security':
        return renderSecurityTab();
      case 'performance':
        return renderPerformanceTab();
      default:
        return renderOverviewTab();
    }
  };

  return (
    <div className="ai-insights-container">
      <div className="ai-insights-header">
        <h2>🤖 TaxWise AI Insights</h2>
        <p>Advanced AI-powered financial analysis using Machine Learning and Large Language Models</p>
      </div>

      <div className="ai-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`ai-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="ai-content">
        {isLoading ? (
          <div className="ai-loading">
            <div className="loading-spinner"></div>
            <p>AI is analyzing your financial data...</p>
          </div>
        ) : (
          renderActiveTab()
        )}
      </div>
    </div>
  );
};

export default AIInsights;