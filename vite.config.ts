import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carrega variáveis de ambiente baseadas no modo (development/production)
  // O terceiro argumento '' diz para carregar todas as variáveis, não apenas as com prefixo VITE_
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Isso permite que o código continue usando process.env.API_KEY
      // mesmo sendo um app Vite (que normalmente usaria import.meta.env)
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  }
})