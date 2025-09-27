import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { User, CreditCard, Building, FileText, Bell, Link, CheckCircle2, Plus, Download, Loader2, AlertCircle, X, Upload, Clock, Filter, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner@2.0.3";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../contexts/AuthContext";
import { DatabaseAPI } from "../utils/supabase/client";

// Interface definitions
interface SavedReport {
  id: string;
  name: string;
  type: string;
  date: string;
  size: string;
  downloadUrl?: string;
}

interface LinkedAccount {
  id: string;
  bank: string;
  account: string;
  type: string;
  status: 'connected' | 'pending' | 'failed';
  icon: any;
  balance?: string;
}

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  pan: string;
}

interface NotificationSettings {
  taxReminders: boolean;
  cibilAlerts: boolean;
  spendingInsights: boolean;
  investmentTips: boolean;
}

const bankOptions = [
  { name: "State Bank of India", code: "SBI" },
  { name: "HDFC Bank", code: "HDFC" },
  { name: "ICICI Bank", code: "ICICI" },
  { name: "Axis Bank", code: "AXIS" },
  { name: "Kotak Mahindra Bank", code: "KOTAK" },
  { name: "Punjab National Bank", code: "PNB" },
  { name: "Bank of Baroda", code: "BOB" },
  { name: "Canara Bank", code: "CANARA" },
  { name: "Union Bank of India", code: "UNION" },
  { name: "IDFC First Bank", code: "IDFC" }
];

export function ProfileSection() {
  const { user, session } = useAuth();
  
  // State management
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "",
    email: "",
    phone: "",
    pan: ""
  });

  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([]);
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [transactionHistory, setTransactionHistory] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<NotificationSettings>({
    taxReminders: true,
    cibilAlerts: true,
    spendingInsights: false,
    investmentTips: true
  });

  const [isUpdating, setIsUpdating] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [downloadingReports, setDownloadingReports] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Load user data when user changes
  useEffect(() => {
    if (user && session?.access_token) {
      loadUserData();
    } else {
      // Reset data when user logs out
      setUserProfile({ name: "", email: "", phone: "", pan: "" });
      setLinkedAccounts([]);
      setSavedReports([]);
      setUploadedFiles([]);
      setTransactionHistory([]);
      setNotifications({
        taxReminders: true,
        cibilAlerts: true,
        spendingInsights: false,
        investmentTips: true
      });
      setLoading(false);
    }
  }, [user, session]);

  const loadUserData = async () => {
    if (!user || !session?.access_token) return;
    
    setLoading(true);
    try {
      // Load profile data
      try {
        const profileResponse = await DatabaseAPI.getProfile(user.id, session.access_token);
        setUserProfile({
          name: profileResponse.profile.name || user.user_metadata?.name || "",
          email: profileResponse.profile.email || user.email || "",
          phone: profileResponse.profile.phone || "",
          pan: profileResponse.profile.pan || ""
        });
      } catch (error) {
        // If profile doesn't exist, create one with user metadata
        setUserProfile({
          name: user.user_metadata?.name || "",
          email: user.email || "",
          phone: "",
          pan: ""
        });
      }

      // Load connected accounts
      try {
        const accountsResponse = await DatabaseAPI.getAccounts(user.id, session.access_token);
        const accountsWithIcons = accountsResponse.accounts.map((acc: any) => ({
          ...acc,
          icon: acc.type === 'Credit Card' ? CreditCard : Building
        }));
        setLinkedAccounts(accountsWithIcons);
      } catch (error) {
        console.error('Error loading accounts:', error);
      }

      // Load notification settings
      try {
        const notificationResponse = await DatabaseAPI.getNotificationSettings(user.id, session.access_token);
        setNotifications(notificationResponse.settings);
      } catch (error) {
        console.error('Error loading notifications:', error);
      }

      // Load saved reports
      try {
        const reportsResponse = await DatabaseAPI.getReports(user.id, session.access_token);
        setSavedReports(reportsResponse.reports);
      } catch (error) {
        console.error('Error loading reports:', error);
      }

      // Load uploaded files
      try {
        const filesResponse = await DatabaseAPI.getUserFiles(user.id, session.access_token);
        setUploadedFiles(filesResponse.files);
      } catch (error) {
        console.error('Error loading files:', error);
      }

      // Generate transaction history from uploaded files and reports (after all data is loaded)
      setTimeout(() => {
        const currentReports = JSON.parse(sessionStorage.getItem('generatedReports') || '[]');
        const currentFiles = uploadedFiles;
        
        const history = [
          ...savedReports.map((report: any) => ({
            id: report.id,
            type: 'report',
            title: report.name,
            description: `${report.type} report generated`,
            date: report.created_at || report.date,
            icon: FileText,
            category: 'Reports'
          })),
          ...uploadedFiles.map((file: any) => ({
            id: file.id,
            type: 'upload',
            title: file.name,
            description: `File uploaded (${(file.size / (1024 * 1024)).toFixed(2)} MB)`,
            date: file.uploaded_at,
            icon: Upload,
            category: 'Uploads'
          })),
          ...linkedAccounts.map((account: any) => ({
            id: `account_${account.id}`,
            type: 'connection',
            title: `${account.bankName} Connected`,
            description: `${account.accountType} account linked successfully`,
            date: account.created_at,
            icon: Building,
            category: 'Connections'
          }))
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        setTransactionHistory(history.slice(0, 50)); // Limit to 50 recent items
      }, 100);

    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error("Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  // Handle profile update
  const handleUpdateProfile = async () => {
    if (!user || !session?.access_token) {
      toast.error("Please log in to update your profile");
      return;
    }

    setIsUpdating(true);
    
    try {
      await DatabaseAPI.updateProfile(user.id, userProfile, session.access_token);
      toast.success("Profile updated successfully!", {
        description: "Your account information has been saved."
      });
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast.error("Failed to update profile", {
        description: error.message || "Please try again later."
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle connecting new account
  const handleConnectAccount = async (bankData: any) => {
    if (!user || !session?.access_token) {
      toast.error("Please log in to connect accounts");
      return;
    }

    setIsConnecting(true);
    
    try {
      const accountResponse = await DatabaseAPI.connectAccount(user.id, {
        bankName: bankData.bankName,
        accountType: bankData.accountType,
        accountNumber: bankData.accountNumber,
        ifscCode: bankData.ifscCode,
        accountHolderName: bankData.accountHolderName,
        account: `****${bankData.accountNumber.slice(-4)}`
      }, session.access_token);

      const newAccountWithIcon = {
        ...accountResponse.account,
        icon: accountResponse.account.accountType === 'Credit Card' ? CreditCard : Building
      };

      setLinkedAccounts(prev => [...prev, newAccountWithIcon]);
      
      toast.success(`${bankData.bankName} account connected successfully!`, {
        description: `Your ${bankData.accountType.toLowerCase()} account is now linked.`
      });
      
      setIsConnectModalOpen(false);
    } catch (error: any) {
      console.error('Account connection error:', error);
      toast.error("Failed to connect account", {
        description: error.message || "Please check your credentials and try again."
      });
    } finally {
      setIsConnecting(false);
    }
  };

  // Handle notification toggle
  const handleNotificationToggle = async (setting: keyof NotificationSettings) => {
    if (!user || !session?.access_token) {
      toast.error("Please log in to update notification settings");
      return;
    }

    const newSettings = {
      ...notifications,
      [setting]: !notifications[setting]
    };
    
    try {
      await DatabaseAPI.updateNotificationSettings(user.id, newSettings, session.access_token);
      setNotifications(newSettings);
      
      toast.success("Notification settings updated", {
        description: `${setting.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} ${newSettings[setting] ? 'enabled' : 'disabled'}`
      });
    } catch (error: any) {
      console.error('Notification update error:', error);
      toast.error("Failed to update notification settings", {
        description: error.message
      });
    }
  };

  // Handle report download
  const handleDownloadReport = async (report: SavedReport) => {
    setDownloadingReports(prev => new Set([...prev, report.id]));
    
    try {
      // Simulate download process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create and trigger download
      const reportContent = JSON.stringify({
        reportName: report.name,
        reportType: report.type,
        generatedDate: report.date,
        size: report.size,
        data: {
          summary: "This is a comprehensive financial report generated by TaxWise AI",
          metrics: {
            taxSavings: "₹15,000",
            cibilScore: "782",
            financialHealthScore: "8.2/10"
          }
        }
      }, null, 2);
      
      const blob = new Blob([reportContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${report.name}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success("Report downloaded successfully!", {
        description: `${report.name} has been saved to your downloads folder.`
      });
    } catch (error) {
      toast.error("Download failed", {
        description: "Please try again later."
      });
    } finally {
      setDownloadingReports(prev => {
        const newSet = new Set(prev);
        newSet.delete(report.id);
        return newSet;
      });
    }
  };

  // Handle account removal
  const handleRemoveAccount = async (accountId: string) => {
    if (!user || !session?.access_token) {
      toast.error("Please log in to disconnect accounts");
      return;
    }

    try {
      await DatabaseAPI.disconnectAccount(user.id, accountId, session.access_token);
      setLinkedAccounts(prev => prev.filter(acc => acc.id !== accountId));
      toast.success("Account disconnected successfully");
    } catch (error: any) {
      console.error('Account disconnection error:', error);
      toast.error("Failed to disconnect account", {
        description: error.message
      });
    }
  };

  // Show login prompt if not authenticated
  if (!user) {
    return (
      <section id="profile" className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-wine mb-4">
              Profile & Settings
            </h2>
            <p className="text-xl text-wine/70 max-w-2xl mx-auto mb-8">
              Please log in to access your profile and settings.
            </p>
            <Button 
              onClick={() => window.dispatchEvent(new CustomEvent('openAuthModal'))}
              className="bg-plum hover:bg-plum/90 text-white"
            >
              Login to Continue
            </Button>
          </div>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section id="profile" className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Loader2 size={48} className="animate-spin text-plum mx-auto mb-4" />
            <p className="text-wine/70">Loading your profile...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="profile" className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-wine mb-4">
            Profile & Settings
          </h2>
          <p className="text-xl text-wine/70 max-w-2xl mx-auto">
            Manage your account information, connected accounts, and notification preferences 
            for a personalized experience.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* User Information */}
          <Card className="border border-wine/20">
            <CardHeader>
              <CardTitle className="text-wine flex items-center gap-2">
                <User size={24} />
                User Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={userProfile.name}
                  onChange={(e) => setUserProfile(prev => ({ ...prev, name: e.target.value }))}
                  className="border-wine/20 focus:border-plum"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={userProfile.email}
                  onChange={(e) => setUserProfile(prev => ({ ...prev, email: e.target.value }))}
                  className="border-wine/20 focus:border-plum"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={userProfile.phone}
                  onChange={(e) => setUserProfile(prev => ({ ...prev, phone: e.target.value }))}
                  className="border-wine/20 focus:border-plum"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="pan">PAN Number</Label>
                <Input
                  id="pan"
                  value={userProfile.pan}
                  onChange={(e) => setUserProfile(prev => ({ ...prev, pan: e.target.value.toUpperCase() }))}
                  className="border-wine/20 focus:border-plum"
                />
              </div>
              
              <Button 
                onClick={handleUpdateProfile}
                disabled={isUpdating}
                className="w-full bg-plum hover:bg-plum/90 text-white"
              >
                {isUpdating ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Profile'
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Connected Accounts */}
          <Card className="border border-wine/20">
            <CardHeader>
              <CardTitle className="text-wine flex items-center gap-2">
                <Link size={24} />
                Connected Accounts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <AnimatePresence>
                  {linkedAccounts.map((account) => (
                    <motion.div
                      key={account.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center justify-between p-3 border border-wine/10 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-wine/10 rounded-lg flex items-center justify-center">
                          <account.icon size={20} className="text-wine" />
                        </div>
                        <div>
                          <div className="font-medium text-wine">{account.bankName}</div>
                          <div className="text-sm text-wine/60">
                            {account.account} • {account.accountType}
                            {account.balance && ` • ${account.balance}`}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={account.status === 'connected' ? 'default' : account.status === 'pending' ? 'outline' : 'destructive'}
                          className={
                            account.status === 'connected' ? 'bg-green-100 text-green-800' : 
                            account.status === 'pending' ? 'text-yellow-600 border-yellow-300' : 
                            'bg-red-100 text-red-800'
                          }
                        >
                          {account.status === 'connected' ? (
                            <><CheckCircle2 size={12} className="mr-1" /> Connected</>
                          ) : account.status === 'pending' ? (
                            'Pending'
                          ) : (
                            <><AlertCircle size={12} className="mr-1" /> Failed</>
                          )}
                        </Badge>
                        {account.status === 'connected' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveAccount(account.id)}
                            className="text-wine/60 hover:text-wine"
                          >
                            <X size={14} />
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              
              <Dialog open={isConnectModalOpen} onOpenChange={setIsConnectModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full mt-4 border-plum text-plum hover:bg-plum hover:text-white">
                    <Plus size={16} className="mr-2" />
                    Connect New Account
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Connect New Bank Account</DialogTitle>
                  </DialogHeader>
                  <ConnectAccountForm 
                    onConnect={handleConnectAccount}
                    isConnecting={isConnecting}
                    bankOptions={bankOptions}
                  />
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="border border-wine/20">
            <CardHeader>
              <CardTitle className="text-wine flex items-center gap-2">
                <Bell size={24} />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-wine">Tax Reminders</div>
                    <div className="text-sm text-wine/60">Get notified about tax deadlines</div>
                  </div>
                  <Switch 
                    checked={notifications.taxReminders}
                    onCheckedChange={() => handleNotificationToggle('taxReminders')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-wine">CIBIL Alerts</div>
                    <div className="text-sm text-wine/60">Monthly credit score updates</div>
                  </div>
                  <Switch 
                    checked={notifications.cibilAlerts}
                    onCheckedChange={() => handleNotificationToggle('cibilAlerts')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-wine">Spending Insights</div>
                    <div className="text-sm text-wine/60">Weekly spending analysis</div>
                  </div>
                  <Switch 
                    checked={notifications.spendingInsights}
                    onCheckedChange={() => handleNotificationToggle('spendingInsights')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-wine">Investment Tips</div>
                    <div className="text-sm text-wine/60">AI-powered recommendations</div>
                  </div>
                  <Switch 
                    checked={notifications.investmentTips}
                    onCheckedChange={() => handleNotificationToggle('investmentTips')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Saved Reports */}
        <Card className="mt-8 border border-wine/20">
          <CardHeader>
            <CardTitle className="text-wine flex items-center gap-2">
              <FileText size={24} />
              Saved Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <AnimatePresence>
                {savedReports.map((report) => (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="border border-wine/10 rounded-lg p-4 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 bg-plum/10 rounded-lg flex items-center justify-center">
                        <FileText size={20} className="text-plum" />
                      </div>
                      <Badge variant="outline" className="text-wine/60">
                        {report.type}
                      </Badge>
                    </div>
                    
                    <h3 className="font-medium text-wine mb-2">{report.name}</h3>
                    <div className="text-sm text-wine/60 mb-3">
                      <div>{report.date}</div>
                      <div>{report.size}</div>
                    </div>
                    
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full border-plum text-plum hover:bg-plum hover:text-white"
                      onClick={() => handleDownloadReport(report)}
                      disabled={downloadingReports.has(report.id)}
                    >
                      {downloadingReports.has(report.id) ? (
                        <>
                          <Loader2 size={14} className="mr-2 animate-spin" />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <Download size={14} className="mr-2" />
                          Download
                        </>
                      )}
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            {savedReports.length === 0 && (
              <div className="text-center py-8 text-wine/60">
                <FileText size={48} className="mx-auto mb-4 opacity-50" />
                <p>No saved reports yet. Generate reports to see them here.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity History */}
        <Card className="mt-8 border border-wine/20">
          <CardHeader>
            <CardTitle className="text-wine flex items-center gap-2">
              <Clock size={24} />
              Activity History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Filter size={16} className="text-wine/60" />
                    <span className="text-sm text-wine/60">Filter by:</span>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-wine/60 cursor-pointer hover:bg-wine/5">
                      All
                    </Badge>
                    <Badge variant="outline" className="text-wine/60 cursor-pointer hover:bg-wine/5">
                      Uploads
                    </Badge>
                    <Badge variant="outline" className="text-wine/60 cursor-pointer hover:bg-wine/5">
                      Reports
                    </Badge>
                    <Badge variant="outline" className="text-wine/60 cursor-pointer hover:bg-wine/5">
                      Transactions
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-wine/60">
                  <Calendar size={16} />
                  Last 30 days
                </div>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                <AnimatePresence>
                  {transactionHistory.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                      className="flex items-center gap-4 p-4 border border-wine/10 rounded-lg hover:shadow-sm transition-shadow"
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        item.type === 'upload' ? 'bg-blue-50' : 
                        item.type === 'report' ? 'bg-green-50' : 'bg-purple-50'
                      }`}>
                        <item.icon size={20} className={
                          item.type === 'upload' ? 'text-blue-600' : 
                          item.type === 'report' ? 'text-green-600' : 'text-purple-600'
                        } />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-wine">{item.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {item.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-wine/60 mt-1">{item.description}</p>
                        <div className="text-xs text-wine/50 mt-2 flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(item.date).toLocaleDateString('en-GB', { 
                            day: '2-digit', 
                            month: 'short', 
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {transactionHistory.length === 0 && (
                <div className="text-center py-12 text-wine/60">
                  <Clock size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="mb-2">No activity history yet</p>
                  <p className="text-sm">Upload files or generate reports to see your activity here</p>
                </div>
              )}

              {/* Quick Stats */}
              <div className="mt-6 grid grid-cols-3 gap-4 pt-4 border-t border-wine/10">
                <div className="text-center">
                  <div className="text-2xl font-bold text-wine">{uploadedFiles.length}</div>
                  <div className="text-sm text-wine/60">Files Uploaded</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-wine">{savedReports.length}</div>
                  <div className="text-sm text-wine/60">Reports Generated</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-wine">{linkedAccounts.filter(acc => acc.status === 'connected').length}</div>
                  <div className="text-sm text-wine/60">Accounts Connected</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

// Connect Account Form Component
function ConnectAccountForm({ 
  onConnect, 
  isConnecting, 
  bankOptions 
}: { 
  onConnect: (data: any) => void;
  isConnecting: boolean;
  bankOptions: { name: string; code: string; }[];
}) {
  const [formData, setFormData] = useState({
    bankName: '',
    accountType: '',
    accountNumber: '',
    ifscCode: '',
    accountHolderName: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConnect(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="bank">Select Bank</Label>
        <Select onValueChange={(value) => setFormData(prev => ({ ...prev, bankName: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Choose your bank" />
          </SelectTrigger>
          <SelectContent>
            {bankOptions.map((bank) => (
              <SelectItem key={bank.code} value={bank.name}>
                {bank.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="accountType">Account Type</Label>
        <Select onValueChange={(value) => setFormData(prev => ({ ...prev, accountType: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Select account type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Savings">Savings Account</SelectItem>
            <SelectItem value="Current">Current Account</SelectItem>
            <SelectItem value="Credit Card">Credit Card</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="accountNumber">Account Number</Label>
        <Input
          id="accountNumber"
          placeholder="Enter account number"
          value={formData.accountNumber}
          onChange={(e) => setFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="ifscCode">IFSC Code</Label>
        <Input
          id="ifscCode"
          placeholder="Enter IFSC code"
          value={formData.ifscCode}
          onChange={(e) => setFormData(prev => ({ ...prev, ifscCode: e.target.value.toUpperCase() }))}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="accountHolderName">Account Holder Name</Label>
        <Input
          id="accountHolderName"
          placeholder="Enter account holder name"
          value={formData.accountHolderName}
          onChange={(e) => setFormData(prev => ({ ...prev, accountHolderName: e.target.value }))}
          required
        />
      </div>

      <Button 
        type="submit" 
        className="w-full bg-plum hover:bg-plum/90 text-white"
        disabled={isConnecting || !formData.bankName || !formData.accountType}
      >
        {isConnecting ? (
          <>
            <Loader2 size={16} className="mr-2 animate-spin" />
            Connecting...
          </>
        ) : (
          'Connect Account'
        )}
      </Button>
    </form>
  );
}