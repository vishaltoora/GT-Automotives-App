/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import compression from 'vite-plugin-compression';

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/apps/webApp',
  
  plugins: [
    react(),
    // Gzip compression for better performance
    compression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
    // Bundle analyzer (optional)
    visualizer({
      filename: './dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  
  build: {
    outDir: './dist',
    emptyOutDir: true,
    reportCompressedSize: true,
    sourcemap: false, // Disable sourcemaps in production
    
    // Optimize chunk splitting for CDN
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'mui-vendor': ['@mui/material', '@mui/icons-material', '@mui/x-data-grid'],
          'clerk-vendor': ['@clerk/clerk-react'],
          'utils': ['axios', 'date-fns', 'react-hook-form'],
        },
        // Asset naming for better caching
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/woff|woff2|eot|ttf|otf/i.test(ext)) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
      },
    },
    
    // Minification settings
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    
    // Performance optimizations
    chunkSizeWarningLimit: 1000,
    cssCodeSplit: true,
    cssMinify: true,
  },
  
  // Define environment variables
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  
  // Resolve aliases (if needed)
  resolve: {
    alias: {
      '@': '/src',
    },
  },
}))