// LLM Service for TaxWise Platform
// Provides intelligent financial analysis using Large Language Models

export interface LLMConfig {
  apiKey: string;
  model: string;
  baseURL?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface LLMInsight {
  type: 'financial_advice' | 'tax_optimization' | 'spending_analysis' | 'investment_recommendation';
  title: string;
  description: string;
  confidence: number;
  actionableSteps: string[];
  potentialImpact: string;
  timeframe: string;
  priority: 'high' | 'medium' | 'low';
}

export interface FinancialContext {
  totalIncome: number;
  totalExpenses: number;
  savingsRate: number;
  transactions?: any[];
  expenseBreakdown?: { [key: string]: number };
  monthlyTrends?: { [key: string]: number };
  financialGoals?: string[];
  categories: { [key: string]: number };
  patterns: any[];
  demographics: {
    age?: number;
    location?: string;
    profession?: string;
    familySize?: number;
  };
  goals: string[];
}

export class LLMService {
  private static config: LLMConfig = {
    apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
    model: 'gpt-4o',
    baseURL: 'https://api.openai.com/v1',
    maxTokens: 1500,
    temperature: 0.7
  };

  private static isInitialized = false;

  /**
   * Initialize the LLM service
   */
  static async initialize(): Promise<void> {
    try {
      if (this.isInitialized) return;
      
      // Validate configuration
      if (!this.config.apiKey) {
        console.warn('OpenAI API key not configured. LLM features will use fallback responses.');
      }
      
      this.isInitialized = true;
      console.log('LLM Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize LLM Service:', error);
      throw error;
    }
  }

  /**
   * Generate personalized financial insights using LLM
   */
  static async generatePersonalizedInsights(
    context: FinancialContext,
    specificQuestions?: string[]
  ): Promise<LLMInsight[]> {
    try {
      const prompt = this.buildFinancialAnalysisPrompt(context, specificQuestions);
      const response = await this.callLLM(prompt, 'financial_analysis');
      
      return this.parseInsightsResponse(response);
    } catch (error) {
      console.error('LLM Service Error:', error);
      return this.getFallbackInsights(context);
    }
  }

  /**
   * Generate intelligent transaction categorization suggestions
   */
  static async enhanceTransactionCategorization(
    transactions: any[],
    uncertainCategories: any[]
  ): Promise<{ [transactionId: string]: { category: string; confidence: number; reasoning: string } }> {
    try {
      const prompt = this.buildCategorizationPrompt(transactions, uncertainCategories);
      const response = await this.callLLM(prompt, 'categorization');
      
      return this.parseCategorizationResponse(response);
    } catch (error) {
      console.error('Categorization LLM Error:', error);
      return {};
    }
  }

  /**
   * Generate tax optimization strategies
   */
  static async generateTaxOptimizationStrategies(
    context: FinancialContext,
    currentTaxUtilization: any
  ): Promise<LLMInsight[]> {
    try {
      const prompt = this.buildTaxOptimizationPrompt(context, currentTaxUtilization);
      const response = await this.callLLM(prompt, 'tax_optimization');
      
      return this.parseInsightsResponse(response);
    } catch (error) {
      console.error('Tax Optimization LLM Error:', error);
      return this.getFallbackTaxInsights(context);
    }
  }

  /**
   * Analyze spending patterns and provide behavioral insights
   */
  static async analyzeSpendingBehavior(
    context: FinancialContext,
    monthlyTrends: any[]
  ): Promise<LLMInsight[]> {
    try {
      const prompt = this.buildSpendingAnalysisPrompt(context, monthlyTrends);
      const response = await this.callLLM(prompt, 'spending_analysis');
      
      return this.parseInsightsResponse(response);
    } catch (error) {
      console.error('Spending Analysis LLM Error:', error);
      return this.getFallbackSpendingInsights(context);
    }
  }

  /**
   * Generate investment recommendations based on profile
   */
  static async generateInvestmentRecommendations(
    context: FinancialContext,
    riskProfile: 'conservative' | 'moderate' | 'aggressive'
  ): Promise<LLMInsight[]> {
    try {
      const prompt = this.buildInvestmentPrompt(context, riskProfile);
      const response = await this.callLLM(prompt, 'investment_advice');
      
      return this.parseInsightsResponse(response);
    } catch (error) {
      console.error('Investment LLM Error:', error);
      return this.getFallbackInvestmentInsights(context, riskProfile);
    }
  }

  /**
   * Generate contextual explanations for financial terms
   */
  static async explainFinancialConcepts(
    concepts: string[],
    userContext: FinancialContext
  ): Promise<{ [concept: string]: string }> {
    try {
      const prompt = this.buildExplanationPrompt(concepts, userContext);
      const response = await this.callLLM(prompt, 'explanation');
      
      return this.parseExplanationResponse(response);
    } catch (error) {
      console.error('Explanation LLM Error:', error);
      return this.getFallbackExplanations(concepts);
    }
  }

  // Private methods for LLM interaction

  private static async callLLM(prompt: string, context: string): Promise<string> {
    if (!this.config.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const requestBody = {
      model: this.config.model,
      messages: [
        {
          role: 'system',
          content: this.getSystemPrompt(context)
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: this.config.maxTokens,
      temperature: this.config.temperature,
      response_format: { type: 'json_object' }
    };

    const response = await fetch(`${this.config.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`LLM API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  private static getSystemPrompt(context: string): string {
    const basePrompt = `You are TaxWise AI, an expert financial advisor specializing in Indian taxation, investment strategies, and personal finance management. You provide accurate, actionable, and personalized financial advice.

Key Guidelines:
- Focus on Indian tax laws and financial instruments
- Provide specific, actionable recommendations
- Consider user's financial context and goals
- Explain complex concepts simply
- Always include potential risks and considerations
- Suggest specific investment products available in India
- Reference relevant tax sections (80C, 80D, etc.)
- Consider current economic conditions in India

Response Format: Always respond in valid JSON format as specified in the user prompt.`;

    const contextPrompts: { [key: string]: string } = {
      'financial_analysis': basePrompt + `
Specific Context: Analyze overall financial health and provide comprehensive insights.
Focus on savings rate, expense optimization, and long-term financial planning.`,
      
      'categorization': basePrompt + `
Specific Context: Help categorize financial transactions accurately.
Consider Indian banking terminology, merchant names, and transaction patterns.`,
      
      'tax_optimization': basePrompt + `
Specific Context: Provide tax optimization strategies specific to Indian tax laws.
Focus on maximizing deductions under various sections of Income Tax Act.`,
      
      'spending_analysis': basePrompt + `
Specific Context: Analyze spending patterns and suggest behavioral improvements.
Focus on identifying wasteful spending and optimization opportunities.`,
      
      'investment_advice': basePrompt + `
Specific Context: Provide investment recommendations suitable for Indian market.
Consider mutual funds, SIPs, tax-saving instruments, and asset allocation.`,
      
      'explanation': basePrompt + `
Specific Context: Explain financial concepts in simple, understandable terms.
Use examples relevant to Indian financial context and user's situation.`
    };

    return contextPrompts[context] || basePrompt;
  }

  // Prompt builders

  private static buildFinancialAnalysisPrompt(context: FinancialContext, questions?: string[]): string {
    return `Analyze the following financial profile and provide comprehensive insights:

Financial Data:
- Monthly Income: ₹${context.totalIncome.toLocaleString()}
- Monthly Expenses: ₹${context.totalExpenses.toLocaleString()}
- Savings Rate: ${context.savingsRate.toFixed(1)}%

Expense Categories:
${Object.entries(context.categories).map(([cat, amount]) => `- ${cat}: ₹${amount.toLocaleString()}`).join('\n')}

Demographics:
- Age: ${context.demographics.age || 'Not specified'}
- Location: ${context.demographics.location || 'India'}
- Profession: ${context.demographics.profession || 'Not specified'}
- Family Size: ${context.demographics.familySize || 'Not specified'}

Financial Goals: ${context.goals.join(', ') || 'General financial wellness'}

${questions ? `Specific Questions: ${questions.join(', ')}` : ''}

Please provide insights in the following JSON format:
{
  "insights": [
    {
      "type": "financial_advice",
      "title": "Insight Title",
      "description": "Detailed description",
      "confidence": 0.85,
      "actionableSteps": ["Step 1", "Step 2"],
      "potentialImpact": "Impact description",
      "timeframe": "3-6 months",
      "priority": "high"
    }
  ]
}`;
  }

  private static buildCategorizationPrompt(transactions: any[], uncertainCategories: any[]): string {
    const transactionList = transactions.slice(0, 10).map(t => 
      `ID: ${t.id}, Description: "${t.description}", Amount: ₹${t.amount}, Current Category: ${t.category || 'Uncertain'}`
    ).join('\n');

    return `Help categorize these Indian financial transactions accurately:

Transactions:
${transactionList}

Available Categories: Salary, EMI, SIP, Insurance, Rent, Utilities, Food, Transportation, Medical, Education, Investment, Shopping, Entertainment, ATM, Transfer, Others

Consider:
- Indian merchant names and banking terminology
- Common transaction patterns in India
- UPI payment references
- Bank-specific transaction codes

Provide categorization in JSON format:
{
  "categorization": {
    "transaction_id": {
      "category": "suggested_category",
      "confidence": 0.85,
      "reasoning": "Explanation for the categorization"
    }
  }
}`;
  }

  private static buildTaxOptimizationPrompt(context: FinancialContext, taxUtilization: any): string {
    return `Provide tax optimization strategies for this Indian taxpayer:

Income: ₹${context.totalIncome.toLocaleString()} annually
Current Tax Utilization:
- Section 80C: ₹${taxUtilization.section80C?.current || 0} / ₹1,50,000
- Section 80D: ₹${taxUtilization.section80D?.current || 0} / ₹25,000

Goals: ${context.goals.join(', ') || 'Tax optimization'}

Provide optimization strategies in JSON format:
{
  "insights": [
    {
      "type": "tax_optimization",
      "title": "Strategy Title",
      "description": "Detailed strategy",
      "confidence": 0.9,
      "actionableSteps": ["Specific action 1", "Specific action 2"],
      "potentialImpact": "Tax savings potential",
      "timeframe": "Implementation timeline",
      "priority": "high"
    }
  ]
}`;
  }

  private static buildSpendingAnalysisPrompt(context: FinancialContext, trends: any[]): string {
    return `Analyze spending patterns and provide behavioral insights:

Monthly Spending: ₹${context.totalExpenses.toLocaleString()}
Savings Rate: ${context.savingsRate.toFixed(1)}%

Category Breakdown:
${Object.entries(context.categories).map(([cat, amount]) => 
  `- ${cat}: ₹${amount.toLocaleString()} (${((amount/context.totalExpenses)*100).toFixed(1)}%)`
).join('\n')}

Provide spending analysis in JSON format:
{
  "insights": [
    {
      "type": "spending_analysis",
      "title": "Analysis Title",
      "description": "Spending behavior insights",
      "confidence": 0.8,
      "actionableSteps": ["Optimization step 1", "Optimization step 2"],
      "potentialImpact": "Expected savings",
      "timeframe": "Implementation period",
      "priority": "medium"
    }
  ]
}`;
  }

  private static buildInvestmentPrompt(context: FinancialContext, riskProfile: string): string {
    const availableForInvestment = Math.max(0, context.totalIncome - context.totalExpenses);
    
    return `Provide investment recommendations for Indian market:

Profile:
- Monthly Surplus: ₹${availableForInvestment.toLocaleString()}
- Risk Profile: ${riskProfile}
- Age: ${context.demographics.age || 30}
- Goals: ${context.goals.join(', ') || 'Long-term wealth creation'}

Consider:
- Indian mutual funds and SIPs
- Tax-saving investments (ELSS, PPF, NSC)
- Direct equity investments
- Debt instruments
- Current market conditions

Provide recommendations in JSON format:
{
  "insights": [
    {
      "type": "investment_recommendation",
      "title": "Investment Strategy",
      "description": "Detailed recommendation",
      "confidence": 0.85,
      "actionableSteps": ["Investment step 1", "Investment step 2"],
      "potentialImpact": "Expected returns and benefits",
      "timeframe": "Investment horizon",
      "priority": "high"
    }
  ]
}`;
  }

  private static buildExplanationPrompt(concepts: string[], context: FinancialContext): string {
    return `Explain these financial concepts in simple terms for an Indian context:

Concepts to explain: ${concepts.join(', ')}

User Context:
- Income Level: ₹${context.totalIncome.toLocaleString()} monthly
- Financial Goals: ${context.goals.join(', ') || 'General financial planning'}

Provide explanations in JSON format:
{
  "explanations": {
    "concept_name": "Simple, contextual explanation with examples"
  }
}`;
  }

  // Response parsers

  private static parseInsightsResponse(response: string): LLMInsight[] {
    try {
      const parsed = JSON.parse(response);
      return parsed.insights || [];
    } catch (error) {
      console.error('Failed to parse LLM insights response:', error);
      return [];
    }
  }

  private static parseCategorizationResponse(response: string): { [transactionId: string]: { category: string; confidence: number; reasoning: string } } {
    try {
      const parsed = JSON.parse(response);
      return parsed.categorization || {};
    } catch (error) {
      console.error('Failed to parse LLM categorization response:', error);
      return {};
    }
  }

  private static parseExplanationResponse(response: string): { [concept: string]: string } {
    try {
      const parsed = JSON.parse(response);
      return parsed.explanations || {};
    } catch (error) {
      console.error('Failed to parse LLM explanation response:', error);
      return {};
    }
  }

  // Fallback methods

  private static getFallbackInsights(context: FinancialContext): LLMInsight[] {
    const insights: LLMInsight[] = [];
    
    if (context.savingsRate < 20) {
      insights.push({
        type: 'financial_advice',
        title: 'Improve Savings Rate',
        description: `Your current savings rate of ${context.savingsRate.toFixed(1)}% is below the recommended 20%. Focus on reducing discretionary expenses and increasing income.`,
        confidence: 0.9,
        actionableSteps: [
          'Track all expenses for one month',
          'Identify and reduce non-essential spending',
          'Set up automatic savings transfers',
          'Look for additional income opportunities'
        ],
        potentialImpact: 'Could increase savings by ₹5,000-15,000 per month',
        timeframe: '3-6 months',
        priority: 'high'
      });
    }

    return insights;
  }

  private static getFallbackTaxInsights(context: FinancialContext): LLMInsight[] {
    return [{
      type: 'tax_optimization',
      title: 'Maximize Section 80C Deductions',
      description: 'You may be missing out on tax-saving opportunities under Section 80C. Consider investing in ELSS, PPF, or NSC.',
      confidence: 0.8,
      actionableSteps: [
        'Review current 80C investments',
        'Consider starting ELSS SIP',
        'Increase PPF contributions',
        'Explore NSC investments'
      ],
      potentialImpact: 'Potential tax savings of ₹46,800 annually',
      timeframe: 'Before March 31st',
      priority: 'high'
    }];
  }

  private static getFallbackSpendingInsights(context: FinancialContext): LLMInsight[] {
    const highestCategory = Object.entries(context.categories)
      .sort(([,a], [,b]) => b - a)[0];

    if (highestCategory && highestCategory[1] > context.totalExpenses * 0.3) {
      return [{
        type: 'spending_analysis',
        title: `High ${highestCategory[0]} Spending`,
        description: `Your ${highestCategory[0]} expenses account for ${((highestCategory[1]/context.totalExpenses)*100).toFixed(1)}% of total expenses. Consider optimization opportunities.`,
        confidence: 0.85,
        actionableSteps: [
          `Review ${highestCategory[0]} expenses in detail`,
          'Look for more cost-effective alternatives',
          'Set a monthly budget limit',
          'Track spending in this category weekly'
        ],
        potentialImpact: `Potential monthly savings of ₹${(highestCategory[1] * 0.1).toLocaleString()}`,
        timeframe: '1-2 months',
        priority: 'medium'
      }];
    }

    return [];
  }

  private static getFallbackInvestmentInsights(context: FinancialContext, riskProfile: string): LLMInsight[] {
    const surplus = Math.max(0, context.totalIncome - context.totalExpenses);
    
    if (surplus > 5000) {
      return [{
        type: 'investment_recommendation',
        title: `${riskProfile === 'aggressive' ? 'Equity-focused' : riskProfile === 'moderate' ? 'Balanced' : 'Conservative'} Investment Strategy`,
        description: `With ₹${surplus.toLocaleString()} monthly surplus, you can build a ${riskProfile} investment portfolio.`,
        confidence: 0.8,
        actionableSteps: [
          'Start with tax-saving ELSS funds',
          `Allocate ${riskProfile === 'aggressive' ? '70%' : riskProfile === 'moderate' ? '50%' : '30%'} to equity funds`,
          'Maintain emergency fund of 6-12 months expenses',
          'Review and rebalance portfolio quarterly'
        ],
        potentialImpact: `Potential wealth creation of ₹${(surplus * 12 * 10 * 1.12).toLocaleString()} over 10 years`,
        timeframe: 'Long-term (5+ years)',
        priority: 'high'
      }];
    }

    return [];
  }

  private static getFallbackExplanations(concepts: string[]): { [concept: string]: string } {
    const explanations: { [concept: string]: string } = {};
    
    concepts.forEach(concept => {
      explanations[concept] = `${concept} is an important financial concept. Please consult with a financial advisor for detailed explanation specific to your situation.`;
    });
    
    return explanations;
  }

  /**
   * Update LLM configuration
   */
  static updateConfig(newConfig: Partial<LLMConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Check if LLM service is properly configured
   */
  static isConfigured(): boolean {
    return !!this.config.apiKey && this.config.apiKey.length > 0;
  }

  /**
   * Get current configuration status
   */
  static getConfigStatus(): { configured: boolean; model: string; hasApiKey: boolean } {
    return {
      configured: this.isConfigured(),
      model: this.config.model,
      hasApiKey: !!this.config.apiKey
    };
  }
}