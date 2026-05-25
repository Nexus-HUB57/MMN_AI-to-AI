// ============================================
// MMN AI-to-AI — PM2 Ecosystem Configuration
// Deploy Hostgator VPS - oneverso.com.br
// ============================================

module.exports = {
  apps: [
    // ========================================
    // API Backend (tRPC)
    // ========================================
    {
      name: 'mmn-api',
      script: 'backend/dist/index.js',
      cwd: './',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/api-error.log',
      out_file: './logs/api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      // Graceful shutdown
      kill_timeout: 5000,
      shutdown_with_message: true
    },

    // ========================================
    // Worker: Content Generation
    // ========================================
    {
      name: 'mmn-worker-content',
      script: 'backend/dist/workers/contentGenerationWorker.js',
      cwd: './',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        QUEUE_NAME: 'content-generation'
      },
      error_file: './logs/worker-content-error.log',
      out_file: './logs/worker-content-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      kill_timeout: 5000,
      shutdown_with_message: true
    },

    // ========================================
    // Worker: Commission Processing
    // ========================================
    {
      name: 'mmn-worker-commissions',
      script: 'backend/dist/workers/commissionProcessingWorker.js',
      cwd: './',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        QUEUE_NAME: 'commission-processing'
      },
      error_file: './logs/worker-commissions-error.log',
      out_file: './logs/worker-commissions-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      kill_timeout: 5000,
      shutdown_with_message: true
    },

    // ========================================
    // Worker: Marketplace Sync
    // ========================================
    {
      name: 'mmn-worker-marketplace',
      script: 'backend/dist/workers/marketplaceSyncWorker.js',
      cwd: './',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        QUEUE_NAME: 'marketplace-sync'
      },
      error_file: './logs/worker-marketplace-error.log',
      out_file: './logs/worker-marketplace-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      kill_timeout: 5000,
      shutdown_with_message: true
    },

    // ========================================
    // Worker: Order Processing
    // ========================================
    {
      name: 'mmn-worker-orders',
      script: 'backend/dist/workers/orderProcessingWorker.js',
      cwd: './',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        QUEUE_NAME: 'order-processing'
      },
      error_file: './logs/worker-orders-error.log',
      out_file: './logs/worker-orders-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      kill_timeout: 5000,
      shutdown_with_message: true
    }
  ],

  // ============================================
  // Deployment Configuration
  // ============================================
  deploy: {
    production: {
      user: 'ssh_user',
      host: 'your-server-ip',
      port: 22,
      ref: 'origin/main',
      repo: 'git@github.com:Nexus-HUB57/MMN_AI-to-AI.git',
      path: '/var/www/oneverso.com.br',
      'pre-deploy-local': '',
      'post-deploy': 'npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};

// ============================================
// Common PM2 Commands for Reference
// ============================================
/*
 * pm2 start ecosystem.config.js --env production
 * pm2 stop mmn-api
 * pm2 restart mmn-api
 * pm2 restart all
 * pm2 delete all
 * pm2 list
 * pm2 logs
 * pm2 monit
 * pm2 save
 * pm2 startup
 *
 * Logs:
 * pm2 logs --lines 100 --nostream
 * pm2 logs mmn-api --err --lines 50
 */