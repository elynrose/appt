#!/bin/bash

# Quick check script to verify nginx and Fastify are running

echo "🔍 Checking Backend Services"
echo "============================"
echo ""

# Check if nginx is running
if pgrep -x nginx > /dev/null; then
    echo "✅ Nginx is running"
else
    echo "❌ Nginx is NOT running"
fi

# Check if node (Fastify) is running
if pgrep -f "node src/index.js" > /dev/null; then
    echo "✅ Fastify (Node.js) is running"
else
    echo "❌ Fastify (Node.js) is NOT running"
fi

# Check ports
echo ""
echo "📡 Port Status:"
if netstat -tuln 2>/dev/null | grep -q ":5050"; then
    echo "✅ Port 5050 (Fastify) is listening"
else
    echo "❌ Port 5050 (Fastify) is NOT listening"
fi

if netstat -tuln 2>/dev/null | grep -q ":${PORT:-8080}"; then
    echo "✅ Port ${PORT:-8080} (Nginx) is listening"
else
    echo "❌ Port ${PORT:-8080} (Nginx) is NOT listening"
fi

echo ""
echo "✅ Check complete!"

