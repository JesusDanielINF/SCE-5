import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  optimizeDeps: {
    entries: [
      path.resolve(__dirname, "client/src/main.tsx"),
    ],
    include: [
      'react',
      'react-dom',
      'zod',
      '@tanstack/react-query',
      'wouter',
      'use-sync-external-store',
      '@radix-ui/react-avatar',
      // Agrega más si necesitas
    ],
    exclude: [
      'drizzle-zod',
      'drizzle-orm',
    ],
    force: true,
    esbuildOptions: {
      target: 'es2020',
      sourcemap: false,
    },
  },
  plugins: [
    react(),
    // Si necesitas Tailwind, descomenta: import tailwindcss from '@tailwindcss/vite'; y agrega: tailwindcss(),
  ],
  resolve: {
    conditions: ['browser', 'development', 'import', 'default'],
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
    dedupe: ['use-sync-external-store', 'react', 'react-dom', 'wouter'],
  },
  root: path.resolve(__dirname, "client"),
  base: './',
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      input: path.resolve(__dirname, "client/src/main.tsx"),
      output: {
        sourcemapExcludeSources: true,
        manualChunks: (id: string) => {
          if (id.includes('node_modules/@radix-ui')) return 'radix-ui';
          if (id.includes('node_modules/@tanstack')) return 'react-query';
          if (id.includes('node_modules/wouter')) return 'wouter';
          if (id.includes('node_modules/recharts')) return 'recharts';
        },
        sourcemapPathTransform: (relativeSource: string) => {
          if (relativeSource.includes('node_modules')) {
            return relativeSource.replace(/node_modules\/[^\/]+\/src/, '');
          }
          return relativeSource;
        },
      },
      onwarn(warning: any, warn: (warning: any) => void) {
        if (warning.code === 'SOURCEMAP_BROKEN' || 
            warning.message.includes('sourcemap') || 
            warning.message.includes('drizzle-zod') ||
            warning.message.includes('missing source files')) {
          return;
        }
        warn(warning);
      },
    },
  },
  //La sección server se ha comentado porque no es necesaria en Vercel.
   server: {
    fs: {
      strict: false,
      deny: ["**/.*"],
      allow: [
        '..', 
        '/@fs', 
         '/home', 
         path.resolve(__dirname, 'node_modules')
      ],
     },
     watch: {
       ignored: ['**/node_modules/**', '**/.git/**'],
    },
    proxy: {
       '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
         rewrite: (path: string) => path.replace(/^\/api/, ''),
       },
     },
  hmr: {
   port: 443,
host: 'localhost',
 },
  },
  esbuild: {
    sourcemap: false,
  },
  css: {
    devSourcemap: false,
  },
  envPrefix: 'VITE_',
  define: {
    global: 'globalThis',
  },
  logLevel: 'info',
});
