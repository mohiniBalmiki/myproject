import { Button } from "./ui/button";
import { ArrowRight, Shield, Users, Lock, TrendingUp, FileText, CreditCard, Calculator } from "lucide-react";
import { motion } from "motion/react";

interface HeroSectionProps {
  onExploreDemo: () => void;
  onLoginClick: () => void;
}

export function HeroSection({ onExploreDemo, onLoginClick }: HeroSectionProps) {
  return (
    <section className="relative py-20 lg:py-32 overflow-hidden bg-purple-50">
      {/* Lavender organic blob background */}
      <div className="absolute inset-0 -z-10">
        <svg
          className="absolute top-0 right-0 w-96 h-96 lg:w-[600px] lg:h-[600px] transform translate-x-1/3 -translate-y-1/4"
          viewBox="0 0 600 600"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M300,50 C450,50 550,150 550,300 C550,400 500,450 400,500 C300,550 200,500 150,400 C100,300 50,200 100,100 C150,50 200,50 300,50 Z"
            fill="#E5E1F5"
            opacity="0.1"
          />
        </svg>
        <svg
          className="absolute bottom-0 left-0 w-80 h-80 lg:w-[500px] lg:h-[500px] transform -translate-x-1/4 translate-y-1/3"
          viewBox="0 0 500 500"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M250,25 C375,25 475,125 475,250 C475,350 425,400 325,450 C225,500 125,450 75,350 C25,250 25,150 75,75 C125,25 175,25 250,25 Z"
            fill="#E5E1F5"
            opacity="0.05"
          />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="lg:pr-8">
            <h1 className="text-4xl lg:text-6xl font-bold text-wine mb-6 leading-tight">
              Smart Tax Filing & Credit Health —{" "}
              <span className="text-plum">TaxWise Platform</span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-wine/70 mb-8 leading-relaxed">
              Upload your financials, optimize taxes with AI, and monitor credit score effortlessly.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button 
                size="lg" 
                onClick={onExploreDemo}
                className="bg-plum hover:bg-plum/90 text-white px-8 py-4 text-lg"
              >
                Explore Demo
                <ArrowRight size={20} className="ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={onLoginClick}
                className="border-plum text-plum hover:bg-plum hover:text-white px-8 py-4 text-lg"
              >
                Login / Sign Up
              </Button>
            </div>
            
            {/* Trust badges */}
            <div className="flex flex-wrap items-center gap-8 text-wine/60">
              <div className="flex items-center gap-2">
                <Shield size={20} className="text-plum" />
                <span>Bank-level encryption</span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={20} className="text-plum" />
                <span>Trusted by 5M+ users</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock size={20} className="text-plum" />
                <span>Privacy First</span>
              </div>
            </div>
          </div>
          
          {/* Interactive TaxWise Dashboard Animation */}
          <div className="relative flex justify-center">
            {/* Main Dashboard Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="relative w-96 h-[500px] bg-gradient-to-br from-white via-lemon-green/5 to-lemon-green/15 rounded-3xl shadow-2xl border border-lemon-green/30 overflow-hidden"
            >
              {/* Dashboard Header */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="p-6 border-b border-lemon-green/20 bg-white/50 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-plum rounded-lg flex items-center justify-center">
                      <FileText size={16} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-wine">TaxWise Dashboard</h3>
                      <p className="text-xs text-wine/60">Real-time analysis</p>
                    </div>
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 2, delay: 1 }}
                    className="w-3 h-3 bg-green-500 rounded-full"
                  />
                </div>
              </motion.div>

              {/* Tax Savings Summary */}
              <motion.div
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="p-6 space-y-4"
              >
                <div className="bg-gradient-to-r from-plum/10 to-wine/10 rounded-xl p-4 border border-plum/20">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-wine/70 text-sm">Total Tax Savings</span>
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ repeat: Infinity, duration: 3, delay: 2 }}
                    >
                      <TrendingUp size={16} className="text-green-600" />
                    </motion.div>
                  </div>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1, duration: 0.8, type: "spring" }}
                    className="text-2xl font-bold text-plum"
                  >
                    ₹47,320
                  </motion.div>
                </div>

                {/* CIBIL Score Widget */}
                <motion.div
                  initial={{ x: 30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.9, duration: 0.8 }}
                  className="bg-gradient-to-r from-lemon-green/20 to-white rounded-xl p-4 border border-lemon-green/30"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-wine/70 text-sm block">CIBIL Score</span>
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2, duration: 0.6 }}
                        className="text-xl font-bold text-wine"
                      >
                        782
                      </motion.span>
                    </div>
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                      className="w-12 h-12 rounded-full border-4 border-lemon-green/30 border-t-plum flex items-center justify-center"
                    >
                      <span className="text-xs font-bold text-plum">↑</span>
                    </motion.div>
                  </div>
                </motion.div>

                {/* Document Upload Progress */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.2, duration: 0.8 }}
                  className="bg-white/70 rounded-xl p-4 border border-wine/10"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 2, delay: 1.5 }}
                      className="w-6 h-6 bg-wine rounded-full flex items-center justify-center"
                    >
                      <CreditCard size={12} className="text-white" />
                    </motion.div>
                    <span className="text-wine text-sm">Bank Statement Analysis</span>
                  </div>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "92%" }}
                    transition={{ delay: 1.8, duration: 2.5 }}
                    className="h-2 bg-plum rounded-full relative overflow-hidden"
                  >
                    <motion.div
                      animate={{ x: [-15, 80] }}
                      transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                      className="absolute top-0 left-0 w-4 h-full bg-white/70 rounded-full"
                    />
                  </motion.div>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.5, duration: 0.6 }}
                    className="text-xs text-wine/60 mt-2"
                  >
                    Processing complete • 23 transactions analyzed
                  </motion.p>
                </motion.div>
              </motion.div>

              {/* Background Floating Elements */}
              <motion.div
                animate={{
                  y: [0, -10, 0],
                  x: [0, 5, 0],
                  rotate: [0, 3, -3, 0]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 6,
                  ease: "easeInOut"
                }}
                className="absolute top-8 right-8 w-16 h-16 bg-lemon-green/30 rounded-full flex items-center justify-center"
              >
                <span className="text-2xl font-bold text-plum/70">₹</span>
              </motion.div>

              <motion.div
                animate={{
                  y: [0, 8, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 4,
                  ease: "easeInOut",
                  delay: 1
                }}
                className="absolute bottom-8 right-6 w-10 h-10 bg-plum/20 rounded-full flex items-center justify-center"
              >
                <Calculator size={14} className="text-plum" />
              </motion.div>

              {/* Connection Lines Animation */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <motion.path
                  d="M80 120 Q200 140 320 180"
                  stroke="url(#gradient)"
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray="5,5"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 2, duration: 2, repeat: Infinity, repeatDelay: 3 }}
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#E5E1F5" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#610A35" stopOpacity="0.8" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Floating Credit Card */}
              <motion.div
                initial={{ x: 50, y: 50, opacity: 0, rotateY: 0 }}
                animate={{ 
                  x: 0, 
                  y: 0, 
                  opacity: 1, 
                  rotateY: [0, 180, 360] 
                }}
                transition={{ 
                  delay: 2.5, 
                  duration: 1.5,
                  rotateY: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                }}
                className="absolute bottom-16 left-4 w-16 h-10 bg-gradient-to-r from-plum to-wine rounded-lg shadow-lg flex items-center justify-center transform-gpu"
              >
                <CreditCard size={20} className="text-white" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}