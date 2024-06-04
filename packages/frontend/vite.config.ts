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
          experimentalMinChunkSize: 10000,
          manualChunks: {
            parse: ['parse'],
            ol: ['ol'],
            react: ['react', 'react-dom'],
            lodash: ['lodash-es'],
            mobx: ['mobx', 'mobx-keystone'],
          },
          plugins: [terser()]
        }
      }
    },
    optimizeDeps: {
      include: ['parse', 'ol', 'react', 'react-dom', 'lodash-es', 'mobx', 'mobx-keystone'],
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
        // parse: path.resolve(__dirname, './node_modules/parse/dist/parse.min.js')
      },
    },
  };
});
