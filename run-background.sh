#!/bin/bash

# Kill existing processes
echo "Stopping existing services..."
lsof -ti:3001,5001 | xargs kill -9 2>/dev/null || true

# Start Node.js production server
echo "Starting Node.js production server (Port 3001)..."
NODE_ENV=production PORT=3001 nohup node server/index-json.js >> node_server.log 2>&1 &
disown

# Start Python Attendance API
echo "Starting Python Attendance API (Port 5001)..."
PORT=5001 nohup python3 server/attendance_api.py >> python_api.log 2>&1 &
disown

echo "Services started in the background."
echo "Use 'bash status.sh' to check status."

