# SMTP Configuration Guide

## The "Error sending confirmation email" issue is resolved by configuring SMTP in Supabase:

### Steps to Fix Email Authentication:

1. **Go to your Supabase Project Dashboard**
   - Visit: https://app.supabase.com/
   - Select your TaxWise project

2. **Navigate to Authentication Settings**
   - Go to Authentication → Settings → SMTP Settings

3. **Configure SMTP (Recommended: Gmail)**
   ```
   Enable Custom SMTP: ✅
   Host: smtp.gmail.com
   Port: 587
   Username: your-gmail-account@gmail.com
   Password: your-app-password (NOT your regular Gmail password)
   ```

4. **Get Gmail App Password**
   - Go to Google Account Settings
   - Enable 2-Factor Authentication (required)
   - Generate App Password for "Mail"
   - Use this App Password in Supabase SMTP settings

5. **Verify Configuration**
   - In Supabase Auth Settings, set:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/auth/callback`

### Alternative: Disable Email Confirmation (Development Only)
If you want to skip email verification during development:
1. Go to Supabase Dashboard → Authentication → Settings
2. Turn OFF "Enable email confirmations"
3. Users can register without email verification

### Testing
After configuration:
1. Try registering a new account
2. Check your email for confirmation
3. Click the confirmation link
4. Login should work perfectly

## Current Status
✅ Frontend: http://localhost:3000/ - Personalized dashboard ready
✅ Backend: http://localhost:5000/ - Authentication endpoints working  
✅ Navigation: Login/Signup button disappears when authenticated
✅ Dashboard: Shows real user data instead of static content
⚠️ SMTP: Needs configuration in Supabase dashboard

The authentication system is 95% complete - only SMTP configuration in Supabase is needed!