import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import * as path from "path";
import checker from "vite-plugin-checker";
import { terser } from "rollup-plugin-terser";
// import { analyzer } from "vite-bundle-analyzer";

export default defineConfig(() => {
  return {
    build: {
      rollupOptions: {
        output: {
          experimentalMinChunkSize: 20000,
          manualChunks: {
            ol: ['ol'],
            react: ['react', 'react-dom'],
            mobx: ['mobx', 'mobx-keystone'],
            parse: ['parse'],
          },
          plugins: [terser()]
        }
      }
    },
    optimizeDeps: {
      include: ['ol', 'react', 'react-dom', 'mobx', 'mobx-keystone', 'parse'],
    },
    plugins: [
      react({
        babel: {
          plugins: [
            ["@babel/plugin-proposal-decorators", { legacy: true }],
            [
              "@babel/plugin-transform-class-properties",
              { loose: true },
            ],
          ],
        },
      }),
      viteTsconfigPaths(),
      checker({
        typescript: true,
        eslint: {
          lintCommand: 'eslint "./src/**/*.{ts,tsx}"',
        },
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
