import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Build version plugin - generates version.json for cache busting
const versionPlugin = () => ({
  name: 'version-plugin',
  closeBundle() {
    const version = Date.now().toString(36)
    fs.writeFileSync(
      path.resolve(__dirname, 'dist/version.json'),
      JSON.stringify({ v: version, t: Date.now() })
    )
    console.log(`✅ version.json created (v: ${version})`)
  }
})

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), versionPlugin()],
  build: {
    // Use esbuild for faster minification (terser is slower)
    minify: 'esbuild',
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Optimize chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'pdf-vendor': ['pdfmake', 'jspdf', 'jspdf-autotable'],
          'map-vendor': ['leaflet', 'react-leaflet'],
        },
      },
    },
    // Increase memory limit for build
    target: 'es2015',
  },
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom')
    }
  },
  server: {
    port: 8081,          // Sen özellikle 8081 istiyorsun
    strictPort: true,    // Eğer 8081 meşgulse hata versin
    host: 'localhost',   // veya '0.0.0.0' yazabilirsin
    hmr: {
      protocol: 'ws',    // HMR websocket'i ws:// üzerinden çalışsın
      host: 'localhost',
      port: 8081,
      clientPort: 8081,  // Brave bazen farklı port deniyor → sabitle
      overlay: true
    },
    headers: {
      'Cache-Control': 'no-store', // Brave’in client.js dosyasını cache’lemesini engeller
    }
  },
  optimizeDeps: {
    force: true // her start'ta yeniden derle, cache kullanma
  }
})
