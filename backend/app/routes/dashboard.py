from flask import Blueprint, request, jsonify
from app import db
from app.models import User, Transaction, TaxCalculation, CibilScore, FinancialData
from datetime import datetime, timedelta
from sqlalchemy import func
import calendar

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/overview/<int:user_id>', methods=['GET'])
def get_dashboard_overview(user_id):
    """Get dashboard overview with key metrics"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get date range for analysis
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=365)  # Last 12 months
        
        # Get financial summary
        financial_summary = get_financial_summary(user_id, start_date, end_date)
        
        # Get tax summary
        tax_summary = get_tax_summary(user_id)
        
        # Get CIBIL summary
        cibil_summary = get_cibil_summary(user_id)
        
        # Get recent activity
        recent_activity = get_recent_activity(user_id)
        
        # Get insights and recommendations
        insights = generate_insights(user_id, financial_summary, tax_summary, cibil_summary)
        
        overview = {
            'user_info': {
                'name': user.name,
                'email': user.email,
                'member_since': user.created_at.strftime('%B %Y')
            },
            'financial_summary': financial_summary,
            'tax_summary': tax_summary,
            'cibil_summary': cibil_summary,
            'recent_activity': recent_activity,
            'insights': insights,
            'last_updated': datetime.now().isoformat()
        }
        
        return jsonify({'dashboard': overview}), 200
    
    except Exception as e:
        return jsonify({'error': 'Failed to load dashboard', 'details': str(e)}), 500

@dashboard_bp.route('/financial-summary/<int:user_id>', methods=['GET'])
def get_detailed_financial_summary(user_id):
    """Get detailed financial summary with charts data"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get query parameters
        period = request.args.get('period', '12m')  # 3m, 6m, 12m
        
        # Calculate date range
        end_date = datetime.now().date()
        if period == '3m':
            start_date = end_date - timedelta(days=90)
        elif period == '6m':
            start_date = end_date - timedelta(days=180)
        else:  # 12m default
            start_date = end_date - timedelta(days=365)
        
        # Get transaction data
        transactions = db.session.query(Transaction).join(FinancialData).filter(
            FinancialData.user_id == user_id,
            Transaction.date >= start_date,
            Transaction.date <= end_date
        ).all()
        
        # Generate charts data
        monthly_trends = generate_monthly_trends(transactions, start_date, end_date)
        category_breakdown = generate_category_breakdown(transactions)
        income_vs_expenses = generate_income_vs_expenses(transactions)
        recurring_transactions = analyze_recurring_transactions(transactions)
        
        summary = {
            'period': period,
            'date_range': {
                'start': start_date.isoformat(),
                'end': end_date.isoformat()
            },
            'monthly_trends': monthly_trends,
            'category_breakdown': category_breakdown,
            'income_vs_expenses': income_vs_expenses,
            'recurring_transactions': recurring_transactions,
            'key_metrics': {
                'total_transactions': len(transactions),
                'average_monthly_income': income_vs_expenses['average_income'],
                'average_monthly_expense': income_vs_expenses['average_expense'],
                'savings_rate': income_vs_expenses['savings_rate']
            }
        }
        
        return jsonify({'financial_summary': summary}), 200
    
    except Exception as e:
        return jsonify({'error': 'Failed to generate financial summary', 'details': str(e)}), 500

@dashboard_bp.route('/tax-insights/<int:user_id>', methods=['GET'])
def get_tax_insights(user_id):
    """Get tax insights and optimization opportunities"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get latest tax calculation
        latest_calculation = TaxCalculation.query.filter_by(user_id=user_id).order_by(
            TaxCalculation.updated_at.desc()
        ).first()
        
        if not latest_calculation:
            return jsonify({'error': 'No tax calculation found'}), 404
        
        # Generate tax insights
        tax_insights = {
            'current_year': latest_calculation.financial_year,
            'tax_liability': {
                'old_regime': latest_calculation.old_regime_tax,
                'new_regime': latest_calculation.new_regime_tax,
                'recommended_regime': latest_calculation.recommended_regime,
                'potential_savings': latest_calculation.potential_savings
            },
            'deduction_utilization': analyze_deduction_utilization(latest_calculation),
            'optimization_opportunities': identify_tax_opportunities(latest_calculation),
            'year_over_year': get_tax_year_comparison(user_id),
            'action_items': generate_tax_action_items(latest_calculation)
        }
        
        return jsonify({'tax_insights': tax_insights}), 200
    
    except Exception as e:
        return jsonify({'error': 'Failed to generate tax insights', 'details': str(e)}), 500

@dashboard_bp.route('/cibil-dashboard/<int:user_id>', methods=['GET'])
def get_cibil_dashboard(user_id):
    """Get CIBIL score dashboard with trends and recommendations"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get CIBIL score history
        cibil_history = CibilScore.query.filter_by(user_id=user_id).order_by(
            CibilScore.analysis_date.desc()
        ).all()
        
        if not cibil_history:
            return jsonify({'error': 'No CIBIL analysis found'}), 404
        
        latest_analysis = cibil_history[0]
        
        # Generate CIBIL dashboard
        cibil_dashboard = {
            'current_score': latest_analysis.predicted_score or latest_analysis.current_score,
            'score_trend': generate_score_trend(cibil_history),
            'score_factors': latest_analysis.score_factors,
            'improvement_plan': latest_analysis.improvement_timeline,
            'recommendations': latest_analysis.recommendations,
            'score_distribution': get_score_distribution(latest_analysis.predicted_score or latest_analysis.current_score),
            'monitoring_alerts': generate_monitoring_alerts(latest_analysis)
        }
        
        return jsonify({'cibil_dashboard': cibil_dashboard}), 200
    
    except Exception as e:
        return jsonify({'error': 'Failed to generate CIBIL dashboard', 'details': str(e)}), 500

@dashboard_bp.route('/reports/<int:user_id>', methods=['GET'])
def get_reports_summary(user_id):
    """Get summary of available reports"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get available reports
        reports = {
            'tax_reports': get_available_tax_reports(user_id),
            'financial_reports': get_available_financial_reports(user_id),
            'cibil_reports': get_available_cibil_reports(user_id)
        }
        
        return jsonify({'reports': reports}), 200
    
    except Exception as e:
        return jsonify({'error': 'Failed to fetch reports', 'details': str(e)}), 500

# Helper functions

def get_financial_summary(user_id, start_date, end_date):
    """Get financial summary for the user"""
    transactions = db.session.query(Transaction).join(FinancialData).filter(
        FinancialData.user_id == user_id,
        Transaction.date >= start_date,
        Transaction.date <= end_date
    ).all()
    
    total_income = sum(t.amount for t in transactions if t.transaction_type == 'credit')
    total_expenses = sum(t.amount for t in transactions if t.transaction_type == 'debit')
    net_savings = total_income - total_expenses
    
    # Calculate month-over-month growth
    current_month_income = sum(t.amount for t in transactions 
                             if t.transaction_type == 'credit' 
                             and t.date.month == datetime.now().month)
    
    previous_month_income = sum(t.amount for t in transactions 
                              if t.transaction_type == 'credit' 
                              and t.date.month == datetime.now().month - 1)
    
    income_growth = ((current_month_income - previous_month_income) / previous_month_income * 100) if previous_month_income > 0 else 0
    
    return {
        'total_income': total_income,
        'total_expenses': total_expenses,
        'net_savings': net_savings,
        'savings_rate': (net_savings / total_income * 100) if total_income > 0 else 0,
        'income_growth': income_growth,
        'transaction_count': len(transactions)
    }

def get_tax_summary(user_id):
    """Get tax summary for the user"""
    latest_calculation = TaxCalculation.query.filter_by(user_id=user_id).order_by(
        TaxCalculation.updated_at.desc()
    ).first()
    
    if not latest_calculation:
        return {'status': 'no_calculation'}
    
    return {
        'financial_year': latest_calculation.financial_year,
        'gross_income': latest_calculation.gross_income,
        'tax_liability': latest_calculation.old_regime_tax if latest_calculation.recommended_regime == 'old' else latest_calculation.new_regime_tax,
        'recommended_regime': latest_calculation.recommended_regime,
        'potential_savings': latest_calculation.potential_savings,
        'deductions_utilized': latest_calculation.total_deductions,
        'last_calculated': latest_calculation.updated_at.isoformat()
    }

def get_cibil_summary(user_id):
    """Get CIBIL summary for the user"""
    latest_analysis = CibilScore.query.filter_by(user_id=user_id).order_by(
        CibilScore.analysis_date.desc()
    ).first()
    
    if not latest_analysis:
        return {'status': 'no_analysis'}
    
    score = latest_analysis.predicted_score or latest_analysis.current_score
    
    return {
        'current_score': score,
        'score_category': get_score_category(score),
        'last_analyzed': latest_analysis.analysis_date.isoformat(),
        'improvement_potential': sum(r.get('impact', 0) for r in latest_analysis.recommendations or []),
        'active_recommendations': len(latest_analysis.recommendations or [])
    }

def get_recent_activity(user_id, limit=5):
    """Get recent financial activity"""
    recent_transactions = db.session.query(Transaction).join(FinancialData).filter(
        FinancialData.user_id == user_id
    ).order_by(Transaction.date.desc()).limit(limit).all()
    
    activity = []
    for transaction in recent_transactions:
        activity.append({
            'date': transaction.date.isoformat(),
            'description': transaction.description,
            'amount': transaction.amount,
            'type': transaction.transaction_type,
            'category': transaction.category
        })
    
    return activity

def generate_insights(user_id, financial_summary, tax_summary, cibil_summary):
    """Generate AI-powered insights"""
    insights = []
    
    # Financial insights
    if financial_summary['savings_rate'] < 20:
        insights.append({
            'type': 'financial',
            'priority': 'high',
            'title': 'Low Savings Rate',
            'message': f"Your savings rate is {financial_summary['savings_rate']:.1f}%. Consider reducing discretionary spending.",
            'action': 'Review your expense categories and identify areas to cut back.'
        })
    
    # Tax insights
    if tax_summary.get('potential_savings', 0) > 10000:
        insights.append({
            'type': 'tax',
            'priority': 'medium',
            'title': 'Tax Optimization Opportunity',
            'message': f"You could save ₹{tax_summary['potential_savings']:,.0f} in taxes.",
            'action': 'Review tax-saving investment options under Section 80C.'
        })
    
    # CIBIL insights
    if cibil_summary.get('current_score', 0) < 700:
        insights.append({
            'type': 'cibil',
            'priority': 'high',
            'title': 'CIBIL Score Improvement',
            'message': f"Your CIBIL score of {cibil_summary['current_score']} needs improvement.",
            'action': 'Focus on timely payments and reducing credit utilization.'
        })
    
    return insights

def generate_monthly_trends(transactions, start_date, end_date):
    """Generate monthly income/expense trends"""
    monthly_data = {}
    
    for transaction in transactions:
        month_key = transaction.date.strftime('%Y-%m')
        if month_key not in monthly_data:
            monthly_data[month_key] = {'income': 0, 'expenses': 0}
        
        if transaction.transaction_type == 'credit':
            monthly_data[month_key]['income'] += transaction.amount
        else:
            monthly_data[month_key]['expenses'] += transaction.amount
    
    # Convert to chart format
    months = []
    income_data = []
    expense_data = []
    
    current_date = start_date
    while current_date <= end_date:
        month_key = current_date.strftime('%Y-%m')
        month_name = current_date.strftime('%b %Y')
        
        months.append(month_name)
        income_data.append(monthly_data.get(month_key, {}).get('income', 0))
        expense_data.append(monthly_data.get(month_key, {}).get('expenses', 0))
        
        # Move to next month
        if current_date.month == 12:
            current_date = current_date.replace(year=current_date.year + 1, month=1)
        else:
            current_date = current_date.replace(month=current_date.month + 1)
    
    return {
        'labels': months,
        'income': income_data,
        'expenses': expense_data
    }

def generate_category_breakdown(transactions):
    """Generate expense category breakdown"""
    category_totals = {}
    
    for transaction in transactions:
        if transaction.transaction_type == 'debit':
            category = transaction.category or 'Others'
            category_totals[category] = category_totals.get(category, 0) + transaction.amount
    
    # Convert to chart format
    categories = list(category_totals.keys())
    amounts = list(category_totals.values())
    
    return {
        'labels': categories,
        'data': amounts
    }

def generate_income_vs_expenses(transactions):
    """Generate income vs expenses analysis"""
    total_income = sum(t.amount for t in transactions if t.transaction_type == 'credit')
    total_expenses = sum(t.amount for t in transactions if t.transaction_type == 'debit')
    
    # Calculate monthly averages
    months = len(set(t.date.strftime('%Y-%m') for t in transactions))
    months = max(1, months)  # Avoid division by zero
    
    avg_income = total_income / months
    avg_expenses = total_expenses / months
    savings_rate = ((total_income - total_expenses) / total_income * 100) if total_income > 0 else 0
    
    return {
        'total_income': total_income,
        'total_expenses': total_expenses,
        'average_income': avg_income,
        'average_expense': avg_expenses,
        'savings_rate': savings_rate,
        'net_savings': total_income - total_expenses
    }

def analyze_recurring_transactions(transactions):
    """Analyze recurring transactions"""
    # This is a simplified analysis - in production you'd use more sophisticated algorithms
    recurring_patterns = {}
    
    for transaction in transactions:
        # Look for similar descriptions and amounts
        key = (transaction.description[:20], round(transaction.amount, -2))  # Round to nearest 100
        if key not in recurring_patterns:
            recurring_patterns[key] = []
        recurring_patterns[key].append(transaction)
    
    recurring_transactions = []
    for (desc, amount), txns in recurring_patterns.items():
        if len(txns) >= 3:  # Consider it recurring if it appears 3+ times
            recurring_transactions.append({
                'description': desc,
                'amount': amount,
                'frequency': len(txns),
                'total_amount': sum(t.amount for t in txns),
                'category': txns[0].category
            })
    
    return recurring_transactions

def analyze_deduction_utilization(tax_calculation):
    """Analyze tax deduction utilization"""
    deductions = tax_calculation.calculation_data.get('deductions', {})
    deduction_limits = {
        '80C': 150000,
        '80D': 25000,
        '80G': 100000,
        '24b': 200000
    }
    
    utilization = {}
    for section, limit in deduction_limits.items():
        used = deductions.get(section, 0)
        utilization[section] = {
            'used': used,
            'limit': limit,
            'utilization_percentage': (used / limit * 100) if limit > 0 else 0,
            'remaining': max(0, limit - used)
        }
    
    return utilization

def identify_tax_opportunities(tax_calculation):
    """Identify tax optimization opportunities"""
    opportunities = []
    deductions = tax_calculation.calculation_data.get('deductions', {})
    
    # Check 80C utilization
    if deductions.get('80C', 0) < 150000:
        remaining = 150000 - deductions.get('80C', 0)
        opportunities.append({
            'section': '80C',
            'opportunity': f'₹{remaining:,} remaining in 80C limit',
            'potential_savings': remaining * 0.2,  # Assuming 20% tax bracket
            'suggestion': 'Invest in ELSS, PPF, or life insurance'
        })
    
    # Check 80D utilization
    if deductions.get('80D', 0) < 25000:
        remaining = 25000 - deductions.get('80D', 0)
        opportunities.append({
            'section': '80D',
            'opportunity': f'₹{remaining:,} remaining in 80D limit',
            'potential_savings': remaining * 0.2,
            'suggestion': 'Get health insurance or increase coverage'
        })
    
    return opportunities

def get_tax_year_comparison(user_id):
    """Get year-over-year tax comparison"""
    calculations = TaxCalculation.query.filter_by(user_id=user_id).order_by(
        TaxCalculation.financial_year.desc()
    ).limit(2).all()
    
    if len(calculations) < 2:
        return None
    
    current = calculations[0]
    previous = calculations[1]
    
    return {
        'current_year': current.financial_year,
        'previous_year': previous.financial_year,
        'income_change': current.gross_income - previous.gross_income,
        'tax_change': current.old_regime_tax - previous.old_regime_tax,
        'savings_change': current.potential_savings - previous.potential_savings
    }

def generate_tax_action_items(tax_calculation):
    """Generate actionable tax-related tasks"""
    action_items = []
    deductions = tax_calculation.calculation_data.get('deductions', {})
    
    if deductions.get('80C', 0) < 150000:
        action_items.append({
            'priority': 'high',
            'task': 'Maximize 80C deductions',
            'deadline': 'March 31st',
            'description': 'Invest remaining amount in tax-saving instruments'
        })
    
    if deductions.get('80D', 0) == 0:
        action_items.append({
            'priority': 'medium',
            'task': 'Get health insurance',
            'deadline': 'Immediate',
            'description': 'Health insurance provides coverage and tax benefits'
        })
    
    return action_items

def generate_score_trend(cibil_history):
    """Generate CIBIL score trend data"""
    trend_data = []
    
    for analysis in reversed(cibil_history):  # Oldest first
        score = analysis.predicted_score or analysis.current_score
        trend_data.append({
            'date': analysis.analysis_date.strftime('%b %Y'),
            'score': score
        })
    
    return trend_data

def get_score_distribution(score):
    """Get score distribution and percentile"""
    if score >= 750:
        return {'category': 'Excellent', 'percentile': 85, 'color': '#4CAF50'}
    elif score >= 700:
        return {'category': 'Good', 'percentile': 65, 'color': '#8BC34A'}
    elif score >= 650:
        return {'category': 'Fair', 'percentile': 45, 'color': '#FFC107'}
    elif score >= 600:
        return {'category': 'Poor', 'percentile': 25, 'color': '#FF9800'}
    else:
        return {'category': 'Bad', 'percentile': 10, 'color': '#F44336'}

def generate_monitoring_alerts(analysis):
    """Generate CIBIL monitoring alerts"""
    alerts = []
    score = analysis.predicted_score or analysis.current_score
    
    if score < 650:
        alerts.append({
            'type': 'warning',
            'message': 'Your CIBIL score is below 650. Focus on improvement strategies.',
            'action': 'Review payment history and credit utilization'
        })
    
    # Add more alert logic based on score factors
    
    return alerts

def get_score_category(score):
    """Get CIBIL score category"""
    if score >= 750:
        return 'Excellent'
    elif score >= 700:
        return 'Good'
    elif score >= 650:
        return 'Fair'
    elif score >= 600:
        return 'Poor'
    else:
        return 'Needs Improvement'

def get_available_tax_reports(user_id):
    """Get available tax reports"""
    calculations = TaxCalculation.query.filter_by(user_id=user_id).all()
    
    reports = []
    for calc in calculations:
        reports.append({
            'id': calc.id,
            'title': f'Tax Report - {calc.financial_year}',
            'type': 'tax_calculation',
            'date': calc.created_at.isoformat(),
            'description': f'Comprehensive tax calculation for FY {calc.financial_year}'
        })
    
    return reports

def get_available_financial_reports(user_id):
    """Get available financial reports"""
    # This would include various financial summaries
    reports = [
        {
            'id': 'monthly_summary',
            'title': 'Monthly Financial Summary',
            'type': 'financial_summary',
            'description': 'Monthly income, expenses, and savings analysis'
        },
        {
            'id': 'category_analysis',
            'title': 'Expense Category Analysis',
            'type': 'expense_analysis',
            'description': 'Detailed breakdown of spending by category'
        }
    ]
    
    return reports

def get_available_cibil_reports(user_id):
    """Get available CIBIL reports"""
    analyses = CibilScore.query.filter_by(user_id=user_id).all()
    
    reports = []
    for analysis in analyses:
        reports.append({
            'id': analysis.id,
            'title': f'CIBIL Analysis Report',
            'type': 'cibil_analysis',
            'date': analysis.analysis_date.isoformat(),
            'description': 'Comprehensive CIBIL score analysis and recommendations'
        })
    
    return reports