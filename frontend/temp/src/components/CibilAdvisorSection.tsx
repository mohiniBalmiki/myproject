import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Slider } from "./ui/slider";
import { Badge } from "./ui/badge";
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, Clock, CreditCard, Lock } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "./ui/button";

const creditFactors = [
  {
    factor: "Payment History",
    impact: "High",
    status: "Excellent",
    score: 95,
    icon: CheckCircle,
    color: "text-green-700"
  },
  {
    factor: "Credit Utilization",
    impact: "High", 
    status: "Good",
    score: 75,
    icon: AlertCircle,
    color: "text-yellow-700"
  },
  {
    factor: "Credit Age",
    impact: "Medium",
    status: "Fair",
    score: 65,
    icon: Clock,
    color: "text-blue-600"
  },
  {
    factor: "New Inquiries",
    impact: "Low",
    status: "Good",
    score: 85,
    icon: CreditCard,
    color: "text-green-700"
  }
];

export function CibilAdvisorSection() {
  const { user } = useAuth();
  const [currentScore] = useState(750);
  const [loanAmount, setLoanAmount] = useState([50000]);
  const [predictedScore, setPredictedScore] = useState(750);

  const handleLoanChange = (value: number[]) => {
    setLoanAmount(value);
    // Simulate score improvement based on loan payment
    const improvement = Math.floor(value[0] / 10000) * 5;
    setPredictedScore(Math.min(900, currentScore + improvement));
  };

  const getScoreColor = (score: number) => {
    if (score >= 750) return "text-green-700";
    if (score >= 650) return "text-yellow-700";
    return "text-red-600";
  };

  const getScoreGrade = (score: number) => {
    if (score >= 750) return "Excellent";
    if (score >= 700) return "Good";
    if (score >= 650) return "Fair";
    return "Poor";
  };

  return (
    <section id="cibil-advisor" className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-wine mb-4">
            CIBIL Score Advisor
          </h2>
          <p className="text-xl text-wine/70 max-w-2xl mx-auto">
            Monitor your credit health, understand key factors, and get actionable recommendations 
            to improve your score.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Score Card */}
          <Card className="border border-wine/20 lg:col-span-1">
            <CardHeader className="text-center">
              <CardTitle className="text-wine">Your CIBIL Score</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="relative mb-6">
                {/* Circular progress */}
                <div className="w-40 h-40 mx-auto relative">
                  <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 144 144">
                    <circle
                      cx="72"
                      cy="72"
                      r="64"
                      stroke="#f3f4f6"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="72"
                      cy="72"
                      r="64"
                      stroke="#047857"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${(currentScore / 900) * 402.1} 402.1`}
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div>
                      <div className={`text-4xl font-bold ${getScoreColor(currentScore)}`}>
                        {currentScore}
                      </div>
                      <div className="text-wine/60">/900</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <Badge className={`${getScoreColor(currentScore)} bg-transparent border-current`}>
                {getScoreGrade(currentScore)}
              </Badge>
              
              <div className="mt-4 flex items-center justify-center gap-2 text-green-700">
                <TrendingUp size={20} />
                <span>+15 points this month</span>
              </div>
            </CardContent>
          </Card>

          {/* Credit Factors */}
          <Card className="border border-wine/20 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-wine">Credit Health Factors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {creditFactors.map((factor, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${factor.color} bg-current/10`}>
                      <factor.icon size={20} className={factor.color} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-wine">{factor.factor}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-wine/60">Impact: {factor.impact}</span>
                          <Badge variant="outline" className={factor.color}>
                            {factor.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            factor.score >= 80 ? 'bg-green-600' :
                            factor.score >= 60 ? 'bg-yellow-600' : 'bg-red-500'
                          }`}
                          style={{ width: `${factor.score}%` }}
                        />
                      </div>
                    </div>
                    
                    <span className="font-semibold text-wine w-12 text-right">
                      {factor.score}%
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* What-If Simulation */}
        <Card className="mt-8 border-2 border-plum/20 bg-gradient-to-r from-plum/5 to-plum/10">
          <CardHeader>
            <CardTitle className="text-wine flex items-center gap-2">
              <TrendingUp size={24} />
              What-If Score Simulation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <label className="block text-wine font-medium mb-4">
                  If you pay off loan amount: ₹{loanAmount[0].toLocaleString()}
                </label>
                <Slider
                  value={loanAmount}
                  onValueChange={handleLoanChange}
                  max={200000}
                  min={10000}
                  step={10000}
                  className="mb-6"
                />
                <div className="flex justify-between text-sm text-wine/60">
                  <span>₹10,000</span>
                  <span>₹2,00,000</span>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-wine/70 mb-2">Your new score would be:</div>
                <div className={`text-5xl font-bold ${getScoreColor(predictedScore)} mb-2`}>
                  {predictedScore}
                </div>
                <div className="text-wine/60">/900</div>
                
                {predictedScore > currentScore && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-300">
                    <div className="flex items-center justify-center gap-2 text-green-800">
                      <TrendingUp size={20} />
                      <span className="font-medium">
                        +{predictedScore - currentScore} point improvement!
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}