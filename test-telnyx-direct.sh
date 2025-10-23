#!/bin/bash

# Direct Telnyx API Test
# This tests if your Telnyx credentials work independently of GT Automotive

echo "📱 Testing Telnyx API Credentials"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Read your phone number
read -p "Enter your phone number to send test SMS to (+1XXXXXXXXXX): " TO_NUMBER

if [ -z "$TO_NUMBER" ]; then
    echo "❌ Phone number is required!"
    exit 1
fi

echo ""
echo "📤 Sending test SMS via Telnyx API..."
echo "From: +12366015757"
echo "To: $TO_NUMBER"
echo "Message: Test from GT Automotive via Telnyx!"
echo ""

# Send SMS via Telnyx API
curl -X POST https://api.telnyx.com/v2/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer KEY019A12E58E404F383F416E54C3A081B3_8GaswjMEGBYxiSUzNTDI2p" \
  -d "{
    \"from\": \"+12366015757\",
    \"to\": \"$TO_NUMBER\",
    \"text\": \"Test from GT Automotive via Telnyx!\",
    \"messaging_profile_id\": \"40019a12-d618-4140-9066-cea635fbd4a9\"
  }"

echo ""
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Request sent! Check your phone for the SMS."
echo ""
echo "If you received the SMS:"
echo "  ✅ Your Telnyx credentials are working!"
echo "  ✅ GT Automotive SMS integration is ready!"
echo ""
echo "If you didn't receive it:"
echo "  1. Check Telnyx dashboard for errors"
echo "  2. Verify your phone number is correct"
echo "  3. Check if you have sufficient Telnyx balance"
echo ""
