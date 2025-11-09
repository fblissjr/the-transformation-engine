#!/bin/bash

# ==============================================================================
# Setup Script for The Transformation Engine
#
# This script:
# 1. Detects your operating system (macOS, Linux, Windows, or WSL)
# 2. Installs required dependencies (mkcert, nginx)
# 3. Generates SSL certificates for local HTTPS
# 4. Configures nginx with the correct paths for your OS
# 5. Installs Node.js dependencies
#
# Supported Platforms:
# - macOS (Homebrew)
# - Linux (apt, yum, dnf)
# - Windows (WSL recommended, Git Bash with manual install)
# - WSL (Windows Subsystem for Linux)
#
# USAGE:
#   ./setup.sh           - Run full setup
#   ./setup.sh --certs   - Only generate SSL certificates
#   ./setup.sh --nginx   - Only configure nginx
#   ./setup.sh --deps    - Only install dependencies
# ==============================================================================

# --- Colors for Output ---
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# --- Detect Operating System ---
detect_os() {
  # Detect Windows (Git Bash, MSYS2, or WSL)
  if [[ "$OSTYPE" == "msys"* ]] || [[ "$OSTYPE" == "win32"* ]] || [[ "$OSTYPE" == "cygwin"* ]]; then
    OS="windows"
    PACKAGE_MANAGER="manual"

    # Check if running in WSL
    if grep -qi microsoft /proc/version 2>/dev/null; then
      OS="wsl"
      PACKAGE_MANAGER="apt"
      NGINX_CONF_DIR="/etc/nginx"
      NGINX_LOG_DIR="/var/log/nginx"
      MIME_TYPES_PATH="/etc/nginx/mime.types"
    else
      # Native Windows (Git Bash/MSYS2)
      # Try to find nginx installation
      if [ -d "/c/nginx" ]; then
        NGINX_CONF_DIR="/c/nginx/conf"
        NGINX_LOG_DIR="/c/nginx/logs"
        MIME_TYPES_PATH="/c/nginx/conf/mime.types"
      elif [ -d "/c/Program Files/nginx" ]; then
        NGINX_CONF_DIR="/c/Program Files/nginx/conf"
        NGINX_LOG_DIR="/c/Program Files/nginx/logs"
        MIME_TYPES_PATH="/c/Program Files/nginx/conf/mime.types"
      else
        # Default paths - user needs to install nginx manually
        NGINX_CONF_DIR="C:/nginx/conf"
        NGINX_LOG_DIR="C:/nginx/logs"
        MIME_TYPES_PATH="C:/nginx/conf/mime.types"
      fi
    fi
  elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
    PACKAGE_MANAGER="brew"
    NGINX_CONF_DIR="/opt/homebrew/etc/nginx"
    NGINX_LOG_DIR="/opt/homebrew/var/log/nginx"
    MIME_TYPES_PATH="/opt/homebrew/etc/nginx/mime.types"
  elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
    # Detect Linux package manager
    if command -v apt-get &> /dev/null; then
      PACKAGE_MANAGER="apt"
      NGINX_CONF_DIR="/etc/nginx"
      NGINX_LOG_DIR="/var/log/nginx"
      MIME_TYPES_PATH="/etc/nginx/mime.types"
    elif command -v yum &> /dev/null; then
      PACKAGE_MANAGER="yum"
      NGINX_CONF_DIR="/etc/nginx"
      NGINX_LOG_DIR="/var/log/nginx"
      MIME_TYPES_PATH="/etc/nginx/mime.types"
    elif command -v dnf &> /dev/null; then
      PACKAGE_MANAGER="dnf"
      NGINX_CONF_DIR="/etc/nginx"
      NGINX_LOG_DIR="/var/log/nginx"
      MIME_TYPES_PATH="/etc/nginx/mime.types"
    else
      echo -e "${RED}Error: Unsupported Linux distribution. Please install mkcert and nginx manually.${NC}"
      exit 1
    fi
  else
    echo -e "${RED}Error: Unsupported operating system: $OSTYPE${NC}"
    exit 1
  fi

  echo -e "${BLUE}Detected OS: $OS (using $PACKAGE_MANAGER)${NC}"
}

# --- Install Dependencies ---
install_dependencies() {
  echo -e "${GREEN}Installing dependencies...${NC}"

  # Install mkcert
  if ! command -v mkcert &> /dev/null; then
    echo "Installing mkcert..."
    if [[ "$PACKAGE_MANAGER" == "brew" ]]; then
      brew install mkcert
    elif [[ "$PACKAGE_MANAGER" == "apt" ]]; then
      sudo apt-get update
      sudo apt-get install -y libnss3-tools
      curl -JLO "https://dl.filippo.io/mkcert/latest?for=linux/amd64"
      chmod +x mkcert-v*-linux-amd64
      sudo mv mkcert-v*-linux-amd64 /usr/local/bin/mkcert
    elif [[ "$PACKAGE_MANAGER" == "yum" ]] || [[ "$PACKAGE_MANAGER" == "dnf" ]]; then
      sudo $PACKAGE_MANAGER install -y nss-tools
      curl -JLO "https://dl.filippo.io/mkcert/latest?for=linux/amd64"
      chmod +x mkcert-v*-linux-amd64
      sudo mv mkcert-v*-linux-amd64 /usr/local/bin/mkcert
    elif [[ "$PACKAGE_MANAGER" == "manual" ]] && [[ "$OS" == "windows" ]]; then
      echo -e "${YELLOW}Please install mkcert manually on Windows:${NC}"
      echo "  1. Download from: https://github.com/FiloSottile/mkcert/releases"
      echo "  2. Get mkcert-v*-windows-amd64.exe"
      echo "  3. Rename to mkcert.exe and add to PATH"
      echo "  OR use Chocolatey: choco install mkcert"
      echo ""
      echo "After installing, run this script again."
      exit 1
    fi
    echo -e "${GREEN}mkcert installed successfully.${NC}"
  else
    echo -e "${YELLOW}mkcert is already installed.${NC}"
  fi

  # Install nginx
  if ! command -v nginx &> /dev/null; then
    echo "Installing nginx..."
    if [[ "$PACKAGE_MANAGER" == "brew" ]]; then
      brew install nginx
    elif [[ "$PACKAGE_MANAGER" == "apt" ]]; then
      sudo apt-get install -y nginx
    elif [[ "$PACKAGE_MANAGER" == "yum" ]] || [[ "$PACKAGE_MANAGER" == "dnf" ]]; then
      sudo $PACKAGE_MANAGER install -y nginx
    elif [[ "$PACKAGE_MANAGER" == "manual" ]] && [[ "$OS" == "windows" ]]; then
      echo -e "${YELLOW}Please install nginx manually on Windows:${NC}"
      echo "  1. Download from: http://nginx.org/en/download.html"
      echo "  2. Extract to C:\\nginx"
      echo "  OR use Chocolatey: choco install nginx"
      echo ""
      echo "After installing, run this script again."
      exit 1
    fi
    echo -e "${GREEN}nginx installed successfully.${NC}"
  else
    echo -e "${YELLOW}nginx is already installed.${NC}"
  fi

  # Install Node.js dependencies
  if [ ! -d "node_modules" ]; then
    echo "Installing Node.js dependencies..."
    npm install
    echo -e "${GREEN}Node.js dependencies installed.${NC}"
  else
    echo -e "${YELLOW}Node.js dependencies already installed.${NC}"
  fi
}

# --- Generate SSL Certificates ---
generate_certificates() {
  echo -e "${GREEN}Generating SSL certificates...${NC}"

  # Check if certificates already exist
  if [ -f "localhost+2.pem" ] && [ -f "localhost+2-key.pem" ]; then
    echo -e "${YELLOW}SSL certificates already exist.${NC}"
    read -p "Do you want to regenerate them? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      echo "Skipping certificate generation."
      return
    fi
    rm -f localhost+2.pem localhost+2-key.pem
  fi

  # Generate certificates
  mkcert localhost 127.0.0.1 ::1

  if [ $? -eq 0 ]; then
    echo -e "${GREEN}SSL certificates generated successfully.${NC}"
    echo -e "${YELLOW}Note: The certificates are valid but not trusted by your system yet.${NC}"
    echo -e "To trust them, run: ${BLUE}mkcert -install${NC} (requires sudo password)"
  else
    echo -e "${RED}Failed to generate SSL certificates.${NC}"
    exit 1
  fi
}

# --- Configure nginx ---
configure_nginx() {
  echo -e "${GREEN}Configuring nginx...${NC}"

  # Get project root directory
  PROJECT_ROOT="$(pwd)"

  # Check if nginx.conf exists
  if [ ! -f "nginx.conf" ]; then
    echo -e "${RED}Error: nginx.conf not found in current directory.${NC}"
    exit 1
  fi

  # Generate local nginx config from template
  # nginx.conf is the template (checked into git)
  # nginx.conf.local is generated (gitignored)
  echo "Generating nginx.conf.local from template..."
  sed -e "s|MIME_TYPES_PATH|$MIME_TYPES_PATH|g" \
      -e "s|PROJECT_ROOT|$PROJECT_ROOT|g" \
      -e "s|NGINX_LOG_DIR|$NGINX_LOG_DIR|g" \
      nginx.conf > nginx.conf.local

  echo -e "${GREEN}nginx configuration updated for $OS.${NC}"
  echo "  MIME types: $MIME_TYPES_PATH"
  echo "  Project root: $PROJECT_ROOT"
  echo "  Log directory: $NGINX_LOG_DIR"

  # Test nginx configuration
  echo ""
  echo "Testing nginx configuration..."
  nginx -t -c "$PROJECT_ROOT/nginx.conf.local"
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}nginx configuration is valid.${NC}"
  else
    echo -e "${RED}nginx configuration test failed.${NC}"
    exit 1
  fi
}

# --- Update manage.sh to use nginx.conf.local ---
update_manage_sh() {
  if [ -f "manage.sh" ]; then
    # Check if manage.sh already uses nginx.conf.local
    if grep -q "nginx.conf.local" manage.sh; then
      return
    fi

    # Update manage.sh to use nginx.conf.local
    if [[ "$OSTYPE" == "darwin"* ]]; then
      sed -i '' 's|nginx.conf|nginx.conf.local|g' manage.sh
    else
      sed -i 's|nginx.conf|nginx.conf.local|g' manage.sh
    fi
    echo "Updated manage.sh to use nginx.conf.local"
  fi
}

# --- Create .gitignore entries ---
update_gitignore() {
  if [ -f ".gitignore" ]; then
    # Check if entries already exist
    if ! grep -q "nginx.conf.template" .gitignore; then
      echo "" >> .gitignore
      echo "# nginx configuration backup" >> .gitignore
      echo "nginx.conf.template" >> .gitignore
      echo -e "${GREEN}Updated .gitignore${NC}"
    fi
  fi
}

# --- Main Setup ---
full_setup() {
  echo -e "${BLUE}========================================${NC}"
  echo -e "${BLUE}  The Transformation Engine - Setup${NC}"
  echo -e "${BLUE}========================================${NC}"
  echo ""

  detect_os
  echo ""

  install_dependencies
  echo ""

  generate_certificates
  echo ""

  configure_nginx
  echo ""

  update_manage_sh
  echo ""

  update_gitignore
  echo ""

  echo -e "${GREEN}========================================${NC}"
  echo -e "${GREEN}  Setup Complete!${NC}"
  echo -e "${GREEN}========================================${NC}"
  echo ""
  echo "Next steps:"
  echo "  1. Build the project:  npm run build"
  echo "  2. Start nginx:        ./manage.sh nginx"
  echo "  3. Open browser:       https://localhost:1847/"
  echo ""
  echo "Optional: To trust SSL certificates system-wide, run:"
  echo "  mkcert -install (requires sudo password)"
  echo ""
}

# --- Parse Arguments ---
case "${1:-}" in
  --certs)
    detect_os
    generate_certificates
    ;;
  --nginx)
    detect_os
    configure_nginx
    ;;
  --deps)
    detect_os
    install_dependencies
    ;;
  --help|-h)
    echo "Usage: $0 [option]"
    echo ""
    echo "Options:"
    echo "  (none)       Run full setup"
    echo "  --certs      Only generate SSL certificates"
    echo "  --nginx      Only configure nginx"
    echo "  --deps       Only install dependencies"
    echo "  --help, -h   Show this help message"
    exit 0
    ;;
  "")
    full_setup
    ;;
  *)
    echo -e "${RED}Error: Unknown option '$1'${NC}"
    echo "Use --help for usage information."
    exit 1
    ;;
esac
