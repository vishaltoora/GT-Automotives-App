# GT Automotive Development Server Guide

## Quick Start - Recommended Method

For the most stable development experience with automatic restart on crashes:

```bash
# Option 1: Use PM2 (Most Stable - Recommended)
yarn dev:pm2

# Option 2: Interactive menu to choose startup method
yarn dev:menu

# Option 3: Basic persistent script
yarn dev:persistent
```

## Available Startup Methods

### 1. PM2 Process Manager (Recommended) ✅
**Best for:** Long development sessions, stability, automatic restarts

```bash
yarn dev:pm2
```

Features:
- Automatically restarts crashed servers
- Provides detailed logs and monitoring
- Keeps servers running in background
- Professional process management

PM2 Commands:
```bash
yarn pm2:status    # Check server status
yarn pm2:logs      # View real-time logs
yarn pm2:restart   # Restart all servers
yarn pm2:stop      # Stop all servers
```

### 2. Persistent Script
**Best for:** Simple auto-restart without additional dependencies

```bash
yarn dev:persistent
```

Features:
- Auto-restarts crashed servers
- Simple bash script
- No additional dependencies
- Shows combined logs

### 3. Standard Nx (Default)
**Best for:** Quick development, debugging

```bash
yarn dev
```

Features:
- Standard Nx development server
- Good for debugging
- May stop on errors

## Server URLs

- **Frontend:** http://localhost:4200
- **Backend API:** http://localhost:3000/api

## Troubleshooting

### If servers won't start:

1. **Kill existing processes:**
```bash
# Kill processes on specific ports
lsof -ti:4200 | xargs kill -9
lsof -ti:3000 | xargs kill -9
```

2. **Clear cache and reinstall:**
```bash
yarn nx reset
rm -rf node_modules
yarn install --ignore-engines
```

3. **Start with PM2 for stability:**
```bash
yarn dev:pm2
```

### If you see "Site can't be reached":

This usually means a server crashed. Our new setup prevents this:

1. **Use PM2 method** - It automatically restarts crashed servers
2. **Check logs** - `yarn pm2:logs` to see what's happening
3. **Restart if needed** - `yarn pm2:restart`

### Hot Reload Issues:

The Vite config has been updated with better hot-reload settings:
- Uses polling for file changes
- Dedicated HMR port (4201)
- More responsive to changes

## Benefits of New Setup

1. **Stability** - Servers automatically restart if they crash
2. **Visibility** - Clear logs show what's happening
3. **Flexibility** - Multiple startup options for different needs
4. **Persistence** - Servers keep running during code changes
5. **Hot Reload** - Changes apply without manual restart

## Recommended Workflow

1. Start servers with PM2:
   ```bash
   yarn dev:pm2
   ```

2. Make your code changes - servers will hot-reload

3. If you need to see logs:
   ```bash
   yarn pm2:logs
   ```

4. When done for the day:
   ```bash
   yarn pm2:stop
   ```

## Notes

- PM2 keeps servers running even if terminal closes
- Logs are saved in the `logs/` directory
- Servers auto-restart up to 10 times if they crash
- Hot-reload is enabled for both frontend and backend