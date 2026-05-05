import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [vue()],
    server: {
      proxy: env.HA_URL ? {
        '/ha-proxy': {
          target: env.HA_URL,
          changeOrigin: true,
          rewrite: path => path.replace(/^\/ha-proxy/, ''),
        },
      } : undefined,
    },
  }
})
