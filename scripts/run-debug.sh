#!/bin/bash

# GT Automotive Run & Debug Script
# Starts both server and frontend, opens Chrome, and cleans up on exit
#
# Features:
# - Starts both backend (port 3000) and frontend (port 4500)
# - Opens Chrome to http://localhost:4500
# - On exit: kills all node processes and clears backend dist
#
# Usage: ./scripts/run-debug.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Ports used by the app
FRONTEND_PORT=4500
BACKEND_PORT=3000

# Track PIDs for cleanup
FRONTEND_PID=""
BACKEND_PID=""
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Change to project root
cd "$PROJECT_ROOT"

echo -e "${CYAN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║      GT Automotive - Run & Debug Script                 ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1; then
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

# Function to kill all node processes from this project
kill_project_nodes() {
    echo -e "${YELLOW}Killing all project-related node processes...${NC}"

    # Kill processes on our specific ports
    kill_port $FRONTEND_PORT
    kill_port $BACKEND_PORT

    # Kill any node processes running from this project directory
    pgrep -f "node.*gt-automotives-app" | xargs kill -9 2>/dev/null || true

    # Kill vite processes
    pgrep -f "vite.*webApp" | xargs kill -9 2>/dev/null || true

    # Kill webpack/nest processes for server
    pgrep -f "webpack.*server" | xargs kill -9 2>/dev/null || true
    pgrep -f "nest start" | xargs kill -9 2>/dev/null || true

    # Also kill any nx processes
    pgrep -f "nx serve" | xargs kill -9 2>/dev/null || true

    sleep 1
    echo -e "${GREEN}Node processes cleaned up${NC}"
}

# Function to clear backend dist
clear_backend_dist() {
    echo -e "${YELLOW}Clearing backend dist folder...${NC}"

    if [ -d "$PROJECT_ROOT/server/dist" ]; then
        rm -rf "$PROJECT_ROOT/server/dist"
        echo -e "${GREEN}Backend dist folder cleared${NC}"
    else
        echo -e "${BLUE}Backend dist folder not found (already clean)${NC}"
    fi
}

# Function to open Chrome on macOS
open_chrome() {
    echo -e "${BLUE}Opening Chrome at http://localhost:$FRONTEND_PORT...${NC}"
    sleep 3  # Wait for servers to start

    # macOS: Use 'open' command with Chrome
    if [ "$(uname)" == "Darwin" ]; then
        # Check if Chrome is installed
        if [ -d "/Applications/Google Chrome.app" ]; then
            open -a "Google Chrome" "http://localhost:$FRONTEND_PORT" 2>/dev/null || true
        else
            # Fallback to default browser
            open "http://localhost:$FRONTEND_PORT" 2>/dev/null || true
        fi
    else
        # Linux: Try various browsers
        if command -v google-chrome &> /dev/null; then
            google-chrome "http://localhost:$FRONTEND_PORT" 2>/dev/null &
        elif command -v chromium-browser &> /dev/null; then
            chromium-browser "http://localhost:$FRONTEND_PORT" 2>/dev/null &
        elif command -v xdg-open &> /dev/null; then
            xdg-open "http://localhost:$FRONTEND_PORT" 2>/dev/null &
        fi
    fi
}

# Cleanup function - runs on exit
cleanup() {
    echo ""
    echo -e "${CYAN}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║                  Cleaning Up...                        ║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════╝${NC}"

    # Kill tracked PIDs first
    if [ ! -z "$FRONTEND_PID" ]; then
        echo -e "${YELLOW}Stopping frontend (PID: $FRONTEND_PID)...${NC}"
        kill $FRONTEND_PID 2>/dev/null || true
    fi

    if [ ! -z "$BACKEND_PID" ]; then
        echo -e "${YELLOW}Stopping backend (PID: $BACKEND_PID)...${NC}"
        kill $BACKEND_PID 2>/dev/null || true
    fi

    sleep 1

    # Kill all related node processes
    kill_project_nodes

    # Clear backend dist
    clear_backend_dist

    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║            Cleanup Complete - Goodbye!                 ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
    exit 0
}

# Set up trap to handle script termination (Ctrl+C, etc.)
trap cleanup EXIT INT TERM

# Main execution
main() {
    # Initial cleanup - kill any existing processes
    echo -e "${YELLOW}Initial cleanup...${NC}"
    kill_project_nodes

    echo ""
    echo -e "${BLUE}Starting development servers...${NC}"
    echo ""

    # Start the backend server
    echo -e "${GREEN}Starting Backend Server on port $BACKEND_PORT...${NC}"
    yarn nx serve server &
    BACKEND_PID=$!

    # Give backend time to start
    sleep 3

    # Start the frontend server
    echo -e "${GREEN}Starting Frontend Server on port $FRONTEND_PORT...${NC}"
    yarn nx serve webApp &
    FRONTEND_PID=$!

    # Wait a bit then open Chrome
    open_chrome &

    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║        Development Servers Starting...                 ║${NC}"
    echo -e "${GREEN}╠════════════════════════════════════════════════════════╣${NC}"
    echo -e "${GREEN}║  Frontend:  http://localhost:$FRONTEND_PORT                     ║${NC}"
    echo -e "${GREEN}║  Backend:   http://localhost:$BACKEND_PORT/api                 ║${NC}"
    echo -e "${GREEN}║                                                        ║${NC}"
    echo -e "${GREEN}║  Hot-reload enabled for both servers                   ║${NC}"
    echo -e "${GREEN}║                                                        ║${NC}"
    echo -e "${GREEN}║  Press Ctrl+C to stop and clean up                     ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
    echo ""

    # Wait for processes to finish (or Ctrl+C)
    wait $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
}

# Run main function
main
