import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        login: resolve(__dirname, 'login.html'),
        dashboard: resolve(__dirname, 'dashboard.html'),
        customers: resolve(__dirname, 'customers.html'),
        customer_detail: resolve(__dirname, 'customer-detail.html'),
        leads: resolve(__dirname, 'leads.html'),
        tasks: resolve(__dirname, 'tasks.html'),
        payments: resolve(__dirname, 'payments.html'),
        settings: resolve(__dirname, 'settings.html'),
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
});
