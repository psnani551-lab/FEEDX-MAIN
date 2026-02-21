# FeedX Nexus - Authentication & Admin Panel System

## Overview

This document covers the new authentication system, admin panel features, and web crawler functionality added to FeedX Nexus.

## New Features

### 1. **Authentication System**
- Login page with username/password authentication
- JWT token-based session management
- Protected admin routes
- Login attempt logging (success/failure)

### 2. **User Management**
- Create new admin users (only authenticated users can create)
- View all users
- Delete users
- User details: name, email, phone, PIN

### 3. **Login Activity Logs**
- View all login attempts (successful and failed)
- Filter logs by username
- IP address tracking
- Timestamp logging

### 4. **External Data Crawler**
- Fetch data from external websites (e.g., GIOE)
- Display announcements, opportunities, and events
- Web scraping functionality
- Data caching

## File Structure

```
/workspaces/feedx-nexus
├── src/pages/
│   ├── AdminLogin.tsx              # Login page
│   ├── UserManagement.tsx          # User creation and management
│   ├── LoginLogs.tsx              # View login activity
│   ├── ExternalDataCrawler.tsx    # Web crawler interface
│   └── AdminPanel.tsx             # Updated with new options
├── server/
│   ├── index.js                   # Updated with auth routes
│   ├── auth.js                    # Authentication middleware (optional)
│   ├── crawler.js                 # Crawler implementation (optional)
│   └── database.js                # Database initialization (optional)
└── public/data/
    └── (JSON data files)
```

## Routes

### Authentication Routes
- `POST /api/auth/login` - Login with username/password
- `POST /api/auth/register` - Create new user (protected)
- `GET /api/auth/users` - Get all users (protected)
- `GET /api/auth/login-logs` - Get login logs (protected)
- `DELETE /api/auth/users/:id` - Delete user (protected)

### Crawler Routes
- `GET /api/crawler/gioe` - Fetch GIOE website data (protected)

### Frontend Routes
- `/admin-login` - Login page
- `/admin` - Admin dashboard
- `/admin/users` - User management
- `/admin/logs` - Login activity logs
- `/admin/crawler` - External data crawler
- (All existing admin routes...)

## Demo Credentials

For testing purposes, use:
- **Username**: admin
- **Password**: admin123

These must be set up as the first user in the system.

## How to Use

### 1. Login
- Navigate to `/admin-login`
- Enter username and password
- JWT token is stored in `localStorage`

### 2. Create Users
- After login, go to `/admin/users`
- Click "Add New User"
- Fill in all required fields:
  - Username
  - Password
  - Full Name
  - Email
  - Phone Number
  - PIN
- User is created and can now login

### 3. View Login Logs
- Go to `/admin/logs`
- View all login attempts with:
  - Username
  - Login time
  - IP address
  - Success/failure status
- Filter by username for specific user activity

### 4. Crawl External Websites
- Go to `/admin/crawler`
- Click "Fetch Data" to crawl GIOE website
- View announcements, opportunities, and events
- Data is cached and refreshed on demand

## Security Considerations

1. **JWT Tokens**: Valid for 24 hours
2. **Password Hashing**: Uses bcrypt with salt
3. **Protected Routes**: Authentication middleware on protected endpoints
4. **IP Logging**: All login attempts are logged with IP address
5. **Token Storage**: Stored in localStorage (consider httpOnly cookies for production)

## API Examples

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

Response:
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1234567890,
    "name": "Admin User",
    "email": "admin@example.com"
  }
}
```

### Create User
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "username": "newuser",
    "password": "password123",
    "name": "New User",
    "email": "newuser@example.com",
    "phone": "9876543210",
    "pin": "123456"
  }'
```

### Get Login Logs
```bash
curl -X GET http://localhost:3001/api/auth/login-logs \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Crawl GIOE
```bash
curl -X GET http://localhost:3001/api/crawler/gioe \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Environment Variables

Set these in your `.env` file:
```
JWT_SECRET=your-secret-key-change-in-production
PORT=3001
```

## Testing Workflow

1. Start the development server:
   ```bash
   npm run dev:full
   ```

2. Navigate to `http://localhost:8080/admin-login`

3. Login with demo credentials (admin/admin123)

4. Test each feature:
   - **User Management**: Create, view, delete users
   - **Login Logs**: Check your login was recorded
   - **Data Crawler**: Fetch and view external data
   - **Admin Panel**: Access all content management sections

## Database Schema

### Users
```json
{
  "id": 1234567890,
  "username": "admin",
  "password": "bcrypt_hash",
  "name": "Administrator",
  "email": "admin@example.com",
  "phone": "9876543210",
  "pin": "123456",
  "created_at": "2025-12-14T10:30:00Z"
}
```

### Login Logs
```json
{
  "id": 1234567890,
  "username": "admin",
  "login_time": "2025-12-14T10:30:00Z",
  "ip_address": "192.168.1.1",
  "success": true
}
```

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad request (missing fields, invalid data)
- `401` - Unauthorized (invalid credentials, no token)
- `404` - Not found
- `500` - Server error

## Future Enhancements

1. **Edit User Profile**: Ability to update user information
2. **Role-Based Access Control**: Admin, Manager, User roles
3. **Email Verification**: Send verification emails on registration
4. **Password Reset**: Forgotten password recovery
5. **Real Web Crawler**: Implement actual web scraping with cheerio
6. **Advanced Logging**: More detailed activity logs
7. **Two-Factor Authentication**: Enhanced security
8. **Session Management**: Multiple device logins

## Troubleshooting

### Login fails with "Invalid credentials"
- Check username and password are correct
- Ensure user exists (check `/admin/users`)
- Verify JWT_SECRET matches between client and server

### Token expired
- JWT tokens expire after 24 hours
- User needs to login again
- Token is stored in localStorage

### Crawler returns empty data
- GIOE website might be down
- Check internet connection
- Implement actual web crawler with cheerio library

## Support

For issues or questions, contact the development team.

---

**Last Updated**: December 14, 2025
**Version**: 2.0.0 (Authentication & Admin Panel)
