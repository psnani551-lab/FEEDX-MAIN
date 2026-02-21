#!/bin/bash

echo "Testing admin security..."

# Test accessing admin notifications without authentication
echo "Testing unauthenticated access to /api/admin/notifications..."
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" http://localhost:3001/api/admin/notifications)
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')

if [ "$HTTP_STATUS" = "401" ]; then
    echo "✅ Security working: Got 401 Unauthorized for unauthenticated admin access"
else
    echo "❌ Security issue: Got HTTP $HTTP_STATUS instead of 401"
    echo "Response: $BODY"
fi

# Test accessing file upload without authentication
echo "Testing unauthenticated access to /api/upload..."
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST http://localhost:3001/api/upload)
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)

if [ "$HTTP_STATUS" = "401" ]; then
    echo "✅ Security working: Got 401 Unauthorized for unauthenticated file upload"
else
    echo "❌ Security issue: Got HTTP $HTTP_STATUS instead of 401"
fi

echo "Security test completed."