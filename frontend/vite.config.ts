import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import * as path from "path";
import checker from "vite-plugin-checker";

export default defineConfig(() => {
  return {
    build: {
      rollupOptions: {
        output:{
          experimentalMinChunkSize: 10000,
          manualChunks: {
            parse: ['parse'],
            ol: ['ol'],
            react: ['react','react-dom'],
          }
        }
      }
    },
    optimizeDeps: {
      include: ['parse', 'ol', 'react', 'react-dom'],
    },
    plugins: [
      react({
      babel: {
        plugins: [
          ["@babel/plugin-proposal-decorators", { legacy: true }],
          [
            "@babel/plugin-proposal-class-properties",
            { loose: true },
          ],
          ["@emotion/babel-plugin"]
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
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '/src'),
        parse: path.resolve(__dirname, './node_modules/parse/dist/parse.min.js')
      },
    },
  };
});
