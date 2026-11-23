import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: ['sb-635cqdib60ms.vercel.run', '.vercel.run', '.vercel.app']
  },
  preview: {
    host: true,
    allowedHosts: ['sb-635cqdib60ms.vercel.run', '.vercel.run', '.vercel.app']
  }
});
