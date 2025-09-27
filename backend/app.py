from flask import Flask
from flask_cors import CORS
import os
from dotenv import load_dotenv
from extensions import db

# Load environment variables
load_dotenv()

def create_app():
    app = Flask(__name__)
    
    # Configuration
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'taxwise-secret-key-2024')
    
    # Database configuration - supports both PostgreSQL (Supabase) and SQLite
    database_url = os.environ.get('DATABASE_URL')
    if database_url and database_url.startswith('postgres://'):
        # Fix for Heroku/Supabase postgres URL
        database_url = database_url.replace('postgres://', 'postgresql://', 1)
    
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url or 'sqlite:///taxwise.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['UPLOAD_FOLDER'] = os.path.join(app.instance_path, 'uploads')
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
    
    # Supabase configuration
    app.config['SUPABASE_URL'] = os.environ.get('SUPABASE_URL')
    app.config['SUPABASE_KEY'] = os.environ.get('SUPABASE_KEY')
    app.config['SUPABASE_SERVICE_KEY'] = os.environ.get('SUPABASE_SERVICE_KEY')
    
    # Ensure upload directory exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    # Initialize extensions with app
    db.init_app(app)
    CORS(app, origins=['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173'])
    
    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.data_ingestion import data_bp
    from app.routes.tax_calculation import tax_bp
    from app.routes.cibil_analysis import cibil_bp
    from app.routes.dashboard import dashboard_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(data_bp, url_prefix='/api/data')
    app.register_blueprint(tax_bp, url_prefix='/api/tax')
    app.register_blueprint(cibil_bp, url_prefix='/api/cibil')
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')
    
    # Health check endpoint
    @app.route('/health')
    def health_check():
        return {'status': 'healthy', 'message': 'TaxWise API is running'}
    
    # API documentation endpoint
    @app.route('/api/docs')
    def api_docs():
        return {
            'api_version': '1.0.0',
            'endpoints': {
                'auth': '/api/auth',
                'data': '/api/data',
                'tax': '/api/tax',
                'cibil': '/api/cibil',
                'dashboard': '/api/dashboard'
            },
            'features': [
                'Smart Financial Data Ingestion',
                'AI-Powered Tax Optimization',
                'CIBIL Score Analysis',
                'Interactive Dashboard'
            ]
        }
    
    # Create database tables
    with app.app_context():
        try:
            db.create_all()
            print("Database tables created successfully")
        except Exception as e:
            print(f"Error creating database tables: {e}")
    
    return app

if __name__ == '__main__':
    app = create_app()
    print("🚀 TaxWise Backend Server Starting...")
    print(f"📊 Dashboard: http://localhost:5000")
    print(f"🔗 API Docs: http://localhost:5000/api/docs")
    print(f"❤️  Health Check: http://localhost:5000/health")
    app.run(debug=True, host='0.0.0.0', port=5000)