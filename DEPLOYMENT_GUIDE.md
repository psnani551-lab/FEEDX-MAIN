# FEEDX - Quick Start Guide

## Build and Run

### Option 1: Clean Build (Recommended if you had build errors)
```bash
chmod +x build-clean.sh
./build-clean.sh
```

This will:
- Clear all build caches
- Reinstall dependencies
- Build the application

### Option 2: Start Development Servers
```bash
chmod +x start-all.sh
./start-all.sh
```

This will start both:
- Backend server on port 3001
- Frontend server on port 8080

### Manual Start

**Backend:**
```bash
cd server
node index.js
```

**Frontend:**
```bash
npm run dev
```

## New Features Added

### 1. Recommended Resources in Student Analytics
- When a student enters their PIN and results are fetched, the system now shows personalized resource recommendations
- Resources are matched based on weak subjects using tags
- Students can click on recommendations to view detailed resource information

### 2. Brilliant-inspired UI Updates
- Cleaner hero section with "Learn by doing" tagline
- Modern category pills for Skills, Opportunities, Knowledge, and Projects
- Improved visual hierarchy and spacing
- Green "Get started" button with rounded corners
- Enhanced card designs with color-coded borders

### 3. API Endpoints Fixed
- Added `/api/results` endpoint for fetching student results from SBTET
- Fixed `/api/attendance` endpoint integration
- Both endpoints proxy to SBTET Telangana APIs

## API Endpoints

- `GET /api/results?pin=<PIN>` - Fetch student results
- `GET /api/attendance?pin=<PIN>` - Fetch attendance data
- `POST /api/auth/login` - Admin login
- `GET /api/admin/notifications` - Get notifications (requires auth)

## Troubleshooting

### Build Error: "failed to resolve import react-icons/fa"
Run the clean build script:
```bash
./build-clean.sh
```

### API 404 Errors
Make sure the backend server is running on port 3001:
```bash
cd server && node index.js
```

### Port Already in Use
Kill the process using the port:
```bash
# For port 3001 (backend)
lsof -ti:3001 | xargs kill -9

# For port 8080 (frontend)
lsof -ti:8080 | xargs kill -9
```

## Project Structure

```
/src
  /components
    RecommendedResources.tsx  (NEW)
    HeroSection.tsx           (UPDATED - Brilliant-inspired)
  /pages
    StudentAnalytics.tsx      (UPDATED - with recommendations)
/server
  index.js                    (UPDATED - added /api/results)
```
