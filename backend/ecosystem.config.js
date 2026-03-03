/**
 * PM2 Ecosystem Configuration
 * ===========================
 * Run in production with:
 *   pm2 start ecosystem.config.js --env production
 *
 * Other useful commands:
 *   pm2 status           — show all processes
 *   pm2 logs             — view live logs
 *   pm2 restart all      — restart all processes
 *   pm2 stop all         — stop all processes
 *   pm2 delete all       — remove all processes
 *   pm2 monit            — open live monitoring dashboard
 *
 * Install PM2 globally if not yet installed:
 *   npm install -g pm2
 *
 * Build before starting production:
 *   npm run build && pm2 start ecosystem.config.js --env production
 */

module.exports = {
  apps: [
    {
      name: 'qc-berkas-backend',
      script: 'dist/main.js',
      cwd: __dirname,

      // Cluster mode: spawn one process per CPU core
      // This multiplies concurrent request capacity by number of CPU cores
      instances: 'max', // Use all available CPU cores
      exec_mode: 'cluster', // Enable load balancing between instances

      // Restart configuration
      watch: false, // Don't watch files in production
      max_memory_restart: '512M', // Restart if memory exceeds 512MB

      // Environment variables for production
      env_production: {
        NODE_ENV: 'production',
        APP_PORT: 3001,
      },

      // Environment variables for development (single instance)
      env_development: {
        NODE_ENV: 'development',
        APP_PORT: 3001,
        instances: 1,
        exec_mode: 'fork',
      },

      // Logging
      out_file: './logs/pm2-out.log',
      error_file: './logs/pm2-error.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

      // Graceful shutdown: wait for in-flight requests to complete
      kill_timeout: 10000, // 10 seconds to finish current requests before force kill
      wait_ready: true, // Wait for app to signal 'ready' event
      listen_timeout: 10000,
    },
  ],
};
