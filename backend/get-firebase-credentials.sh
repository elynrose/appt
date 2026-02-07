#!/bin/bash

# Script to help get Firebase service account credentials for project: studio-5771582587-5ae19

PROJECT_ID="studio-5771582587-5ae19"
FIREBASE_CONSOLE_URL="https://console.firebase.google.com/project/${PROJECT_ID}/settings/serviceaccounts/adminsdk"

echo "🔧 Firebase Service Account Setup"
echo "=================================="
echo ""
echo "Project ID: ${PROJECT_ID}"
echo ""
echo "To get your service account credentials:"
echo ""
echo "1. Open this URL in your browser:"
echo "   ${FIREBASE_CONSOLE_URL}"
echo ""
echo "2. Click 'Generate new private key'"
echo ""
echo "3. Save the downloaded JSON file (e.g., ${PROJECT_ID}-firebase-adminsdk-xxxxx.json)"
echo ""
echo "4. Once downloaded, run this command to encode it:"
echo "   node encode-service-account.js <path-to-downloaded-json-file>"
echo ""
echo "Or manually encode it:"
echo "   base64 -i <path-to-json-file> | tr -d '\n'"
echo ""
echo "5. Add the base64 output to your .env file as:"
echo "   FIREBASE_SERVICE_ACCOUNT_BASE64=<base64-string>"
echo ""

