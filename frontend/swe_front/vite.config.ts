import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    // ❌ Comment this out for now!
    // headers: {
    //   "Content-Security-Policy": "...your CSP here..."
    // }
  }
})
