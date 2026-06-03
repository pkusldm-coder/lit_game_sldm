import { useState, useCallback, useEffect, useRef } from 'react'
import { createGameState, selectCell, inputNumber, eraseCell, useHint, undoMove, toggleNoteMode } from './core/engine'
import type { Difficulty, GameState } from './core/types'
import { DIFFICULTIES, DIFFICULTY_CONFIG } from './core/config'
import './App.css'

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function App() {
  const [screen, setScreen] = useState<'menu' | 'game'>('menu')
  const [state, setState] = useState<GameState | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startGame = useCallback((diff: Difficulty) => {
    if (timerRef.current) clearInterval(timerRef.current)
    const newState = createGameState(diff)
    setState(newState)
    setScreen('game')
    timerRef.current = setInterval(() => {
      setState(prev => prev ? { ...prev, timer: prev.timer + 1 } : prev)
    }, 1000)
  }, [])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const handleCellClick = useCallback((r: number, c: number) => {
    if (!state || state.status !== 'playing') return
    setState(prev => prev ? selectCell(prev, r, c) : prev)
  }, [state])

  const handleNumber = useCallback((num: number) => {
    if (!state || state.status !== 'playing') return
    setState(prev => prev ? inputNumber(prev, num) : prev)
  }, [state])

  if (screen === 'menu') {
    return (
      <div className="menu">
        <h1 className="title">数独</h1>
        <p className="subtitle">Sudoku</p>
        <div className="difficulty-list">
          {DIFFICULTIES.map(d => (
            <button key={d} className="diff-btn" onClick={() => startGame(d)}>
              <span className="diff-label">{DIFFICULTY_CONFIG[d].label}</span>
              <span className="diff-desc">
                {d === 'easy' && '适合新手'}
                {d === 'medium' && '一定挑战'}
                {d === 'hard' && '需要技巧'}
                {d === 'expert' && '大师级别'}
              </span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (!state) return null

  const selected = state.selectedCell
  const [selR, selC] = selected ?? [-1, -1]

  const isSelected = (r: number, c: number) => r === selR && c === selC
  const isSameRow = (r: number) => r === selR
  const isSameCol = (c: number) => c === selC
  const isSameBox = (r: number, c: number) => {
    const br = Math.floor(r / 3) * 3
    const bc = Math.floor(c / 3) * 3
    const sr = Math.floor(selR / 3) * 3
    const sc = Math.floor(selC / 3) * 3
    return br === sr && bc === sc
  }
  const isSameNumber = (r: number, c: number) =>
    selR >= 0 && state.board[r][c].value !== null &&
    state.board[r][c].value === state.board[selR][selC].value

  return (
    <div className="game">
      <header className="game-header">
        <button className="back-btn" onClick={() => { setScreen('menu'); if (timerRef.current) clearInterval(timerRef.current) }}>←</button>
        <span className="game-difficulty">{DIFFICULTY_CONFIG[state.difficulty].label}</span>
        <span className="game-timer">{formatTime(state.timer)}</span>
      </header>

      <div className="board">
        {state.board.map((row, r) =>
          row.map((cell, c) => {
            const classes = [
              'cell',
              cell.isGiven ? 'given' : '',
              isSelected(r, c) ? 'selected' : '',
              isSameRow(r) || isSameCol(c) || isSameBox(r, c) ? 'highlighted' : '',
              isSameNumber(r, c) && !isSelected(r, c) ? 'same-number' : '',
              cell.isError ? 'error' : '',
              cell.isHint ? 'hint' : '',
              c % 3 === 2 && c !== 8 ? 'border-right' : '',
              r % 3 === 2 && r !== 8 ? 'border-bottom' : '',
              c === 0 ? 'border-left' : '',
              r === 0 ? 'border-top' : '',
            ].filter(Boolean).join(' ')

            return (
              <div
                key={`${r}-${c}`}
                className={classes}
                onClick={() => handleCellClick(r, c)}
              >
                {cell.value !== null ? (
                  <span className="cell-value">{cell.value}</span>
                ) : cell.pencilMarks.length > 0 ? (
                  <div className="pencil-marks">
                    {[1,2,3,4,5,6,7,8,9].map(n => (
                      <span key={n} className={`pencil ${cell.pencilMarks.includes(n) ? 'active' : ''}`}>
                        {cell.pencilMarks.includes(n) ? n : ''}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            )
          })
        )}
      </div>

      <div className="status-bar">
        {state.status === 'won' ? (
          <div className="win-message">恭喜完成！</div>
        ) : (
          <div className="status-info">
            <span>错误: {state.mistakes}</span>
            <span>提示: {state.hintsUsed}</span>
          </div>
        )}
      </div>

      <div className="numpad">
        {[1,2,3,4,5,6,7,8,9].map(n => (
          <button key={n} className="num-btn" onClick={() => handleNumber(n)}>
            {n}
          </button>
        ))}
      </div>

      <div className="controls">
        <button className="ctrl-btn" onClick={() => setState(prev => prev ? undoMove(prev) : prev)}>
          撤销
        </button>
        <button className="ctrl-btn" onClick={() => setState(prev => prev ? eraseCell(prev) : prev)}>
          擦除
        </button>
        <button className="ctrl-btn" onClick={() => setState(prev => prev ? useHint(prev) : prev)}>
          提示
        </button>
        <button className={`ctrl-btn ${state.noteMode ? 'active' : ''}`} onClick={() => setState(prev => prev ? toggleNoteMode(prev) : prev)}>
          笔记
        </button>
      </div>

      {state.status === 'won' && (
        <div className="win-overlay" onClick={() => { setScreen('menu'); if (timerRef.current) clearInterval(timerRef.current) }}>
          <div className="win-card" onClick={e => e.stopPropagation()}>
            <h2>🎉 恭喜完成！</h2>
            <p>难度: {DIFFICULTY_CONFIG[state.difficulty].label}</p>
            <p>用时: {formatTime(state.timer)}</p>
            <p>错误: {state.mistakes}</p>
            <p>提示: {state.hintsUsed}</p>
            <button className="new-game-btn" onClick={() => setScreen('menu')}>新游戏</button>
          </div>
        </div>
      )}
    </div>
  )
}
