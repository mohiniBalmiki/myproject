from flask import Flask
from flask_cors import CORS
import os
from dotenv import load_dotenv
from supabase_client import get_supabase_manager

# Load environment variables
load_dotenv()

def create_app():
    app = Flask(__name__)
    
    # Configuration
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'taxwise-secret-key-2024')
    app.config['UPLOAD_FOLDER'] = os.path.join(app.instance_path, 'uploads')
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
    
    # Supabase configuration
    app.config['SUPABASE_URL'] = os.environ.get('SUPABASE_URL')
    app.config['SUPABASE_KEY'] = os.environ.get('SUPABASE_KEY')
    app.config['SUPABASE_SERVICE_KEY'] = os.environ.get('SUPABASE_SERVICE_KEY')
    
    # Ensure upload directory exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    # Initialize CORS
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
    
    # Initialize Supabase connection and check database schema
    with app.app_context():
        try:
            supabase_manager = get_supabase_manager()
            connection_test = supabase_manager.test_connection()
            
            if connection_test:
                print("✅ Supabase connection established successfully")
                
                # Check database schema
                schema_check = supabase_manager.init_database_schema()
                if schema_check['success']:
                    print(f"� Database schema check completed")
                    print(f"📂 Existing tables: {schema_check.get('existing_tables', [])}")
                    if schema_check.get('missing_tables'):
                        print(f"⚠️  Missing tables: {schema_check['missing_tables']}")
                        print("� Please create these tables in your Supabase dashboard")
                else:
                    print(f"⚠️  Schema check warning: {schema_check.get('error', 'Unknown error')}")
            else:
                print("❌ Supabase connection failed")
                print("🔧 Please check your Supabase credentials in .env file")
                
        except Exception as e:
            print(f"❌ Error initializing Supabase: {e}")
            print("� Please check your SUPABASE_URL and SUPABASE_KEY in .env file")
    
    return app

if __name__ == '__main__':
    app = create_app()
    print("🚀 TaxWise Backend Server Starting...")
    print(f"📊 Dashboard: http://localhost:5000")
    print(f"🔗 API Docs: http://localhost:5000/api/docs")
    print(f"❤️  Health Check: http://localhost:5000/health")
    app.run(debug=True, host='0.0.0.0', port=5000)