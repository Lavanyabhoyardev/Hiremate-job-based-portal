import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react()
  ],
  server: {
    port: 3000,
    // Fail loudly instead of silently grabbing 3001 (JobClaw) or 3002 (HireMate),
    // which would break the "Explore Jobs" / "Launch JobClaw" redirects.
    strictPort: true
  }
})
