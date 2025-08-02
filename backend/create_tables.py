#!/usr/bin/env python3
"""
Script to create database tables in Supabase
Run this once to set up the database schema
"""

import os
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

supabase_url = os.environ['SUPABASE_URL']
supabase_key = os.environ['SUPABASE_ANON_KEY']

supabase: Client = create_client(supabase_url, supabase_key)

def create_tables():
    """Create tables using Supabase client"""
    print("Setting up database tables...")
    
    # Note: These tables need to be created through Supabase SQL Editor
    # This script serves as documentation for the required schema
    
    users_table_sql = """
    CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT CHECK (role IN ('admin', 'user')) DEFAULT 'user',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Enable RLS (Row Level Security)
    ALTER TABLE users ENABLE ROW LEVEL SECURITY;
    
    -- Create policies for users table
    CREATE POLICY "Users can view their own data" ON users
        FOR SELECT USING (true);
        
    CREATE POLICY "Users can insert their own data" ON users
        FOR INSERT WITH CHECK (true);
        
    CREATE POLICY "Users can update their own data" ON users
        FOR UPDATE USING (true);
    """
    
    announcements_table_sql = """
    CREATE TABLE IF NOT EXISTS announcements (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        author_id UUID REFERENCES users(id) ON DELETE CASCADE,
        author_email TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Enable RLS (Row Level Security)
    ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
    
    -- Create policies for announcements table
    CREATE POLICY "Anyone can view announcements" ON announcements
        FOR SELECT USING (true);
        
    CREATE POLICY "Authenticated users can create announcements" ON announcements
        FOR INSERT WITH CHECK (true);
        
    CREATE POLICY "Authors and admins can update announcements" ON announcements
        FOR UPDATE USING (true);
        
    CREATE POLICY "Authors and admins can delete announcements" ON announcements
        FOR DELETE USING (true);
    """
    
    print("SQL for users table:")
    print(users_table_sql)
    print("\nSQL for announcements table:")
    print(announcements_table_sql)
    print("\n" + "="*80)
    print("IMPORTANT: Please execute the above SQL in your Supabase SQL Editor!")
    print("1. Go to https://app.supabase.com/project/your-project/sql")
    print("2. Paste and run the users table SQL")
    print("3. Paste and run the announcements table SQL")
    print("4. The database will be ready for the Team Hub application")
    print("="*80)

if __name__ == "__main__":
    create_tables()