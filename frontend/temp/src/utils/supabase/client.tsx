import { createClient } from '@supabase/supabase-js'
import { projectId, publicAnonKey, supabaseUrl } from './info'

// Create a single supabase client for interacting with your database
export const supabase = createClient(
  supabaseUrl,
  publicAnonKey
)

// API helper functions - Connect to your Flask backend
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5000'

// API Configuration
export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  getAuthHeaders: (accessToken?: string) => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken || publicAnonKey}`
  })
}

// Simplified API helper class - Non-auth methods only
export class DatabaseAPI {

  // Profile methods - Updated for Flask backend
  static async getProfile(userId: string, accessToken: string) {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/auth/profile`, {
      method: 'GET',
      headers: API_CONFIG.getAuthHeaders(accessToken)
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch profile')
    }
    
    return response.json()
  }

  static async updateProfile(userId: string, profileData: any, accessToken: string) {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/auth/profile`, {
      method: 'PUT',
      headers: API_CONFIG.getAuthHeaders(accessToken),
      body: JSON.stringify(profileData)
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update profile')
    }
    
    return response.json()
  }

  // Dashboard methods - Mock data for now (backend uses different architecture)
  static async getDashboardOverview(userId: string, accessToken: string) {
    // Mock dashboard data that matches the DashboardSection component
    return {
      dashboard: {
        user_info: {
          name: "Sudan Jerald",
          email: "sudan@example.com",
          member_since: "September 2025"
        },
        financial_summary: {
          total_income: 1200000,
          total_expenses: 850000,
          net_savings: 350000,
          monthly_income: 100000,
          monthly_expenses: 70833,
          savings_rate: 29.2
        },
        tax_summary: {
          financial_year: "2023-24",
          gross_income: 1200000,
          tax_liability: 195000,
          recommended_regime: "Old Regime",
          potential_savings: 25000,
          deductions_utilized: 175000,
          last_calculated: new Date().toISOString()
        },
        cibil_summary: {
          current_score: 782,
          previous_score: 767,
          trend: "improving",
          score_category: "Excellent",
          last_updated: new Date().toISOString()
        },
        recent_activity: [
          {
            id: "1",
            type: "upload",
            description: "Bank statement uploaded",
            amount: 0,
            date: new Date(Date.now() - 86400000).toISOString()
          },
          {
            id: "2",
            type: "calculation",
            description: "Tax calculation completed",
            amount: 195000,
            date: new Date(Date.now() - 172800000).toISOString()
          },
          {
            id: "3",
            type: "report",
            description: "Financial report generated",
            amount: 0,
            date: new Date(Date.now() - 259200000).toISOString()
          }
        ],
        insights: [
          {
            type: "tax",
            message: "You could save ₹25,000 by maximizing your 80C deductions",
            impact: "high",
            action_required: true
          },
          {
            type: "savings",
            message: "Your savings rate of 29.2% is excellent! Keep it up.",
            impact: "medium",
            action_required: false
          },
          {
            type: "credit",
            message: "Your CIBIL score improved by 15 points this month",
            impact: "medium",
            action_required: false
          }
        ],
        last_updated: new Date().toISOString()
      }
    }
  }

  static async getChartData(userId: string, chartType: string, accessToken: string) {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/dashboard/charts/${userId}?type=${chartType}`, {
      method: 'GET',
      headers: API_CONFIG.getAuthHeaders(accessToken)
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch chart data')
    }
    
    return response.json()
  }

  // Health check method
  static async healthCheck() {
    const response = await fetch(`${API_CONFIG.BASE_URL}/health`, {
      method: 'GET',
      headers: API_CONFIG.getAuthHeaders()
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Backend health check failed')
    }
    
    return response.json()
  }

  // File methods - Updated for TaxWise backend
  static async uploadFile(userId: string, file: File, fileType: string, accessToken: string) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('user_id', userId)
    formData.append('file_type', fileType) // 'bank_statement', 'credit_card', 'csv'

    const response = await fetch(`${API_CONFIG.BASE_URL}/api/data/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      body: formData
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to upload file')
    }
    
    return response.json()
  }

  static async getUserTransactions(userId: string, accessToken: string) {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/data/transactions/${userId}`, {
      method: 'GET',
      headers: API_CONFIG.getAuthHeaders(accessToken)
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch transactions')
    }
    
    return response.json()
  }

  static async getFinancialData(userId: string, accessToken: string) {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/data/financial/${userId}`, {
      method: 'GET',
      headers: API_CONFIG.getAuthHeaders(accessToken)
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch financial data')
    }
    
    return response.json()
  }

  // Tax calculation methods
  static async calculateTax(userId: string, taxData: any, accessToken: string) {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/tax/calculate/${userId}`, {
      method: 'POST',
      headers: API_CONFIG.getAuthHeaders(accessToken),
      body: JSON.stringify(taxData)
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to calculate tax')
    }
    
    return response.json()
  }

  static async getTaxOptimization(userId: string, accessToken: string) {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/tax/optimization/${userId}`, {
      method: 'GET',
      headers: API_CONFIG.getAuthHeaders(accessToken)
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to get tax optimization')
    }
    
    return response.json()
  }

  // CIBIL methods
  static async getCibilScore(userId: string, accessToken: string) {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/cibil/score/${userId}`, {
      method: 'GET',
      headers: API_CONFIG.getAuthHeaders(accessToken)
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch CIBIL score')
    }
    
    return response.json()
  }

  static async getCibilRecommendations(userId: string, accessToken: string) {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/cibil/recommendations/${userId}`, {
      method: 'GET',
      headers: API_CONFIG.getAuthHeaders(accessToken)
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch CIBIL recommendations')
    }
    
    return response.json()
  }

  // Analytics and Insights methods  
  static async getSpendingAnalysis(userId: string, accessToken: string) {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/dashboard/charts/${userId}?type=spending`, {
      method: 'GET',
      headers: API_CONFIG.getAuthHeaders(accessToken)
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch spending analysis')
    }
    
    return response.json()
  }

  static async getIncomeAnalysis(userId: string, accessToken: string) {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/dashboard/charts/${userId}?type=income`, {
      method: 'GET',
      headers: API_CONFIG.getAuthHeaders(accessToken)
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch income analysis')
    }
    
    return response.json()
  }

  static async getTaxHistory(userId: string, accessToken: string) {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/tax/history/${userId}`, {
      method: 'GET',
      headers: API_CONFIG.getAuthHeaders(accessToken)
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch tax history')
    }
    
    return response.json()
  }

  // Additional methods for ProfileSection and other components
  static async getAccounts(userId: string, accessToken: string) {
    // Mock connected accounts data
    return {
      accounts: [
        {
          id: '1',
          bankName: 'HDFC Bank',
          accountType: 'Savings',
          account: '****1234',
          status: 'connected',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          bankName: 'SBI',
          accountType: 'Credit Card',
          account: '****5678',
          status: 'connected',
          created_at: new Date().toISOString()
        }
      ]
    }
  }

  static async connectAccount(userId: string, accountData: any, accessToken: string) {
    // Mock account connection
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
    return {
      account: {
        id: Date.now().toString(),
        bankName: accountData.bankName,
        accountType: accountData.accountType,
        account: accountData.account,
        status: 'connected',
        created_at: new Date().toISOString()
      }
    }
  }

  static async disconnectAccount(userId: string, accountId: string, accessToken: string) {
    // Mock account disconnection
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
    return { success: true }
  }

  static async getNotificationSettings(userId: string, accessToken: string) {
    // Mock notification settings
    return {
      settings: {
        taxReminders: true,
        cibilAlerts: true,
        spendingInsights: false,
        investmentTips: true
      }
    }
  }

  static async updateNotificationSettings(userId: string, settings: any, accessToken: string) {
    // Mock notification settings update
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
    return { success: true, settings }
  }

  static async getReports(userId: string, accessToken: string) {
    // Mock saved reports
    return {
      reports: [
        {
          id: '1',
          name: 'Tax Summary Report 2023-24',
          type: 'Tax Report',
          date: '2024-03-15',
          size: '2.3 MB',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          name: 'CIBIL Analysis Report',
          type: 'Credit Report',
          date: '2024-03-10',
          size: '1.8 MB',
          created_at: new Date().toISOString()
        }
      ]
    }
  }

  static async saveReport(userId: string, reportData: any, accessToken: string) {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/reports`, {
      method: 'POST',
      headers: API_CONFIG.getAuthHeaders(accessToken),
      body: JSON.stringify({ user_id: userId, ...reportData })
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to save report')
    }
    
    return response.json()
  }

  static async getUserFiles(userId: string, accessToken: string) {
    // Mock uploaded files
    return {
      files: [
        {
          id: '1',
          name: 'Bank_Statement_March_2024.pdf',
          size: 1024 * 1024 * 2.5, // 2.5 MB
          uploaded_at: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: '2',
          name: 'Credit_Card_Statement_March_2024.pdf',
          size: 1024 * 1024 * 1.2, // 1.2 MB
          uploaded_at: new Date(Date.now() - 172800000).toISOString()
        }
      ]
    }
  }
}