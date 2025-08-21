#!/bin/bash

# GT Automotive Persistent Development Server Script
# This script ensures development servers keep running even when code changes

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║        GT Automotive Development Server Manager        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        return 0
    else
        return 1
    fi
}

# Function to kill process on port
kill_port() {
    local port=$1
    if check_port $port; then
        echo -e "${YELLOW}Killing existing process on port $port...${NC}"
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
        sleep 1
    fi
}

# Function to start the frontend server
start_frontend() {
    echo -e "${GREEN}Starting Frontend Server on port 4200...${NC}"
    cd apps/webApp
    npx vite --host --port 4200 --strictPort &
    FRONTEND_PID=$!
    cd ../..
}

# Function to start the backend server
start_backend() {
    echo -e "${GREEN}Starting Backend Server on port 3000...${NC}"
    cd server
    npm run start:dev &
    BACKEND_PID=$!
    cd ..
}

# Cleanup function
cleanup() {
    echo ""
    echo -e "${YELLOW}Stopping servers...${NC}"
    
    # Kill frontend server
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    
    # Kill backend server
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    
    # Kill any remaining processes on the ports
    kill_port 4200
    kill_port 3000
    
    echo -e "${GREEN}Servers stopped successfully!${NC}"
    exit 0
}

# Set up trap to handle script termination
trap cleanup EXIT INT TERM

# Main execution
main() {
    # Kill any existing processes on our ports
    kill_port 4200
    kill_port 3000
    
    echo -e "${BLUE}Installing dependencies if needed...${NC}"
    yarn install --ignore-engines 2>/dev/null || true
    
    # Start the servers
    start_frontend
    sleep 3
    
    start_backend
    sleep 3
    
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║           Development Servers Started Successfully      ║${NC}"
    echo -e "${GREEN}╠════════════════════════════════════════════════════════╣${NC}"
    echo -e "${GREEN}║  Frontend:  http://localhost:4200                     ║${NC}"
    echo -e "${GREEN}║  Backend:   http://localhost:3000/api                 ║${NC}"
    echo -e "${GREEN}║                                                        ║${NC}"
    echo -e "${GREEN}║  Hot-reload is enabled for both servers               ║${NC}"
    echo -e "${GREEN}║  Press Ctrl+C to stop all servers                     ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    # Keep the script running and show logs
    while true; do
        # Check if servers are still running
        if ! kill -0 $FRONTEND_PID 2>/dev/null; then
            echo -e "${RED}Frontend server crashed! Restarting...${NC}"
            start_frontend
        fi
        
        if ! kill -0 $BACKEND_PID 2>/dev/null; then
            echo -e "${RED}Backend server crashed! Restarting...${NC}"
            start_backend
        fi
        
        sleep 5
    done
}

# Run main function
main