import react from '@vitejs/plugin-react';
import * as path from "path";
import { terser } from "rollup-plugin-terser";
import { defineConfig } from 'vite';
import checker from "vite-plugin-checker";
import viteTsconfigPaths from 'vite-tsconfig-paths';
// import { analyzer } from "vite-bundle-analyzer";

export default defineConfig(() => {
  return {
    build: {
      rollupOptions: {
        output: {
          experimentalMinChunkSize: 20000,
          manualChunks: {
            ol: ['ol'],
            parse: ['parse'],
            react: ['react', 'react-dom'],
            zustand: ['zustand'],
          },
          plugins: [terser()]
        }
      }
    },
    optimizeDeps: {
      include: ['ol', 'react', 'react-dom', 'zustand', 'parse'],
    },
    plugins: [
      react(),
      viteTsconfigPaths(),
      checker({
        eslint: {
          lintCommand: 'eslint "./src/**/*.{ts,tsx}"',
          useFlatConfig: true,
        },
        typescript: true,
      }),
      // analyzer(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '/src'),
        parse: path.resolve(__dirname, '../../node_modules/parse/dist/parse.min.js')
      },
    },
  };
});
