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
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return id.toString().split('node_modules/')[1].split('/')[0].toString();
            }
          }
        }
      }
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
