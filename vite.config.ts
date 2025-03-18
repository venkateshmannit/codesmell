import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['react-draggable', 'recharts'],
    exclude: ['lucide-react'],
  },
  resolve: {
    alias: {
      '@': '/src', // Optional alias for cleaner imports
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
    hmr: {
      overlay: false, // Disables the overlay error display
    },
  },
});
