#!/bin/bash

# GT Automotive Development Server Startup Script
# Multiple options for running development servers

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║      GT Automotive Development Server Launcher         ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Function to check if PM2 is installed
check_pm2() {
    if command -v pm2 &> /dev/null; then
        return 0
    else
        return 1
    fi
}

# Function to install PM2
install_pm2() {
    echo -e "${YELLOW}PM2 not found. Installing PM2 globally...${NC}"
    npm install -g pm2
    echo -e "${GREEN}PM2 installed successfully!${NC}"
}

# Function to start with PM2
start_with_pm2() {
    echo -e "${GREEN}Starting servers with PM2 (recommended for stability)...${NC}"
    
    # Stop any existing PM2 processes
    pm2 delete all 2>/dev/null || true
    
    # Start the servers
    pm2 start ecosystem.config.js
    
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║         Servers Started with PM2 Successfully!         ║${NC}"
    echo -e "${GREEN}╠════════════════════════════════════════════════════════╣${NC}"
    echo -e "${GREEN}║  Frontend:  http://localhost:4500                     ║${NC}"
    echo -e "${GREEN}║  Backend:   http://localhost:3000/api                 ║${NC}"
    echo -e "${GREEN}║                                                        ║${NC}"
    echo -e "${GREEN}║  Commands:                                            ║${NC}"
    echo -e "${GREEN}║  • View logs:     pm2 logs                            ║${NC}"
    echo -e "${GREEN}║  • View status:   pm2 status                          ║${NC}"
    echo -e "${GREEN}║  • Stop servers:  pm2 stop all                        ║${NC}"
    echo -e "${GREEN}║  • Restart:       pm2 restart all                     ║${NC}"
    echo -e "${GREEN}║  • Monitor:       pm2 monit                           ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
    
    # Show real-time logs
    pm2 logs
}

# Function to start with basic script
start_basic() {
    echo -e "${GREEN}Starting servers with basic persistent script...${NC}"
    ./scripts/dev-persistent.sh
}

# Function to start with nx
start_nx() {
    echo -e "${GREEN}Starting servers with Nx (default)...${NC}"
    yarn dev
}

# Main menu
show_menu() {
    echo -e "${BLUE}Select startup method:${NC}"
    echo "1) PM2 Process Manager (Most Stable - Recommended)"
    echo "2) Persistent Script (Auto-restart on crash)"
    echo "3) Nx Default (Standard development)"
    echo "4) Exit"
    echo ""
    read -p "Enter your choice [1-4]: " choice
    
    case $choice in
        1)
            if check_pm2; then
                start_with_pm2
            else
                install_pm2
                start_with_pm2
            fi
            ;;
        2)
            start_basic
            ;;
        3)
            start_nx
            ;;
        4)
            echo -e "${YELLOW}Exiting...${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid option. Please try again.${NC}"
            show_menu
            ;;
    esac
}

# Check for command line arguments
if [ "$1" == "pm2" ]; then
    if check_pm2; then
        start_with_pm2
    else
        install_pm2
        start_with_pm2
    fi
elif [ "$1" == "basic" ]; then
    start_basic
elif [ "$1" == "nx" ]; then
    start_nx
else
    show_menu
fi