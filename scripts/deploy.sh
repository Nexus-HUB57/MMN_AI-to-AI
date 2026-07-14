#!/bin/bash
# ============================================
# MMN AI-to-AI — Deploy Script
# Hostgator VPS - oneverso.com.br
# ============================================

set -e  # Exit on error

# ============================================
# Configuration
# ============================================
APP_NAME="mmn-ai-to-ai"
APP_DIR="/var/www/oneverso.com.br"
LOG_DIR="$APP_DIR/logs"
BACKUP_DIR="$APP_DIR/backups"
ENV_FILE="$APP_DIR/.env.production"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================
# Functions
# ============================================
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# ============================================
# Pre-deployment checks
# ============================================
pre_deploy_checks() {
    log_info "Running pre-deployment checks..."

    # Check if .env.production exists
    if [ ! -f "$ENV_FILE" ]; then
        log_error ".env.production not found at $ENV_FILE"
        exit 1
    fi

    # Check Node.js version
    NODE_VERSION=$(node -v)
    log_info "Node.js version: $NODE_VERSION"

    # Check npm version
    NPM_VERSION=$(npm -v)
    log_info "npm version: $NPM_VERSION"

    log_success "Pre-deployment checks passed"
}

# ============================================
# Create directories
# ============================================
create_directories() {
    log_info "Creating application directories..."

    sudo mkdir -p "$APP_DIR"
    sudo mkdir -p "$LOG_DIR"
    sudo mkdir -p "$BACKUP_DIR"
    sudo mkdir -p "$APP_DIR/frontend/dist"

    sudo chown -R www-data:www-data "$APP_DIR"

    log_success "Directories created"
}

# ============================================
# Pull latest code
# ============================================
pull_latest_code() {
    log_info "Pulling latest code from GitHub..."

    cd "$APP_DIR"

    # Stash changes
    git stash

    # Pull latest
    git pull origin main

    # Restore .env if stashed
    git stash pop || true

    log_success "Code updated"
}

# ============================================
# Install dependencies
# ============================================
install_dependencies() {
    log_info "Installing dependencies..."

    cd "$APP_DIR"

    # Install Node modules
    npm install

    # Install workspace packages
    npm run install:workspaces || true

    log_success "Dependencies installed"
}

# ============================================
# Build application
# ============================================
build_application() {
    log_info "Building application..."

    cd "$APP_DIR"

    # Build frontend
    log_info "Building frontend..."
    npm run build:frontend

    # Build backend
    log_info "Building backend..."
    npm run build:backend

    log_success "Build completed"
}

# ============================================
# Database migration
# ============================================
run_migrations() {
    log_info "Running database migrations..."

    cd "$APP_DIR"

    # Generate migrations
    npm run db:generate

    # Run migrations
    npm run db:migrate

    log_success "Migrations completed"
}

# ============================================
# PM2 deployment
# ============================================
deploy_pm2() {
    log_info "Deploying with PM2..."

    cd "$APP_DIR"

    # Stop existing processes
    log_info "Stopping existing PM2 processes..."
    pm2 stop all || true
    pm2 delete all || true

    # Start services
    log_info "Starting PM2 services..."
    pm2 start ecosystem.config.js --env production

    # Save PM2 state
    pm2 save

    # Setup PM2 startup
    pm2 startup

    log_success "PM2 deployed"
}

# ============================================
# Nginx configuration
# ============================================
configure_nginx() {
    log_info "Configuring Nginx..."

    NGINX_CONFIG="/etc/nginx/sites-available/oneverso.com.br"
    NGINX_ENABLED="/etc/nginx/sites-enabled/oneverso.com.br"

    # Create Nginx config
    sudo tee "$NGINX_CONFIG" > /dev/null <<'EOF'
server {
    listen 80;
    server_name oneverso.com.br www.oneverso.com.br;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name oneverso.com.br www.oneverso.com.br;

    # SSL Configuration (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/oneverso.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/oneverso.com.br/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Frontend Static Files
    root /var/www/oneverso.com.br/frontend/dist;
    index index.html;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Frontend Routes
    location / {
        try_files $uri /index.html;
    }

    # Static Assets Cache
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # API tRPC Proxy
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 90;
        proxy_connect_timeout 90;
    }

    # Health Check
    location /health {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    # Logs
    access_log /var/log/nginx/oneverso_access.log;
    error_log /var/log/nginx/oneverso_error.log;
}
EOF

    # Enable site
    sudo ln -sf "$NGINX_CONFIG" "$NGINX_ENABLED"

    # Test and reload Nginx
    sudo nginx -t && sudo systemctl reload nginx

    log_success "Nginx configured"
}

# ============================================
# SSL Certificate (Let's Encrypt)
# ============================================
setup_ssl() {
    log_info "Setting up SSL certificate..."

    # Install certbot
    sudo apt-get update
    sudo apt-get install -y certbot python3-certbot-nginx

    # Generate certificate
    sudo certbot --nginx -d oneverso.com.br -d www.oneverso.com.br

    # Auto-renew
    sudo systemctl enable certbot.timer

    log_success "SSL certificate configured"
}

# ============================================
# Health check
# ============================================
health_check() {
    log_info "Running health checks..."

    # Check API
    sleep 5
    API_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health)

    if [ "$API_RESPONSE" = "200" ]; then
        log_success "API health check passed (HTTP $API_RESPONSE)"
    else
        log_warning "API health check failed (HTTP $API_RESPONSE)"
    fi

    # Check frontend
    FRONTEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://oneverso.com.br)

    if [ "$FRONTEND_RESPONSE" = "200" ]; then
        log_success "Frontend health check passed (HTTP $FRONTEND_RESPONSE)"
    else
        log_warning "Frontend health check failed (HTTP $FRONTEND_RESPONSE)"
    fi

    # Validate Open API discovery after deploy
    if [ -x "./scripts/check_openapi_release.sh" ]; then
        log_info "Validating Open API discovery stage..."
        ./scripts/check_openapi_release.sh || {
            log_error "Open API discovery validation failed after deploy"
            exit 1
        }
        log_success "Open API discovery validation passed"
    else
        log_warning "scripts/check_openapi_release.sh not found or not executable"
    fi

    # Check PM2 status
    pm2 list
}

# ============================================
# Backup (optional)
# ============================================
create_backup() {
    log_info "Creating backup..."

    BACKUP_NAME="backup_$(date +%Y%m%d_%H%M%S).tar.gz"

    tar -czf "$BACKUP_DIR/$BACKUP_NAME" \
        -C "$APP_DIR" \
        --exclude='node_modules' \
        --exclude='.git' \
        --exclude='logs' \
        .

    log_success "Backup created: $BACKUP_NAME"
}

# ============================================
# Main deployment
# ============================================
main() {
    echo "============================================"
    echo " MMN AI-to-AI Deployment Script"
    echo " Hostgator VPS - oneverso.com.br"
    echo "============================================"
    echo ""

    # Run deployment steps
    pre_deploy_checks
    create_directories
    pull_latest_code
    install_dependencies
    build_application
    run_migrations
    create_backup
    configure_nginx
    setup_ssl
    deploy_pm2
    health_check

    echo ""
    echo "============================================"
    log_success "Deployment completed successfully!"
    echo "============================================"
    echo ""
    echo "Access your application at: https://oneverso.com.br"
    echo "PM2 Status: pm2 list"
    echo "Logs: pm2 logs"
    echo ""
}

# ============================================
# Execute
# ============================================
main "$@"