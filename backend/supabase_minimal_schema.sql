-- TaxWise Minimum Schema for Initial Setup
-- Run this first in your Supabase Dashboard > SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Profiles Table (main table for user data)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
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
    created_at timestamp with time zone DEFAULT now()
);

-- Connected Accounts Table
CREATE TABLE IF NOT EXISTS public.connected_accounts (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    bank_name varchar(255) NOT NULL,
    account_type varchar(100) NOT NULL,
    account varchar(50),
    status varchar(50) DEFAULT 'connected',
    created_at timestamp with time zone DEFAULT now()
);

-- User Reports Table
CREATE TABLE IF NOT EXISTS public.user_reports (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    name varchar(255) NOT NULL,
    type varchar(100) NOT NULL,
    content jsonb,
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

-- Create a simple ping function for connection testing
CREATE OR REPLACE FUNCTION public.ping()
RETURNS text AS $$
BEGIN
    RETURN 'pong';
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connected_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies
CREATE POLICY "Users can manage own profile" ON public.user_profiles
    FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can manage own files" ON public.user_files
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own accounts" ON public.connected_accounts
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own reports" ON public.user_reports
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own settings" ON public.notification_settings
    FOR ALL USING (auth.uid() = user_id);

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;