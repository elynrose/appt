#!/bin/bash

# Script to watch backend logs in real-time
LOG_FILE="backend.log"

echo "📋 Watching backend logs (Ctrl+C to stop)..."
echo ""

if [ ! -f "$LOG_FILE" ]; then
  echo "⚠️  Log file not found. Starting backend with logging..."
  npm run dev > "$LOG_FILE" 2>&1 &
  sleep 2
fi

tail -f "$LOG_FILE"

