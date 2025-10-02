import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          (await import("@replit/vite-plugin-runtime-error-modal")).default(),
          (await import("@replit/vite-plugin-cartographer")).cartographer(),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/client"),
    emptyOutDir: true,
    // Production optimizations
    minify: 'esbuild', // Use esbuild instead of terser for faster builds
    rollupOptions: {
      output: {
        // Code splitting for better caching
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['@tanstack/react-query'],
          ui: ['lucide-react', '@radix-ui/react-dialog', '@radix-ui/react-alert-dialog'],
        },
      },
    },
    // Generate source maps for production debugging
    sourcemap: process.env.NODE_ENV === 'production' ? 'hidden' : true,
    // Chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // CSS optimization
    cssCodeSplit: true,
    // Asset optimization
    assetsInlineLimit: 4096, // 4kb
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
