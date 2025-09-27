from datetime import datetime
from app import db

class User(db.Model):
    """User model for authentication and profile management"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(15), nullable=True)
    pan_number = db.Column(db.String(10), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    financial_data = db.relationship('FinancialData', backref='user', lazy=True, cascade='all, delete-orphan')
    tax_calculations = db.relationship('TaxCalculation', backref='user', lazy=True, cascade='all, delete-orphan')
    cibil_scores = db.relationship('CibilScore', backref='user', lazy=True, cascade='all, delete-orphan')

class FinancialData(db.Model):
    """Financial data uploaded by users"""
    __tablename__ = 'financial_data'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    file_name = db.Column(db.String(255), nullable=False)
    file_type = db.Column(db.String(50), nullable=False)  # 'bank_statement', 'credit_card', 'csv'
    file_path = db.Column(db.String(500), nullable=False)
    processing_status = db.Column(db.String(50), default='pending')  # 'pending', 'processed', 'error'
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)
    processed_at = db.Column(db.DateTime, nullable=True)
    
    # Relationships
    transactions = db.relationship('Transaction', backref='financial_data', lazy=True, cascade='all, delete-orphan')

class Transaction(db.Model):
    """Individual financial transactions extracted from uploaded data"""
    __tablename__ = 'transactions'
    
    id = db.Column(db.Integer, primary_key=True)
    financial_data_id = db.Column(db.Integer, db.ForeignKey('financial_data.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    description = db.Column(db.Text, nullable=False)
    amount = db.Column(db.Float, nullable=False)
    transaction_type = db.Column(db.String(20), nullable=False)  # 'credit', 'debit'
    category = db.Column(db.String(100), nullable=True)
    subcategory = db.Column(db.String(100), nullable=True)
    is_recurring = db.Column(db.Boolean, default=False)
    recurring_frequency = db.Column(db.String(20), nullable=True)  # 'monthly', 'quarterly', 'yearly'
    tax_relevant = db.Column(db.Boolean, default=False)
    tax_section = db.Column(db.String(20), nullable=True)  # '80C', '80D', '24b', etc.
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class TaxCalculation(db.Model):
    """Tax calculations for users"""
    __tablename__ = 'tax_calculations'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    financial_year = db.Column(db.String(10), nullable=False)  # '2023-24'
    gross_income = db.Column(db.Float, nullable=False)
    total_deductions = db.Column(db.Float, default=0.0)
    taxable_income = db.Column(db.Float, nullable=False)
    old_regime_tax = db.Column(db.Float, nullable=False)
    new_regime_tax = db.Column(db.Float, nullable=False)
    recommended_regime = db.Column(db.String(20), nullable=False)  # 'old', 'new'
    potential_savings = db.Column(db.Float, default=0.0)
    calculation_data = db.Column(db.JSON)  # Detailed breakdown
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class CibilScore(db.Model):
    """CIBIL score analysis and recommendations"""
    __tablename__ = 'cibil_scores'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    current_score = db.Column(db.Integer, nullable=True)
    predicted_score = db.Column(db.Integer, nullable=True)
    score_factors = db.Column(db.JSON)  # Factors affecting the score
    recommendations = db.Column(db.JSON)  # AI-generated recommendations
    improvement_timeline = db.Column(db.JSON)  # Projected improvement over time
    analysis_date = db.Column(db.DateTime, default=datetime.utcnow)
    
class TaxDeduction(db.Model):
    """Tax deduction categories and limits"""
    __tablename__ = 'tax_deductions'
    
    id = db.Column(db.Integer, primary_key=True)
    section = db.Column(db.String(20), nullable=False)  # '80C', '80D', etc.
    description = db.Column(db.String(255), nullable=False)
    limit_amount = db.Column(db.Float, nullable=False)
    applicable_regime = db.Column(db.String(20), nullable=False)  # 'old', 'new', 'both'
    financial_year = db.Column(db.String(10), nullable=False)
    is_active = db.Column(db.Boolean, default=True)

class UserDeduction(db.Model):
    """User's actual deductions claimed"""
    __tablename__ = 'user_deductions'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    tax_calculation_id = db.Column(db.Integer, db.ForeignKey('tax_calculations.id'), nullable=False)
    section = db.Column(db.String(20), nullable=False)
    claimed_amount = db.Column(db.Float, nullable=False)
    eligible_amount = db.Column(db.Float, nullable=False)
    supporting_documents = db.Column(db.JSON)  # List of document paths
    verification_status = db.Column(db.String(20), default='pending')  # 'pending', 'verified', 'rejected'