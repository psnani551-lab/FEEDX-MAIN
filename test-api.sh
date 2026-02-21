#!/bin/bash

# Test script for SBTET Attendance API

API_URL="http://0.0.0.0:5001"
TEST_PIN="24054-cps-024"

echo "🧪 Testing SBTET Attendance API"
echo "================================"
echo ""

# Test 1: Health Check
echo "Test 1: Health Check"
echo "--------------------"
echo "Request: GET $API_URL/health"
curl -s "$API_URL/health" | python3 -m json.tool
echo ""
echo ""

# Test 2: Get Attendance with valid PIN
echo "Test 2: Get Attendance (Valid PIN)"
echo "-----------------------------------"
echo "Request: GET $API_URL/api/attendance?pin=$TEST_PIN"
curl -s "$API_URL/api/attendance?pin=$TEST_PIN" | python3 -m json.tool
echo ""
echo ""

# Test 3: Get Attendance without PIN
echo "Test 3: Get Attendance (Missing PIN)"
echo "-------------------------------------"
echo "Request: GET $API_URL/api/attendance"
curl -s "$API_URL/api/attendance" | python3 -m json.tool
echo ""
echo ""

# Test 4: Get Attendance with invalid PIN
echo "Test 4: Get Attendance (Invalid PIN)"
echo "-------------------------------------"
echo "Request: GET $API_URL/api/attendance?pin=invalid-pin"
curl -s "$API_URL/api/attendance?pin=invalid-pin" | python3 -m json.tool
echo ""

echo "✅ Tests completed"
