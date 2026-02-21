#!/bin/bash

# Colors for output
BLUE='\033[0;34m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}📊 FEEDX Status Check${NC}"
echo "================================================"
echo ""

# Function to check if a port is in use
check_port() {
    lsof -ti:$1 > /dev/null 2>&1
}

# Function to get PID on port
get_pid() {
    lsof -ti:$1 2>/dev/null
}

# Check Frontend
echo -e "${BLUE}Frontend (Port 8080):${NC}"
if check_port 8080; then
    PID=$(get_pid 8080)
    echo -e "   ${GREEN}✓ Running (PID: $PID)${NC}"
    echo "   URL: http://0.0.0.0:8080"
else
    echo -e "   ${RED}✗ Not running${NC}"
fi
echo ""

# Check Backend
echo -e "${BLUE}Backend API (Port 5001):${NC}"
if check_port 5001; then
    PID=$(get_pid 5001)
    echo -e "   ${GREEN}✓ Running (PID: $PID)${NC}"
    echo "   URL: http://0.0.0.0:5001"
    
    # Try to hit health endpoint
    if command -v curl &> /dev/null; then
        HEALTH=$(curl -s http://0.0.0.0:5001/health 2>/dev/null)
        if [ $? -eq 0 ]; then
            echo -e "   ${GREEN}✓ Health check passed${NC}"
        else
            echo -e "   ${YELLOW}⚠ Health check failed${NC}"
        fi
    fi
else
    echo -e "   ${RED}✗ Not running${NC}"
fi
echo ""

# Check logs
echo -e "${BLUE}Recent Logs:${NC}"
if [ -f "node_server.log" ]; then
    echo -e "${YELLOW}Node Server (last 5 lines):${NC}"
    tail -n 5 node_server.log | sed 's/^/   /'
fi

if [ -f "python_api.log" ]; then
    echo -e "${YELLOW}Python API (last 5 lines):${NC}"
    tail -n 5 python_api.log | sed 's/^/   /'
fi

if [ ! -f "node_server.log" ] && [ ! -f "python_api.log" ] && [ ! -f "logs/backend.log" ]; then
    echo "   No server logs found"
fi
echo ""

# System info
echo -e "${BLUE}System Info:${NC}"
echo "   Node version:   $(node --version 2>/dev/null || echo 'Not installed')"
echo "   Python version: $(python3 --version 2>/dev/null || echo 'Not installed')"
echo "   npm version:    $(npm --version 2>/dev/null || echo 'Not installed')"
echo ""
