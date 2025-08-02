# Team Hub - API Contracts & Integration Plan

## Database Schema (Supabase Tables)

### Users Table
```sql
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT CHECK (role IN ('admin', 'user')) DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Announcements Table
```sql
CREATE TABLE announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  author_email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## API Endpoints

### Authentication Endpoints
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout
- `GET /api/auth/user` - Get current user info

### Announcements Endpoints
- `GET /api/announcements` - Get all announcements
- `POST /api/announcements` - Create new announcement (authenticated)
- `PUT /api/announcements/{id}` - Update announcement (owner or admin only)
- `DELETE /api/announcements/{id}` - Delete announcement (owner or admin only)

### Admin Endpoints
- `GET /api/admin/users` - Get all users (admin only)
- `PUT /api/admin/users/{id}/role` - Update user role (admin only)

## Mock Data Replacement Plan

### Frontend Files to Update:
1. **Remove mock.js dependency** from all components
2. **Update Dashboard.jsx** to use real API calls
3. **Update AdminPage.jsx** to use real user management API
4. **Update AuthPage.jsx** to use real authentication
5. **Update App.js** to handle real authentication state
6. **Create API service files** for clean separation

### Mock Data Mapping:
- `mockAuth.signIn/signUp` → Real Supabase auth API calls
- `mockAnnouncementAPI` → Real FastAPI announcement endpoints
- `mockUserAPI` → Real FastAPI admin endpoints
- `localStorage` persistence → Database persistence

## Authentication Strategy:
- Use Supabase built-in authentication for secure user management
- JWT tokens for session management
- Role-based access control at API level
- Frontend route protection using authentication state

## Implementation Order:
1. Setup Supabase client and database schema
2. Create FastAPI backend with authentication middleware
3. Implement all API endpoints with proper error handling
4. Update frontend to replace mock data with API calls
5. Test full authentication and CRUD workflows