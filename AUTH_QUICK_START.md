# Quick Start - Authentication System

## 5-Minute Setup

### Prerequisites
- Node.js installed
- npm/bun package manager
- FeedX Nexus project running

### Step 1: Start the Server
```bash
npm run dev:full
```

This starts both the React app and Express server.

### Step 2: Access Admin Login
Open browser and navigate to:
```
http://localhost:8080/admin-login
```

### Step 3: Login with Demo Credentials
```
Username: admin
Password: admin123
```

> **Note**: These are default credentials. In production, change the initial password!

### Step 4: Create More Users
1. After login, you'll see the Admin Panel
2. Click on "Admin Panel" or navigate to `/admin/users`
3. Click "Add New User"
4. Fill in the form:
   - **Username**: Enter a unique username
   - **Password**: Strong password
   - **Full Name**: User's full name
   - **Email**: Valid email address
   - **Phone**: Contact number
   - **PIN**: 4-6 digit PIN
5. Click "Create User"

### Step 5: View Login Activity
1. Go to `/admin/logs` or click "Login Activity" card
2. See all login attempts with:
   - Username
   - Date/Time
   - IP Address
   - Success/Failure status
3. Filter by username to track specific users

### Step 6: Crawl External Sites
1. Go to `/admin/crawler`
2. Click "Fetch Data" button
3. View:
   - Announcements
   - Opportunities
   - Events
4. Click on "Opportunities" tab to see different data

## Key Features

### 🔐 Security
- Passwords are hashed using bcrypt
- JWT tokens expire in 24 hours
- All API endpoints are protected
- Failed login attempts are logged

### 📊 Admin Dashboard
Quick access to:
- Create/View/Delete content (notifications, updates, resources, events, etc.)
- Manage users
- View login logs
- Crawl external websites

### 📋 Login Logs
Track:
- Successful logins
- Failed login attempts
- IP addresses
- Exact timestamps

### 🌐 Data Crawler
Fetch data from external websites:
- Announcements
- Job opportunities
- Events
- Custom data extraction

## Page Navigation

```
/admin-login
    ↓
/admin (Dashboard)
    ├── /admin/notifications
    ├── /admin/updates
    ├── /admin/resources
    ├── /admin/events
    ├── /admin/spotlight
    ├── /admin/testimonials
    ├── /admin/users ⭐ NEW
    ├── /admin/logs ⭐ NEW
    └── /admin/crawler ⭐ NEW
```

## API Endpoints

### Login
```
POST /api/auth/login
Body: { "username": "admin", "password": "admin123" }
```

### Create User (Protected)
```
POST /api/auth/register
Header: Authorization: Bearer TOKEN
Body: {
  "username": "newuser",
  "password": "pass123",
  "name": "User Name",
  "email": "user@example.com",
  "phone": "9876543210",
  "pin": "1234"
}
```

### Get All Users (Protected)
```
GET /api/auth/users
Header: Authorization: Bearer TOKEN
```

### Get Login Logs (Protected)
```
GET /api/auth/login-logs
Header: Authorization: Bearer TOKEN
Optional: ?username=admin
```

### Delete User (Protected)
```
DELETE /api/auth/users/:id
Header: Authorization: Bearer TOKEN
```

## Data Storage

All data is stored in JSON files:
- `/server/users.json` - User accounts
- `/server/login_logs.json` - Login activity
- `/public/data/` - Content (notifications, updates, etc.)

## Testing Checklist

- [ ] Login with admin/admin123
- [ ] Create a new user
- [ ] Login with new user account
- [ ] Check login logs show both logins
- [ ] View all users
- [ ] Delete a test user
- [ ] Crawl external website
- [ ] Try failed login and check logs

## Common Issues

### Login fails
```
❌ "Invalid credentials" message
✅ Solution: Check username/password spelling
✅ Solution: Ensure user exists in /admin/users
```

### Token expired
```
❌ "Invalid token" error
✅ Solution: Login again
✅ Solution: Tokens valid for 24 hours
```

### Can't create users
```
❌ "Registration failed" error
✅ Solution: Must be logged in
✅ Solution: Check all fields are filled
✅ Solution: Email might already exist
```

### Crawler returns empty
```
❌ No data displayed
✅ Solution: Check internet connection
✅ Solution: External website might be down
✅ Solution: Try again in a few minutes
```

## Next Steps

1. ✅ Test all authentication features
2. ✅ Create admin users for team
3. ✅ Test content management
4. ✅ Customize default credentials
5. ✅ Review security settings
6. ✅ Set up database backups
7. ✅ Document team access

## Security Reminders

> ⚠️ **IMPORTANT**: These are development credentials!

Before deploying to production:
1. Change default admin password
2. Update `JWT_SECRET` in environment variables
3. Use HTTPS for all connections
4. Implement rate limiting on login endpoint
5. Add email verification
6. Use httpOnly cookies instead of localStorage
7. Implement CORS restrictions
8. Add request validation

## Support

For issues:
1. Check browser console for errors
2. Check server logs for API errors
3. Verify token is present in localStorage
4. Ensure server is running on port 3001
5. Check network tab in DevTools

---

**Need help?** Check `AUTHENTICATION_SETUP.md` for detailed documentation.
