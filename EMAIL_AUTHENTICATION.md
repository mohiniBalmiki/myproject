# TaxWise Email Authentication System

## Overview
TaxWise now includes a complete email authentication system with email verification powered by Supabase Auth. Users must verify their email addresses before being able to log in to the platform.

## Architecture

### Backend (Flask API)
- **Framework**: Flask with Supabase integration
- **Database**: Supabase PostgreSQL with Row Level Security (RLS)
- **Authentication**: Supabase Auth with email verification
- **Endpoints**: RESTful API with comprehensive auth routes

### Frontend (React)
- **Framework**: React 18 with TypeScript
- **Router**: React Router DOM for auth callback handling
- **State Management**: Context API for authentication state
- **UI**: Radix UI components with custom styling

## Authentication Flow

### 1. User Registration
1. User fills out signup form with name, email, and password
2. Frontend calls `/api/auth/register` endpoint
3. Backend creates user in Supabase Auth (email_confirmed: false)
4. Supabase sends confirmation email automatically
5. User receives success message to check email

### 2. Email Verification
1. User clicks verification link in email
2. Link redirects to `/auth/callback?token=...&type=signup`
3. `AuthCallback` component handles the verification
4. Calls `/api/auth/confirm-email` endpoint
5. Backend confirms email and creates user profile
6. User is redirected with success message

### 3. User Login
1. User enters email and password
2. Frontend calls `/api/auth/login` endpoint
3. Backend checks if email is verified
4. If verified: returns session token
5. If not verified: shows resend verification option

### 4. Session Management
- JWT tokens stored in localStorage
- Automatic session refresh
- Context-based authentication state
- Supabase client session synchronization

## API Endpoints

### Authentication Routes (`/api/auth/`)

#### POST `/register`
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful. Please check your email for verification."
}
```

#### POST `/login`
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "session": {
    "access_token": "jwt_token",
    "refresh_token": "refresh_token"
  }
}
```

**Response (Email Not Verified):**
```json
{
  "success": false,
  "error": "Please verify your email before logging in.",
  "requires_verification": true
}
```

#### POST `/confirm-email`
```json
{
  "token": "confirmation_token",
  "type": "signup"
}
```

#### POST `/resend-verification`
```json
{
  "email": "user@example.com"
}
```

#### POST `/logout`
```json
{
  "access_token": "current_jwt_token"
}
```

## Database Schema

### Core Tables
1. **user_profiles** - Extended user information
2. **user_files** - Document uploads and processing
3. **connected_accounts** - Bank/financial account connections
4. **user_reports** - Generated tax and credit reports
5. **notification_settings** - User preferences

### Row Level Security (RLS)
- All tables have RLS policies enabled
- Users can only access their own data
- Policies based on `auth.uid()` matching user IDs

## Frontend Components

### AuthContext
- Manages authentication state globally
- Provides auth methods: `signUp`, `signIn`, `signOut`, `resendVerification`
- Handles session management and token storage

### AuthModal
- Combined login/signup modal
- Email verification error handling
- Resend verification functionality
- Demo mode access

### AuthCallback
- Handles email verification redirects
- Processes confirmation tokens
- Provides user feedback and navigation

## Configuration

### Environment Variables (Backend)
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
FLASK_ENV=development
FLASK_DEBUG=True
```

### Supabase Configuration
- Email templates configured for verification
- SMTP settings for email delivery
- Auth providers enabled: Email/Password
- Email confirmation required: Yes

## Security Features

### Password Requirements
- Minimum 6 characters
- Client-side and server-side validation

### Email Verification
- Required before account activation
- Secure token-based verification
- Automatic expiration handling

### Session Security
- JWT tokens with expiration
- Refresh token rotation
- Automatic logout on token expiry

### Database Security
- Row Level Security (RLS) policies
- User isolation at database level
- Secure API key management

## Error Handling

### Frontend Error Handling
- Toast notifications for user feedback
- Specific error messages for different scenarios
- Loading states during authentication
- Retry mechanisms for failed requests

### Backend Error Handling
- Comprehensive error responses
- Proper HTTP status codes
- Detailed error messages for debugging
- Graceful handling of Supabase errors

## Testing the System

### Manual Testing Steps

1. **Registration Test**
   - Navigate to http://localhost:3000
   - Click "Sign Up" tab in auth modal
   - Fill form and submit
   - Check for success message
   - Check email for verification link

2. **Email Verification Test**
   - Click link in verification email
   - Should redirect to app with success message
   - User profile should be created in database

3. **Login Test**
   - Try logging in before verification (should fail)
   - Try logging in after verification (should succeed)
   - Check session persistence on page refresh

4. **Resend Verification Test**
   - Try logging in with unverified account
   - Click "Resend" in the toast notification
   - Check for new verification email

## Production Deployment

### Backend Deployment
- Set production environment variables
- Configure proper CORS settings
- Set up SSL/HTTPS
- Use production database

### Frontend Deployment
- Update API base URL for production
- Build optimized production bundle
- Configure proper routing for auth callback
- Set up CDN for static assets

### Email Configuration
- Configure custom email templates
- Set up proper SMTP provider
- Configure custom domain for emails
- Set up email delivery monitoring

## Troubleshooting

### Common Issues

1. **Email not received**
   - Check spam folder
   - Verify SMTP configuration
   - Check Supabase email settings

2. **Auth callback not working**
   - Verify React Router configuration
   - Check callback URL in Supabase
   - Ensure proper route handling

3. **Session not persisting**
   - Check localStorage settings
   - Verify token expiration
   - Check Supabase client configuration

4. **Database connection errors**
   - Verify environment variables
   - Check Supabase service status
   - Verify database permissions

## Next Steps

### Potential Enhancements
1. **Password Reset**: Add forgot password functionality
2. **Two-Factor Authentication**: Implement 2FA with SMS/TOTP
3. **Social Login**: Add Google/Apple OAuth integration
4. **Email Templates**: Custom branded email templates
5. **Admin Panel**: User management dashboard
6. **Analytics**: Track authentication events
7. **Rate Limiting**: Prevent abuse of auth endpoints
8. **Session Management**: Advanced session controls

### Security Improvements
1. **Password Strength**: Enhanced password requirements
2. **Account Lockout**: Temporary lockout after failed attempts
3. **Device Trust**: Remember trusted devices
4. **IP Whitelisting**: Location-based security
5. **Audit Logs**: Track all authentication events

This email authentication system provides a solid foundation for TaxWise's user management while maintaining security best practices and providing a smooth user experience.