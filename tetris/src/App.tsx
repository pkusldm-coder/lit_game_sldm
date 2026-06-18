import { useState, useEffect, useCallback, useRef } from 'react'
import type { GameState } from './core/types'
import { BOARD_W, BOARD_H } from './core/types'
import { initGame, moveLeft, moveRight, moveDown, rotate, hardDrop } from './core/game'
import GameBoard from './components/GameBoard'
import Header from './components/Header'
import GameRules from './components/GameRules'
import './index.css'

function useCellSize(): number {
  const [cell, setCell] = useState(26)
  useEffect(() => {
    const calc = () => {
      const maxW = window.innerWidth - 32
      const maxH = window.innerHeight - 150
      const cw = Math.floor(maxW / BOARD_W)
      const ch = Math.floor(maxH / BOARD_H)
      setCell(Math.max(16, Math.min(30, cw, ch)))
    }
    calc()
    window.addEventListener('resize', calc)
    return () => window.removeEventListener('resize', calc)
  }, [])
  return cell
}

export default function App() {
  const cellSize = useCellSize()
  const [gs, setGs] = useState<GameState>(initGame)
  const touchStart = useRef<{ x: number; y: number; t: number } | null>(null)
  const gsRef = useRef(gs)
  gsRef.current = gs

  useEffect(() => {
    if (gs.gameOver || gs.paused) return
    const speed = Math.max(50, 800 - (gs.level - 1) * 70)
    const id = setInterval(() => setGs(prev => moveDown(prev)), speed)
    return () => clearInterval(id)
  }, [gs.gameOver, gs.paused, gs.level])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setGs(prev => moveLeft(prev))
      else if (e.key === 'ArrowRight') setGs(prev => moveRight(prev))
      else if (e.key === 'ArrowDown') setGs(prev => moveDown(prev, true))
      else if (e.key === 'ArrowUp') setGs(prev => rotate(prev))
      else if (e.key === ' ') { e.preventDefault(); setGs(prev => hardDrop(prev)) }
      else if (e.key === 'p' || e.key === 'P') setGs(prev => ({ ...prev, paused: !prev.paused }))
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0]
    touchStart.current = { x: t.clientX, y: t.clientY, t: Date.now() }
  }, [])

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStart.current) return
    const t = e.changedTouches[0]
    const dx = t.clientX - touchStart.current.x
    const dy = t.clientY - touchStart.current.y
    const dt = Date.now() - touchStart.current.t
    touchStart.current = null
    if (dt > 300) return
    const adx = Math.abs(dx)
    const ady = Math.abs(dy)
    if (adx > ady && adx > 20) setGs(prev => dx > 0 ? moveRight(prev) : moveLeft(prev))
    else if (ady > adx && ady > 20) setGs(prev => dy > 0 ? moveDown(prev, true) : rotate(prev))
  }, [])

  const onRestart = () => setGs(initGame())

  const bw = BOARD_W * cellSize

  return (
    <div className="tg-app" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <Header gs={gs} />
      <div className="tg-center" style={{ width: bw }}>
        <GameRules />
        {gs.gameOver && (
          <div className="tg-overlay">
            <div className="tg-gameover">
              游戏结束<br />
              <span className="tg-final-score">得分：{gs.score}</span>
              <button className="tg-restart" onClick={onRestart}>再来一局</button>
            </div>
          </div>
        )}
        <GameBoard gs={gs} cellSize={cellSize} />
        {gs.paused && !gs.gameOver && <div className="tg-pause">暂停</div>}
      </div>
    </div>
  )
}
