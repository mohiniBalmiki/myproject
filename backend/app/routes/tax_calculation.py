from flask import Blueprint, request, jsonify
from extensions import db
from app.models import User, Transaction, TaxCalculation, TaxDeduction, UserDeduction, FinancialData
from utils.tax_calculator import TaxCalculator
from utils.tax_optimizer import TaxOptimizer
from datetime import datetime, date
import json

tax_bp = Blueprint('tax', __name__)

@tax_bp.route('/calculate/<int:user_id>', methods=['POST'])
def calculate_tax(user_id):
    """Calculate tax for a user based on their financial data"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        financial_year = data.get('financial_year', '2023-24')
        
        # Get user's transactions for the financial year
        fy_start, fy_end = get_financial_year_dates(financial_year)
        
        transactions = db.session.query(Transaction).join(FinancialData).filter(
            FinancialData.user_id == user_id,
            Transaction.date >= fy_start,
            Transaction.date <= fy_end
        ).all()
        
        if not transactions:
            return jsonify({'error': 'No financial data found for the specified year'}), 400
        
        # Initialize tax calculator
        calculator = TaxCalculator(financial_year)
        
        # Calculate income and categorize expenses
        income_data = calculator.calculate_income(transactions)
        expense_data = calculator.categorize_expenses(transactions)
        
        # Get applicable deductions
        deductions = calculator.calculate_deductions(transactions, data.get('additional_deductions', {}))
        
        # Calculate tax for both regimes
        old_regime_tax = calculator.calculate_old_regime_tax(
            income_data['gross_income'], 
            deductions
        )
        
        new_regime_tax = calculator.calculate_new_regime_tax(
            income_data['gross_income']
        )
        
        # Determine recommended regime
        recommended_regime = 'old' if old_regime_tax['total_tax'] < new_regime_tax['total_tax'] else 'new'
        potential_savings = abs(old_regime_tax['total_tax'] - new_regime_tax['total_tax'])
        
        # Prepare calculation data
        calculation_data = {
            'income_breakdown': income_data,
            'expense_breakdown': expense_data,
            'deductions': deductions,
            'old_regime': old_regime_tax,
            'new_regime': new_regime_tax,
            'comparison': {
                'recommended_regime': recommended_regime,
                'potential_savings': potential_savings,
                'savings_percentage': (potential_savings / max(old_regime_tax['total_tax'], new_regime_tax['total_tax'])) * 100
            }
        }
        
        # Save calculation to database
        existing_calculation = TaxCalculation.query.filter_by(
            user_id=user_id, 
            financial_year=financial_year
        ).first()
        
        if existing_calculation:
            # Update existing calculation
            existing_calculation.gross_income = income_data['gross_income']
            existing_calculation.total_deductions = sum(deductions.values())
            existing_calculation.taxable_income = income_data['gross_income'] - sum(deductions.values())
            existing_calculation.old_regime_tax = old_regime_tax['total_tax']
            existing_calculation.new_regime_tax = new_regime_tax['total_tax']
            existing_calculation.recommended_regime = recommended_regime
            existing_calculation.potential_savings = potential_savings
            existing_calculation.calculation_data = calculation_data
            existing_calculation.updated_at = datetime.utcnow()
        else:
            # Create new calculation
            tax_calculation = TaxCalculation(
                user_id=user_id,
                financial_year=financial_year,
                gross_income=income_data['gross_income'],
                total_deductions=sum(deductions.values()),
                taxable_income=income_data['gross_income'] - sum(deductions.values()),
                old_regime_tax=old_regime_tax['total_tax'],
                new_regime_tax=new_regime_tax['total_tax'],
                recommended_regime=recommended_regime,
                potential_savings=potential_savings,
                calculation_data=calculation_data
            )
            db.session.add(tax_calculation)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Tax calculation completed successfully',
            'calculation': calculation_data
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Tax calculation failed', 'details': str(e)}), 500

@tax_bp.route('/optimize/<int:user_id>', methods=['POST'])
def optimize_tax(user_id):
    """Get tax optimization suggestions for a user"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        financial_year = data.get('financial_year', '2023-24')
        
        # Get latest tax calculation
        tax_calculation = TaxCalculation.query.filter_by(
            user_id=user_id,
            financial_year=financial_year
        ).order_by(TaxCalculation.updated_at.desc()).first()
        
        if not tax_calculation:
            return jsonify({'error': 'No tax calculation found. Please calculate tax first.'}), 400
        
        # Initialize tax optimizer
        optimizer = TaxOptimizer(financial_year)
        
        # Get optimization suggestions
        suggestions = optimizer.get_optimization_suggestions(
            tax_calculation.gross_income,
            tax_calculation.calculation_data.get('deductions', {}),
            tax_calculation.calculation_data.get('expense_breakdown', {})
        )
        
        return jsonify({
            'optimization_suggestions': suggestions,
            'current_tax': {
                'old_regime': tax_calculation.old_regime_tax,
                'new_regime': tax_calculation.new_regime_tax,
                'recommended': tax_calculation.recommended_regime
            }
        }), 200
    
    except Exception as e:
        return jsonify({'error': 'Tax optimization failed', 'details': str(e)}), 500

@tax_bp.route('/history/<int:user_id>', methods=['GET'])
def get_tax_history(user_id):
    """Get tax calculation history for a user"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        calculations = TaxCalculation.query.filter_by(user_id=user_id).order_by(
            TaxCalculation.created_at.desc()
        ).all()
        
        history = []
        for calc in calculations:
            history.append({
                'id': calc.id,
                'financial_year': calc.financial_year,
                'gross_income': calc.gross_income,
                'total_deductions': calc.total_deductions,
                'taxable_income': calc.taxable_income,
                'old_regime_tax': calc.old_regime_tax,
                'new_regime_tax': calc.new_regime_tax,
                'recommended_regime': calc.recommended_regime,
                'potential_savings': calc.potential_savings,
                'calculated_at': calc.created_at.isoformat(),
                'updated_at': calc.updated_at.isoformat()
            })
        
        return jsonify({'tax_history': history}), 200
    
    except Exception as e:
        return jsonify({'error': 'Failed to fetch tax history', 'details': str(e)}), 500

@tax_bp.route('/deductions', methods=['GET'])
def get_tax_deductions():
    """Get available tax deductions and their limits"""
    try:
        financial_year = request.args.get('financial_year', '2023-24')
        
        deductions = TaxDeduction.query.filter_by(
            financial_year=financial_year,
            is_active=True
        ).all()
        
        deductions_data = []
        for deduction in deductions:
            deductions_data.append({
                'section': deduction.section,
                'description': deduction.description,
                'limit_amount': deduction.limit_amount,
                'applicable_regime': deduction.applicable_regime
            })
        
        return jsonify({'deductions': deductions_data}), 200
    
    except Exception as e:
        return jsonify({'error': 'Failed to fetch deductions', 'details': str(e)}), 500

@tax_bp.route('/simulate', methods=['POST'])
def simulate_tax_scenarios():
    """Simulate different tax scenarios for planning"""
    try:
        data = request.get_json()
        
        required_fields = ['gross_income', 'financial_year']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'{field} is required'}), 400
        
        gross_income = data['gross_income']
        financial_year = data['financial_year']
        scenarios = data.get('scenarios', [])
        
        calculator = TaxCalculator(financial_year)
        results = []
        
        # Base scenario (no additional deductions)
        base_old = calculator.calculate_old_regime_tax(gross_income, {})
        base_new = calculator.calculate_new_regime_tax(gross_income)
        
        results.append({
            'scenario': 'Base (No additional deductions)',
            'old_regime_tax': base_old['total_tax'],
            'new_regime_tax': base_new['total_tax'],
            'recommended': 'old' if base_old['total_tax'] < base_new['total_tax'] else 'new'
        })
        
        # Simulate each provided scenario
        for scenario in scenarios:
            scenario_name = scenario.get('name', 'Custom Scenario')
            deductions = scenario.get('deductions', {})
            
            old_tax = calculator.calculate_old_regime_tax(gross_income, deductions)
            new_tax = calculator.calculate_new_regime_tax(gross_income)
            
            results.append({
                'scenario': scenario_name,
                'deductions': deductions,
                'old_regime_tax': old_tax['total_tax'],
                'new_regime_tax': new_tax['total_tax'],
                'recommended': 'old' if old_tax['total_tax'] < new_tax['total_tax'] else 'new',
                'savings_vs_base': base_old['total_tax'] - old_tax['total_tax']
            })
        
        return jsonify({'simulations': results}), 200
    
    except Exception as e:
        return jsonify({'error': 'Tax simulation failed', 'details': str(e)}), 500

@tax_bp.route('/export/<int:calculation_id>', methods=['GET'])
def export_tax_calculation(calculation_id):
    """Export tax calculation as a detailed report"""
    try:
        calculation = TaxCalculation.query.get(calculation_id)
        if not calculation:
            return jsonify({'error': 'Tax calculation not found'}), 404
        
        # Generate detailed report
        report = {
            'user_info': {
                'name': calculation.user.name,
                'email': calculation.user.email,
                'pan_number': calculation.user.pan_number
            },
            'calculation_summary': {
                'financial_year': calculation.financial_year,
                'gross_income': calculation.gross_income,
                'total_deductions': calculation.total_deductions,
                'taxable_income': calculation.taxable_income,
                'old_regime_tax': calculation.old_regime_tax,
                'new_regime_tax': calculation.new_regime_tax,
                'recommended_regime': calculation.recommended_regime,
                'potential_savings': calculation.potential_savings
            },
            'detailed_breakdown': calculation.calculation_data,
            'generated_at': datetime.utcnow().isoformat()
        }
        
        return jsonify({'report': report}), 200
    
    except Exception as e:
        return jsonify({'error': 'Report generation failed', 'details': str(e)}), 500

def get_financial_year_dates(financial_year):
    """Get start and end dates for a financial year"""
    start_year = int(financial_year.split('-')[0])
    start_date = date(start_year, 4, 1)  # April 1st
    end_date = date(start_year + 1, 3, 31)  # March 31st next year
    return start_date, end_date