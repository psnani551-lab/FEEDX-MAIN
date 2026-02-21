#!/bin/bash

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🔍 Checking Server Status..."
echo "================================"
echo ""

# Check Port 3001 (Node API)
if lsof -ti:3001 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Node.js API (Port 3001): RUNNING${NC}"
else
    echo -e "${RED}✗ Node.js API (Port 3001): NOT RUNNING${NC}"
fi

# Check Port 5001 (Python API)
if lsof -ti:5001 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Python API (Port 5001): RUNNING${NC}"
else
    echo -e "${RED}✗ Python API (Port 5001): NOT RUNNING${NC}"
fi

# Check Port 8080 (Frontend)
if lsof -ti:8080 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Frontend (Port 8080): RUNNING${NC}"
else
    echo -e "${RED}✗ Frontend (Port 8080): NOT RUNNING${NC}"
fi

echo ""
echo "Testing Node.js API endpoint..."
if curl -s http://localhost:3001/api/admin/notifications > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Node API is responding${NC}"
else
    echo -e "${RED}✗ Node API is not responding${NC}"
    echo -e "${YELLOW}Check logs/api.log for errors${NC}"
fi

echo ""
echo "Recent API log (last 10 lines):"
echo "================================"
if [ -f "logs/api.log" ]; then
    tail -10 logs/api.log
else
    echo -e "${YELLOW}No api.log file found${NC}"
fi
