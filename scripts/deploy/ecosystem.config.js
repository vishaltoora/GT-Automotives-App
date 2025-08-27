module.exports = {
  apps: [
    {
      name: 'gt-automotive-backend',
      script: 'dist/main.js',
      cwd: '/home/ubuntu/GT-Automotives-App/server',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '/home/ubuntu/logs/backend-err.log',
      out_file: '/home/ubuntu/logs/backend-out.log',
      log_file: '/home/ubuntu/logs/backend-combined.log',
      time: true,
      max_restarts: 3,
      restart_delay: 5000,
      watch: false,
      ignore_watch: ['logs', 'node_modules'],
      
      // Health monitoring
      min_uptime: '10s',
      max_memory_restart: '300M',
      
      // Advanced settings
      kill_timeout: 5000,
      listen_timeout: 3000,
      
      // Environment specific settings
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    },
    {
      name: 'gt-automotive-frontend',
      script: 'serve',
      args: '-s /home/ubuntu/GT-Automotives-App/frontend -l 4200 -C',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production'
      },
      error_file: '/home/ubuntu/logs/frontend-err.log',
      out_file: '/home/ubuntu/logs/frontend-out.log',
      log_file: '/home/ubuntu/logs/frontend-combined.log',
      time: true,
      max_restarts: 3,
      restart_delay: 5000,
      
      // Health monitoring
      min_uptime: '10s',
      max_memory_restart: '150M',
      
      // Advanced settings
      kill_timeout: 5000,
      
      env_production: {
        NODE_ENV: 'production'
      }
    }
  ]
};