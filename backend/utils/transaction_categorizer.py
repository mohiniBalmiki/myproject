import re
from datetime import datetime
import pandas as pd

class TransactionCategorizer:
    """AI-powered transaction categorization system"""
    
    def __init__(self):
        # Define category patterns and keywords
        self.category_patterns = {
            'Salary': {
                'keywords': ['salary', 'sal', 'payroll', 'wages', 'income', 'stipend'],
                'patterns': [r'sal\s*\d+', r'salary\s*credit', r'payroll'],
                'tax_relevant': True,
                'tax_section': 'income',
                'is_recurring': True,
                'frequency': 'monthly'
            },
            'EMI': {
                'keywords': ['emi', 'loan', 'mortgage', 'installment', 'equated'],
                'patterns': [r'emi\s*\d+', r'loan\s*repayment', r'home\s*loan', r'car\s*loan'],
                'tax_relevant': True,
                'tax_section': '24b',  # Home loan interest
                'is_recurring': True,
                'frequency': 'monthly'
            },
            'SIP': {
                'keywords': ['sip', 'mutual fund', 'systematic', 'investment'],
                'patterns': [r'sip\s*\d+', r'mf\s*investment', r'systematic\s*investment'],
                'tax_relevant': True,
                'tax_section': '80C',
                'is_recurring': True,
                'frequency': 'monthly'
            },
            'Insurance': {
                'keywords': ['insurance', 'premium', 'policy', 'lic', 'health insurance'],
                'patterns': [r'insurance\s*premium', r'policy\s*\d+', r'lic\s*premium'],
                'tax_relevant': True,
                'tax_section': '80C',  # Life insurance, '80D' for health insurance
                'is_recurring': True,
                'frequency': 'yearly'
            },
            'Rent': {
                'keywords': ['rent', 'house rent', 'apartment', 'flat rent'],
                'patterns': [r'house\s*rent', r'flat\s*rent', r'rent\s*\d+'],
                'tax_relevant': True,
                'tax_section': 'HRA',
                'is_recurring': True,
                'frequency': 'monthly'
            },
            'Utilities': {
                'keywords': ['electricity', 'water', 'gas', 'internet', 'mobile', 'phone'],
                'patterns': [r'electric\s*bill', r'water\s*bill', r'gas\s*bill', r'mobile\s*recharge'],
                'tax_relevant': False,
                'is_recurring': True,
                'frequency': 'monthly'
            },
            'Food': {
                'keywords': ['food', 'restaurant', 'swiggy', 'zomato', 'grocery', 'supermarket'],
                'patterns': [r'swiggy', r'zomato', r'restaurant', r'food\s*court'],
                'tax_relevant': False,
                'is_recurring': False
            },
            'Transportation': {
                'keywords': ['uber', 'ola', 'taxi', 'metro', 'bus', 'fuel', 'petrol', 'diesel'],
                'patterns': [r'uber', r'ola', r'fuel\s*station', r'petrol\s*pump'],
                'tax_relevant': False,
                'is_recurring': False
            },
            'Medical': {
                'keywords': ['hospital', 'medical', 'doctor', 'pharmacy', 'medicine', 'health'],
                'patterns': [r'hospital', r'medical\s*store', r'pharmacy', r'dr\s*\w+'],
                'tax_relevant': True,
                'tax_section': '80D',
                'is_recurring': False
            },
            'Education': {
                'keywords': ['school', 'college', 'university', 'tuition', 'education', 'course'],
                'patterns': [r'school\s*fee', r'college\s*fee', r'tuition', r'education'],
                'tax_relevant': True,
                'tax_section': '80C',
                'is_recurring': True,
                'frequency': 'yearly'
            },
            'Investment': {
                'keywords': ['investment', 'mutual fund', 'stocks', 'equity', 'bond', 'fd', 'fixed deposit'],
                'patterns': [r'mutual\s*fund', r'equity\s*investment', r'fixed\s*deposit'],
                'tax_relevant': True,
                'tax_section': '80C',
                'is_recurring': False
            },
            'Shopping': {
                'keywords': ['amazon', 'flipkart', 'shopping', 'mall', 'store', 'market'],
                'patterns': [r'amazon', r'flipkart', r'shopping\s*mall'],
                'tax_relevant': False,
                'is_recurring': False
            },
            'Entertainment': {
                'keywords': ['movie', 'cinema', 'netflix', 'prime', 'spotify', 'entertainment'],
                'patterns': [r'movie\s*ticket', r'netflix', r'amazon\s*prime', r'spotify'],
                'tax_relevant': False,
                'is_recurring': False
            },
            'ATM': {
                'keywords': ['atm', 'cash withdrawal', 'withdrawal'],
                'patterns': [r'atm\s*withdrawal', r'cash\s*withdrawal'],
                'tax_relevant': False,
                'is_recurring': False
            },
            'Transfer': {
                'keywords': ['transfer', 'neft', 'imps', 'rtgs', 'upi'],
                'patterns': [r'neft', r'imps', r'rtgs', r'upi', r'transfer'],
                'tax_relevant': False,
                'is_recurring': False
            }
        }
        
        # Common Indian payment methods and platforms
        self.payment_platforms = {
            'upi': ['paytm', 'gpay', 'phonepe', 'bhim', 'upi'],
            'banking': ['neft', 'imps', 'rtgs', 'nach'],
            'cards': ['visa', 'master', 'rupay'],
            'wallets': ['paytm', 'mobikwik', 'freecharge', 'airtel money']
        }
    
    def categorize_transaction(self, description, amount):
        """
        Categorize a transaction based on description and amount
        
        Args:
            description (str): Transaction description
            amount (float): Transaction amount
            
        Returns:
            dict: Category information with tax relevance
        """
        description_lower = description.lower().strip()
        
        # Check each category
        for category, config in self.category_patterns.items():
            # Check keywords
            for keyword in config['keywords']:
                if keyword in description_lower:
                    return self._build_category_result(category, config, description, amount)
            
            # Check patterns
            for pattern in config.get('patterns', []):
                if re.search(pattern, description_lower):
                    return self._build_category_result(category, config, description, amount)
        
        # If no category matched, use amount-based heuristics
        return self._categorize_by_amount(description, amount)
    
    def _build_category_result(self, category, config, description, amount):
        """Build category result with all relevant information"""
        result = {
            'category': category,
            'subcategory': self._get_subcategory(category, description),
            'tax_relevant': config.get('tax_relevant', False),
            'is_recurring': config.get('is_recurring', False)
        }
        
        if config.get('tax_section'):
            result['tax_section'] = config['tax_section']
        
        if config.get('frequency'):
            result['frequency'] = config['frequency']
        
        # Special handling for certain categories
        if category == 'Insurance':
            # Determine if it's life or health insurance
            if any(term in description.lower() for term in ['health', 'medical', 'mediclaim']):
                result['tax_section'] = '80D'
                result['subcategory'] = 'Health Insurance'
            else:
                result['tax_section'] = '80C'
                result['subcategory'] = 'Life Insurance'
        
        return result
    
    def _get_subcategory(self, category, description):
        """Get more specific subcategory based on description"""
        subcategories = {
            'Food': {
                'restaurant': ['restaurant', 'hotel', 'cafe', 'food court'],
                'delivery': ['swiggy', 'zomato', 'delivery'],
                'grocery': ['grocery', 'supermarket', 'mall', 'store']
            },
            'Transportation': {
                'cab': ['uber', 'ola', 'taxi'],
                'fuel': ['petrol', 'diesel', 'fuel'],
                'public': ['metro', 'bus', 'auto']
            },
            'Utilities': {
                'electricity': ['electric', 'power', 'mseb'],
                'water': ['water', 'municipal'],
                'internet': ['internet', 'broadband', 'wifi'],
                'mobile': ['mobile', 'phone', 'airtel', 'jio', 'vi']
            },
            'Shopping': {
                'online': ['amazon', 'flipkart', 'myntra'],
                'offline': ['mall', 'store', 'market']
            }
        }
        
        description_lower = description.lower()
        
        if category in subcategories:
            for subcat, keywords in subcategories[category].items():
                if any(keyword in description_lower for keyword in keywords):
                    return subcat.title()
        
        return category
    
    def _categorize_by_amount(self, description, amount):
        """Fallback categorization based on amount patterns"""
        description_lower = description.lower()
        
        # Large amounts are likely investments or major purchases
        if amount > 50000:
            if any(term in description_lower for term in ['transfer', 'neft', 'imps']):
                return {
                    'category': 'Investment',
                    'subcategory': 'Large Transfer',
                    'tax_relevant': False,
                    'is_recurring': False
                }
            else:
                return {
                    'category': 'Investment',
                    'subcategory': 'Major Purchase',
                    'tax_relevant': False,
                    'is_recurring': False
                }
        
        # Small regular amounts might be subscriptions
        elif amount < 1000 and any(term in description_lower for term in ['monthly', 'subscription']):
            return {
                'category': 'Entertainment',
                'subcategory': 'Subscription',
                'tax_relevant': False,
                'is_recurring': True,
                'frequency': 'monthly'
            }
        
        # Default category
        return {
            'category': 'Others',
            'subcategory': 'Miscellaneous',
            'tax_relevant': False,
            'is_recurring': False
        }
    
    def get_tax_deduction_suggestions(self, transactions):
        """
        Analyze transactions and suggest tax deductions
        
        Args:
            transactions (list): List of transaction dictionaries
            
        Returns:
            dict: Tax deduction suggestions
        """
        suggestions = {}
        
        # Group transactions by tax section
        tax_sections = {}
        for transaction in transactions:
            if transaction.get('tax_relevant') and transaction.get('tax_section'):
                section = transaction['tax_section']
                if section not in tax_sections:
                    tax_sections[section] = []
                tax_sections[section].append(transaction)
        
        # Calculate potential deductions
        for section, txns in tax_sections.items():
            total_amount = sum(txn['amount'] for txn in txns if txn['transaction_type'] == 'debit')
            
            suggestions[section] = {
                'total_amount': total_amount,
                'transaction_count': len(txns),
                'eligible_limit': self._get_deduction_limit(section),
                'potential_deduction': min(total_amount, self._get_deduction_limit(section))
            }
        
        return suggestions
    
    def _get_deduction_limit(self, section):
        """Get deduction limits for various tax sections"""
        limits = {
            '80C': 150000,
            '80D': 25000,  # Health insurance for self
            '80G': 100000,  # Donations (varies)
            '24b': 200000,  # Home loan interest
            'HRA': None,  # Based on salary and city
            'income': None  # No limit for income
        }
        
        return limits.get(section, 0)