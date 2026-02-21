#!/bin/bash

echo "Testing file upload functionality..."

# Test if server is running
if curl -s http://localhost:3001/api/admin/events > /dev/null 2>&1; then
    echo "✅ Server is running"
else
    echo "❌ Server is not running. Please start it with: npm run server"
    exit 1
fi

# Create a test file
echo "Creating test file..."
echo "This is a test document for upload functionality." > test_file.txt

# Test file upload
echo "Testing file upload..."
UPLOAD_RESPONSE=$(curl -s -X POST \
  -F "file=@test_file.txt" \
  http://localhost:3001/api/upload)

if echo "$UPLOAD_RESPONSE" | grep -q "url"; then
    echo "✅ File upload successful"
    echo "Response: $UPLOAD_RESPONSE"
else
    echo "❌ File upload failed"
    echo "Response: $UPLOAD_RESPONSE"
fi

# Clean up
rm -f test_file.txt

echo "File upload test completed."