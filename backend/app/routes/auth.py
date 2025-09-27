"""
Authentication routes for TaxWise backend using Supabase
"""

from flask import Blueprint, request, jsonify
from supabase_client import get_supabase_manager
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
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({
                'success': False,
                'error': 'Email and password are required'
            }), 400
        
        email = data['email'].lower().strip()
        password = data['password']
        name = data.get('name', '').strip()
        
        # Validate email format
        if not validate_email(email):
            return jsonify({
                'success': False,
                'error': 'Invalid email format'
            }), 400
        
        # Validate password strength
        if len(password) < 6:
            return jsonify({
                'success': False,
                'error': 'Password must be at least 6 characters long'
            }), 400
        
        # Validate PAN if provided
        pan = data.get('pan', '').strip().upper()
        if pan and not validate_pan(pan):
            return jsonify({
                'success': False,
                'error': 'Invalid PAN format. Use format: ABCDE1234F'
            }), 400
        
        try:
            # Get Supabase manager
            supabase_manager = get_supabase_manager()
            
            # Register user with Supabase Auth with email confirmation
            response = supabase_manager.client.auth.sign_up({
                "email": email,
                "password": password,
                "options": {
                    "data": {
                        "name": name,
                        "phone": data.get('phone', ''),
                        "pan": pan
                    },
                    "email_redirect_to": "http://localhost:3000/auth/callback"
                }
            })
            
            if response.user:
                # Note: Don't create user profile yet - wait for email confirmation
                # Profile will be created after email verification
                
                return jsonify({
                    'success': True,
                    'message': 'Registration successful! Please check your email and click the verification link to activate your account.',
                    'user': {
                        'id': response.user.id,
                        'email': response.user.email,
                        'name': name,
                        'email_confirmed': response.user.email_confirmed_at is not None
                    },
                    'requires_verification': True
                }), 201
            else:
                return jsonify({
                    'success': False,
                    'error': 'Registration failed'
                }), 400
                
        except Exception as auth_error:
            logger.error(f"Supabase registration error: {auth_error}")
            return jsonify({
                'success': False,
                'error': str(auth_error)
            }), 400
            
    except Exception as e:
        logger.error(f"Registration error: {e}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user with Supabase Auth"""
    try:
        data = request.get_json()
        
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({
                'success': False,
                'error': 'Email and password are required'
            }), 400
        
        email = data['email'].lower().strip()
        password = data['password']
        
        try:
            # Get Supabase manager
            supabase_manager = get_supabase_manager()
            
            # Sign in with Supabase Auth
            response = supabase_manager.client.auth.sign_in_with_password({
                "email": email,
                "password": password
            })
            
            if response.user and response.session:
                # Check if email is confirmed
                if not response.user.email_confirmed_at:
                    return jsonify({
                        'success': False,
                        'error': 'Please verify your email before logging in. Check your inbox for the verification link.',
                        'requires_verification': True,
                        'email': response.user.email
                    }), 401
                
                # Get user profile
                profile_result = supabase_manager.get_user_profile(response.user.id)
                
                return jsonify({
                    'success': True,
                    'message': 'Login successful',
                    'user': {
                        'id': response.user.id,
                        'email': response.user.email,
                        'name': profile_result.get('profile', {}).get('name', ''),
                        'email_confirmed': True,
                        'profile': profile_result.get('profile', {})
                    },
                    'session': {
                        'access_token': response.session.access_token,
                        'refresh_token': response.session.refresh_token,
                        'expires_at': response.session.expires_at
                    }
                }), 200
            else:
                return jsonify({
                    'success': False,
                    'error': 'Invalid email or password'
                }), 401
                
        except Exception as auth_error:
            logger.error(f"Supabase login error: {auth_error}")
            return jsonify({
                'success': False,
                'error': 'Invalid email or password'
            }), 401
            
    except Exception as e:
        logger.error(f"Login error: {e}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500

@auth_bp.route('/logout', methods=['POST'])
def logout():
    """Logout user"""
    try:
        # Get authorization header
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({
                'success': False,
                'error': 'No valid authorization token provided'
            }), 401
        
        # Get Supabase manager
        supabase_manager = get_supabase_manager()
        
        # Sign out from Supabase
        response = supabase_manager.client.auth.sign_out()
        
        return jsonify({
            'success': True,
            'message': 'Logout successful'
        }), 200
        
    except Exception as e:
        logger.error(f"Logout error: {e}")
        return jsonify({
            'success': True,  # Always return success for logout
            'message': 'Logout completed'
        }), 200

@auth_bp.route('/profile', methods=['GET'])
def get_profile():
    """Get user profile"""
    try:
        # Get authorization header
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({
                'success': False,
                'error': 'No valid authorization token provided'
            }), 401
        
        token = auth_header.split(' ')[1]
        
        # Get Supabase manager
        supabase_manager = get_supabase_manager()
        
        # Get user from token
        user_response = supabase_manager.client.auth.get_user(token)
        
        if user_response.user:
            # Get user profile
            profile_result = supabase_manager.get_user_profile(user_response.user.id)
            
            return jsonify({
                'success': True,
                'profile': profile_result.get('profile', {}),
                'user': {
                    'id': user_response.user.id,
                    'email': user_response.user.email
                }
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': 'Invalid or expired token'
            }), 401
            
    except Exception as e:
        logger.error(f"Get profile error: {e}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500

@auth_bp.route('/profile', methods=['PUT'])
def update_profile():
    """Update user profile"""
    try:
        # Get authorization header
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({
                'success': False,
                'error': 'No valid authorization token provided'
            }), 401
        
        token = auth_header.split(' ')[1]
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        # Get Supabase manager
        supabase_manager = get_supabase_manager()
        
        # Get user from token
        user_response = supabase_manager.client.auth.get_user(token)
        
        if user_response.user:
            # Validate PAN if provided
            pan = data.get('pan', '').strip().upper()
            if pan and not validate_pan(pan):
                return jsonify({
                    'success': False,
                    'error': 'Invalid PAN format. Use format: ABCDE1234F'
                }), 400
            
            # Update profile
            profile_data = {
                'name': data.get('name', '').strip(),
                'phone': data.get('phone', '').strip(),
                'pan': pan
            }
            
            # Remove empty fields
            profile_data = {k: v for k, v in profile_data.items() if v}
            
            result = supabase_manager.update_user_profile(user_response.user.id, profile_data)
            
            if result['success']:
                return jsonify({
                    'success': True,
                    'message': 'Profile updated successfully',
                    'profile': result['profile']
                }), 200
            else:
                return jsonify({
                    'success': False,
                    'error': result.get('error', 'Profile update failed')
                }), 400
        else:
            return jsonify({
                'success': False,
                'error': 'Invalid or expired token'
            }), 401
            
    except Exception as e:
        logger.error(f"Update profile error: {e}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500

@auth_bp.route('/confirm-email', methods=['POST'])
def confirm_email():
    """Confirm email verification"""
    try:
        data = request.get_json()
        
        if not data or not data.get('token_hash') or not data.get('type'):
            return jsonify({
                'success': False,
                'error': 'Token hash and type are required'
            }), 400
        
        try:
            # Get Supabase manager
            supabase_manager = get_supabase_manager()
            
            # Verify email with token
            response = supabase_manager.client.auth.verify_otp({
                'token_hash': data['token_hash'],
                'type': data['type']
            })
            
            if response.user and response.session:
                # Now create user profile after email confirmation
                user_metadata = response.user.user_metadata or {}
                profile_data = {
                    'email': response.user.email,
                    'name': user_metadata.get('name', ''),
                    'phone': user_metadata.get('phone', ''),
                    'pan': user_metadata.get('pan', '')
                }
                
                profile_result = supabase_manager.create_user_profile(response.user.id, profile_data)
                
                return jsonify({
                    'success': True,
                    'message': 'Email verified successfully! Your account is now active.',
                    'user': {
                        'id': response.user.id,
                        'email': response.user.email,
                        'email_confirmed': True,
                        'profile': profile_result.get('profile', {})
                    },
                    'session': {
                        'access_token': response.session.access_token,
                        'refresh_token': response.session.refresh_token,
                        'expires_at': response.session.expires_at
                    }
                }), 200
            else:
                return jsonify({
                    'success': False,
                    'error': 'Invalid or expired verification token'
                }), 400
                
        except Exception as auth_error:
            logger.error(f"Email confirmation error: {auth_error}")
            return jsonify({
                'success': False,
                'error': 'Email verification failed'
            }), 400
            
    except Exception as e:
        logger.error(f"Confirm email error: {e}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500

@auth_bp.route('/resend-verification', methods=['POST'])
def resend_verification():
    """Resend email verification"""
    try:
        data = request.get_json()
        
        if not data or not data.get('email'):
            return jsonify({
                'success': False,
                'error': 'Email is required'
            }), 400
        
        email = data['email'].lower().strip()
        
        try:
            # Get Supabase manager
            supabase_manager = get_supabase_manager()
            
            # Resend verification email
            response = supabase_manager.client.auth.resend({
                'type': 'signup',
                'email': email,
                'options': {
                    'email_redirect_to': 'http://localhost:3000/auth/callback'
                }
            })
            
            return jsonify({
                'success': True,
                'message': 'Verification email sent! Please check your inbox and click the verification link.'
            }), 200
                
        except Exception as auth_error:
            logger.error(f"Resend verification error: {auth_error}")
            return jsonify({
                'success': False,
                'error': 'Failed to resend verification email'
            }), 400
            
    except Exception as e:
        logger.error(f"Resend verification error: {e}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500

@auth_bp.route('/verify', methods=['POST'])
def verify_token():
    """Verify if token is valid"""
    try:
        # Get authorization header
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({
                'success': False,
                'error': 'No valid authorization token provided'
            }), 401
        
        token = auth_header.split(' ')[1]
        
        # Get Supabase manager
        supabase_manager = get_supabase_manager()
        
        # Verify token
        user_response = supabase_manager.client.auth.get_user(token)
        
        if user_response.user:
            return jsonify({
                'success': True,
                'valid': True,
                'user': {
                    'id': user_response.user.id,
                    'email': user_response.user.email
                }
            }), 200
        else:
            return jsonify({
                'success': False,
                'valid': False,
                'error': 'Invalid or expired token'
            }), 401
            
    except Exception as e:
        logger.error(f"Token verification error: {e}")
        return jsonify({
            'success': False,
            'valid': False,
            'error': 'Invalid token'
        }), 401