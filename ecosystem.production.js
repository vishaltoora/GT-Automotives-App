module.exports = {
  apps: [
    {
      name: 'gt-automotive-backend',
      script: '/home/ubuntu/GT-Automotives-App/server/main.js',
      cwd: '/home/ubuntu/GT-Automotives-App/server',
      instances: 1,
      exec_mode: 'fork',
      env_file: '/home/ubuntu/GT-Automotives-App/.env',
      error_file: '/home/ubuntu/logs/backend-err.log',
      out_file: '/home/ubuntu/logs/backend-out.log',
      time: true,
      autorestart: true,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    },
    {
      name: 'gt-automotive-frontend',
      script: 'serve',
      args: ['-s', '/home/ubuntu/GT-Automotives-App/frontend', '-l', '4200'],
      cwd: '/home/ubuntu/GT-Automotives-App',
      instances: 1,
      exec_mode: 'fork',
      env: { 
        NODE_ENV: 'production' 
      },
      error_file: '/home/ubuntu/logs/frontend-err.log',
      out_file: '/home/ubuntu/logs/frontend-out.log',
      time: true,
      autorestart: true,
      max_memory_restart: '200M'
    }
  ]
};