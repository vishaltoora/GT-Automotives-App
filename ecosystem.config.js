// PM2 Configuration for GT Automotive Development
// This configuration ensures servers stay running and auto-restart on crashes

module.exports = {
  apps: [
    {
      name: 'gt-frontend',
      script: 'npx',
      args: 'vite --host --port 4200',
      cwd: './apps/webApp',
      watch: false, // Vite has its own watch
      env: {
        NODE_ENV: 'development',
        PORT: 4200,
      },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      time: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
    },
    {
      name: 'gt-backend',
      script: 'npm',
      args: 'run start:dev',
      cwd: './server',
      watch: false, // NestJS has its own watch
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      time: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
    },
  ],
};