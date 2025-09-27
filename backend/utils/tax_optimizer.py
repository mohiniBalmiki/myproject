class TaxOptimizer:
    """AI-powered tax optimization recommendations"""
    
    def __init__(self, financial_year):
        self.financial_year = financial_year
        self.setup_optimization_rules()
    
    def setup_optimization_rules(self):
        """Setup tax optimization rules and suggestions"""
        self.optimization_strategies = {
            '80C': {
                'limit': 150000,
                'options': [
                    {
                        'instrument': 'Public Provident Fund (PPF)',
                        'description': 'Tax-free returns after 15 years, lock-in period',
                        'risk': 'Low',
                        'returns': '7-8%',
                        'liquidity': 'Low (15 years lock-in)'
                    },
                    {
                        'instrument': 'Equity Linked Savings Scheme (ELSS)',
                        'description': 'Mutual funds with 3-year lock-in, potential for higher returns',
                        'risk': 'High',
                        'returns': '10-15%',
                        'liquidity': 'Medium (3 years lock-in)'
                    },
                    {
                        'instrument': 'Employee Provident Fund (EPF)',
                        'description': 'Compulsory for salaried employees, stable returns',
                        'risk': 'Low',
                        'returns': '8-9%',
                        'liquidity': 'Low (retirement/specific conditions)'
                    },
                    {
                        'instrument': 'Life Insurance Premium',
                        'description': 'Term/endowment plans, provides life cover',
                        'risk': 'Low',
                        'returns': '4-6%',
                        'liquidity': 'Low'
                    },
                    {
                        'instrument': 'National Savings Certificate (NSC)',
                        'description': '5-year fixed deposit with tax benefits',
                        'risk': 'Low',
                        'returns': '6-7%',
                        'liquidity': 'Low (5 years)'
                    }
                ]
            },
            '80D': {
                'limit': 25000,  # For self, higher for senior citizens
                'options': [
                    {
                        'instrument': 'Health Insurance Premium',
                        'description': 'Medical insurance for self and family',
                        'benefit': 'Tax deduction + health coverage',
                        'recommendation': 'Essential for financial protection'
                    },
                    {
                        'instrument': 'Preventive Health Check-up',
                        'description': 'Annual health check-ups',
                        'benefit': 'Up to ₹5,000 deduction within 80D limit',
                        'recommendation': 'Highly recommended for early detection'
                    }
                ]
            },
            '80G': {
                'limit': 100000,  # Varies by organization
                'options': [
                    {
                        'instrument': 'Charitable Donations',
                        'description': 'Donations to approved charitable organizations',
                        'benefit': '50% or 100% deduction based on organization',
                        'recommendation': 'Contribute to social causes while saving tax'
                    }
                ]
            },
            '24b': {
                'limit': 200000,
                'options': [
                    {
                        'instrument': 'Home Loan Interest',
                        'description': 'Interest paid on home loan for self-occupied property',
                        'benefit': 'Up to ₹2 lakh deduction',
                        'recommendation': 'Consider home purchase for tax benefits and asset creation'
                    }
                ]
            },
            'HRA': {
                'limit': 'Variable',
                'options': [
                    {
                        'instrument': 'House Rent Allowance',
                        'description': 'HRA received from employer',
                        'benefit': 'Minimum of actual HRA, 50%/40% of basic salary, rent-10% of basic',
                        'recommendation': 'Optimize HRA component in salary structure'
                    }
                ]
            }
        }
        
        # Tax-saving investment recommendations based on income level
        self.income_based_recommendations = {
            'low': {  # < 5 lakhs
                'strategy': 'Focus on low-risk, guaranteed returns',
                'primary_focus': ['PPF', 'EPF', 'NSC'],
                'secondary_focus': ['Health Insurance']
            },
            'medium': {  # 5-15 lakhs
                'strategy': 'Balanced approach with moderate risk',
                'primary_focus': ['PPF', 'ELSS', 'Health Insurance'],
                'secondary_focus': ['Life Insurance', 'Home Loan']
            },
            'high': {  # > 15 lakhs
                'strategy': 'Aggressive tax planning with diversification',
                'primary_focus': ['ELSS', 'PPF', 'Home Loan', 'Health Insurance'],
                'secondary_focus': ['Charitable Donations', 'Life Insurance']
            }
        }
    
    def get_optimization_suggestions(self, gross_income, current_deductions, expense_breakdown):
        """Get personalized tax optimization suggestions"""
        suggestions = {
            'summary': self._get_optimization_summary(gross_income, current_deductions),
            'deduction_opportunities': self._identify_deduction_opportunities(current_deductions),
            'investment_recommendations': self._get_investment_recommendations(gross_income, current_deductions),
            'expense_optimization': self._analyze_expense_optimization(expense_breakdown),
            'salary_restructuring': self._suggest_salary_restructuring(gross_income),
            'action_plan': self._create_action_plan(gross_income, current_deductions)
        }
        
        return suggestions
    
    def _get_optimization_summary(self, gross_income, current_deductions):
        """Generate optimization summary"""
        total_current_deductions = sum(current_deductions.values())
        max_possible_deductions = sum([
            150000,  # 80C
            25000,   # 80D
            200000,  # 24b (if applicable)
            100000   # 80G (if applicable)
        ])
        
        potential_additional_deductions = max_possible_deductions - total_current_deductions
        
        # Calculate potential tax savings
        marginal_rate = self._get_marginal_tax_rate(gross_income)
        potential_savings = potential_additional_deductions * marginal_rate
        
        return {
            'current_deductions': total_current_deductions,
            'max_possible_deductions': max_possible_deductions,
            'optimization_potential': potential_additional_deductions,
            'estimated_tax_savings': potential_savings,
            'optimization_percentage': (potential_additional_deductions / max_possible_deductions) * 100
        }
    
    def _identify_deduction_opportunities(self, current_deductions):
        """Identify specific deduction opportunities"""
        opportunities = []
        
        for section, current_amount in current_deductions.items():
            if section in self.optimization_strategies:
                strategy = self.optimization_strategies[section]
                limit = strategy['limit']
                
                if isinstance(limit, int) and current_amount < limit:
                    remaining_limit = limit - current_amount
                    
                    opportunities.append({
                        'section': section,
                        'current_utilization': current_amount,
                        'limit': limit,
                        'remaining_opportunity': remaining_limit,
                        'utilization_percentage': (current_amount / limit) * 100,
                        'recommendations': strategy['options']
                    })
        
        return opportunities
    
    def _get_investment_recommendations(self, gross_income, current_deductions):
        """Get investment recommendations based on income level"""
        income_category = self._categorize_income(gross_income)
        base_strategy = self.income_based_recommendations[income_category]
        
        recommendations = []
        
        # 80C Recommendations
        remaining_80c = 150000 - current_deductions.get('80C', 0)
        if remaining_80c > 0:
            for option in self.optimization_strategies['80C']['options']:
                if option['instrument'].split()[-1].replace('(', '').replace(')', '') in base_strategy['primary_focus']:
                    recommendations.append({
                        'section': '80C',
                        'instrument': option['instrument'],
                        'suggested_amount': min(remaining_80c, 50000),  # Suggest reasonable amounts
                        'rationale': option['description'],
                        'risk_return': f"Risk: {option['risk']}, Returns: {option['returns']}",
                        'priority': 'High'
                    })
        
        # 80D Recommendations
        remaining_80d = 25000 - current_deductions.get('80D', 0)
        if remaining_80d > 0:
            recommendations.append({
                'section': '80D',
                'instrument': 'Health Insurance',
                'suggested_amount': remaining_80d,
                'rationale': 'Essential for health coverage and tax benefits',
                'priority': 'High'
            })
        
        return {
            'strategy': base_strategy['strategy'],
            'recommendations': recommendations
        }
    
    def _analyze_expense_optimization(self, expense_breakdown):
        """Analyze expenses for tax optimization opportunities"""
        optimizations = []
        
        # Check for high discretionary spending
        discretionary_categories = ['Food', 'Entertainment', 'Shopping']
        total_discretionary = sum(expense_breakdown.get(cat, 0) for cat in discretionary_categories)
        
        if total_discretionary > 100000:  # If discretionary spending > 1 lakh
            optimizations.append({
                'category': 'Discretionary Spending',
                'current_amount': total_discretionary,
                'suggestion': 'Consider redirecting some discretionary spending to tax-saving investments',
                'potential_tax_saving': total_discretionary * 0.3 * 0.2,  # Assume 30% can be redirected, 20% tax rate
                'recommendation': 'Redirect ₹50,000 from discretionary spending to ELSS mutual funds'
            })
        
        # Check for rent vs EMI optimization
        rent_amount = expense_breakdown.get('Rent', 0)
        emi_amount = expense_breakdown.get('EMI', 0)
        
        if rent_amount > 20000 * 12 and emi_amount == 0:  # Paying high rent but no home loan
            optimizations.append({
                'category': 'Housing',
                'suggestion': 'Consider home purchase for tax benefits under Section 24(b) and 80C',
                'current_rent': rent_amount,
                'potential_deduction': 350000,  # 200k for interest + 150k principal under 80C
                'tax_savings': 350000 * 0.2  # Assuming 20% tax bracket
            })
        
        return optimizations
    
    def _suggest_salary_restructuring(self, gross_income):
        """Suggest salary restructuring for tax optimization"""
        suggestions = []
        
        # HRA optimization
        suggestions.append({
            'component': 'House Rent Allowance (HRA)',
            'recommendation': 'Structure 40-50% of basic salary as HRA if living in rented accommodation',
            'benefit': 'Significant tax savings on rent payments',
            'action': 'Discuss with employer for salary restructuring'
        })
        
        # Food allowance
        suggestions.append({
            'component': 'Food Allowance',
            'recommendation': 'Include food allowance/meal vouchers up to ₹2,200/month',
            'benefit': 'Tax-free allowance for food expenses',
            'annual_saving': 2200 * 12
        })
        
        # Transport allowance
        suggestions.append({
            'component': 'Transport Allowance',
            'recommendation': 'Include transport allowance up to ₹1,600/month',
            'benefit': 'Tax-free allowance for commuting',
            'annual_saving': 1600 * 12
        })
        
        # Mobile/Internet reimbursement
        suggestions.append({
            'component': 'Communication Allowance',
            'recommendation': 'Include mobile/internet reimbursement as per company policy',
            'benefit': 'Tax-free reimbursement for work-related communication',
            'action': 'Submit bills for reimbursement'
        })
        
        return suggestions
    
    def _create_action_plan(self, gross_income, current_deductions):
        """Create a prioritized action plan"""
        action_items = []
        
        # Priority 1: Maximize 80C if not fully utilized
        if current_deductions.get('80C', 0) < 150000:
            remaining = 150000 - current_deductions.get('80C', 0)
            action_items.append({
                'priority': 1,
                'action': f'Invest ₹{remaining:,} in 80C instruments',
                'timeline': 'Before March 31st',
                'impact': f'Tax saving: ₹{remaining * 0.2:,}',
                'specific_steps': [
                    'Open PPF account if not already done',
                    'Invest in ELSS mutual funds',
                    'Increase EPF contribution if possible'
                ]
            })
        
        # Priority 2: Health insurance if not covered
        if current_deductions.get('80D', 0) < 25000:
            action_items.append({
                'priority': 2,
                'action': 'Get comprehensive health insurance',
                'timeline': 'Immediate',
                'impact': 'Tax saving + Health coverage',
                'specific_steps': [
                    'Compare health insurance plans',
                    'Choose family floater or individual plans',
                    'Pay premium before March 31st'
                ]
            })
        
        # Priority 3: Salary restructuring
        action_items.append({
            'priority': 3,
            'action': 'Optimize salary structure',
            'timeline': 'Next appraisal cycle',
            'impact': 'Ongoing tax savings',
            'specific_steps': [
                'Discuss HRA component with HR',
                'Include tax-free allowances',
                'Submit rent receipts and declarations'
            ]
        })
        
        return action_items
    
    def _get_marginal_tax_rate(self, gross_income):
        """Get marginal tax rate based on income"""
        if gross_income <= 300000:
            return 0
        elif gross_income <= 600000:
            return 0.05
        elif gross_income <= 900000:
            return 0.10
        elif gross_income <= 1200000:
            return 0.15
        elif gross_income <= 1500000:
            return 0.20
        else:
            return 0.30
    
    def _categorize_income(self, gross_income):
        """Categorize income level"""
        if gross_income < 500000:
            return 'low'
        elif gross_income < 1500000:
            return 'medium'
        else:
            return 'high'