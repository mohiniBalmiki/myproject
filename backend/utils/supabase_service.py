from supabase import create_client, Client
import os
from typing import Optional

class SupabaseService:
    """Supabase integration service for TaxWise"""
    
    def __init__(self):
        self.url = os.environ.get('SUPABASE_URL')
        self.key = os.environ.get('SUPABASE_KEY')
        self.service_key = os.environ.get('SUPABASE_SERVICE_KEY')
        
        if not self.url or not self.key:
            raise ValueError("Supabase URL and Key must be provided")
        
        self.client: Client = create_client(self.url, self.key)
        self.admin_client: Optional[Client] = None
        
        if self.service_key:
            self.admin_client = create_client(self.url, self.service_key)
    
    def get_client(self, admin=False):
        """Get Supabase client"""
        if admin and self.admin_client:
            return self.admin_client
        return self.client
    
    def authenticate_user(self, email: str, password: str):
        """Authenticate user with Supabase Auth"""
        try:
            response = self.client.auth.sign_in_with_password({
                "email": email,
                "password": password
            })
            return response
        except Exception as e:
            raise Exception(f"Authentication failed: {str(e)}")
    
    def register_user(self, email: str, password: str, user_metadata: dict = None):
        """Register new user with Supabase Auth"""
        try:
            response = self.client.auth.sign_up({
                "email": email,
                "password": password,
                "options": {
                    "data": user_metadata or {}
                }
            })
            return response
        except Exception as e:
            raise Exception(f"Registration failed: {str(e)}")
    
    def get_user(self, access_token: str):
        """Get user details from access token"""
        try:
            response = self.client.auth.get_user(access_token)
            return response
        except Exception as e:
            raise Exception(f"Failed to get user: {str(e)}")
    
    def upload_file(self, bucket: str, file_path: str, file_data, content_type: str = None):
        """Upload file to Supabase Storage"""
        try:
            response = self.client.storage.from_(bucket).upload(
                file_path, 
                file_data,
                file_options={
                    "content-type": content_type
                } if content_type else None
            )
            return response
        except Exception as e:
            raise Exception(f"File upload failed: {str(e)}")
    
    def get_file_url(self, bucket: str, file_path: str):
        """Get public URL for a file"""
        try:
            response = self.client.storage.from_(bucket).get_public_url(file_path)
            return response
        except Exception as e:
            raise Exception(f"Failed to get file URL: {str(e)}")
    
    def delete_file(self, bucket: str, file_path: str):
        """Delete file from Supabase Storage"""
        try:
            response = self.client.storage.from_(bucket).remove([file_path])
            return response
        except Exception as e:
            raise Exception(f"File deletion failed: {str(e)}")
    
    def query_table(self, table: str, select: str = "*", filters: dict = None):
        """Query data from Supabase table"""
        try:
            query = self.client.table(table).select(select)
            
            if filters:
                for key, value in filters.items():
                    if isinstance(value, dict):
                        # Handle complex filters like {"gte": 100}
                        for op, val in value.items():
                            query = getattr(query, op)(key, val)
                    else:
                        query = query.eq(key, value)
            
            response = query.execute()
            return response
        except Exception as e:
            raise Exception(f"Query failed: {str(e)}")
    
    def insert_data(self, table: str, data):
        """Insert data into Supabase table"""
        try:
            response = self.client.table(table).insert(data).execute()
            return response
        except Exception as e:
            raise Exception(f"Insert failed: {str(e)}")
    
    def update_data(self, table: str, data, filters: dict):
        """Update data in Supabase table"""
        try:
            query = self.client.table(table)
            
            for key, value in filters.items():
                query = query.eq(key, value)
            
            response = query.update(data).execute()
            return response
        except Exception as e:
            raise Exception(f"Update failed: {str(e)}")
    
    def delete_data(self, table: str, filters: dict):
        """Delete data from Supabase table"""
        try:
            query = self.client.table(table)
            
            for key, value in filters.items():
                query = query.eq(key, value)
            
            response = query.delete().execute()
            return response
        except Exception as e:
            raise Exception(f"Delete failed: {str(e)}")
    
    def create_bucket(self, bucket_name: str, public: bool = False):
        """Create a new storage bucket"""
        try:
            response = self.client.storage.create_bucket(bucket_name, {
                "public": public
            })
            return response
        except Exception as e:
            raise Exception(f"Bucket creation failed: {str(e)}")
    
    def realtime_subscribe(self, table: str, callback, event: str = "*"):
        """Subscribe to real-time changes"""
        try:
            subscription = self.client.table(table).on(event, callback).subscribe()
            return subscription
        except Exception as e:
            raise Exception(f"Realtime subscription failed: {str(e)}")

# Global instance
supabase_service = None

def get_supabase_service():
    """Get or create Supabase service instance"""
    global supabase_service
    if supabase_service is None:
        supabase_service = SupabaseService()
    return supabase_service