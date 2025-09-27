"""
Supabase Client for TaxWise Backend
Handles all database operations through Supabase REST API
"""

import os
from supabase import create_client, Client
from typing import Dict, List, Any, Optional
import json

class SupabaseManager:
    def __init__(self):
        self.url = os.environ.get('SUPABASE_URL')
        self.key = os.environ.get('SUPABASE_KEY')
        self.service_key = os.environ.get('SUPABASE_SERVICE_KEY')
        
        if not self.url or not self.key:
            raise ValueError("Supabase URL and Key must be provided")
        
        # Create client with anon key for regular operations
        self.client: Client = create_client(self.url, self.key)
        
        # Create service client for admin operations (if service key is available)
        if self.service_key:
            self.service_client: Client = create_client(self.url, self.service_key)
        else:
            self.service_client = self.client

    def test_connection(self) -> bool:
        """Test if Supabase connection is working"""
        try:
            # Try to query any existing table or just test the connection
            # First try to access a simple endpoint
            response = self.client.rpc('ping').execute()
            return True
        except Exception as e:
            try:
                # Fallback: try to query user_profiles table
                response = self.client.table('user_profiles').select('id').limit(1).execute()
                return True
            except Exception as e2:
                print(f"Supabase connection test failed: {e2}")
                return False

    # User Management
    def create_user_profile(self, user_id: str, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a user profile in Supabase"""
        try:
            profile_data['id'] = user_id
            profile_data['created_at'] = 'now()'
            
            response = self.service_client.table('user_profiles').insert(profile_data).execute()
            return {'success': True, 'profile': response.data[0]}
        except Exception as e:
            return {'success': False, 'error': str(e)}

    def get_user_profile(self, user_id: str) -> Dict[str, Any]:
        """Get user profile from Supabase"""
        try:
            response = self.client.table('user_profiles').select('*').eq('id', user_id).execute()
            if response.data:
                return {'success': True, 'profile': response.data[0]}
            else:
                return {'success': False, 'error': 'Profile not found'}
        except Exception as e:
            return {'success': False, 'error': str(e)}

    def update_user_profile(self, user_id: str, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update user profile in Supabase"""
        try:
            profile_data['updated_at'] = 'now()'
            response = self.client.table('user_profiles').update(profile_data).eq('id', user_id).execute()
            return {'success': True, 'profile': response.data[0]}
        except Exception as e:
            return {'success': False, 'error': str(e)}

    # File Management
    def upload_file(self, user_id: str, file_name: str, file_data: bytes, file_type: str) -> Dict[str, Any]:
        """Upload file to Supabase storage"""
        try:
            # Upload to storage
            storage_path = f"{user_id}/{file_name}"
            response = self.client.storage.from_('user-files').upload(storage_path, file_data)
            
            if response:
                # Save file metadata to database
                file_metadata = {
                    'user_id': user_id,
                    'file_name': file_name,
                    'file_path': storage_path,
                    'file_type': file_type,
                    'file_size': len(file_data),
                    'created_at': 'now()'
                }
                
                db_response = self.client.table('user_files').insert(file_metadata).execute()
                return {'success': True, 'file': db_response.data[0]}
            else:
                return {'success': False, 'error': 'File upload failed'}
        except Exception as e:
            return {'success': False, 'error': str(e)}

    def get_user_files(self, user_id: str) -> Dict[str, Any]:
        """Get all files for a user"""
        try:
            response = self.client.table('user_files').select('*').eq('user_id', user_id).execute()
            return {'success': True, 'files': response.data}
        except Exception as e:
            return {'success': False, 'error': str(e)}

    # Account Management
    def connect_account(self, user_id: str, account_data: Dict[str, Any]) -> Dict[str, Any]:
        """Connect a bank account"""
        try:
            account_data['user_id'] = user_id
            account_data['created_at'] = 'now()'
            account_data['status'] = 'connected'
            
            response = self.client.table('connected_accounts').insert(account_data).execute()
            return {'success': True, 'account': response.data[0]}
        except Exception as e:
            return {'success': False, 'error': str(e)}

    def get_connected_accounts(self, user_id: str) -> Dict[str, Any]:
        """Get all connected accounts for a user"""
        try:
            response = self.client.table('connected_accounts').select('*').eq('user_id', user_id).execute()
            return {'success': True, 'accounts': response.data}
        except Exception as e:
            return {'success': False, 'error': str(e)}

    def disconnect_account(self, user_id: str, account_id: str) -> Dict[str, Any]:
        """Disconnect a bank account"""
        try:
            response = self.client.table('connected_accounts').delete().eq('user_id', user_id).eq('id', account_id).execute()
            return {'success': True}
        except Exception as e:
            return {'success': False, 'error': str(e)}

    # Reports Management
    def save_report(self, user_id: str, report_data: Dict[str, Any]) -> Dict[str, Any]:
        """Save a generated report"""
        try:
            report_data['user_id'] = user_id
            report_data['created_at'] = 'now()'
            
            response = self.client.table('user_reports').insert(report_data).execute()
            return {'success': True, 'report': response.data[0]}
        except Exception as e:
            return {'success': False, 'error': str(e)}

    def get_user_reports(self, user_id: str) -> Dict[str, Any]:
        """Get all reports for a user"""
        try:
            response = self.client.table('user_reports').select('*').eq('user_id', user_id).execute()
            return {'success': True, 'reports': response.data}
        except Exception as e:
            return {'success': False, 'error': str(e)}

    # Notification Settings
    def update_notification_settings(self, user_id: str, settings: Dict[str, Any]) -> Dict[str, Any]:
        """Update user notification settings"""
        try:
            settings['user_id'] = user_id
            settings['updated_at'] = 'now()'
            
            # Try to update first, if not exists then insert
            response = self.client.table('notification_settings').upsert(settings).execute()
            return {'success': True, 'settings': response.data[0]}
        except Exception as e:
            return {'success': False, 'error': str(e)}

    def get_notification_settings(self, user_id: str) -> Dict[str, Any]:
        """Get user notification settings"""
        try:
            response = self.client.table('notification_settings').select('*').eq('user_id', user_id).execute()
            if response.data:
                return {'success': True, 'settings': response.data[0]}
            else:
                # Return default settings
                default_settings = {
                    'taxReminders': True,
                    'cibilAlerts': True,
                    'spendingInsights': False,
                    'investmentTips': True
                }
                return {'success': True, 'settings': default_settings}
        except Exception as e:
            return {'success': False, 'error': str(e)}

    # Initialize database tables
    def init_database_schema(self) -> Dict[str, Any]:
        """Initialize the database schema in Supabase"""
        try:
            # This would typically be done through Supabase Dashboard
            # But we can verify tables exist
            tables_to_check = [
                'user_profiles',
                'user_files', 
                'connected_accounts',
                'user_reports',
                'notification_settings'
            ]
            
            existing_tables = []
            for table in tables_to_check:
                try:
                    response = self.client.table(table).select('*').limit(1).execute()
                    existing_tables.append(table)
                except:
                    pass
            
            return {
                'success': True, 
                'message': f'Database schema check completed',
                'existing_tables': existing_tables,
                'missing_tables': list(set(tables_to_check) - set(existing_tables))
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}

# Global instance
supabase_manager = None

def get_supabase_manager() -> SupabaseManager:
    """Get global Supabase manager instance"""
    global supabase_manager
    if supabase_manager is None:
        supabase_manager = SupabaseManager()
    return supabase_manager