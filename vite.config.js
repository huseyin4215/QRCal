import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
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
