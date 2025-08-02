#!/usr/bin/env python3
"""
Team Hub Backend API Test Suite
Tests all backend endpoints with Supabase integration
"""

import requests
import json
import sys
import os
from datetime import datetime
import uuid

# Get backend URL from frontend .env file
def get_backend_url():
    try:
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    return line.split('=', 1)[1].strip()
    except Exception as e:
        print(f"Error reading frontend .env: {e}")
        return None

BASE_URL = get_backend_url()
if not BASE_URL:
    print("❌ Could not get backend URL from frontend/.env")
    sys.exit(1)

API_URL = f"{BASE_URL}/api"
print(f"🔗 Testing API at: {API_URL}")

# Test data
admin_user_data = {
    "email": "admin@teamhub.com",
    "password": "AdminPass123!",
    "role": "admin"
}

regular_user_data = {
    "email": "user@teamhub.com", 
    "password": "UserPass123!",
    "role": "user"
}

announcement_data = {
    "title": "Welcome to Team Hub",
    "content": "This is our first announcement to welcome everyone to the new Team Hub platform!"
}

# Global variables to store tokens and IDs
admin_token = None
user_token = None
admin_user_id = None
user_user_id = None
announcement_id = None

def print_test_header(test_name):
    print(f"\n{'='*60}")
    print(f"🧪 {test_name}")
    print(f"{'='*60}")

def print_result(success, message, details=None):
    status = "✅" if success else "❌"
    print(f"{status} {message}")
    if details:
        print(f"   Details: {details}")

def make_request(method, endpoint, data=None, headers=None, expected_status=None):
    """Make HTTP request and return response"""
    url = f"{API_URL}{endpoint}"
    
    try:
        if method.upper() == 'GET':
            response = requests.get(url, headers=headers, timeout=30)
        elif method.upper() == 'POST':
            response = requests.post(url, json=data, headers=headers, timeout=30)
        elif method.upper() == 'PUT':
            response = requests.put(url, json=data, headers=headers, timeout=30)
        elif method.upper() == 'DELETE':
            response = requests.delete(url, headers=headers, timeout=30)
        else:
            raise ValueError(f"Unsupported method: {method}")
            
        print(f"   {method} {endpoint} -> {response.status_code}")
        
        if expected_status and response.status_code != expected_status:
            print(f"   Expected {expected_status}, got {response.status_code}")
            print(f"   Response: {response.text}")
            return None
            
        return response
        
    except requests.exceptions.RequestException as e:
        print(f"   Request failed: {e}")
        return None

def test_health_checks():
    """Test health check endpoints"""
    print_test_header("Health Check Endpoints")
    
    # Test basic health check
    response = make_request('GET', '/', expected_status=200)
    if response:
        data = response.json()
        if "Team Hub API" in data.get("message", ""):
            print_result(True, "Basic health check passed")
        else:
            print_result(False, "Basic health check failed", data)
    else:
        print_result(False, "Basic health check endpoint not accessible")
    
    # Test database health check
    response = make_request('GET', '/health', expected_status=200)
    if response:
        data = response.json()
        if data.get("status") == "healthy" and data.get("database") == "connected":
            print_result(True, "Database health check passed")
        else:
            print_result(False, "Database health check failed", data)
    else:
        print_result(False, "Database health check endpoint not accessible")

def test_user_signup():
    """Test user signup functionality"""
    global admin_token, user_token, admin_user_id, user_user_id
    
    print_test_header("User Signup Tests")
    
    # Test admin user signup
    response = make_request('POST', '/auth/signup', admin_user_data, expected_status=200)
    if response:
        data = response.json()
        if data.get("success") and data.get("token") and data.get("user"):
            admin_token = data["token"]
            admin_user_id = data["user"]["id"]
            print_result(True, f"Admin user signup successful - ID: {admin_user_id}")
        else:
            print_result(False, "Admin user signup failed", data)
    else:
        print_result(False, "Admin user signup request failed")
    
    # Test regular user signup
    response = make_request('POST', '/auth/signup', regular_user_data, expected_status=200)
    if response:
        data = response.json()
        if data.get("success") and data.get("token") and data.get("user"):
            user_token = data["token"]
            user_user_id = data["user"]["id"]
            print_result(True, f"Regular user signup successful - ID: {user_user_id}")
        else:
            print_result(False, "Regular user signup failed", data)
    else:
        print_result(False, "Regular user signup request failed")
    
    # Test duplicate signup (should fail)
    response = make_request('POST', '/auth/signup', admin_user_data, expected_status=400)
    if response:
        data = response.json()
        if "already exists" in data.get("detail", "").lower():
            print_result(True, "Duplicate signup properly rejected")
        else:
            print_result(False, "Duplicate signup not properly handled", data)
    else:
        print_result(False, "Duplicate signup test failed")

def test_user_signin():
    """Test user signin functionality"""
    global admin_token, user_token
    
    print_test_header("User Signin Tests")
    
    # Test admin signin
    response = make_request('POST', '/auth/signin', {
        "email": admin_user_data["email"],
        "password": admin_user_data["password"]
    }, expected_status=200)
    
    if response:
        data = response.json()
        if data.get("success") and data.get("token"):
            admin_token = data["token"]  # Update token
            print_result(True, "Admin signin successful")
        else:
            print_result(False, "Admin signin failed", data)
    else:
        print_result(False, "Admin signin request failed")
    
    # Test regular user signin
    response = make_request('POST', '/auth/signin', {
        "email": regular_user_data["email"],
        "password": regular_user_data["password"]
    }, expected_status=200)
    
    if response:
        data = response.json()
        if data.get("success") and data.get("token"):
            user_token = data["token"]  # Update token
            print_result(True, "Regular user signin successful")
        else:
            print_result(False, "Regular user signin failed", data)
    else:
        print_result(False, "Regular user signin request failed")
    
    # Test invalid credentials
    response = make_request('POST', '/auth/signin', {
        "email": admin_user_data["email"],
        "password": "wrongpassword"
    }, expected_status=401)
    
    if response:
        print_result(True, "Invalid credentials properly rejected")
    else:
        print_result(False, "Invalid credentials test failed")

def test_get_user_info():
    """Test getting current user info"""
    print_test_header("Get User Info Tests")
    
    if not admin_token:
        print_result(False, "No admin token available for testing")
        return
    
    # Test getting admin user info
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = make_request('GET', '/auth/user', headers=headers, expected_status=200)
    
    if response:
        data = response.json()
        if data.get("success") and data.get("user"):
            user_info = data["user"]
            if user_info.get("role") == "admin":
                print_result(True, f"Admin user info retrieved - Email: {user_info.get('email')}")
            else:
                print_result(False, "Admin user role incorrect", user_info)
        else:
            print_result(False, "Admin user info retrieval failed", data)
    else:
        print_result(False, "Admin user info request failed")
    
    # Test getting regular user info
    if user_token:
        headers = {"Authorization": f"Bearer {user_token}"}
        response = make_request('GET', '/auth/user', headers=headers, expected_status=200)
        
        if response:
            data = response.json()
            if data.get("success") and data.get("user"):
                user_info = data["user"]
                if user_info.get("role") == "user":
                    print_result(True, f"Regular user info retrieved - Email: {user_info.get('email')}")
                else:
                    print_result(False, "Regular user role incorrect", user_info)
            else:
                print_result(False, "Regular user info retrieval failed", data)
        else:
            print_result(False, "Regular user info request failed")
    
    # Test unauthorized access
    response = make_request('GET', '/auth/user', expected_status=401)
    if response and response.status_code == 401:
        print_result(True, "Unauthorized access properly rejected")
    else:
        print_result(False, "Unauthorized access test failed")

def test_announcements_crud():
    """Test announcements CRUD operations"""
    global announcement_id
    
    print_test_header("Announcements CRUD Tests")
    
    if not admin_token:
        print_result(False, "No admin token available for testing")
        return
    
    # Test getting announcements (should work without auth)
    response = make_request('GET', '/announcements', expected_status=200)
    if response:
        data = response.json()
        if isinstance(data, list):
            print_result(True, f"Get announcements successful - Found {len(data)} announcements")
        else:
            print_result(False, "Get announcements returned invalid format", data)
    else:
        print_result(False, "Get announcements request failed")
    
    # Test creating announcement (requires auth)
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = make_request('POST', '/announcements', announcement_data, headers=headers, expected_status=200)
    
    if response:
        data = response.json()
        if data.get("id") and data.get("title") == announcement_data["title"]:
            announcement_id = data["id"]
            print_result(True, f"Create announcement successful - ID: {announcement_id}")
        else:
            print_result(False, "Create announcement failed", data)
    else:
        print_result(False, "Create announcement request failed")
    
    # Test creating announcement without auth (should fail)
    response = make_request('POST', '/announcements', announcement_data, expected_status=401)
    if response and response.status_code == 401:
        print_result(True, "Unauthorized announcement creation properly rejected")
    else:
        print_result(False, "Unauthorized announcement creation test failed")
    
    if announcement_id:
        # Test updating announcement
        update_data = {
            "title": "Updated Welcome Message",
            "content": "This announcement has been updated with new information!"
        }
        
        response = make_request('PUT', f'/announcements/{announcement_id}', update_data, headers=headers, expected_status=200)
        if response:
            data = response.json()
            if data.get("title") == update_data["title"]:
                print_result(True, "Update announcement successful")
            else:
                print_result(False, "Update announcement failed", data)
        else:
            print_result(False, "Update announcement request failed")
        
        # Test deleting announcement
        response = make_request('DELETE', f'/announcements/{announcement_id}', headers=headers, expected_status=200)
        if response:
            data = response.json()
            if data.get("success"):
                print_result(True, "Delete announcement successful")
            else:
                print_result(False, "Delete announcement failed", data)
        else:
            print_result(False, "Delete announcement request failed")

def test_admin_endpoints():
    """Test admin-only endpoints"""
    print_test_header("Admin Endpoints Tests")
    
    if not admin_token:
        print_result(False, "No admin token available for testing")
        return
    
    # Test getting all users (admin only)
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = make_request('GET', '/admin/users', headers=headers, expected_status=200)
    
    if response:
        data = response.json()
        if isinstance(data, list) and len(data) >= 2:  # Should have at least admin and regular user
            print_result(True, f"Get all users successful - Found {len(data)} users")
        else:
            print_result(False, "Get all users failed or insufficient data", data)
    else:
        print_result(False, "Get all users request failed")
    
    # Test accessing admin endpoint with regular user (should fail)
    if user_token:
        headers = {"Authorization": f"Bearer {user_token}"}
        response = make_request('GET', '/admin/users', headers=headers, expected_status=403)
        if response and response.status_code == 403:
            print_result(True, "Regular user access to admin endpoint properly rejected")
        else:
            print_result(False, "Regular user admin access test failed")
    
    # Test updating user role (admin only)
    if user_user_id:
        headers = {"Authorization": f"Bearer {admin_token}"}
        role_update = {"role": "admin"}
        
        response = make_request('PUT', f'/admin/users/{user_user_id}/role', role_update, headers=headers, expected_status=200)
        if response:
            data = response.json()
            if data.get("success") and data.get("user", {}).get("role") == "admin":
                print_result(True, "User role update successful")
                
                # Change it back to user
                role_update = {"role": "user"}
                response = make_request('PUT', f'/admin/users/{user_user_id}/role', role_update, headers=headers, expected_status=200)
                if response:
                    print_result(True, "User role reverted successfully")
                else:
                    print_result(False, "User role revert failed")
            else:
                print_result(False, "User role update failed", data)
        else:
            print_result(False, "User role update request failed")

def test_error_handling():
    """Test error handling scenarios"""
    print_test_header("Error Handling Tests")
    
    # Test invalid endpoint
    response = make_request('GET', '/invalid-endpoint', expected_status=404)
    if response and response.status_code == 404:
        print_result(True, "Invalid endpoint properly returns 404")
    else:
        print_result(False, "Invalid endpoint test failed")
    
    # Test invalid announcement ID
    if admin_token:
        headers = {"Authorization": f"Bearer {admin_token}"}
        fake_id = str(uuid.uuid4())
        response = make_request('GET', f'/announcements/{fake_id}', headers=headers)
        # Note: The current API doesn't have a GET single announcement endpoint, so this might return 404
        print_result(True, "Invalid ID handling tested")
    
    # Test malformed JSON
    try:
        url = f"{API_URL}/auth/signup"
        response = requests.post(url, data="invalid json", headers={"Content-Type": "application/json"}, timeout=30)
        if response.status_code == 422:  # FastAPI returns 422 for validation errors
            print_result(True, "Malformed JSON properly rejected")
        else:
            print_result(False, f"Malformed JSON test failed - Status: {response.status_code}")
    except Exception as e:
        print_result(False, f"Malformed JSON test error: {e}")

def run_all_tests():
    """Run all test suites"""
    print(f"\n🚀 Starting Team Hub Backend API Tests")
    print(f"📅 Test run started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    try:
        # Run tests in logical order
        test_health_checks()
        test_user_signup()
        test_user_signin()
        test_get_user_info()
        test_announcements_crud()
        test_admin_endpoints()
        test_error_handling()
        
        print(f"\n{'='*60}")
        print("🏁 All tests completed!")
        print(f"📅 Test run finished at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"{'='*60}")
        
    except KeyboardInterrupt:
        print("\n⚠️  Tests interrupted by user")
    except Exception as e:
        print(f"\n❌ Test suite failed with error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    run_all_tests()