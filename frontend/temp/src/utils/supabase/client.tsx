import { createClient } from '@supabase/supabase-js'
import { projectId, publicAnonKey, supabaseUrl } from './info'

// Create a single supabase client for interacting with your database
export const supabase = createClient(
  supabaseUrl,
  publicAnonKey
)

// API helper functions - Connect to your Flask backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

export class DatabaseAPI {
  private static getAuthHeaders(accessToken?: string) {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken || publicAnonKey}`
    }
  }

  // Auth methods - Updated for Flask backend
  static async signUp(email: string, password: string, name: string, phone?: string, panNumber?: string) {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ 
        email, 
        password, 
        name,
        phone,
        pan_number: panNumber
      })
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Registration failed')
    }
    
    return response.json()
  }

  static async signIn(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ email, password })
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Login failed')
    }
    
    return response.json()
  }

  static async signOut(accessToken: string) {
    const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: this.getAuthHeaders(accessToken),
      body: JSON.stringify({ access_token: accessToken })
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Logout failed')
    }
    
    return response.json()
  }

  // Profile methods - Updated for Flask backend
  static async getProfile(userId: string, accessToken: string) {
    const response = await fetch(`${API_BASE_URL}/api/auth/profile/${userId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(accessToken)
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch profile')
    }
    
    return response.json()
  }

  static async updateProfile(userId: string, profileData: any, accessToken: string) {
    const response = await fetch(`${API_BASE_URL}/api/auth/profile/${userId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(accessToken),
      body: JSON.stringify(profileData)
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update profile')
    }
    
    return response.json()
  }

  // Dashboard methods - New for TaxWise backend
  static async getDashboardOverview(userId: string, accessToken: string) {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/overview/${userId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(accessToken)
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch dashboard data')
    }
    
    return response.json()
  }

  static async getChartData(userId: string, chartType: string, accessToken: string) {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/charts/${userId}?type=${chartType}`, {
      method: 'GET',
      headers: this.getAuthHeaders(accessToken)
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch chart data')
    }
    
    return response.json()
  }

  // Health check method
  static async healthCheck() {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: this.getAuthHeaders()
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

    const response = await fetch(`${API_BASE_URL}/api/data/upload`, {
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
    const response = await fetch(`${API_BASE_URL}/api/data/transactions/${userId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(accessToken)
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch transactions')
    }
    
    return response.json()
  }

  static async getFinancialData(userId: string, accessToken: string) {
    const response = await fetch(`${API_BASE_URL}/api/data/financial/${userId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(accessToken)
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch financial data')
    }
    
    return response.json()
  }

  // Tax calculation methods
  static async calculateTax(userId: string, taxData: any, accessToken: string) {
    const response = await fetch(`${API_BASE_URL}/api/tax/calculate/${userId}`, {
      method: 'POST',
      headers: this.getAuthHeaders(accessToken),
      body: JSON.stringify(taxData)
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to calculate tax')
    }
    
    return response.json()
  }

  static async getTaxOptimization(userId: string, accessToken: string) {
    const response = await fetch(`${API_BASE_URL}/api/tax/optimization/${userId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(accessToken)
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to get tax optimization')
    }
    
    return response.json()
  }

  // CIBIL methods
  static async getCibilScore(userId: string, accessToken: string) {
    const response = await fetch(`${API_BASE_URL}/api/cibil/score/${userId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(accessToken)
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch CIBIL score')
    }
    
    return response.json()
  }

  static async getCibilRecommendations(userId: string, accessToken: string) {
    const response = await fetch(`${API_BASE_URL}/api/cibil/recommendations/${userId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(accessToken)
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch CIBIL recommendations')
    }
    
    return response.json()
  }

  // Analytics and Insights methods  
  static async getSpendingAnalysis(userId: string, accessToken: string) {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/charts/${userId}?type=spending`, {
      method: 'GET',
      headers: this.getAuthHeaders(accessToken)
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch spending analysis')
    }
    
    return response.json()
  }

  static async getIncomeAnalysis(userId: string, accessToken: string) {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/charts/${userId}?type=income`, {
      method: 'GET',
      headers: this.getAuthHeaders(accessToken)
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch income analysis')
    }
    
    return response.json()
  }

  static async getTaxHistory(userId: string, accessToken: string) {
    const response = await fetch(`${API_BASE_URL}/api/tax/history/${userId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(accessToken)
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch tax history')
    }
    
    return response.json()
  }
}