from flask import Blueprint, request, jsonify
from supabase_client import get_supabase_manager
from datetime import datetime
import re
import logging

logger = logging.getLogger(__name__)

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
    """Register a new user with Supabase Auth"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['email', 'password', 'name']
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
        
        # Register with Supabase Auth
        try:
            auth_service = get_supabase_auth()
            user_metadata = {
                'name': data['name'],
                'phone': data.get('phone'),
                'pan_number': data.get('pan_number')
            }
            
            auth_result = auth_service.register_user(
                email=data['email'],
                password=data['password'],
                user_data=user_metadata
            )
            
            if not auth_result['success']:
                return jsonify({
                    'error': auth_result.get('error', 'Authentication failed'),
                    'message': auth_result.get('message', 'Registration failed')
                }), 400
            
            # Create user in our database with Supabase user ID
            supabase_user = auth_result['user']
            user = User(
                id=supabase_user.id,  # Use Supabase user ID
                email=data['email'],
                name=data['name'],
                phone=data.get('phone'),
                pan_number=data.get('pan_number', '').upper() if data.get('pan_number') else None
            )
            
            db.session.add(user)
            db.session.commit()
            
            logger.info(f"User registered successfully with Supabase: {data['email']}")
            
            return jsonify({
                'message': 'User registered successfully',
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'name': user.name,
                    'phone': user.phone,
                    'pan_number': user.pan_number
                },
                'session': {
                    'access_token': auth_result['session'].access_token if auth_result.get('session') else None,
                    'refresh_token': auth_result['session'].refresh_token if auth_result.get('session') else None
                }
            }), 201
            
        except Exception as auth_error:
            logger.error(f"Supabase auth error: {str(auth_error)}")
            # Fallback to local registration without Supabase
            user = User(
                email=data['email'],
                name=data['name'],
                phone=data.get('phone'),
                pan_number=data.get('pan_number', '').upper() if data.get('pan_number') else None
            )
            
            db.session.add(user)
            db.session.commit()
            
            return jsonify({
                'message': 'User registered successfully (local only)',
                'warning': 'Supabase authentication not available',
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
        logger.error(f"Registration error: {str(e)}")
        return jsonify({'error': 'Registration failed', 'details': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """User login with Supabase Auth"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['email', 'password']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Try Supabase authentication first
        try:
            auth_service = get_supabase_auth()
            auth_result = auth_service.login_user(
                email=data['email'],
                password=data['password']
            )
            
            if auth_result['success']:
                # Get user from our database
                user = User.query.filter_by(email=data['email']).first()
                if not user:
                    return jsonify({'error': 'User not found in database'}), 404
                
                # Update last login time
                user.updated_at = datetime.utcnow()
                db.session.commit()
                
                logger.info(f"User logged in successfully: {data['email']}")
                
                return jsonify({
                    'message': 'Login successful',
                    'user': {
                        'id': user.id,
                        'email': user.email,
                        'name': user.name,
                        'phone': user.phone,
                        'pan_number': user.pan_number
                    },
                    'session': {
                        'access_token': auth_result.get('access_token'),
                        'refresh_token': auth_result.get('session', {}).get('refresh_token') if auth_result.get('session') else None
                    }
                }), 200
            else:
                return jsonify({
                    'error': auth_result.get('error', 'Invalid credentials'),
                    'message': auth_result.get('message', 'Login failed')
                }), 401
                
        except Exception as auth_error:
            logger.error(f"Supabase auth error during login: {str(auth_error)}")
            # Fallback to simple email-based login
            user = User.query.filter_by(email=data['email']).first()
            if not user:
                return jsonify({'error': 'User not found'}), 404
            
            # Update last login time
            user.updated_at = datetime.utcnow()
            db.session.commit()
            
            return jsonify({
                'message': 'Login successful (local only)',
                'warning': 'Supabase authentication not available',
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'name': user.name,
                    'phone': user.phone,
                    'pan_number': user.pan_number
                }
            }), 200
    
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
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

@auth_bp.route('/logout', methods=['POST'])
def logout():
    """User logout"""
    try:
        data = request.get_json()
        access_token = data.get('access_token')
        
        if access_token:
            try:
                auth_service = get_supabase_auth()
                auth_result = auth_service.logout_user(access_token)
                
                if auth_result['success']:
                    return jsonify({'message': 'Logout successful'}), 200
                else:
                    return jsonify({
                        'error': auth_result.get('error', 'Logout failed'),
                        'message': auth_result.get('message', 'Logout failed')
                    }), 400
            except Exception as auth_error:
                logger.error(f"Supabase logout error: {str(auth_error)}")
        
        # Always return success for logout (even if Supabase fails)
        return jsonify({'message': 'Logout successful'}), 200
    
    except Exception as e:
        logger.error(f"Logout error: {str(e)}")
        return jsonify({'error': 'Logout failed', 'details': str(e)}), 500

@auth_bp.route('/refresh', methods=['POST'])
def refresh_session():
    """Refresh user session"""
    try:
        data = request.get_json()
        refresh_token = data.get('refresh_token')
        
        if not refresh_token:
            return jsonify({'error': 'Refresh token is required'}), 400
        
        try:
            auth_service = get_supabase_auth()
            auth_result = auth_service.refresh_session(refresh_token)
            
            if auth_result['success']:
                return jsonify({
                    'message': 'Session refreshed successfully',
                    'session': {
                        'access_token': auth_result.get('access_token'),
                        'refresh_token': auth_result.get('session', {}).get('refresh_token') if auth_result.get('session') else None
                    }
                }), 200
            else:
                return jsonify({
                    'error': auth_result.get('error', 'Session refresh failed'),
                    'message': auth_result.get('message', 'Session refresh failed')
                }), 400
                
        except Exception as auth_error:
            logger.error(f"Session refresh error: {str(auth_error)}")
            return jsonify({'error': 'Session refresh failed', 'details': str(auth_error)}), 500
    
    except Exception as e:
        logger.error(f"Session refresh error: {str(e)}")
        return jsonify({'error': 'Session refresh failed', 'details': str(e)}), 500

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    """Send password reset email"""
    try:
        data = request.get_json()
        email = data.get('email')
        
        if not email:
            return jsonify({'error': 'Email is required'}), 400
        
        if not validate_email(email):
            return jsonify({'error': 'Invalid email format'}), 400
        
        try:
            auth_service = get_supabase_auth()
            auth_result = auth_service.reset_password(email)
            
            if auth_result['success']:
                return jsonify({
                    'message': 'Password reset email sent successfully'
                }), 200
            else:
                return jsonify({
                    'error': auth_result.get('error', 'Password reset failed'),
                    'message': auth_result.get('message', 'Password reset failed')
                }), 400
                
        except Exception as auth_error:
            logger.error(f"Password reset error: {str(auth_error)}")
            return jsonify({'error': 'Password reset failed', 'details': str(auth_error)}), 500
    
    except Exception as e:
        logger.error(f"Password reset error: {str(e)}")
        return jsonify({'error': 'Password reset failed', 'details': str(e)}), 500