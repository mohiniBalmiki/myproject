import numpy as np
from datetime import datetime, timedelta
import statistics

class CibilAnalyzer:
    """AI-powered CIBIL score analysis and improvement suggestions"""
    
    def __init__(self):
        # CIBIL score factor weights
        self.score_weights = {
            'payment_history': 0.35,
            'credit_utilization': 0.30,
            'credit_mix': 0.15,
            'new_credit': 0.10,
            'length_of_history': 0.10
        }
        
        # Score improvement potential mapping
        self.improvement_potential = {
            'payment_history': {
                'excellent': 0, 'good': 20, 'fair': 40, 'poor': 80, 'bad': 120
            },
            'credit_utilization': {
                'excellent': 0, 'good': 15, 'fair': 30, 'poor': 60, 'bad': 100
            },
            'credit_mix': {
                'excellent': 0, 'good': 10, 'fair': 20, 'poor': 40, 'bad': 60
            },
            'new_credit': {
                'excellent': 0, 'good': 5, 'fair': 15, 'poor': 25, 'bad': 40
            },
            'length_of_history': {
                'excellent': 0, 'good': 5, 'fair': 10, 'poor': 20, 'bad': 30
            }
        }
    
    def analyze_financial_behavior(self, transactions):
        """Analyze financial behavior patterns from transactions"""
        analysis = {
            'payment_consistency': self._analyze_payment_consistency(transactions),
            'credit_utilization': self._analyze_credit_utilization(transactions),
            'credit_diversity': self._analyze_credit_diversity(transactions),
            'new_credit_inquiries': self._estimate_credit_inquiries(transactions),
            'account_age': self._estimate_account_age(transactions),
            'debt_to_income': self._calculate_debt_to_income_ratio(transactions),
            'spending_patterns': self._analyze_spending_patterns(transactions)
        }
        
        return analysis
    
    def _analyze_payment_consistency(self, transactions):
        """Analyze payment consistency for EMIs and credit cards"""
        emi_transactions = [t for t in transactions if t.category == 'EMI' and t.transaction_type == 'debit']
        
        if not emi_transactions:
            return {'score': 'no_data', 'consistency': 0, 'missed_payments': 0}
        
        # Group transactions by month
        monthly_payments = {}
        for transaction in emi_transactions:
            month_key = transaction.date.strftime('%Y-%m')
            if month_key not in monthly_payments:
                monthly_payments[month_key] = []
            monthly_payments[month_key].append(transaction)
        
        # Analyze consistency
        total_months = len(monthly_payments)
        months_with_payments = sum(1 for payments in monthly_payments.values() if payments)
        consistency = (months_with_payments / total_months) * 100 if total_months > 0 else 0
        
        # Estimate missed payments (basic heuristic)
        expected_monthly_payment = statistics.median([t.amount for t in emi_transactions]) if emi_transactions else 0
        missed_payments = max(0, total_months - months_with_payments)
        
        if consistency >= 95:
            score = 'excellent'
        elif consistency >= 85:
            score = 'good'
        elif consistency >= 70:
            score = 'fair'
        elif consistency >= 50:
            score = 'poor'
        else:
            score = 'bad'
        
        return {
            'score': score,
            'consistency': consistency,
            'missed_payments': missed_payments,
            'total_months_analyzed': total_months
        }
    
    def _analyze_credit_utilization(self, transactions):
        """Analyze credit utilization patterns"""
        # This is a simplified analysis based on transaction patterns
        # In a real scenario, you'd need actual credit limits and balances
        
        credit_card_spends = [t for t in transactions if 'credit' in t.description.lower() and t.transaction_type == 'debit']
        credit_card_payments = [t for t in transactions if 'credit' in t.description.lower() and t.transaction_type == 'credit']
        
        if not credit_card_spends:
            return {'score': 'no_data', 'estimated_utilization': 0}
        
        total_spend = sum(t.amount for t in credit_card_spends)
        total_payments = sum(t.amount for t in credit_card_payments)
        
        # Estimate utilization (simplified approach)
        # Assume average credit limit is 3-5x of monthly spending
        monthly_spend = total_spend / 12  # Assuming 12 months of data
        estimated_credit_limit = monthly_spend * 4  # Conservative estimate
        
        current_balance = max(0, total_spend - total_payments)
        utilization = (current_balance / estimated_credit_limit) * 100 if estimated_credit_limit > 0 else 0
        
        if utilization <= 10:
            score = 'excellent'
        elif utilization <= 30:
            score = 'good'
        elif utilization <= 50:
            score = 'fair'
        elif utilization <= 70:
            score = 'poor'
        else:
            score = 'bad'
        
        return {
            'score': score,
            'estimated_utilization': min(utilization, 100),
            'estimated_balance': current_balance,
            'estimated_limit': estimated_credit_limit
        }
    
    def _analyze_credit_diversity(self, transactions):
        """Analyze credit product diversity"""
        credit_types = set()
        
        # Identify different types of credit from transactions
        for transaction in transactions:
            desc_lower = transaction.description.lower()
            if any(term in desc_lower for term in ['emi', 'loan', 'mortgage']):
                if 'home' in desc_lower or 'house' in desc_lower:
                    credit_types.add('home_loan')
                elif 'car' in desc_lower or 'auto' in desc_lower:
                    credit_types.add('auto_loan')
                else:
                    credit_types.add('personal_loan')
            elif 'credit' in desc_lower:
                credit_types.add('credit_card')
        
        diversity_count = len(credit_types)
        
        if diversity_count >= 4:
            score = 'excellent'
        elif diversity_count >= 3:
            score = 'good'
        elif diversity_count >= 2:
            score = 'fair'
        elif diversity_count >= 1:
            score = 'poor'
        else:
            score = 'bad'
        
        return {
            'score': score,
            'credit_types': list(credit_types),
            'diversity_count': diversity_count
        }
    
    def _estimate_credit_inquiries(self, transactions):
        """Estimate new credit inquiries based on new account patterns"""
        # This is a simplified estimation
        # Look for patterns that might indicate new credit applications
        
        potential_new_accounts = 0
        
        # Look for first-time transactions with credit institutions
        institution_first_transactions = {}
        
        for transaction in transactions:
            # Extract potential institution names (simplified)
            desc_words = transaction.description.lower().split()
            potential_institution = None
            
            for word in desc_words:
                if any(term in word for term in ['bank', 'card', 'finance', 'loan']):
                    potential_institution = word
                    break
            
            if potential_institution:
                if potential_institution not in institution_first_transactions:
                    institution_first_transactions[potential_institution] = transaction.date
                    potential_new_accounts += 1
        
        # Score based on number of new accounts in last 12 months
        if potential_new_accounts == 0:
            score = 'excellent'
        elif potential_new_accounts <= 2:
            score = 'good'
        elif potential_new_accounts <= 4:
            score = 'fair'
        elif potential_new_accounts <= 6:
            score = 'poor'
        else:
            score = 'bad'
        
        return {
            'score': score,
            'estimated_new_accounts': potential_new_accounts,
            'institutions': list(institution_first_transactions.keys())
        }
    
    def _estimate_account_age(self, transactions):
        """Estimate average account age based on transaction history"""
        if not transactions:
            return {'score': 'no_data', 'estimated_age_months': 0}
        
        # Use transaction data span as a proxy for account age
        dates = [t.date for t in transactions]
        oldest_date = min(dates)
        newest_date = max(dates)
        
        data_span_days = (newest_date - oldest_date).days
        estimated_age_months = data_span_days / 30.44  # Average days per month
        
        if estimated_age_months >= 60:  # 5+ years
            score = 'excellent'
        elif estimated_age_months >= 36:  # 3+ years
            score = 'good'
        elif estimated_age_months >= 24:  # 2+ years
            score = 'fair'
        elif estimated_age_months >= 12:  # 1+ year
            score = 'poor'
        else:
            score = 'bad'
        
        return {
            'score': score,
            'estimated_age_months': estimated_age_months,
            'data_span_days': data_span_days
        }
    
    def _calculate_debt_to_income_ratio(self, transactions):
        """Calculate debt-to-income ratio"""
        monthly_income = sum(t.amount for t in transactions if t.transaction_type == 'credit' and t.category == 'Salary') / 12
        monthly_emi = sum(t.amount for t in transactions if t.transaction_type == 'debit' and t.category == 'EMI') / 12
        
        if monthly_income == 0:
            return {'ratio': 0, 'score': 'no_data'}
        
        dti_ratio = (monthly_emi / monthly_income) * 100
        
        if dti_ratio <= 20:
            score = 'excellent'
        elif dti_ratio <= 36:
            score = 'good'
        elif dti_ratio <= 50:
            score = 'fair'
        elif dti_ratio <= 70:
            score = 'poor'
        else:
            score = 'bad'
        
        return {
            'ratio': dti_ratio,
            'score': score,
            'monthly_income': monthly_income,
            'monthly_emi': monthly_emi
        }
    
    def _analyze_spending_patterns(self, transactions):
        """Analyze spending patterns for financial stability indicators"""
        debit_transactions = [t for t in transactions if t.transaction_type == 'debit']
        
        if not debit_transactions:
            return {'stability': 'no_data'}
        
        monthly_spending = {}
        for transaction in debit_transactions:
            month_key = transaction.date.strftime('%Y-%m')
            if month_key not in monthly_spending:
                monthly_spending[month_key] = 0
            monthly_spending[month_key] += transaction.amount
        
        spending_amounts = list(monthly_spending.values())
        
        if len(spending_amounts) < 2:
            return {'stability': 'insufficient_data'}
        
        # Calculate spending stability (coefficient of variation)
        mean_spending = statistics.mean(spending_amounts)
        std_spending = statistics.stdev(spending_amounts)
        cv = (std_spending / mean_spending) * 100 if mean_spending > 0 else 0
        
        if cv <= 15:
            stability = 'excellent'
        elif cv <= 25:
            stability = 'good'
        elif cv <= 40:
            stability = 'fair'
        elif cv <= 60:
            stability = 'poor'
        else:
            stability = 'bad'
        
        return {
            'stability': stability,
            'coefficient_of_variation': cv,
            'mean_monthly_spending': mean_spending,
            'spending_volatility': std_spending
        }
    
    def predict_cibil_score(self, behavior_analysis):
        """Predict CIBIL score based on behavior analysis"""
        base_score = 300  # Minimum CIBIL score
        max_score = 900   # Maximum CIBIL score
        
        # Score components based on behavior
        payment_score = self._get_component_score(behavior_analysis['payment_consistency']['score'], 'payment_history')
        utilization_score = self._get_component_score(behavior_analysis['credit_utilization']['score'], 'credit_utilization')
        diversity_score = self._get_component_score(behavior_analysis['credit_diversity']['score'], 'credit_mix')
        inquiry_score = self._get_component_score(behavior_analysis['new_credit_inquiries']['score'], 'new_credit')
        age_score = self._get_component_score(behavior_analysis['account_age']['score'], 'length_of_history')
        
        # Weighted score calculation
        total_score = (
            payment_score * self.score_weights['payment_history'] +
            utilization_score * self.score_weights['credit_utilization'] +
            diversity_score * self.score_weights['credit_mix'] +
            inquiry_score * self.score_weights['new_credit'] +
            age_score * self.score_weights['length_of_history']
        )
        
        # Convert to CIBIL score range
        predicted_score = base_score + (total_score * (max_score - base_score) / 100)
        
        return min(max_score, max(base_score, int(predicted_score)))
    
    def _get_component_score(self, grade, component):
        """Convert grade to component score (0-100)"""
        grade_scores = {
            'excellent': 95,
            'good': 80,
            'fair': 65,
            'poor': 45,
            'bad': 25,
            'no_data': 50  # Neutral score for missing data
        }
        return grade_scores.get(grade, 50)
    
    def get_improvement_factors(self, behavior_analysis, current_score):
        """Get factors that can improve the CIBIL score"""
        improvement_factors = []
        
        for factor, analysis in behavior_analysis.items():
            if isinstance(analysis, dict) and 'score' in analysis:
                grade = analysis['score']
                if grade in ['poor', 'bad', 'fair']:
                    factor_name = factor.replace('_', ' ').title()
                    improvement_factors.append({
                        'factor': factor_name,
                        'current_grade': grade,
                        'improvement_potential': self.improvement_potential.get(factor, {}).get(grade, 0),
                        'priority': self._get_improvement_priority(factor, grade)
                    })
        
        # Sort by priority and improvement potential
        improvement_factors.sort(key=lambda x: (x['priority'], -x['improvement_potential']))
        
        return improvement_factors
    
    def _get_improvement_priority(self, factor, grade):
        """Get improvement priority (1=highest, 5=lowest)"""
        priority_matrix = {
            'payment_consistency': {'bad': 1, 'poor': 1, 'fair': 2},
            'credit_utilization': {'bad': 1, 'poor': 2, 'fair': 3},
            'credit_diversity': {'bad': 3, 'poor': 4, 'fair': 5},
            'new_credit_inquiries': {'bad': 2, 'poor': 3, 'fair': 4},
            'account_age': {'bad': 4, 'poor': 5, 'fair': 5}
        }
        
        return priority_matrix.get(factor, {}).get(grade, 5)
    
    def generate_recommendations(self, behavior_analysis, current_score):
        """Generate actionable recommendations for score improvement"""
        recommendations = []
        
        # Payment history recommendations
        payment_analysis = behavior_analysis.get('payment_consistency', {})
        if payment_analysis.get('score') in ['poor', 'bad']:
            recommendations.append({
                'category': 'Payment History',
                'priority': 'High',
                'recommendation': 'Set up automatic payments for all EMIs and credit card bills',
                'impact': 'Can improve score by 50-100 points over 6-12 months',
                'timeline': '6-12 months',
                'specific_actions': [
                    'Enable auto-debit for EMI payments',
                    'Set up credit card autopay for full amount',
                    'Pay any overdue amounts immediately',
                    'Set payment reminders 3 days before due dates'
                ]
            })
        
        # Credit utilization recommendations
        utilization_analysis = behavior_analysis.get('credit_utilization', {})
        if utilization_analysis.get('score') in ['poor', 'bad', 'fair']:
            recommendations.append({
                'category': 'Credit Utilization',
                'priority': 'High',
                'recommendation': 'Reduce credit card utilization below 30%',
                'impact': 'Can improve score by 30-80 points over 3-6 months',
                'timeline': '3-6 months',
                'specific_actions': [
                    'Pay down existing credit card balances',
                    'Request credit limit increases',
                    'Split balances across multiple cards',
                    'Pay twice monthly to keep balances low'
                ]
            })
        
        # Credit mix recommendations
        diversity_analysis = behavior_analysis.get('credit_diversity', {})
        if diversity_analysis.get('score') in ['poor', 'bad']:
            recommendations.append({
                'category': 'Credit Mix',
                'priority': 'Medium',
                'recommendation': 'Diversify your credit portfolio responsibly',
                'impact': 'Can improve score by 20-40 points over 12-24 months',
                'timeline': '12-24 months',
                'specific_actions': [
                    'Consider a secured credit card if new to credit',
                    'Add an installment loan if you only have credit cards',
                    'Maintain different types of credit accounts',
                    'Avoid opening too many accounts at once'
                ]
            })
        
        # New credit recommendations
        inquiry_analysis = behavior_analysis.get('new_credit_inquiries', {})
        if inquiry_analysis.get('score') in ['poor', 'bad']:
            recommendations.append({
                'category': 'New Credit',
                'priority': 'Medium',
                'recommendation': 'Limit new credit applications',
                'impact': 'Can improve score by 10-25 points over 6-12 months',
                'timeline': '6-12 months',
                'specific_actions': [
                    'Avoid applying for new credit for 6-12 months',
                    'Research thoroughly before applying',
                    'Space applications 6+ months apart',
                    'Only apply for credit you actually need'
                ]
            })
        
        return recommendations
    
    def create_improvement_timeline(self, behavior_analysis, current_score, recommendations):
        """Create a timeline for score improvement"""
        timeline = []
        projected_score = current_score
        
        # 3-month milestones
        for month in [3, 6, 9, 12, 18, 24]:
            month_improvements = []
            score_increase = 0
            
            for rec in recommendations:
                if month >= 3 and rec['category'] == 'Credit Utilization':
                    month_improvements.append(f"Credit utilization improvements visible")
                    score_increase += 15
                
                if month >= 6 and rec['category'] == 'Payment History':
                    month_improvements.append(f"Payment history improvements visible")
                    score_increase += 20
                
                if month >= 12 and rec['category'] == 'New Credit':
                    month_improvements.append(f"Reduced inquiry impact")
                    score_increase += 10
                
                if month >= 18 and rec['category'] == 'Credit Mix':
                    month_improvements.append(f"Credit mix benefits visible")
                    score_increase += 15
            
            if month_improvements:
                projected_score = min(900, projected_score + score_increase)
                timeline.append({
                    'month': month,
                    'projected_score': projected_score,
                    'improvements': month_improvements,
                    'score_increase': score_increase
                })
        
        return timeline
    
    def simulate_scenario(self, current_score, scenario_changes):
        """Simulate score changes based on specific scenarios"""
        score_impact = 0
        timeline_months = 12
        key_factors = []
        
        # Simulate different scenarios
        if 'pay_off_credit_cards' in scenario_changes:
            score_impact += 40
            timeline_months = 3
            key_factors.append('Credit utilization improvement')
        
        if 'never_miss_payments' in scenario_changes:
            score_impact += 60
            timeline_months = max(timeline_months, 6)
            key_factors.append('Perfect payment history')
        
        if 'add_credit_type' in scenario_changes:
            score_impact += 20
            timeline_months = max(timeline_months, 12)
            key_factors.append('Improved credit mix')
        
        if 'no_new_applications' in scenario_changes:
            score_impact += 15
            timeline_months = max(timeline_months, 6)
            key_factors.append('Reduced credit inquiries')
        
        new_score = min(900, current_score + score_impact)
        
        return {
            'new_score': new_score,
            'score_change': score_impact,
            'timeline': f"{timeline_months} months",
            'key_factors': key_factors
        }
    
    def get_simulation_recommendations(self, simulation_results):
        """Get recommendations based on simulation results"""
        best_scenario = max(simulation_results, key=lambda x: x['projected_score'])
        
        return {
            'best_scenario': best_scenario['scenario'],
            'max_improvement': best_scenario['score_change'],
            'recommendation': f"Focus on {best_scenario['scenario']} for maximum impact",
            'timeline': best_scenario['timeline']
        }
    
    def get_detailed_recommendations(self, score_factors, current_score):
        """Get detailed, actionable recommendations"""
        detailed_recs = []
        
        for factor, score in score_factors.items():
            if score < 70:  # Needs improvement
                factor_recs = self._get_factor_specific_recommendations(factor, score, current_score)
                detailed_recs.extend(factor_recs)
        
        return detailed_recs
    
    def _get_factor_specific_recommendations(self, factor, score, current_score):
        """Get specific recommendations for each factor"""
        recommendations = {
            'payment_history': [
                {
                    'action': 'Set up automatic EMI payments',
                    'priority': 'Critical',
                    'timeline': 'Immediate',
                    'impact': 'High'
                },
                {
                    'action': 'Pay all overdue amounts',
                    'priority': 'Critical',
                    'timeline': 'Immediate',
                    'impact': 'High'
                }
            ],
            'credit_utilization': [
                {
                    'action': 'Pay down credit card balances to below 30%',
                    'priority': 'High',
                    'timeline': '1-3 months',
                    'impact': 'High'
                },
                {
                    'action': 'Request credit limit increases',
                    'priority': 'Medium',
                    'timeline': '1 month',
                    'impact': 'Medium'
                }
            ]
        }
        
        return recommendations.get(factor, [])