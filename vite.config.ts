
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    server: {
      host: "::",
      port: 8080,
      allowedHosts: [
        'localhost',
        '*.lovableproject.com',
        'dff52ca3-4a2a-4126-9988-04d619649a62.lovableproject.com'
      ]
    },
    plugins: [
      react(),
      mode === 'development' &&
      componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    // Pass env variables to the client
    define: {
      'import.meta.env.VITE_FRAUD_API_URL': JSON.stringify(env.VITE_FRAUD_API_URL || 'http://localhost:5000'),
    }
  };
});
