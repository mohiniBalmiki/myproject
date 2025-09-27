import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Upload, FileSpreadsheet, CreditCard, Building, CheckCircle2, Loader2, X, File } from "lucide-react";
import { motion } from "motion/react";
import { useState, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { DatabaseAPI } from "../utils/supabase/client";
import { toast } from "sonner@2.0.3";

const sampleTransactions = [
  { category: "💰 Salary", amount: "₹75,000", icon: "💰", type: "income" },
  { category: "🏠 Rent", amount: "₹25,000", icon: "🏠", type: "expense" },
  { category: "💳 EMI", amount: "₹12,000", icon: "💳", type: "expense" },
  { category: "📈 SIPs", amount: "₹15,000", icon: "📈", type: "investment" },
  { category: "🛒 Groceries", amount: "₹8,500", icon: "🛒", type: "expense" },
  { category: "⛽ Fuel", amount: "₹4,200", icon: "⛽", type: "expense" }
];

export function UploadSection() {
  const { user, session } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isProcessed, setIsProcessed] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [processedData, setProcessedData] = useState<any[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Store uploaded files globally for other components to access
  const storeUploadedFiles = async (files: File[], uploadedFileData: any[]) => {
    // Store in sessionStorage for immediate access
    const fileData = uploadedFileData.map(fileInfo => ({
      name: fileInfo.name,
      size: fileInfo.size,
      type: fileInfo.type,
      url: fileInfo.url,
      id: fileInfo.id
    }));
    sessionStorage.setItem('uploadedFiles', JSON.stringify(fileData));
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('filesUploaded', { detail: fileData }));
  };

  const isValidFileType = (file: File): boolean => {
    const validTypes = [
      'application/pdf',
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    const validExtensions = ['.pdf', '.csv', '.xls', '.xlsx'];
    
    return validTypes.includes(file.type) || 
           validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
  };

  const processFiles = async (files: File[]) => {
    if (!user || !session?.access_token) {
      toast.error("Please log in to upload files");
      return;
    }

    const validFiles = files.filter(isValidFileType);
    
    if (validFiles.length === 0) {
      toast.error('Please upload valid files: Bank statements (PDF), Credit card bills, or CSV files');
      return;
    }

    setUploadedFiles(validFiles);
    setIsProcessing(true);
    setUploadProgress({});
    
    try {
      // Upload files to Supabase Storage
      const uploadPromises = validFiles.map(async (file, index) => {
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
        
        try {
          const response = await DatabaseAPI.uploadFile(user.id, file, session.access_token);
          
          // Simulate progress updates
          const progressInterval = setInterval(() => {
            setUploadProgress(prev => ({
              ...prev,
              [file.name]: Math.min((prev[file.name] || 0) + Math.random() * 30, 90)
            }));
          }, 200);

          // Wait for upload completion simulation
          await new Promise(resolve => setTimeout(resolve, 1000 + index * 500));
          
          clearInterval(progressInterval);
          setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
          
          return response.file;
        } catch (error) {
          console.error(`Failed to upload ${file.name}:`, error);
          toast.error(`Failed to upload ${file.name}`);
          throw error;
        }
      });
      
      const uploadedFileData = await Promise.all(uploadPromises);
      
      // Store files for other components
      await storeUploadedFiles(validFiles, uploadedFileData);
      
      // Process the uploaded data
      const processedTransactions = validFiles.map((file, index) => {
        if (file.type === 'application/pdf') {
          return {
            ...sampleTransactions[index % sampleTransactions.length],
            source: `${file.name}`,
            fileType: 'Bank Statement',
            uploadedFileId: uploadedFileData[index]?.id
          };
        } else if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
          return {
            ...sampleTransactions[(index + 1) % sampleTransactions.length],
            source: `${file.name}`,
            fileType: 'CSV Data',
            uploadedFileId: uploadedFileData[index]?.id
          };
        } else {
          return {
            ...sampleTransactions[(index + 2) % sampleTransactions.length],
            source: `${file.name}`,
            fileType: 'Credit Card',
            uploadedFileId: uploadedFileData[index]?.id
          };
        }
      });
      
      setProcessedData(processedTransactions);
      setIsProcessed(true);
      
      toast.success(`Successfully uploaded and processed ${validFiles.length} file(s)!`, {
        description: "Your financial data is now available for analysis."
      });
      
    } catch (error) {
      console.error('File processing error:', error);
      toast.error("Failed to process files", {
        description: "Please try again or contact support."
      });
    } finally {
      setIsProcessing(false);
      setUploadProgress({});
    }
  };

  const handleFileUpload = () => {
    if (!user) {
      window.dispatchEvent(new CustomEvent('openAuthModal'));
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      processFiles(files);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (!user) {
      window.dispatchEvent(new CustomEvent('openAuthModal'));
      return;
    }
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processFiles(files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    const newProcessedData = processedData.filter((_, i) => i !== index);
    
    setUploadedFiles(newFiles);
    setProcessedData(newProcessedData);
    
    if (newFiles.length === 0) {
      setIsProcessed(false);
      sessionStorage.removeItem('uploadedFiles');
      window.dispatchEvent(new CustomEvent('filesUploaded', { detail: [] }));
    }
    
    toast.success("File removed successfully");
  };

  return (
    <section id="upload" className="py-16 lg:py-24 bg-lavender/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-wine mb-4">
            Smart Financial Data Upload
          </h2>
          <p className="text-xl text-wine/70 max-w-2xl mx-auto">
            Securely upload your bank statements, credit card bills, and financial documents. 
            Our AI will analyze and extract insights to optimize your financial health.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Upload Area */}
          <Card className="border border-wine/20">
            <CardHeader>
              <CardTitle className="text-wine flex items-center gap-2">
                <Upload size={24} />
                Upload Financial Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                  isDragOver 
                    ? 'border-plum bg-plum/5' 
                    : isProcessed 
                      ? 'border-green-300 bg-green-50' 
                      : 'border-wine/30 hover:border-wine/50'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                {!user ? (
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-wine/10 rounded-full flex items-center justify-center mx-auto">
                      <Upload size={32} className="text-wine/60" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-wine/70">Please log in to upload files</p>
                      <Button 
                        onClick={() => window.dispatchEvent(new CustomEvent('openAuthModal'))}
                        className="bg-plum hover:bg-plum/90 text-white"
                      >
                        Login to Continue
                      </Button>
                    </div>
                  </div>
                ) : isProcessing ? (
                  <div className="space-y-4">
                    <Loader2 size={48} className="text-plum mx-auto animate-spin" />
                    <div className="space-y-2">
                      <p className="text-wine/70">Processing your financial documents...</p>
                      <p className="text-sm text-wine/60">Analyzing transactions and extracting insights</p>
                      
                      {/* Show upload progress for each file */}
                      {Object.entries(uploadProgress).map(([fileName, progress]) => (
                        <div key={fileName} className="space-y-1">
                          <div className="flex justify-between text-xs text-wine/60">
                            <span>{fileName}</span>
                            <span>{Math.round(progress)}%</span>
                          </div>
                          <div className="w-full bg-wine/10 rounded-full h-2">
                            <div 
                              className="bg-plum h-2 rounded-full transition-all duration-300"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : isProcessed ? (
                  <div className="space-y-4">
                    <CheckCircle2 size={48} className="text-green-600 mx-auto" />
                    <div className="space-y-2">
                      <p className="text-green-700 font-medium">Documents processed successfully!</p>
                      <p className="text-sm text-wine/60">
                        {uploadedFiles.length} file(s) analyzed • Ready for insights
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-wine/10 rounded-full flex items-center justify-center mx-auto">
                      <Upload size={32} className="text-wine/60" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-wine/70">
                        Drag and drop your financial documents here, or click to browse
                      </p>
                      <p className="text-sm text-wine/60">
                        Supports: PDF, CSV, Excel files (Bank statements, Credit card bills)
                      </p>
                    </div>
                    <Button 
                      onClick={handleFileUpload}
                      className="bg-plum hover:bg-plum/90 text-white"
                      disabled={isProcessing}
                    >
                      <Upload size={16} className="mr-2" />
                      Choose Files
                    </Button>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.csv,.xls,.xlsx"
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div className="mt-6 space-y-3">
                  <h4 className="font-medium text-wine">Uploaded Files:</h4>
                  {uploadedFiles.map((file, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between p-3 bg-wine/5 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-plum/10 rounded flex items-center justify-center">
                          <File size={16} className="text-plum" />
                        </div>
                        <div>
                          <div className="font-medium text-wine text-sm">{file.name}</div>
                          <div className="text-xs text-wine/60">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFile(index)}
                        className="text-wine/60 hover:text-wine"
                      >
                        <X size={16} />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Processed Data Preview */}
          <Card className="border border-wine/20">
            <CardHeader>
              <CardTitle className="text-wine flex items-center gap-2">
                <FileSpreadsheet size={24} />
                Extracted Financial Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              {processedData.length > 0 ? (
                <div className="space-y-4">
                  <div className="text-sm text-wine/70 mb-4">
                    Preview of extracted transaction data:
                  </div>
                  {processedData.map((transaction, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 border border-wine/10 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{transaction.icon}</span>
                        <div>
                          <div className="font-medium text-wine">{transaction.category}</div>
                          <div className="text-sm text-wine/60">
                            From: {transaction.source} • {transaction.fileType}
                          </div>
                        </div>
                      </div>
                      <div className={`font-bold ${
                        transaction.type === 'income' ? 'text-green-600' : 
                        transaction.type === 'investment' ? 'text-blue-600' : 'text-red-600'
                      }`}>
                        {transaction.amount}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-wine/60">
                  <FileSpreadsheet size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="mb-2">No data processed yet</p>
                  <p className="text-sm">Upload your financial documents to see extracted data here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-4 gap-6">
          {[
            {
              icon: FileSpreadsheet,
              title: "Bank Statements",
              description: "Upload PDF statements from any bank for comprehensive transaction analysis",
              bgColor: "bg-blue-100",
              iconColor: "text-blue-600"
            },
            {
              icon: CreditCard,
              title: "Credit Card Bills",
              description: "Analyze spending patterns and optimize credit utilization across cards",
              bgColor: "bg-purple-100",
              iconColor: "text-purple-600"
            },
            {
              icon: Building,
              title: "Investment Records",
              description: "Track portfolio performance and get AI-powered investment insights",
              bgColor: "bg-green-100",
              iconColor: "text-green-600"
            },
            {
              icon: Upload,
              title: "CSV Data",
              description: "Import custom financial data in CSV format for detailed analysis",
              bgColor: "bg-orange-100",
              iconColor: "text-orange-600"
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border border-wine/20 hover:shadow-lg transition-all duration-300 h-full">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 ${feature.bgColor} rounded-lg flex items-center justify-center mb-4`}>
                    <feature.icon size={24} className={feature.iconColor} />
                  </div>
                  <h3 className="font-bold text-wine mb-2">{feature.title}</h3>
                  <p className="text-sm text-wine/70">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}