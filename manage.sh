#!/bin/bash

# ==============================================================================
# Management Script for The Transformation Engine (React/Vite)
#
# USAGE:
#   ./manage.sh dev      - Starts the local development server
#   ./manage.sh build    - Creates a production build
#   ./manage.sh start    - Serves the production build with PM2
#   ./manage.sh stop     - Stops the PM2 process
#   ./manage.sh logs     - Shows logs for the PM2 process
#   ./manage.sh status   - Shows the status of the PM2 process
#
# ENVIRONMENT VARIABLES:
#   APP_NAME=myapp ./manage.sh start       - Custom PM2 process name
#   APP_PORT=8080 ./manage.sh start        - Custom port (default: 1847)
#   APP_HOST=0.0.0.0 ./manage.sh start     - Bind to all interfaces
#
# EXAMPLES:
#   APP_PORT=3000 ./manage.sh start        - Serve on port 3000
#   APP_NAME=prod-engine ./manage.sh start - Use custom PM2 name
# ==============================================================================

# --- Configuration ---
# Name for your application in PM2
APP_NAME="${APP_NAME:-tte}"

# Port to serve the production build on. Override with: APP_PORT=8080 ./manage.sh start
APP_PORT="${APP_PORT:-7392}"

# Host to bind to (0.0.0.0 for external access, 127.0.0.1 for localhost only)
APP_HOST="${APP_HOST:-127.0.0.1}"

# Directory where the production build is output
BUILD_DIR="dist"

# --- Colors for Output ---
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# --- Helper Functions ---
check_node_modules() {
  if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Warning: 'node_modules' directory not found.${NC}"
    echo "Running 'npm install' for you..."
    npm install
    if [ $? -ne 0 ]; then
      echo -e "${RED}Error: 'npm install' failed. Please fix the issues and try again.${NC}"
      exit 1
    fi
    echo -e "${GREEN}Dependencies installed successfully.${NC}"
  fi
}

# --- Script Commands ---

# Function to start the development server
start_dev() {
  echo -e "${GREEN}Starting development server...${NC}"
  check_node_modules
  npm run dev # Vite projects often use 'dev' instead of 'start'
}

# Function to build the project for production
build_project() {
  echo -e "${GREEN}Creating production build...${NC}"
  check_node_modules
  npm run build
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}Build completed successfully! Files are in the '${BUILD_DIR}' directory.${NC}" # <-- DYNAMICALLY USES FOLDER NAME
  else
    echo -e "${RED}Build failed. Please check the error messages above.${NC}"
  fi
}

# Function to start the application with PM2
start_pm2() {
  echo -e "${GREEN}Starting application with PM2...${NC}"

  # Check if the build directory exists
  if [ ! -d "$BUILD_DIR" ]; then # <-- CHANGED
    echo -e "${RED}Error: '${BUILD_DIR}' directory not found.${NC}" # <-- CHANGED
    echo "Please run './manage.sh build' first."
    exit 1
  fi

  # Check if pm2 and serve are installed globally via npm
  if ! npm list -g serve >/dev/null 2>&1 || ! npm list -g pm2 >/dev/null 2>&1; then
      echo -e "${YELLOW}PM2 or Serve not found. Installing them globally...${NC}"
      npm install -g pm2 serve
      if [ $? -ne 0 ]; then
        echo -e "${RED}Failed to install PM2 or Serve. Please install them manually.${NC}"
        exit 1
      fi
  fi

  echo "Serving '${BUILD_DIR}' directory on ${APP_HOST}:${APP_PORT} with SPA support."

  # Stop the process if it's already running to ensure a clean start
  pm2 stop "$APP_NAME" >/dev/null 2>&1
  pm2 delete "$APP_NAME" >/dev/null 2>&1

  # Start the server with PM2
  # Note: pm2 serve doesn't support --host flag, so we use ecosystem config approach
  if [ "$APP_HOST" != "127.0.0.1" ] && [ "$APP_HOST" != "localhost" ]; then
    echo -e "${YELLOW}Note: PM2's 'serve' command binds to all interfaces by default.${NC}"
    echo "For host-specific binding, consider using nginx as reverse proxy."
  fi

  pm2 serve ${BUILD_DIR} ${APP_PORT} --name "$APP_NAME" --spa

  # Set up PM2 to start on server reboot
  echo -e "\n${YELLOW}To make the app restart automatically on server reboot, run the following commands:${NC}"
  echo "1. pm2 startup (and run the command it gives you)"
  echo "2. pm2 save"
}

# --- Main Logic ---
# Check if an argument was provided
if [ -z "$1" ]; then
  echo -e "${RED}Error: No command specified.${NC}"
  echo -e "Usage: $0 {dev|build|start|stop|logs|status}"
  exit 1
fi

# Case statement to handle the command
case "$1" in
  dev)
    start_dev
    ;;
  build)
    build_project
    ;;
  start)
    start_pm2
    ;;
  stop)
    echo "Stopping PM2 process: $APP_NAME"
    pm2 stop "$APP_NAME"
    ;;
  logs)
    echo "Showing logs for PM2 process: $APP_NAME"
    pm2 logs "$APP_NAME"
    ;;
  status)
    echo "Showing status for PM2 process: $APP_NAME"
    pm2 list
    ;;
  *)
    echo -e "${RED}Error: Invalid command '$1'.${NC}"
    echo -e "Usage: $0 {dev|build|start|stop|logs|status}"
    exit 1
    ;;
esac
