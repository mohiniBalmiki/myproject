import { Card, CardContent } from "./ui/card";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Software Engineer",
    location: "Bangalore",
    rating: 5,
    text: "ClearTax made investing so simple! I started my SIP with just ₹1000 and now I'm building a great portfolio. The tax-saving features are excellent.",
    avatar: "PS"
  },
  {
    name: "Rajesh Kumar",
    role: "Business Owner", 
    location: "Mumbai",
    rating: 5,
    text: "Zero commission mutual funds and expert recommendations helped me grow my wealth systematically. The app is incredibly user-friendly.",
    avatar: "RK"
  },
  {
    name: "Anita Patel",
    role: "Doctor",
    location: "Delhi",
    rating: 5,
    text: "The goal-based SIP feature is amazing. I'm planning for my daughter's education and the platform shows exactly how much to invest each month.",
    avatar: "AP"
  },
  {
    name: "Vikram Singh",
    role: "Marketing Manager",
    location: "Pune",
    rating: 5,
    text: "Tax planning became so much easier with ClearTax. The ELSS recommendations helped me save taxes while building wealth for the future.",
    avatar: "VS"
  }
];

export function TestimonialsSection() {
  return (
    <section className="py-16 lg:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Loved by 50+ Lakh Investors
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            See what our investors have to say about their experience with ClearTax
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border border-gray-200 hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                {/* Rating */}
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={16} className="text-yellow-400 fill-current" />
                  ))}
                </div>
                
                {/* Testimonial Text */}
                <p className="text-gray-600 mb-6 leading-relaxed">
                  "{testimonial.text}"
                </p>
                
                {/* Author */}
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-semibold mr-3">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                    <div className="text-sm text-gray-500">{testimonial.location}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* App Store Ratings */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-8 bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">4.6</div>
              <div className="flex items-center justify-center mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={20} className="text-yellow-400 fill-current" />
                ))}
              </div>
              <div className="text-gray-500">App Store Rating</div>
            </div>
            
            <div className="w-px h-16 bg-gray-200"></div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">4.5</div>
              <div className="flex items-center justify-center mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={20} className="text-yellow-400 fill-current" />
                ))}
              </div>
              <div className="text-gray-500">Play Store Rating</div>
            </div>
            
            <div className="w-px h-16 bg-gray-200"></div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">1M+</div>
              <div className="text-gray-500 mb-4">Downloads</div>
              <div className="text-gray-500">Active Users</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}