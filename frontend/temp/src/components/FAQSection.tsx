import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { Shield, CreditCard, FileCheck, Users } from "lucide-react";

const faqs = [
  {
    question: "How secure is my financial data?",
    answer: "We use bank-level 256-bit SSL encryption and comply with RBI guidelines for data protection. Your data is stored securely and never shared with third parties without your consent. We're SOC 2 certified and follow strict security protocols.",
    icon: Shield
  },
  {
    question: "Is tax filing really free?",
    answer: "Yes! Basic tax filing is completely free for income up to ₹50 lakhs. We charge no hidden fees for ITR-1, ITR-2, and ITR-3 filings. Premium features like priority support and detailed tax planning are available at nominal charges.",
    icon: FileCheck
  },
  {
    question: "Will checking my CIBIL score impact my credit?",
    answer: "No, checking your CIBIL score through our platform is a 'soft inquiry' and doesn't impact your credit score. You can check your score as many times as you want without any negative effects on your credit history.",
    icon: CreditCard
  },
  {
    question: "Can I use this in demo mode without signing up?",
    answer: "Absolutely! You can explore all features in demo mode with sample data. Demo mode gives you full access to understand how our platform works. However, to save your data and generate real reports, you'll need to create an account.",
    icon: Users
  },
  {
    question: "How accurate is your AI tax optimization?",
    answer: "Our AI has been trained on millions of tax scenarios and has 99.9% accuracy in tax calculations. It's regularly updated with the latest tax rules and regulations. However, we always recommend consulting a tax professional for complex situations.",
    icon: Shield
  },
  {
    question: "What file formats can I upload?",
    answer: "We support PDF bank statements, Excel/CSV files, and direct bank account linking. Our AI can process statements from 150+ banks and financial institutions. Images of documents are also supported with OCR technology.",
    icon: FileCheck
  }
];

export function FAQSection() {
  return (
    <section id="faq" className="py-16 lg:py-24 bg-gray-50/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-wine mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-wine/70">
            Everything you need to know about our platform and services
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border border-wine/20 rounded-lg bg-white px-6 data-[state=open]:border-plum/50"
            >
              <AccordionTrigger className="text-left hover:no-underline hover:text-plum">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-plum/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <faq.icon size={16} className="text-plum" />
                  </div>
                  <span className="font-medium text-wine">{faq.question}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-wine/70 pt-4 pb-2 ml-11 leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Contact Support */}
        <div className="mt-12 text-center p-8 bg-gradient-to-r from-lemon-green/10 to-lemon-green/5 rounded-xl border border-lemon-green/30">
          <h3 className="text-xl font-semibold text-wine mb-2">
            Still have questions?
          </h3>
          <p className="text-wine/70 mb-6">
            Our support team is here to help you 24/7
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:support@taxhealth.com"
              className="inline-flex items-center justify-center px-6 py-3 bg-plum text-white rounded-lg hover:bg-plum/90 transition-colors"
            >
              Email Support
            </a>
            <a
              href="tel:+918001234567"
              className="inline-flex items-center justify-center px-6 py-3 border border-plum text-plum rounded-lg hover:bg-plum hover:text-white transition-colors"
            >
              Call Us: 1800-123-4567
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}