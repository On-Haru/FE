import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: '하루온',
        short_name: '하루온',
        description: '하루온 - 복약 관리 앱',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#36C8B7',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://api.onharu.my',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path, // 경로 그대로 전달
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // CORS 관련 헤더 제거 (프록시가 서버로 요청할 때는 불필요)
            proxyReq.removeHeader('origin');
            proxyReq.removeHeader('referer');

            console.log('Sending Request to the Target:', req.method, req.url);
            console.log('Request Headers:', proxyReq.getHeaders());
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            // CORS 헤더 제거 (프록시 응답에는 불필요)
            delete proxyRes.headers['access-control-allow-origin'];
            delete proxyRes.headers['access-control-allow-credentials'];
            delete proxyRes.headers['access-control-allow-methods'];
            delete proxyRes.headers['access-control-allow-headers'];

            console.log(
              'Received Response from the Target:',
              proxyRes.statusCode,
              req.url
            );
            console.log('Response Headers:', proxyRes.headers);
          });
        },
      },
    },
  },
});
