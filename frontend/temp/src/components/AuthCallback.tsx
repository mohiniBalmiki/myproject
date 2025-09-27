import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get parameters from URL
        const token_hash = searchParams.get('token_hash');
        const type = searchParams.get('type');
        const error = searchParams.get('error');
        const error_description = searchParams.get('error_description');

        if (error) {
          setStatus('error');
          setMessage(error_description || error);
          return;
        }

        if (!token_hash || !type) {
          setStatus('error');
          setMessage('Invalid verification link. Please try again or request a new verification email.');
          return;
        }

        // Confirm email with backend
        const response = await fetch('/api/auth/confirm-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token_hash,
            type
          }),
        });

        const data = await response.json();

        if (data.success) {
          setStatus('success');
          setMessage('Email verified successfully! You can now access your account.');
          
          // Store session data
          if (data.session) {
            localStorage.setItem('supabase.auth.token', JSON.stringify(data.session));
          }
          
          toast.success('Email verified successfully!', {
            description: 'Welcome to TaxWise! Your account is now active.'
          });
          
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        } else {
          setStatus('error');
          setMessage(data.error || 'Email verification failed');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setMessage('An error occurred during email verification. Please try again.');
      }
    };

    handleAuthCallback();
  }, [searchParams, navigate]);

  const handleResendVerification = async () => {
    const email = searchParams.get('email');
    if (!email) {
      toast.error('Email address not found. Please try signing up again.');
      navigate('/');
      return;
    }

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Verification email sent!', {
          description: 'Please check your inbox for the new verification link.'
        });
      } else {
        toast.error('Failed to resend verification email', {
          description: data.error
        });
      }
    } catch (error) {
      toast.error('Error sending verification email');
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md border border-wine/20">
        <CardHeader className="text-center">
          <CardTitle className="text-wine">Email Verification</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          {status === 'loading' && (
            <>
              <div className="flex justify-center">
                <Loader2 size={48} className="animate-spin text-plum" />
              </div>
              <div>
                <h3 className="font-semibold text-wine mb-2">Verifying your email...</h3>
                <p className="text-wine/70 text-sm">Please wait while we confirm your email address.</p>
              </div>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle size={32} className="text-green-600" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-wine mb-2">Email Verified Successfully!</h3>
                <p className="text-wine/70 text-sm">{message}</p>
                <p className="text-wine/70 text-sm mt-2">Redirecting you to your dashboard...</p>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle size={32} className="text-red-600" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-wine mb-2">Verification Failed</h3>
                <p className="text-wine/70 text-sm">{message}</p>
              </div>
              <div className="space-y-3">
                <Button
                  onClick={handleResendVerification}
                  className="w-full bg-plum hover:bg-plum/90 text-white"
                >
                  <Mail size={16} className="mr-2" />
                  Resend Verification Email
                </Button>
                <Button
                  onClick={handleBackToHome}
                  variant="outline"
                  className="w-full border-wine text-wine hover:bg-wine hover:text-white"
                >
                  Back to Home
                </Button>
              </div>
            </>
          )}

          {(status === 'success' || status === 'loading') && (
            <div className="pt-4 border-t border-wine/10">
              <Button
                onClick={handleBackToHome}
                variant="outline"
                className="w-full border-wine text-wine hover:bg-wine hover:text-white"
              >
                Back to Home
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}