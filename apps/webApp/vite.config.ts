/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/apps/webApp',
  server: {
    port: 4500,
    host: 'localhost',
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
    hmr: {
      overlay: true,
      // Remove separate HMR port to use WebSocket on same port
    },
    watch: {
      usePolling: true,
      interval: 100,
    },
  },
  preview: {
    port: 4500,
    host: 'localhost',
  },
  plugins: [react()],
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },
  resolve: {
    conditions: ['development', 'import', 'module', 'browser', 'default'],
    // Module resolution handled by symlinks in node_modules
    alias: {
      // Force Vite to use source files instead of dist (CommonJS) for shared library
      '@gt-automotive/data': path.resolve(__dirname, '../../libs/data/src/index.ts'),
    },
  },
  build: {
    outDir: './dist',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
}));
