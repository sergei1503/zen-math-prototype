#!/bin/bash
# Zen Math Development Server
# Port: 3051 (configured in .project-config.json)

cd "$(dirname "$0")"
echo "Starting Zen Math development server on port 3051..."
echo "Open: http://localhost:3051"
python3 -m http.server 3051
