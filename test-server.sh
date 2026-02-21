#!/bin/bash

echo "Testing server connectivity..."
echo "=============================="

# Test if server is running locally
if curl -s http://localhost:3001/api/test > /dev/null 2>&1; then
    echo "✓ Local server (localhost:3001) is responding"
    curl -s http://localhost:3001/api/test
    echo ""
else
    echo "✗ Local server not responding"
fi

# Test the forwarded URL (if available)
FORWARDED_URL="https://ideal-meme-69wvggpj5x993r565-3001.app.github.dev"
if curl -s "$FORWARDED_URL/api/test" > /dev/null 2>&1; then
    echo "✓ Forwarded server ($FORWARDED_URL) is responding"
    curl -s "$FORWARDED_URL/api/test"
    echo ""
else
    echo "✗ Forwarded server not responding"
fi

echo ""
echo "Recent server logs:"
echo "==================="
tail -10 logs/api.log 2>/dev/null || echo "No logs found"