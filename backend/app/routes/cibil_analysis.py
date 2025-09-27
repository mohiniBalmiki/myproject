from flask import Blueprint, request, jsonify
from app import db
from app.models import User, Transaction, CibilScore, FinancialData
from utils.cibil_analyzer import CibilAnalyzer
from datetime import datetime, timedelta
import json

cibil_bp = Blueprint('cibil', __name__)

@cibil_bp.route('/analyze/<int:user_id>', methods=['POST'])
def analyze_cibil_score(user_id):
    """Analyze user's CIBIL score based on financial behavior"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        current_score = data.get('current_score')  # User can provide current score if known
        
        # Get user's financial transactions from last 12 months
        cutoff_date = datetime.now() - timedelta(days=365)
        
        transactions = db.session.query(Transaction).join(FinancialData).filter(
            FinancialData.user_id == user_id,
            Transaction.date >= cutoff_date.date()
        ).all()
        
        if not transactions:
            return jsonify({'error': 'Insufficient financial data for CIBIL analysis'}), 400
        
        # Initialize CIBIL analyzer
        analyzer = CibilAnalyzer()
        
        # Analyze financial behavior
        behavior_analysis = analyzer.analyze_financial_behavior(transactions)
        
        # Predict CIBIL score if not provided
        if not current_score:
            predicted_score = analyzer.predict_cibil_score(behavior_analysis)
        else:
            predicted_score = current_score
        
        # Get score improvement factors
        improvement_factors = analyzer.get_improvement_factors(behavior_analysis, predicted_score)
        
        # Generate recommendations
        recommendations = analyzer.generate_recommendations(behavior_analysis, predicted_score)
        
        # Create improvement timeline
        improvement_timeline = analyzer.create_improvement_timeline(
            behavior_analysis, predicted_score, recommendations
        )
        
        # Prepare score factors
        score_factors = {
            'payment_history': behavior_analysis['payment_consistency'],
            'credit_utilization': behavior_analysis['credit_utilization'],
            'credit_mix': behavior_analysis['credit_diversity'],
            'new_credit': behavior_analysis['new_credit_inquiries'],
            'length_of_history': behavior_analysis['account_age']
        }
        
        # Save analysis to database
        existing_analysis = CibilScore.query.filter_by(user_id=user_id).order_by(
            CibilScore.analysis_date.desc()
        ).first()
        
        cibil_analysis = CibilScore(
            user_id=user_id,
            current_score=current_score,
            predicted_score=predicted_score,
            score_factors=score_factors,
            recommendations=recommendations,
            improvement_timeline=improvement_timeline
        )
        
        db.session.add(cibil_analysis)
        db.session.commit()
        
        return jsonify({
            'message': 'CIBIL analysis completed successfully',
            'analysis': {
                'current_score': current_score,
                'predicted_score': predicted_score,
                'score_factors': score_factors,
                'behavior_analysis': behavior_analysis,
                'improvement_factors': improvement_factors,
                'recommendations': recommendations,
                'improvement_timeline': improvement_timeline
            }
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'CIBIL analysis failed', 'details': str(e)}), 500

@cibil_bp.route('/simulate/<int:user_id>', methods=['POST'])
def simulate_score_improvement(user_id):
    """Simulate CIBIL score improvement scenarios"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        current_score = data.get('current_score')
        scenarios = data.get('scenarios', [])
        
        if not current_score:
            return jsonify({'error': 'Current CIBIL score is required'}), 400
        
        analyzer = CibilAnalyzer()
        simulation_results = []
        
        for scenario in scenarios:
            scenario_name = scenario.get('name', 'Custom Scenario')
            changes = scenario.get('changes', {})
            
            # Simulate the scenario
            simulated_score = analyzer.simulate_scenario(current_score, changes)
            
            simulation_results.append({
                'scenario': scenario_name,
                'changes': changes,
                'current_score': current_score,
                'projected_score': simulated_score['new_score'],
                'score_change': simulated_score['score_change'],
                'timeline': simulated_score['timeline'],
                'key_factors': simulated_score['key_factors']
            })
        
        return jsonify({
            'simulations': simulation_results,
            'recommendations': analyzer.get_simulation_recommendations(simulation_results)
        }), 200
    
    except Exception as e:
        return jsonify({'error': 'Score simulation failed', 'details': str(e)}), 500

@cibil_bp.route('/history/<int:user_id>', methods=['GET'])
def get_cibil_history(user_id):
    """Get CIBIL score analysis history"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        analyses = CibilScore.query.filter_by(user_id=user_id).order_by(
            CibilScore.analysis_date.desc()
        ).all()
        
        history = []
        for analysis in analyses:
            history.append({
                'id': analysis.id,
                'current_score': analysis.current_score,
                'predicted_score': analysis.predicted_score,
                'score_factors': analysis.score_factors,
                'analysis_date': analysis.analysis_date.isoformat(),
                'improvement_summary': {
                    'total_recommendations': len(analysis.recommendations) if analysis.recommendations else 0,
                    'timeline_months': len(analysis.improvement_timeline) if analysis.improvement_timeline else 0
                }
            })
        
        return jsonify({'cibil_history': history}), 200
    
    except Exception as e:
        return jsonify({'error': 'Failed to fetch CIBIL history', 'details': str(e)}), 500

@cibil_bp.route('/recommendations/<int:analysis_id>', methods=['GET'])
def get_detailed_recommendations(analysis_id):
    """Get detailed recommendations from a specific analysis"""
    try:
        analysis = CibilScore.query.get(analysis_id)
        if not analysis:
            return jsonify({'error': 'Analysis not found'}), 404
        
        # Get actionable recommendations with priority
        analyzer = CibilAnalyzer()
        detailed_recommendations = analyzer.get_detailed_recommendations(
            analysis.score_factors,
            analysis.predicted_score or analysis.current_score
        )
        
        return jsonify({
            'analysis_id': analysis_id,
            'current_score': analysis.current_score,
            'predicted_score': analysis.predicted_score,
            'recommendations': detailed_recommendations,
            'improvement_timeline': analysis.improvement_timeline
        }), 200
    
    except Exception as e:
        return jsonify({'error': 'Failed to fetch recommendations', 'details': str(e)}), 500

@cibil_bp.route('/score-factors', methods=['GET'])
def get_score_factors_info():
    """Get information about CIBIL score factors"""
    try:
        factors_info = {
            'payment_history': {
                'weight': '35%',
                'description': 'Your track record of making payments on time',
                'improvement_tips': [
                    'Always pay credit card bills and EMIs on time',
                    'Set up automatic payments to avoid delays',
                    'Pay at least the minimum amount due',
                    'Clear any overdue amounts immediately'
                ]
            },
            'credit_utilization': {
                'weight': '30%',
                'description': 'How much credit you use vs. your total available credit',
                'improvement_tips': [
                    'Keep credit utilization below 30%',
                    'Pay off credit card balances in full',
                    'Request credit limit increases',
                    'Spread balances across multiple cards'
                ]
            },
            'credit_mix': {
                'weight': '15%',
                'description': 'Variety of credit products you have',
                'improvement_tips': [
                    'Maintain a healthy mix of secured and unsecured loans',
                    'Have both revolving (credit cards) and installment credit',
                    'Avoid too many credit cards',
                    'Consider secured credit cards if starting out'
                ]
            },
            'new_credit': {
                'weight': '10%',
                'description': 'How often you apply for new credit',
                'improvement_tips': [
                    'Limit credit applications to when needed',
                    'Space out credit applications by 6 months',
                    'Avoid multiple applications in short periods',
                    'Research before applying for credit'
                ]
            },
            'length_of_history': {
                'weight': '10%',
                'description': 'How long you have been using credit',
                'improvement_tips': [
                    'Keep old credit accounts open',
                    'Maintain long-standing credit relationships',
                    'Use older credit cards occasionally',
                    'Avoid closing your first credit card'
                ]
            }
        }
        
        score_ranges = {
            'excellent': {'range': '750-900', 'description': 'Excellent credit, best rates available'},
            'good': {'range': '700-749', 'description': 'Good credit, competitive rates'},
            'fair': {'range': '650-699', 'description': 'Fair credit, higher rates'},
            'poor': {'range': '600-649', 'description': 'Poor credit, limited options'},
            'bad': {'range': '300-599', 'description': 'Bad credit, very limited options'}
        }
        
        return jsonify({
            'factors': factors_info,
            'score_ranges': score_ranges,
            'general_tips': [
                'Monitor your credit report regularly',
                'Dispute any errors in your credit report',
                'Keep personal information updated with lenders',
                'Be patient - credit improvement takes time'
            ]
        }), 200
    
    except Exception as e:
        return jsonify({'error': 'Failed to fetch score factors info', 'details': str(e)}), 500

@cibil_bp.route('/monitor/<int:user_id>', methods=['POST'])
def setup_score_monitoring(user_id):
    """Setup CIBIL score monitoring and alerts"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        monitoring_config = {
            'frequency': data.get('frequency', 'monthly'),  # monthly, quarterly
            'alerts': {
                'score_drop': data.get('alert_on_drop', True),
                'new_inquiries': data.get('alert_on_inquiries', True),
                'account_changes': data.get('alert_on_changes', True)
            },
            'target_score': data.get('target_score'),
            'setup_date': datetime.utcnow().isoformat()
        }
        
        # In a real application, you would set up background jobs
        # For now, we'll just save the configuration
        
        return jsonify({
            'message': 'CIBIL monitoring setup successful',
            'monitoring_config': monitoring_config,
            'next_check_date': (datetime.utcnow() + timedelta(days=30)).isoformat()
        }), 200
    
    except Exception as e:
        return jsonify({'error': 'Failed to setup monitoring', 'details': str(e)}), 500