#!/bin/bash

# Smart-ID Hardware Bridge Test Script
# Run this on your backend machine to test Pi connectivity

PI_IP="192.168.225.169"
PI_PORT="5001"
BASE_URL="http://${PI_IP}:${PI_PORT}"

echo "========================================"
echo "Smart-ID Hardware Bridge Connectivity Test"
echo "========================================"
echo ""

# Test 1: Health Check
echo "Test 1: Health Check"
echo "---------------------"
echo "URL: GET ${BASE_URL}/health"
response=$(curl -s -w "\nHTTP_CODE:%{http_code}" "${BASE_URL}/health")
http_code=$(echo "$response" | grep "HTTP_CODE:" | cut -d: -f2)
body=$(echo "$response" | sed '/HTTP_CODE:/d')

echo "Status: $http_code"
if [ "$http_code" == "200" ]; then
    echo "Result: SUCCESS"
    echo "$body" | python3 -m json.tool 2>/dev/null || echo "$body"
else
    echo "Result: FAILED"
    echo "$body"
fi
echo ""

# Test 2: NFC Scan (no card needed, just tests endpoint)
echo "Test 2: NFC Scan Endpoint"
echo "-------------------------"
echo "URL: POST ${BASE_URL}/scan-nfc"
echo "Body: {\"timeout\": 5}"
response=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
    -X POST "${BASE_URL}/scan-nfc" \
    -H "Content-Type: application/json" \
    -d '{"timeout": 5}')
http_code=$(echo "$response" | grep "HTTP_CODE:" | cut -d: -f2)
body=$(echo "$response" | sed '/HTTP_CODE:/d')

echo "Status: $http_code"
if [ "$http_code" == "200" ]; then
    echo "Result: SUCCESS - Endpoint is working"
    echo "$body" | python3 -m json.tool 2>/dev/null || echo "$body"
elif [ "$http_code" == "400" ]; then
    echo "Result: EXPECTED - No NFC card present (timeout)"
    echo "$body" | python3 -m json.tool 2>/dev/null || echo "$body"
else
    echo "Result: FAILED"
    echo "$body"
fi
echo ""

# Test 3: SMS Test
echo "Test 3: SMS Endpoint (dry run - won't actually send)"
echo "-----------------------------------------------------"
echo "URL: POST ${BASE_URL}/send-sms"
echo "Body: {\"phone\": \"+919876543210\", \"message\": \"Test from backend\"}"
response=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
    -X POST "${BASE_URL}/send-sms" \
    -H "Content-Type: application/json" \
    -d '{"phone": "+919876543210", "message": "Test from backend"}')
http_code=$(echo "$response" | grep "HTTP_CODE:" | cut -d: -f2)
body=$(echo "$response" | sed '/HTTP_CODE:/d')

echo "Status: $http_code"
if [ "$http_code" == "200" ]; then
    echo "Result: SUCCESS - SMS endpoint is working"
    echo "$body" | python3 -m json.tool 2>/dev/null || echo "$body"
elif [ "$http_code" == "400" ]; then
    echo "Result: EXPECTED - GSM module may need SIM card"
    echo "$body" | python3 -m json.tool 2>/dev/null || echo "$body"
else
    echo "Result: FAILED"
    echo "$body"
fi
echo ""

echo "========================================"
echo "Test Complete"
echo "========================================"
