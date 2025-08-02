# Team Hub

Team Hub is a comprehensive team management application that allows organizations to create announcements, manage team members, and provide role-based access control. The application features a React frontend with a FastAPI backend, using Supabase for data storage.

## Live Application

[https://team-hub-one.vercel.app/](https://team-hub-one.vercel.app/)

## Features

### Role-Based Access Control
- **User Role**: Can view announcements and create/edit/delete their own announcements
- **Admin Role**: Has all user privileges plus can manage other users' roles and access all announcements

### Core Functionality
- User authentication (sign up, sign in, sign out)
- Announcement creation, editing, and deletion
- Admin dashboard for user management
- Responsive design for all device sizes

## Technology Stack

### Frontend
- **React** - JavaScript library for building user interfaces
- **Tailwind CSS** - Utility-first CSS framework for styling
- **Vercel** - Deployment platform for frontend

### Backend
- **FastAPI** - Modern, fast (high-performance) web framework for building APIs with Python
- **Supabase** - Open source Firebase alternative for database and authentication
- **Render** - Cloud platform for hosting backend services

### Development Tools
- **Emergent AI** - AI-powered development assistance for code generation and debugging

## Deployment Architecture

### Frontend Deployment (Vercel)
1. Connect GitHub repository to Vercel
2. Set root directory to `/frontend`
3. Configure environment variables:
   - `REACT_APP_BACKEND_URL`: Your Render backend URL

### Backend Deployment (Render)
1. Connect GitHub repository to Render
2. Set root directory to `/`
3. Build command: `pip install -r backend/requirements.txt`
4. Start command: `uvicorn backend.server:app --host 0.0.0.0 --port $PORT`
5. Configure environment variables:
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_ANON_KEY`: Your Supabase anonymous key
   - `JWT_SECRET`: A secure random string for JWT token signing

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `GET /api/auth/user` - Get current user info

### Announcements
- `GET /api/announcements` - Get all announcements
- `POST /api/announcements` - Create new announcement
- `PUT /api/announcements/{id}` - Update announcement
- `DELETE /api/announcements/{id}` - Delete announcement

### Admin
- `GET /api/admin/users` - Get all users (admin only)
- `PUT /api/admin/users/{id}/role` - Update user role (admin only)

### Health Check
- `GET /api/health` - Check backend health status

## Development Setup

### Prerequisites
- Node.js and npm/yarn
- Python 3.8+
- Supabase account

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   yarn install
   ```
3. Create a `.env` file with:
   ```
   REACT_APP_BACKEND_URL=http://localhost:8001
   ```
4. Start the development server:
   ```bash
   yarn start
   ```

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file with:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   JWT_SECRET=your_jwt_secret_key
   ```
5. Start the development server:
   ```bash
   uvicorn server:app --host 0.0.0.0 --port 8001
   ```

## Database Schema

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

## Testing

### AI-Powered Testing
This project leverages **Blackbox** for comprehensive testing:

- **Blackbox**: Used for test scenario generation, identifying edge cases, and providing intelligent debugging assistance during testing

### Manual Testing
Run the test suite:
```bash
python backend_test.py
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## Support

For support, please open an issue on the GitHub repository or contact the development team.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
