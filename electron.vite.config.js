import { sentryVitePlugin } from '@sentry/vite-plugin';
import { resolve } from 'path';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';
require('dotenv').config();

const { SENTRY_AUTH_TOKEN, SENTRY_ORG, SENTRY_PROJECT } = process.env;

export default defineConfig({
  main: {
    plugins: [
      externalizeDepsPlugin(),
      sentryVitePlugin({
        org: SENTRY_ORG,
        project: SENTRY_PROJECT,
        authToken: SENTRY_AUTH_TOKEN,
        telemetry: false
      })
    ],
    build: {
      sourcemap: true
    }
  },

  preload: {
    plugins: [
      externalizeDepsPlugin(),
      sentryVitePlugin({
        org: SENTRY_ORG,
        project: SENTRY_PROJECT,
        authToken: SENTRY_AUTH_TOKEN,
        telemetry: false
      })
    ],
    build: {
      sourcemap: true
    }
  },

  renderer: {
    build: {
      sourcemap: true
    },
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [
      react(),
      sentryVitePlugin({
        org: SENTRY_ORG,
        project: SENTRY_PROJECT,
        authToken: SENTRY_AUTH_TOKEN,
        telemetry: false
      })
    ],
    css: {
      modules: {}
    }
  }
});
