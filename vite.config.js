import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// на github pages сайт живёт в /ritm/, а локально в корне
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/ritm/' : '/',
  plugins: [vue()]
}))
