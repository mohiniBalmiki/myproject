-- TaxWise Database Schema for Supabase
-- Run this SQL in your Supabase Dashboard > SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Profiles Table
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    email varchar(255) UNIQUE NOT NULL,
    name varchar(255),
    phone varchar(20),
    pan varchar(10),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- User Files Table
CREATE TABLE IF NOT EXISTS public.user_files (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    file_name varchar(255) NOT NULL,
    file_path varchar(500) NOT NULL,
    file_type varchar(100),
    file_size bigint,
    processing_status varchar(50) DEFAULT 'uploaded',
    extracted_data jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Connected Accounts Table
CREATE TABLE IF NOT EXISTS public.connected_accounts (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    bank_name varchar(255) NOT NULL,
    account_type varchar(100) NOT NULL,
    account_number varchar(100),
    ifsc_code varchar(20),
    account_holder_name varchar(255),
    account varchar(50), -- Masked account number for display
    status varchar(50) DEFAULT 'connected',
    balance decimal(15,2),
    last_synced timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- User Reports Table
CREATE TABLE IF NOT EXISTS public.user_reports (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    name varchar(255) NOT NULL,
    type varchar(100) NOT NULL,
    content jsonb,
    file_url varchar(500),
    size varchar(20),
    status varchar(50) DEFAULT 'completed',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Notification Settings Table
CREATE TABLE IF NOT EXISTS public.notification_settings (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    tax_reminders boolean DEFAULT true,
    cibil_alerts boolean DEFAULT true,
    spending_insights boolean DEFAULT false,
    investment_tips boolean DEFAULT true,
    email_notifications boolean DEFAULT true,
    sms_notifications boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id)
);

-- Financial Data Table (for storing processed financial information)
CREATE TABLE IF NOT EXISTS public.financial_data (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    file_id uuid REFERENCES public.user_files(id) ON DELETE CASCADE,
    transaction_date date,
    description text,
    amount decimal(15,2),
    transaction_type varchar(50), -- 'debit' or 'credit'
    category varchar(100),
    subcategory varchar(100),
    account_id uuid REFERENCES public.connected_accounts(id),
    is_recurring boolean DEFAULT false,
    tags text[],
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Tax Calculations Table
CREATE TABLE IF NOT EXISTS public.tax_calculations (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    financial_year varchar(10) NOT NULL,
    gross_income decimal(15,2),
    deductions jsonb, -- Store deduction details as JSON
    taxable_income decimal(15,2),
    old_regime_tax decimal(15,2),
    new_regime_tax decimal(15,2),
    recommended_regime varchar(20),
    savings_amount decimal(15,2),
    calculation_details jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- CIBIL Analysis Table
CREATE TABLE IF NOT EXISTS public.cibil_analysis (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    current_score integer,
    previous_score integer,
    score_date date DEFAULT current_date,
    factors jsonb, -- Store credit factors as JSON
    recommendations text[],
    improvement_plan jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_auth_id ON public.user_profiles(auth_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_files_user_id ON public.user_files(user_id);
CREATE INDEX IF NOT EXISTS idx_connected_accounts_user_id ON public.connected_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_user_id ON public.user_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_data_user_id ON public.financial_data(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_data_date ON public.financial_data(transaction_date);
CREATE INDEX IF NOT EXISTS idx_tax_calculations_user_id ON public.tax_calculations(user_id);
CREATE INDEX IF NOT EXISTS idx_cibil_analysis_user_id ON public.cibil_analysis(user_id);

-- Row Level Security (RLS) Policies
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connected_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cibil_analysis ENABLE ROW LEVEL SECURITY;

-- Policies to ensure users can only access their own data
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = auth_id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = auth_id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = auth_id);

CREATE POLICY "Users can view own files" ON public.user_files
    FOR SELECT USING (auth.uid() = (SELECT auth_id FROM public.user_profiles WHERE id = user_id));

CREATE POLICY "Users can insert own files" ON public.user_files
    FOR INSERT WITH CHECK (auth.uid() = (SELECT auth_id FROM public.user_profiles WHERE id = user_id));

CREATE POLICY "Users can view own accounts" ON public.connected_accounts
    FOR SELECT USING (auth.uid() = (SELECT auth_id FROM public.user_profiles WHERE id = user_id));

CREATE POLICY "Users can manage own accounts" ON public.connected_accounts
    FOR ALL USING (auth.uid() = (SELECT auth_id FROM public.user_profiles WHERE id = user_id));

CREATE POLICY "Users can view own reports" ON public.user_reports
    FOR SELECT USING (auth.uid() = (SELECT auth_id FROM public.user_profiles WHERE id = user_id));

CREATE POLICY "Users can manage own reports" ON public.user_reports
    FOR ALL USING (auth.uid() = (SELECT auth_id FROM public.user_profiles WHERE id = user_id));

CREATE POLICY "Users can view own settings" ON public.notification_settings
    FOR SELECT USING (auth.uid() = (SELECT auth_id FROM public.user_profiles WHERE id = user_id));

CREATE POLICY "Users can manage own settings" ON public.notification_settings
    FOR ALL USING (auth.uid() = (SELECT auth_id FROM public.user_profiles WHERE id = user_id));

CREATE POLICY "Users can view own financial data" ON public.financial_data
    FOR SELECT USING (auth.uid() = (SELECT auth_id FROM public.user_profiles WHERE id = user_id));

CREATE POLICY "Users can manage own financial data" ON public.financial_data
    FOR ALL USING (auth.uid() = (SELECT auth_id FROM public.user_profiles WHERE id = user_id));

CREATE POLICY "Users can view own tax calculations" ON public.tax_calculations
    FOR SELECT USING (auth.uid() = (SELECT auth_id FROM public.user_profiles WHERE id = user_id));

CREATE POLICY "Users can manage own tax calculations" ON public.tax_calculations
    FOR ALL USING (auth.uid() = (SELECT auth_id FROM public.user_profiles WHERE id = user_id));

CREATE POLICY "Users can view own cibil analysis" ON public.cibil_analysis
    FOR SELECT USING (auth.uid() = (SELECT auth_id FROM public.user_profiles WHERE id = user_id));

CREATE POLICY "Users can manage own cibil analysis" ON public.cibil_analysis
    FOR ALL USING (auth.uid() = (SELECT auth_id FROM public.user_profiles WHERE id = user_id));

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.user_files
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.connected_accounts
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.user_reports
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.notification_settings
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.financial_data
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.tax_calculations
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.cibil_analysis
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Create a simple ping function for connection testing
CREATE OR REPLACE FUNCTION public.ping()
RETURNS text AS $$
BEGIN
    RETURN 'pong';
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Insert some sample data for testing (optional)
-- This will only run if there are no existing profiles
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.user_profiles LIMIT 1) THEN
        -- You can add sample data here if needed for testing
        NULL;
    END IF;
END $$;

COMMIT;