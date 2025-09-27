-- Create remaining tables for TaxWise (Safe version - handles existing policies)

-- User Files Table
CREATE TABLE IF NOT EXISTS public.user_files (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    file_name varchar(255) NOT NULL,
    file_path varchar(500) NOT NULL,
    file_type varchar(100),
    file_size bigint,
    uploaded_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now()
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
    account varchar(50),
    status varchar(50) DEFAULT 'connected',
    balance varchar(50),
    created_at timestamp with time zone DEFAULT now()
);

-- User Reports Table
CREATE TABLE IF NOT EXISTS public.user_reports (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    name varchar(255) NOT NULL,
    type varchar(100) NOT NULL,
    content jsonb,
    date varchar(50),
    size varchar(20),
    created_at timestamp with time zone DEFAULT now()
);

-- Notification Settings Table
CREATE TABLE IF NOT EXISTS public.notification_settings (
    user_id uuid PRIMARY KEY REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    tax_reminders boolean DEFAULT true,
    cibil_alerts boolean DEFAULT true,
    spending_insights boolean DEFAULT false,
    investment_tips boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security (safe - won't error if already enabled)
ALTER TABLE public.user_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connected_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then create new ones
DROP POLICY IF EXISTS "Users can manage own files" ON public.user_files;
DROP POLICY IF EXISTS "Users can manage own accounts" ON public.connected_accounts;
DROP POLICY IF EXISTS "Users can manage own reports" ON public.user_reports;
DROP POLICY IF EXISTS "Users can manage own settings" ON public.notification_settings;

-- Create Security Policies
CREATE POLICY "Users can manage own files" ON public.user_files
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own accounts" ON public.connected_accounts
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own reports" ON public.user_reports
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own settings" ON public.notification_settings
    FOR ALL USING (auth.uid() = user_id);

-- Grant Permissions (safe - won't error if already granted)
GRANT ALL ON public.user_files TO anon, authenticated;
GRANT ALL ON public.connected_accounts TO anon, authenticated;
GRANT ALL ON public.user_reports TO anon, authenticated;
GRANT ALL ON public.notification_settings TO anon, authenticated;

-- Success message
SELECT 'All tables and policies created successfully!' as status;