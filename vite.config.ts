import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Charger les variables d'environnement
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [
      react(),
      nodePolyfills({
        include: ['fs', 'path', 'os', 'crypto', 'stream', 'buffer'],
        globals: {
          Buffer: true,
          global: true,
          process: true,
        },
      }),
    ],
    
    // Configuration du serveur de développement
    server: {
      port: 5173,
      strictPort: true,
      host: true,
      hmr: {
        protocol: 'ws',
        host: 'localhost',
        port: 5173,
        overlay: true, // Afficher les erreurs dans le navigateur
      },
      watch: {
        usePolling: true, // Meilleure détection des changements sur certains systèmes
      },
      cors: true, // Activer CORS
    },

    // Configuration de la build
    build: {
      outDir: 'dist',
      sourcemap: true, // Générer des sourcemaps pour le debugging
      minify: 'terser', // Utiliser Terser pour une meilleure minification
      terserOptions: {
        compress: {
          drop_console: mode === 'production', // Supprimer les console.log en production
          drop_debugger: mode === 'production',
        },
      },
      rollupOptions: {
        output: {
          manualChunks: {
            // Séparer les dépendances en chunks
            vendor: ['react', 'react-dom', 'react-router-dom'],
            ui: ['@heroicons/react', 'lucide-react'],
          },
        },
      },
    },

    // Optimisations des dépendances
    optimizeDeps: {
      exclude: ['lucide-react'],
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@heroicons/react',
      ],
    },

    // Résolution des alias pour les imports
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@pages': path.resolve(__dirname, './src/pages'),
        '@services': path.resolve(__dirname, './src/services'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@context': path.resolve(__dirname, './src/context'),
        '@utils': path.resolve(__dirname, './src/utils'),
        '@types': path.resolve(__dirname, './src/types'),
        '@styles': path.resolve(__dirname, './src/styles'),
      },
    },

    // Configuration CSS
    css: {
      devSourcemap: true, // Sourcemaps pour le CSS en développement
      modules: {
        localsConvention: 'camelCase', // Permettre l'utilisation de camelCase pour les classes CSS modules
      },
    },

    // Configuration des variables d'environnement
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      __APP_ENV__: JSON.stringify(mode),
    },
  };
});
