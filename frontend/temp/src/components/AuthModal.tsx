import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
  onDemo: () => void;
}

export function AuthModal({ isOpen, onClose, onLogin, onDemo }: AuthModalProps) {
  const { signIn, signUp, resendVerification } = useAuth();
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Signup form state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [pan, setPan] = useState("");
  
  // Loading states
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginEmail || !loginPassword) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoggingIn(true);
    
    try {
      await signIn(loginEmail, loginPassword);
      toast.success("Successfully logged in!");
      onLogin();
      onClose();
      
      // Reset form
      setLoginEmail("");
      setLoginPassword("");
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle email verification requirement
      if (error.message?.includes('verify your email') || error.message?.includes('requires_verification')) {
        toast.error("Email verification required", {
          description: "Please check your email and click the verification link before logging in."
        });
        
        // Show resend verification option
        const handleResendVerification = async () => {
          try {
            await resendVerification(loginEmail);
            toast.success("Verification email sent!", {
              description: "Please check your inbox for the verification link."
            });
          } catch (err: any) {
            toast.error(err.message || "Failed to resend verification email");
          }
        };
        
        // Add a button to resend verification (you can implement a custom toast with action)
        setTimeout(() => {
          toast.info("Need a new verification email?", {
            description: "We can send you another verification link.",
            action: {
              label: "Resend",
              onClick: handleResendVerification
            }
          });
        }, 2000);
      } else {
        toast.error(error.message || "Failed to log in");
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signupName || !signupEmail || !signupPassword) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (signupPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setIsSigningUp(true);
    
    try {
      await signUp(signupEmail, signupPassword, signupName, { phone, pan });
      toast.success("Account created successfully!", {
        description: "Please check your email and click the verification link to activate your account."
      });
      
      // Don't automatically log in - wait for email verification
      onClose();
      
      // Reset form
      setSignupName("");
      setSignupEmail("");
      setSignupPassword("");
      setPhone("");
      setPan("");
    } catch (error: any) {
      console.error('Signup error:', error);
      
      // Handle specific error messages
      if (error.message?.includes('confirmation email') || error.message?.includes('SMTP')) {
        // SMTP error - offer development registration
        toast.error("Email service unavailable", {
          description: "Trying alternative registration method...",
          duration: 2000
        });
        
        // Try development registration as fallback
        try {
          const response = await fetch('/api/auth/register-dev', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: signupEmail,
              password: signupPassword,
              name: signupName,
              phone,
              pan
            }),
          });

          const data = await response.json();

          if (data.success) {
            toast.success("Account created successfully!", {
              description: "Your account is ready to use. No email verification required in development mode."
            });
            onClose();
            
            // Reset form
            setSignupName("");
            setSignupEmail("");
            setSignupPassword("");
            setPhone("");
            setPan("");
          } else {
            throw new Error(data.error);
          }
        } catch (devError: any) {
          toast.error("Registration failed", {
            description: "Please contact support or try again later."
          });
        }
      } else if (error.message?.includes('requires_verification')) {
        toast.info("Account created!", {
          description: "Please check your email and verify your account before logging in."
        });
        onClose();
      } else {
        toast.error(error.message || "Failed to create account");
      }
    } finally {
      setIsSigningUp(false);
    }
  };

  const handleDemo = () => {
    onDemo();
    onClose();
    toast.success("Welcome to Demo Mode! Exploring with sample data.");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border border-wine/20">
        <DialogHeader>
          <DialogTitle className="text-wine text-center">Welcome to TaxWise</DialogTitle>
          <DialogDescription className="text-wine/70 text-center">
            Sign in to access your personalized tax and credit health dashboard
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="Enter your email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="border-wine/20 focus:border-plum"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="Enter your password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="border-wine/20 focus:border-plum"
                  required
                />
              </div>
              <Button 
                type="submit" 
                disabled={isLoggingIn}
                className="w-full bg-plum hover:bg-plum/90 text-white"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  'Login'
                )}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="signup" className="space-y-4">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name">Full Name</Label>
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="Enter your full name"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  className="border-wine/20 focus:border-plum"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="Enter your email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  className="border-wine/20 focus:border-plum"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="Create a password (min. 6 characters)"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  className="border-wine/20 focus:border-plum"
                  required
                  minLength={6}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone (Optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="border-wine/20 focus:border-plum"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pan">PAN (Optional)</Label>
                  <Input
                    id="pan"
                    type="text"
                    placeholder="PAN number"
                    value={pan}
                    onChange={(e) => setPan(e.target.value.toUpperCase())}
                    className="border-wine/20 focus:border-plum"
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                disabled={isSigningUp}
                className="w-full bg-plum hover:bg-plum/90 text-white"
              >
                {isSigningUp ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Sign Up'
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-wine/20" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-wine/60">Or</span>
          </div>
        </div>
        
        <Button 
          onClick={handleDemo} 
          variant="outline" 
          className="w-full border-plum text-plum hover:bg-plum hover:text-white"
        >
          Continue as Guest/Demo
        </Button>
      </DialogContent>
    </Dialog>
  );
}