import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: { port: 5174 },
  resolve: {
    alias: {
      '@game2048': path.resolve(__dirname, '2048/src'),
      '@gomoku': path.resolve(__dirname, 'gomoku/src'),
      '@sudoku': path.resolve(__dirname, 'sudoku/src'),
      '@linkgame': path.resolve(__dirname, 'linkgame/src'),
      '@matchgame': path.resolve(__dirname, 'matchgame/src'),
      '@klotski': path.resolve(__dirname, 'klotski/src'),
      '@flowgame': path.resolve(__dirname, 'flowgame/src'),
      '@nonogram': path.resolve(__dirname, 'nonogram/src'),
      '@tetris': path.resolve(__dirname, 'tetris/src'),
      '@cainizi': path.resolve(__dirname, 'cainizi'),
      '@dengmi': path.resolve(__dirname, 'dengmi'),
      '@shici': path.resolve(__dirname, 'shici'),
      '@shicitian': path.resolve(__dirname, 'shicitian'),
      '@naojin': path.resolve(__dirname, 'naojin'),
      '@xiehouyu': path.resolve(__dirname, 'xiehouyu'),
      '@jungle': path.resolve(__dirname, 'jungle/src'),
      '@ludo': path.resolve(__dirname, 'ludo/src'),
      '@checkers': path.resolve(__dirname, 'checkers/src'),
      '@chess': path.resolve(__dirname, 'chess/src'),
      '@junqi': path.resolve(__dirname, 'junqi/src'),
      '@go': path.resolve(__dirname, 'go/src'),
      '@wordcore': path.resolve(__dirname, 'core'),
    },
    dedupe: ['react', 'react-dom'],
  },
})