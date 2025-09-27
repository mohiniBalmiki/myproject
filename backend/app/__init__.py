"""
TaxWise Backend Application

This package contains the Flask backend API for the TaxWise platform.
"""
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize extensions
db = SQLAlchemy()
cors = CORS()

def create_app():
    """Create and configure the Flask application."""
    app = Flask(__name__)
    
    # Configuration
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')
    
    # Database configuration
    database_url = os.getenv('DATABASE_URL', 'sqlite:///taxwise.db')
    if database_url.startswith('postgres://'):
        database_url = database_url.replace('postgres://', 'postgresql://', 1)
    
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # File upload configuration
    app.config['UPLOAD_FOLDER'] = os.getenv('UPLOAD_FOLDER', 'uploads')
    app.config['MAX_CONTENT_LENGTH'] = int(os.getenv('MAX_CONTENT_LENGTH', 16777216))
    
    # Initialize extensions
    db.init_app(app)
    cors.init_app(app, origins=["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:5500"])
    
    # Import models
    from .models import User, FinancialData, Transaction, TaxCalculation, CibilScore
    
    # Create upload directory
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    # Register blueprints
    from .routes.auth import auth_bp
    from .routes.data_ingestion import data_bp
    from .routes.tax_calculation import tax_bp
    from .routes.cibil_analysis import cibil_bp
    from .routes.dashboard import dashboard_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(data_bp, url_prefix='/api/data')
    app.register_blueprint(tax_bp, url_prefix='/api/tax')
    app.register_blueprint(cibil_bp, url_prefix='/api/cibil')
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')
    
    # Create database tables
    with app.app_context():
        db.create_all()
    
    return app

__version__ = "1.0.0"