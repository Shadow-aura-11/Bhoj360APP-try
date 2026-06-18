import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: process.env.GITHUB_PAGES === 'true' ? '/Bhoj360-react/' : '/',
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:4000',
      '/r': {
        target: 'http://localhost:4000',
        ws: true,
        bypass: (req) => {
          if (req.headers.accept && req.headers.accept.includes('text/html')) {
            return '/index.html';
          }
        },
      },
      '/t': {
        target: 'http://localhost:4000',
        ws: true,
        bypass: (req) => {
          if (req.headers.accept && req.headers.accept.includes('text/html')) {
            return '/index.html';
          }
        },
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            if (id.includes('react-router-dom') || id.includes('react-router') || id.includes('@remix-run')) {
              return 'vendor-router';
            }
            if (id.includes('recharts') || id.includes('d3-') || id.includes('lodash') || id.includes('internmap')) {
              return 'vendor-charts';
            }
            if (id.includes('jszip') || id.includes('file-saver')) {
              return 'vendor-zip';
            }
            return 'vendor';
          }
        }
      }
    }
  }
});

