from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from extensions import db
from app.models import User, FinancialData, Transaction
from utils.file_processor import FileProcessor
from utils.transaction_categorizer import TransactionCategorizer
import os
from datetime import datetime

data_bp = Blueprint('data', __name__)

ALLOWED_EXTENSIONS = {'csv', 'xlsx', 'xls', 'pdf'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@data_bp.route('/upload', methods=['POST'])
def upload_file():
    """Upload and process financial data files"""
    try:
        # Check if user_id is provided
        user_id = request.form.get('user_id')
        if not user_id:
            return jsonify({'error': 'User ID is required'}), 400
        
        # Verify user exists
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Check if file is present
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'File type not allowed'}), 400
        
        # Get file type from form data
        file_type = request.form.get('file_type', 'csv')  # bank_statement, credit_card, csv
        
        # Save file
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{timestamp}_{filename}"
        file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        # Create financial data record
        financial_data = FinancialData(
            user_id=user_id,
            file_name=filename,
            file_type=file_type,
            file_path=file_path,
            processing_status='pending'
        )
        db.session.add(financial_data)
        db.session.commit()
        
        # Process file asynchronously (in production, use Celery or similar)
        try:
            processor = FileProcessor()
            transactions = processor.process_file(file_path, file_type)
            
            # Categorize transactions
            categorizer = TransactionCategorizer()
            
            for transaction_data in transactions:
                # Categorize the transaction
                category_info = categorizer.categorize_transaction(
                    transaction_data['description'], 
                    transaction_data['amount']
                )
                
                transaction = Transaction(
                    financial_data_id=financial_data.id,
                    date=transaction_data['date'],
                    description=transaction_data['description'],
                    amount=transaction_data['amount'],
                    transaction_type=transaction_data['type'],
                    category=category_info['category'],
                    subcategory=category_info['subcategory'],
                    is_recurring=category_info['is_recurring'],
                    recurring_frequency=category_info.get('frequency'),
                    tax_relevant=category_info['tax_relevant'],
                    tax_section=category_info.get('tax_section')
                )
                db.session.add(transaction)
            
            # Update processing status
            financial_data.processing_status = 'processed'
            financial_data.processed_at = datetime.utcnow()
            db.session.commit()
            
            return jsonify({
                'message': 'File uploaded and processed successfully',
                'file_id': financial_data.id,
                'transactions_count': len(transactions)
            }), 200
        
        except Exception as processing_error:
            financial_data.processing_status = 'error'
            db.session.commit()
            return jsonify({
                'error': 'File processing failed',
                'details': str(processing_error)
            }), 500
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'File upload failed', 'details': str(e)}), 500

@data_bp.route('/files/<int:user_id>', methods=['GET'])
def get_user_files(user_id):
    """Get all files uploaded by a user"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        files = FinancialData.query.filter_by(user_id=user_id).order_by(
            FinancialData.uploaded_at.desc()
        ).all()
        
        files_data = []
        for file in files:
            transaction_count = Transaction.query.filter_by(
                financial_data_id=file.id
            ).count()
            
            files_data.append({
                'id': file.id,
                'file_name': file.file_name,
                'file_type': file.file_type,
                'processing_status': file.processing_status,
                'uploaded_at': file.uploaded_at.isoformat(),
                'processed_at': file.processed_at.isoformat() if file.processed_at else None,
                'transaction_count': transaction_count
            })
        
        return jsonify({'files': files_data}), 200
    
    except Exception as e:
        return jsonify({'error': 'Failed to fetch files', 'details': str(e)}), 500

@data_bp.route('/transactions/<int:user_id>', methods=['GET'])
def get_user_transactions(user_id):
    """Get all transactions for a user with filtering options"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get query parameters for filtering
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        category = request.args.get('category')
        transaction_type = request.args.get('type')
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 100))
        
        # Build query
        query = db.session.query(Transaction).join(FinancialData).filter(
            FinancialData.user_id == user_id
        )
        
        if start_date:
            query = query.filter(Transaction.date >= datetime.strptime(start_date, '%Y-%m-%d').date())
        if end_date:
            query = query.filter(Transaction.date <= datetime.strptime(end_date, '%Y-%m-%d').date())
        if category:
            query = query.filter(Transaction.category == category)
        if transaction_type:
            query = query.filter(Transaction.transaction_type == transaction_type)
        
        # Execute query with pagination
        transactions = query.order_by(Transaction.date.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        transactions_data = []
        for transaction in transactions.items:
            transactions_data.append({
                'id': transaction.id,
                'date': transaction.date.isoformat(),
                'description': transaction.description,
                'amount': transaction.amount,
                'transaction_type': transaction.transaction_type,
                'category': transaction.category,
                'subcategory': transaction.subcategory,
                'is_recurring': transaction.is_recurring,
                'recurring_frequency': transaction.recurring_frequency,
                'tax_relevant': transaction.tax_relevant,
                'tax_section': transaction.tax_section
            })
        
        return jsonify({
            'transactions': transactions_data,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': transactions.total,
                'pages': transactions.pages,
                'has_next': transactions.has_next,
                'has_prev': transactions.has_prev
            }
        }), 200
    
    except Exception as e:
        return jsonify({'error': 'Failed to fetch transactions', 'details': str(e)}), 500

@data_bp.route('/transactions/<int:transaction_id>/categorize', methods=['PUT'])
def update_transaction_category(transaction_id):
    """Update transaction category manually"""
    try:
        transaction = Transaction.query.get(transaction_id)
        if not transaction:
            return jsonify({'error': 'Transaction not found'}), 404
        
        data = request.get_json()
        
        # Update transaction fields
        if 'category' in data:
            transaction.category = data['category']
        if 'subcategory' in data:
            transaction.subcategory = data['subcategory']
        if 'tax_relevant' in data:
            transaction.tax_relevant = data['tax_relevant']
        if 'tax_section' in data:
            transaction.tax_section = data['tax_section']
        
        db.session.commit()
        
        return jsonify({'message': 'Transaction updated successfully'}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update transaction', 'details': str(e)}), 500

@data_bp.route('/summary/<int:user_id>', methods=['GET'])
def get_data_summary(user_id):
    """Get summary of user's financial data"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get summary statistics
        total_files = FinancialData.query.filter_by(user_id=user_id).count()
        total_transactions = db.session.query(Transaction).join(FinancialData).filter(
            FinancialData.user_id == user_id
        ).count()
        
        # Get transaction summaries by type
        credit_sum = db.session.query(db.func.sum(Transaction.amount)).join(FinancialData).filter(
            FinancialData.user_id == user_id,
            Transaction.transaction_type == 'credit'
        ).scalar() or 0
        
        debit_sum = db.session.query(db.func.sum(Transaction.amount)).join(FinancialData).filter(
            FinancialData.user_id == user_id,
            Transaction.transaction_type == 'debit'
        ).scalar() or 0
        
        # Get category-wise breakdown
        category_summary = db.session.query(
            Transaction.category,
            db.func.sum(Transaction.amount),
            db.func.count(Transaction.id)
        ).join(FinancialData).filter(
            FinancialData.user_id == user_id
        ).group_by(Transaction.category).all()
        
        categories = []
        for category, amount, count in category_summary:
            categories.append({
                'category': category,
                'amount': float(amount) if amount else 0,
                'count': count
            })
        
        return jsonify({
            'summary': {
                'total_files': total_files,
                'total_transactions': total_transactions,
                'total_credits': float(credit_sum),
                'total_debits': float(debit_sum),
                'net_amount': float(credit_sum - debit_sum),
                'categories': categories
            }
        }), 200
    
    except Exception as e:
        return jsonify({'error': 'Failed to generate summary', 'details': str(e)}), 500