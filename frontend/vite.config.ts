import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { existsSync, readFileSync } from 'node:fs';

let version = '1.0.0';

try {
  const versionJsonPath = path.resolve(__dirname, '../version.json');
  if (existsSync(versionJsonPath)) {
    const versionData = JSON.parse(readFileSync(versionJsonPath, 'utf-8'));
    if (versionData.version) {
      version = versionData.version;
    }
  }
} catch (error) {
  console.warn('Could not read version.json, using default version:', error);
}

export default defineConfig({
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
  resolve: {
    alias: {
      '@rnv24/shared': path.resolve(__dirname, '../shared/src/index.ts'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
