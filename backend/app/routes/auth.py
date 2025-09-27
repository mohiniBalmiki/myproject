from flask import Blueprint, request, jsonify
from extensions import db
from app.models import User
from datetime import datetime
import re

auth_bp = Blueprint('auth', __name__)

def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_pan(pan):
    """Validate PAN number format"""
    if not pan:
        return True  # PAN is optional
    pattern = r'^[A-Z]{5}[0-9]{4}[A-Z]{1}$'
    return re.match(pattern, pan.upper()) is not None

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['email', 'name']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Validate email format
        if not validate_email(data['email']):
            return jsonify({'error': 'Invalid email format'}), 400
        
        # Check if user already exists
        existing_user = User.query.filter_by(email=data['email']).first()
        if existing_user:
            return jsonify({'error': 'User with this email already exists'}), 409
        
        # Validate PAN if provided
        if data.get('pan_number') and not validate_pan(data['pan_number']):
            return jsonify({'error': 'Invalid PAN format'}), 400
        
        # Create new user
        user = User(
            email=data['email'],
            name=data['name'],
            phone=data.get('phone'),
            pan_number=data.get('pan_number', '').upper() if data.get('pan_number') else None
        )
        
        db.session.add(user)
        db.session.commit()
        
        return jsonify({
            'message': 'User registered successfully',
            'user': {
                'id': user.id,
                'email': user.email,
                'name': user.name,
                'phone': user.phone,
                'pan_number': user.pan_number
            }
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Registration failed', 'details': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """User login"""
    try:
        data = request.get_json()
        
        if not data.get('email'):
            return jsonify({'error': 'Email is required'}), 400
        
        user = User.query.filter_by(email=data['email']).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Update last login time
        user.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Login successful',
            'user': {
                'id': user.id,
                'email': user.email,
                'name': user.name,
                'phone': user.phone,
                'pan_number': user.pan_number
            }
        }), 200
    
    except Exception as e:
        return jsonify({'error': 'Login failed', 'details': str(e)}), 500

@auth_bp.route('/profile/<int:user_id>', methods=['GET'])
def get_profile(user_id):
    """Get user profile"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'user': {
                'id': user.id,
                'email': user.email,
                'name': user.name,
                'phone': user.phone,
                'pan_number': user.pan_number,
                'created_at': user.created_at.isoformat(),
                'updated_at': user.updated_at.isoformat()
            }
        }), 200
    
    except Exception as e:
        return jsonify({'error': 'Failed to fetch profile', 'details': str(e)}), 500

@auth_bp.route('/profile/<int:user_id>', methods=['PUT'])
def update_profile(user_id):
    """Update user profile"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        # Update allowed fields
        if 'name' in data:
            user.name = data['name']
        if 'phone' in data:
            user.phone = data['phone']
        if 'pan_number' in data:
            if data['pan_number'] and not validate_pan(data['pan_number']):
                return jsonify({'error': 'Invalid PAN format'}), 400
            user.pan_number = data['pan_number'].upper() if data['pan_number'] else None
        
        user.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Profile updated successfully',
            'user': {
                'id': user.id,
                'email': user.email,
                'name': user.name,
                'phone': user.phone,
                'pan_number': user.pan_number
            }
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update profile', 'details': str(e)}), 500