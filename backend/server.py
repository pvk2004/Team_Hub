from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime
from supabase import create_client, Client
from jose import JWTError, jwt
import bcrypt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Supabase configuration
supabase_url = os.environ['SUPABASE_URL']
supabase_key = os.environ['SUPABASE_ANON_KEY']
jwt_secret = os.environ['JWT_SECRET']

supabase: Client = create_client(supabase_url, supabase_key)

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()

# Pydantic Models
class UserCreate(BaseModel):
    email: str
    password: str
    role: str = Field(default="user", pattern="^(admin|user)$")

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    role: str
    created_at: datetime

class AnnouncementCreate(BaseModel):
    title: str
    content: str

class AnnouncementUpdate(BaseModel):
    title: str
    content: str

class AnnouncementResponse(BaseModel):
    id: str
    title: str
    content: str
    author_id: str
    author_email: str
    created_at: datetime
    updated_at: datetime

class RoleUpdate(BaseModel):
    role: str = Field(pattern="^(admin|user)$")

# Helper functions
def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_jwt_token(user_data: dict) -> str:
    return jwt.encode(user_data, jwt_secret, algorithm="HS256")

def verify_jwt_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, jwt_secret, algorithms=["HS256"])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    user_data = verify_jwt_token(token)
    
    # Fetch user from database to get latest info
    result = supabase.table('users').select('*').eq('id', user_data['id']).execute()
    if not result.data:
        raise HTTPException(status_code=401, detail="User not found")
    
    return result.data[0]

async def get_admin_user(current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

# Initialize database tables
async def init_db():
    """Initialize database tables if they don't exist"""
    try:
        # Create users table
        supabase.table('users').select('id').limit(1).execute()
    except Exception as e:
        logger.info("Database tables might need to be created manually in Supabase dashboard")

# Authentication endpoints
@api_router.post("/auth/signup", response_model=dict)
async def signup(user: UserCreate):
    try:
        # Check if user already exists
        result = supabase.table('users').select('*').eq('email', user.email).execute()
        if result.data:
            raise HTTPException(status_code=400, detail="User already exists")
        
        # Hash password and create user
        hashed_password = hash_password(user.password)
        user_data = {
            'id': str(uuid.uuid4()),
            'email': user.email,
            'password_hash': hashed_password,
            'role': user.role,
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }
        
        result = supabase.table('users').insert(user_data).execute()
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to create user")
        
        # Create JWT token
        token_data = {
            'id': user_data['id'],
            'email': user_data['email'],
            'role': user_data['role']
        }
        token = create_jwt_token(token_data)
        
        return {
            "success": True,
            "user": {
                "id": user_data['id'],
                "email": user_data['email'],
                "role": user_data['role']
            },
            "token": token
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Signup error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.post("/auth/signin", response_model=dict)
async def signin(user: UserLogin):
    try:
        # Find user by email
        result = supabase.table('users').select('*').eq('email', user.email).execute()
        if not result.data:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        user_record = result.data[0]
        
        # Verify password
        if not verify_password(user.password, user_record['password_hash']):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        # Create JWT token
        token_data = {
            'id': user_record['id'],
            'email': user_record['email'],
            'role': user_record['role']
        }
        token = create_jwt_token(token_data)
        
        return {
            "success": True,
            "user": {
                "id": user_record['id'],
                "email": user_record['email'],
                "role": user_record['role']
            },
            "token": token
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Signin error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.get("/auth/user", response_model=dict)
async def get_user_info(current_user: dict = Depends(get_current_user)):
    return {
        "success": True,
        "user": {
            "id": current_user['id'],
            "email": current_user['email'],
            "role": current_user['role']
        }
    }

# Announcement endpoints
@api_router.get("/announcements", response_model=List[AnnouncementResponse])
async def get_announcements():
    try:
        result = supabase.table('announcements').select('*').order('created_at', desc=True).execute()
        return result.data
    except Exception as e:
        logger.error(f"Get announcements error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch announcements")

@api_router.post("/announcements", response_model=AnnouncementResponse)
async def create_announcement(announcement: AnnouncementCreate, current_user: dict = Depends(get_current_user)):
    try:
        announcement_data = {
            'id': str(uuid.uuid4()),
            'title': announcement.title,
            'content': announcement.content,
            'author_id': current_user['id'],
            'author_email': current_user['email'],
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }
        
        result = supabase.table('announcements').insert(announcement_data).execute()
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to create announcement")
        
        return result.data[0]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Create announcement error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.put("/announcements/{announcement_id}", response_model=AnnouncementResponse)
async def update_announcement(announcement_id: str, announcement: AnnouncementUpdate, current_user: dict = Depends(get_current_user)):
    try:
        # Get existing announcement
        result = supabase.table('announcements').select('*').eq('id', announcement_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Announcement not found")
        
        existing = result.data[0]
        
        # Check permissions (owner or admin)
        if existing['author_id'] != current_user['id'] and current_user['role'] != 'admin':
            raise HTTPException(status_code=403, detail="Permission denied")
        
        # Update announcement
        update_data = {
            'title': announcement.title,
            'content': announcement.content,
            'updated_at': datetime.utcnow().isoformat()
        }
        
        result = supabase.table('announcements').update(update_data).eq('id', announcement_id).execute()
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to update announcement")
        
        return result.data[0]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update announcement error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.delete("/announcements/{announcement_id}")
async def delete_announcement(announcement_id: str, current_user: dict = Depends(get_current_user)):
    try:
        # Get existing announcement
        result = supabase.table('announcements').select('*').eq('id', announcement_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Announcement not found")
        
        existing = result.data[0]
        
        # Check permissions (owner or admin)
        if existing['author_id'] != current_user['id'] and current_user['role'] != 'admin':
            raise HTTPException(status_code=403, detail="Permission denied")
        
        # Delete announcement
        result = supabase.table('announcements').delete().eq('id', announcement_id).execute()
        
        return {"success": True, "message": "Announcement deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete announcement error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Admin endpoints
@api_router.get("/admin/users", response_model=List[UserResponse])
async def get_all_users(current_user: dict = Depends(get_admin_user)):
    try:
        result = supabase.table('users').select('id, email, role, created_at').order('created_at', desc=True).execute()
        return result.data
    except Exception as e:
        logger.error(f"Get users error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch users")

@api_router.put("/admin/users/{user_id}/role", response_model=dict)
async def update_user_role(user_id: str, role_update: RoleUpdate, current_user: dict = Depends(get_admin_user)):
    try:
        # Check if user exists
        result = supabase.table('users').select('*').eq('id', user_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Update role
        update_data = {
            'role': role_update.role,
            'updated_at': datetime.utcnow().isoformat()
        }
        
        result = supabase.table('users').update(update_data).eq('id', user_id).execute()
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to update user role")
        
        return {
            "success": True,
            "message": "User role updated successfully",
            "user": {
                "id": result.data[0]['id'],
                "email": result.data[0]['email'],
                "role": result.data[0]['role']
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update user role error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Health check endpoint
@api_router.get("/")
async def root():
    return {"message": "Team Hub API is running with Supabase"}

@api_router.get("/health")
async def health_check():
    try:
        # Test database connection
        supabase.table('users').select('id').limit(1).execute()
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": "disconnected", "error": str(e)}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_origin_regex="https://.*\\.vercel\\.app",
    expose_headers=["Access-Control-Allow-Origin"]
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    logger.info("Team Hub API starting up...")
    await init_db()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)