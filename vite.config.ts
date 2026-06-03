import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@game2048': path.resolve(__dirname, '2048/src'),
      '@gomoku': path.resolve(__dirname, 'gomoku/src'),
      '@sudoku': path.resolve(__dirname, 'sudoku/src'),
    },
  },
})
