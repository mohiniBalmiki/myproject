/* TaxWise Supabase Configuration */

export const projectId = "czamypmzklsjqxstrruh"
export const publicAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6YW15cG16a2xzanF4c3RycnVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5Nzg5NTUsImV4cCI6MjA3NDU1NDk1NX0.bFBcnYe07SSvNq45o0aDKA4dxixmoYYfm_xjFutybDw"
export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || `https://${projectId}.supabase.co`