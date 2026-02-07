#!/bin/bash

# Start script for Railway with Nginx proxy
# Nginx handles WebSocket upgrades, proxies to Fastify

# Start nginx in background
nginx

# Start Fastify backend
node src/index.js

