import { Card, CardContent } from "./ui/card";
import { Upload, Bot, TrendingUp, FileText, Users, Building2, Shield, DollarSign } from "lucide-react";
import { motion } from "motion/react";

const features = [
  {
    icon: Upload,
    title: "Upload Bank & Card Statements",
    description: "Securely upload your financial documents. Our AI automatically categorizes transactions and identifies tax-saving opportunities.",
    color: "bg-lemon-green/20 text-plum"
  },
  {
    icon: Bot,
    title: "Optimize Tax Automatically",
    description: "Smart AI analysis compares old vs new tax regimes, suggests deductions, and maximizes your savings without any manual work.",
    color: "bg-lemon-green/20 text-plum"
  },
  {
    icon: TrendingUp,
    title: "Track & Improve Your CIBIL Score",
    description: "Monitor your credit health in real-time. Get personalized recommendations to improve your score and financial wellness.",
    color: "bg-lemon-green/20 text-plum"
  },
  {
    icon: FileText,
    title: "Download Personalized Reports",
    description: "Get detailed tax reports, credit analysis, and financial insights in beautiful PDFs ready for filing or sharing.",
    color: "bg-lemon-green/20 text-plum"
  }
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-16 lg:py-24 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-wine mb-4">
            Everything You Need for Financial Health
          </h2>
          <p className="text-xl text-wine/70 max-w-3xl mx-auto">
            Our comprehensive platform combines tax optimization and credit monitoring 
            to give you complete control over your financial wellness.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-xl transition-all duration-300 border border-wine/10 hover:border-plum/30 bg-white">
              <CardContent className="p-8 text-center">
                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl ${feature.color} flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon size={32} />
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-semibold text-wine mb-4 group-hover:text-plum transition-colors">
                  {feature.title}
                </h3>
                <p className="text-wine/60 leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Interactive Stats Section */}
        <div className="mt-20">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {/* 250M+ invoices uploaded */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-wine/5 hover:shadow-xl transition-all duration-300 lg:col-span-2"
            >
              <motion.div
                animate={{ rotate: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4"
              >
                <Shield className="w-6 h-6 text-blue-500" />
              </motion.div>
              <div className="text-2xl lg:text-3xl font-bold text-wine mb-1">
                250M <span className="text-lemon-green">+</span>
              </div>
              <div className="text-wine/60 text-sm">invoices uploaded</div>
            </motion.div>

            {/* 35,000+ retail investors */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-wine/5 hover:shadow-xl transition-all duration-300 lg:col-span-2"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4"
              >
                <Users className="w-6 h-6 text-green-500" />
              </motion.div>
              <div className="text-2xl lg:text-3xl font-bold text-wine mb-1">
                35,000 <span className="text-lemon-green">+</span>
              </div>
              <div className="text-wine/60 text-sm">retail investors</div>
            </motion.div>

            {/* 6M Businesses visible */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-wine/5 hover:shadow-xl transition-all duration-300 lg:col-span-2"
            >
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4"
              >
                <Building2 className="w-6 h-6 text-purple-500" />
              </motion.div>
              <div className="text-2xl lg:text-3xl font-bold text-wine mb-1">
                6M <span className="text-lemon-green">+</span>
              </div>
              <div className="text-wine/60 text-sm">Businesses visible</div>
            </motion.div>

            {/* 6M+ tax returns filed */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-wine/5 hover:shadow-xl transition-all duration-300 lg:col-span-3"
            >
              <motion.div
                animate={{ rotate: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
                className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4"
              >
                <FileText className="w-6 h-6 text-indigo-500" />
              </motion.div>
              <div className="text-2xl lg:text-3xl font-bold text-wine mb-1">
                6M <span className="text-lemon-green">+</span>
              </div>
              <div className="text-wine/60 text-sm">tax returns filed</div>
            </motion.div>

            {/* $300B+ trade value filled */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-wine/5 hover:shadow-xl transition-all duration-300 lg:col-span-3"
            >
              <motion.div
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.05, 1]
                }}
                transition={{ 
                  rotate: { repeat: Infinity, duration: 8, ease: "linear" },
                  scale: { repeat: Infinity, duration: 2, ease: "easeInOut" }
                }}
                className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4"
              >
                <DollarSign className="w-6 h-6 text-orange-500" />
              </motion.div>
              <div className="text-2xl lg:text-3xl font-bold text-wine mb-1">
                $300B <span className="text-lemon-green">+</span>
              </div>
              <div className="text-wine/60 text-sm">trade value filled</div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}