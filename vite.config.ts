import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const DEFAULT_BASE = '/';

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  const base = isProduction ? (process.env.VITE_BASE_PATH ?? DEFAULT_BASE) : '/';

  return {
    base,
    plugins: [react(), tailwindcss()],
    build: {
      sourcemap: false,
      target: 'es2022',
      chunkSizeWarningLimit: 700,
      rollupOptions: {
        onwarn(warning, defaultHandler) {
          if (warning.code === 'INVALID_ANNOTATION') return;
          defaultHandler(warning);
        },
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-zod': ['zod'],
          },
        },
      },
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./tests/setup.ts'],
      include: ['tests/**/*.test.{ts,tsx}'],
      css: false,
      restoreMocks: true,
      pool: 'forks',
    },
  };
});
