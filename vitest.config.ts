/// <reference types="vitest" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [tsconfigPaths(), react()],
    test: {
        include: ['**/src/**/*.{test,spec}.{ts,mts,cts,tsx}'],
        exclude: ['**/node_modules/**', '**/tsc-out/**'],
    },
})
