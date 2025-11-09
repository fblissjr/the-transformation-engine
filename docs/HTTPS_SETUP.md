# HTTPS Setup Guide

This guide explains how to run The Transformation Engine with HTTPS locally using nginx and mkcert.

## Quick Start

Run the automated setup script:

```bash
./setup.sh
```

This will:
1. Install `mkcert` and `nginx` for your OS (macOS or Linux)
2. Generate SSL certificates
3. Configure nginx with the correct paths
4. Install Node.js dependencies

Then build and start the app:

```bash
npm run build
./manage.sh nginx
```

Visit: **https://localhost:1847/**

## Supported Platforms

- ✅ **macOS** (Homebrew)
- ✅ **Linux** (apt, yum, dnf)
- ✅ **Windows** (WSL, Git Bash, or native with manual setup)
- ✅ **WSL** (Windows Subsystem for Linux)

## Manual Setup

If you prefer to set things up manually:

### 1. Install Dependencies

**macOS:**
```bash
brew install mkcert nginx
```

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install -y nginx libnss3-tools
curl -JLO "https://dl.filippo.io/mkcert/latest?for=linux/amd64"
chmod +x mkcert-v*-linux-amd64
sudo mv mkcert-v*-linux-amd64 /usr/local/bin/mkcert
```

**RHEL/CentOS/Fedora:**
```bash
sudo yum install -y nginx nss-tools  # or dnf
curl -JLO "https://dl.filippo.io/mkcert/latest?for=linux/amd64"
chmod +x mkcert-v*-linux-amd64
sudo mv mkcert-v*-linux-amd64 /usr/local/bin/mkcert
```

**Windows (WSL - Recommended):**
```bash
# WSL uses Linux commands - follow Ubuntu/Debian instructions above
sudo apt-get update
sudo apt-get install -y nginx libnss3-tools
curl -JLO "https://dl.filippo.io/mkcert/latest?for=linux/amd64"
chmod +x mkcert-v*-linux-amd64
sudo mv mkcert-v*-linux-amd64 /usr/local/bin/mkcert
```

**Windows (Native - Chocolatey):**
```powershell
# Run PowerShell as Administrator
choco install mkcert nginx
```

**Windows (Native - Manual):**
1. **mkcert**:
   - Download from: https://github.com/FiloSottile/mkcert/releases
   - Get `mkcert-v*-windows-amd64.exe`
   - Rename to `mkcert.exe` and add to PATH

2. **nginx**:
   - Download from: http://nginx.org/en/download.html
   - Extract to `C:\nginx`
   - Add `C:\nginx` to PATH

### 2. Generate SSL Certificates

```bash
mkcert localhost 127.0.0.1 ::1
```

This creates:
- `localhost+2.pem` (certificate)
- `localhost+2-key.pem` (private key)

**Optional:** Trust the certificates system-wide:
```bash
mkcert -install  # Requires sudo password
```

### 3. Configure nginx

```bash
./setup.sh --nginx
```

This updates `nginx.conf` with the correct paths for your OS.

### 4. Build and Start

```bash
npm run build
./manage.sh nginx
```

## manage.sh Commands

```bash
./manage.sh dev      # Development server with HTTPS (Vite)
./manage.sh build    # Build for production
./manage.sh nginx    # Start nginx with HTTPS
./manage.sh start    # Start with PM2 (HTTP only)
./manage.sh stop     # Stop nginx or PM2
./manage.sh status   # Show status
./manage.sh logs     # Show logs
```

## Development vs Production

### Development Mode (npm run dev)
- Uses Vite dev server
- Hot module replacement
- HTTPS via vite.config.ts
- Runs on **https://localhost:1847/**

### Production Mode (./manage.sh nginx)
- Uses nginx to serve static files
- HTTPS with mkcert certificates
- HTTP→HTTPS redirect on port 7392
- Better performance for production testing

### PM2 Mode (./manage.sh start)
- Uses PM2 + serve
- HTTP only (no SSL)
- Good for simple deployments
- For production HTTPS, use nginx instead

## Troubleshooting

### "Address already in use" Error

Port 7392 or 1847 is occupied. Stop other services:

```bash
./manage.sh stop
# Or manually find what's using the port:
lsof -i :1847
lsof -i :7392
```

### nginx Configuration Test Failed

Run the test manually to see details:

```bash
nginx -t -c $(pwd)/nginx.conf
```

### Certificate Errors in Browser

**Option 1:** Click through the warning
- Chrome/Edge: "Advanced" → "Proceed to localhost"
- Firefox: "Advanced" → "Accept the Risk"

**Option 2:** Trust the certificates system-wide
```bash
mkcert -install  # Requires sudo password
```

Then restart nginx:
```bash
./manage.sh stop
./manage.sh nginx
```

### nginx Won't Start on Linux

Make sure nginx has permission to bind to ports 1847 and 7392:

```bash
# Check if ports require sudo
sudo netstat -tlnp | grep -E ':(1847|7392)'

# If ports are restricted, you may need to run nginx with sudo
# Or change ports to 8443 (HTTPS) and 8080 (HTTP) in nginx.conf
```

### Log Files Not Found

Verify log directory exists:

**macOS:**
```bash
ls -la /opt/homebrew/var/log/nginx/
```

**Linux:**
```bash
ls -la /var/log/nginx/
sudo mkdir -p /var/log/nginx  # Create if missing
```

**Windows:**
```bash
ls -la /c/nginx/logs/         # Git Bash
dir C:\nginx\logs\            # CMD
```

### Windows-Specific Issues

#### Git Bash Path Issues

If you see "nginx: command not found":
```bash
# Add nginx to PATH in Git Bash
export PATH="$PATH:/c/nginx"

# Or use full path
/c/nginx/nginx.exe -c $(pwd)/nginx.conf.local
```

#### nginx Won't Start on Windows

**Option 1: Run as Administrator**
```bash
# Git Bash - right-click, "Run as Administrator"
./manage.sh nginx
```

**Option 2: Change Ports**

Windows may restrict ports below 1024. Edit `nginx.conf`:
```nginx
listen 8443 ssl;      # Instead of 1847
listen 8080;          # Instead of 7392
```

#### WSL vs Native Windows

**Use WSL (Recommended):**
- Better compatibility with Unix tools
- Easier package management
- Same commands as Linux

**Native Windows:**
- Requires manual setup
- Use Git Bash or MSYS2
- Some commands may differ

#### Path Format Issues

Windows uses backslashes, but scripts use forward slashes. If you see path errors:

```bash
# Git Bash automatically converts
/c/nginx/conf  →  C:\nginx\conf

# If issues persist, use Windows-style paths in nginx.conf.local
C:/nginx/conf  # Forward slashes work in nginx config
```

## Files

- **setup.sh** - Automated setup script
- **nginx.conf** - nginx configuration (auto-generated from template)
- **nginx.conf.template** - Template with OS-agnostic placeholders
- **manage.sh** - Server management script
- **vite.config.ts** - Vite dev server HTTPS config
- **localhost+2.pem** - SSL certificate (gitignored)
- **localhost+2-key.pem** - SSL private key (gitignored)

## Security Notes

1. **Self-Signed Certificates**: The mkcert certificates are self-signed and only for local development. Never use them in production.

2. **Private Keys**: The `.pem` and `.key` files are automatically gitignored. Never commit them to version control.

3. **Production Deployments**: For real production HTTPS, use:
   - Let's Encrypt certificates
   - Reverse proxy (nginx, Caddy, Traefik)
   - Cloud provider SSL termination (Cloudflare, AWS ALB, etc.)

## Advanced Configuration

### Custom Ports

Edit `nginx.conf` and change:
```nginx
listen 1847 ssl;      # HTTPS port
listen 7392;          # HTTP port (redirects to HTTPS)
```

Then restart nginx:
```bash
./manage.sh stop
./manage.sh nginx
```

### Custom Domain

To use a custom domain like `tte.local`:

1. Generate certificate for your domain:
```bash
mkcert tte.local
```

2. Update `/etc/hosts`:
```
127.0.0.1 tte.local
```

3. Update `nginx.conf`:
```nginx
server_name tte.local;
ssl_certificate     /path/to/tte.local.pem;
ssl_certificate_key /path/to/tte.local-key.pem;
```

4. Restart nginx and visit: https://tte.local:1847/

## Getting Help

If you encounter issues:

1. Check the logs: `./manage.sh logs`
2. Test nginx config: `nginx -t -c $(pwd)/nginx.conf`
3. Verify certificates exist: `ls -la localhost+2*.pem`
4. Check if ports are available: `lsof -i :1847 -i :7392`

For more help, see the main README.md or open an issue on GitHub.
