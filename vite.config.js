import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 如果你的 GitHub 仓库名不是 weipan-skill，把 base 改成 /你的仓库名/
export default defineConfig({
  plugins: [react()],
  base: '/weipan-skill/',
})
