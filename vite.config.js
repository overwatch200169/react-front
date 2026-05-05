import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // 根据模式加载对应的 .env 文件
  const env = loadEnv(mode, process.cwd(), '')

  // 判断是否为生产环境
  const isProduction = mode === 'production'

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: isProduction ? {} : {
        '/api': {
          target: env.VITE_API_TARGET || 'http://localhost:8000',
          changeOrigin: true,
          secure: false
        }
      }
    },
    build: {
      outDir: 'dist',
      sourcemap: !isProduction
    }
  }
})
