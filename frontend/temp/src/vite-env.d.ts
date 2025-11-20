/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_BACKEND_URL: string
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
  readonly VITE_APP_DESCRIPTION: string
  readonly VITE_ENABLE_DEMO_MODE: string
  readonly VITE_ENABLE_FILE_UPLOAD: string
  readonly VITE_ENABLE_TAX_CALCULATOR: string
  readonly VITE_ENABLE_CIBIL_ANALYSIS: string
  readonly VITE_DEBUG_MODE: string
  readonly VITE_LOG_LEVEL: string
  readonly VITE_OPENAI_API_KEY: string
  readonly VITE_ML_API_ENDPOINT: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}