import { useEffect, useCallback, useRef } from 'react'
import { useGame } from './hooks/useGame'
import { usePersistence } from './hooks/usePersistence'
import { mapKeyToDirection, getSwipeDirection } from './utils/input'
import { DIFFICULTY_CONFIG } from './core/config'
import Header from './components/Header'
import ScoreBoard from './components/ScoreBoard'
import GameBoard from './components/GameBoard'
import EraseMechanism from './components/EraseMechanism'
import GameOverOverlay from './components/GameOverOverlay'
import GameRules from './components/GameRules'
import './App.css'

function App() {
  const { state, move, newGame, eraseTile, setDifficulty, activateErase, exitEraseMode } = useGame()
  const { highScore, updateHighScore } = usePersistence(state.difficulty)
  const touchRef = useRef({ startX: 0, startY: 0 })
  const mouseRef = useRef({ startX: 0, startY: 0, isDown: false })
  const config = DIFFICULTY_CONFIG[state.difficulty]

  useEffect(() => {
    if (state.score > 0) updateHighScore(state.score)
  }, [state.score, updateHighScore])

  const handleKey = useCallback((e: KeyboardEvent) => {
    const dir = mapKeyToDirection(e.key)
    if (dir) {
      e.preventDefault()
      move(dir)
    }
  }, [move])

  const handleTouchStart = useCallback((e: TouchEvent) => {
    touchRef.current = { startX: e.touches[0].clientX, startY: e.touches[0].clientY }
  }, [])

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchRef.current.startX
    const dy = e.changedTouches[0].clientY - touchRef.current.startY
    const dir = getSwipeDirection(dx, dy)
    if (dir) move(dir)
  }, [move])

  const handleMouseDown = useCallback((e: MouseEvent) => {
    mouseRef.current = { startX: e.clientX, startY: e.clientY, isDown: true }
  }, [])

  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (!mouseRef.current.isDown) return
    mouseRef.current.isDown = false
    const dx = e.clientX - mouseRef.current.startX
    const dy = e.clientY - mouseRef.current.startY
    const dir = getSwipeDirection(dx, dy)
    if (dir) move(dir)
  }, [move])

  useEffect(() => {
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleKey])

  useEffect(() => {
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchend', handleTouchEnd, { passive: true })
    return () => {
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchEnd])

  useEffect(() => {
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [handleMouseDown, handleMouseUp])

  const handleNewGame = useCallback(() => {
    newGame()
  }, [newGame])

  const handleDifficultyChange = useCallback((d: typeof state.difficulty) => {
    setDifficulty(d)
  }, [setDifficulty])

  const handleCellClick = useCallback((row: number, col: number) => {
    if (state.isEraseMode) {
      eraseTile(row, col)
    }
  }, [state.isEraseMode, eraseTile])

  const handleActivateErase = useCallback(() => {
    if (state.eraserRemaining > 0 && !state.gameOver) {
      if (!state.isEraseMode) {
        activateErase()
      } else {
        exitEraseMode()
      }
    }
  }, [state.eraserRemaining, state.gameOver, state.isEraseMode, activateErase, exitEraseMode])

  return (
    <div className="app">
      <Header
        difficulty={state.difficulty}
        onDifficultyChange={handleDifficultyChange}
        onNewGame={handleNewGame}
      />
      <ScoreBoard
        score={state.score}
        highScore={highScore}
        difficulty={state.difficulty}
      />
      <div className="board-container">
        <GameBoard
          gridSize={config.gridSize}
          tiles={state.tiles}
          isEraseMode={state.isEraseMode}
          onCellClick={handleCellClick}
        />
        <GameOverOverlay
          show={state.gameOver}
          score={state.score}
          highScore={highScore}
          onNewGame={handleNewGame}
        />
      </div>
      <EraseMechanism
        eraserRemaining={state.eraserRemaining}
        onActivateErase={handleActivateErase}
      />
      <GameRules />
    </div>
  )
}

export default App