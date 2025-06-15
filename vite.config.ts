
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false, // Disable error overlay to prevent crashes
    },
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger({
      // Optimize tagger configuration
      exclude: [/node_modules/], // Exclude node_modules
      include: [/\.tsx?$/], // Only tag TypeScript/React files
      minify: true, // Reduce metadata size
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-select', '@radix-ui/react-toast'],
        },
      },
    },
  },
  optimizeDeps: {
    exclude: ['lovable-tagger'], // Exclude from pre-bundling to avoid conflicts
  },
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }, // Suppress common warnings
  },
}));
