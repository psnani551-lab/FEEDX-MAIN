#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🛑 Stopping FEEDX Application${NC}"
echo "================================================"
echo ""

# Function to check if a port is in use
check_port() {
    lsof -ti:$1 > /dev/null 2>&1
}

# Function to kill process on a port
kill_port() {
    if check_port $1; then
        echo -e "${YELLOW}   Killing process on port $1...${NC}"
        lsof -ti:$1 | xargs kill -9 2>/dev/null
        sleep 1
        if ! check_port $1; then
            echo -e "${GREEN}   ✓ Port $1 freed${NC}"
        else
            echo -e "${RED}   ✗ Failed to free port $1${NC}"
        fi
    else
        echo -e "${GREEN}   ✓ Port $1 is already free${NC}"
    fi
}

# Kill processes on required ports
echo "Stopping services..."
kill_port 8080  # Frontend
kill_port 3001  # Node.js API
kill_port 5001  # Python Backend API

echo ""
echo -e "${GREEN}✅ All services stopped${NC}"
echo ""
