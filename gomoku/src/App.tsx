import { useState, useCallback, useRef, useEffect } from 'react'
import { createBoard, placeStone, checkFiveInARow, getWinLine } from './core/GameEngine'
import { checkForbidden } from './core/rules'
import { findBestMove } from './core/ai'
import type { Board, Stone, Difficulty, GameMode } from './core/types'
import { BOARD_SIZE, DIFFICULTY_CONFIG } from './core/config'
import './App.css'

const CELL_SIZE = 36
const PADDING = 24
const STONE_RADIUS = 15
const BOARD_PX = (BOARD_SIZE - 1) * CELL_SIZE + PADDING * 2

type GamePhase = 'select' | 'playing' | 'over'

export default function App() {
  const [phase, setPhase] = useState<GamePhase>('select')
  const [board, setBoard] = useState<Board>(() => createBoard())
  const [currentPlayer, setCurrentPlayer] = useState<Stone>('black')
  const [playerStone, setPlayerStone] = useState<Stone>('black')
  const [gameMode, setGameMode] = useState<GameMode>('ai')
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [moveHistory, setMoveHistory] = useState<{ row: number; col: number; stone: Stone }[]>([])
  const [winner, setWinner] = useState<Stone | null>(null)
  const [winLine, setWinLine] = useState<[number, number][] | null>(null)
  const [forfeitBy, setForfeitBy] = useState<Stone | null>(null)
  const [forbiddenWarning, setForbiddenWarning] = useState<string | null>(null)
  const [lastMove, setLastMove] = useState<{ row: number; col: number } | null>(null)
  const [thinking, setThinking] = useState(false)
  const [hoverPos, setHoverPos] = useState<{ row: number; col: number } | null>(null)

  const resetGame = useCallback(() => {
    setBoard(createBoard())
    setCurrentPlayer('black')
    setMoveHistory([])
    setWinner(null)
    setWinLine(null)
    setForfeitBy(null)
    setForbiddenWarning(null)
    setLastMove(null)
    setThinking(false)
    setPhase('select')
  }, [])

  const startGame = useCallback((stone: Stone, mode: GameMode, diff: Difficulty) => {
    setBoard(createBoard())
    setCurrentPlayer('black')
    setPlayerStone(stone)
    setGameMode(mode)
    setDifficulty(diff)
    setMoveHistory([])
    setWinner(null)
    setWinLine(null)
    setForfeitBy(null)
    setForbiddenWarning(null)
    setLastMove(null)
    setForbiddenWarning(null)
    setPhase('playing')

    // If player chose white, AI moves first
    if (mode === 'ai' && stone === 'white') {
      setThinking(true)
      setTimeout(() => {
        const move = findBestMove(createBoard(), 'black', diff)
        if (move) {
          const [r, c] = move
          const newBoard = placeStone(createBoard(), r, c, 'black')
          setBoard(newBoard)
          setCurrentPlayer('white')
          setLastMove({ row: r, col: c })
          setMoveHistory([{ row: r, col: c, stone: 'black' }])
        }
        setThinking(false)
      }, 300)
    }
  }, [])

  const handleCellClick = useCallback((row: number, col: number) => {
    if (thinking || phase !== 'playing' || winner) return

    const stone = currentPlayer

    if (gameMode === 'ai' && stone !== playerStone) return

    if (board[row][col] !== null) return

    // Forbidden check for black
    if (stone === 'black') {
      const fb = checkForbidden(board, row, col)
      if (fb.forbidden) {
        setForbiddenWarning(fb.reason)
        setTimeout(() => setForbiddenWarning(null), 2000)
        return
      }
    }
    setForbiddenWarning(null)

    const newBoard = placeStone(board, row, col, stone)
    setBoard(newBoard)
    setLastMove({ row, col })

    // Check win
    if (checkFiveInARow(newBoard, row, col, stone)) {
      setWinner(stone)
      setWinLine(getWinLine(newBoard, row, col, stone))
      setPhase('over')
      return
    }

    const newHistory = [...moveHistory, { row, col, stone }]
    setMoveHistory(newHistory)
    const next = stone === 'black' ? 'white' : 'black'
    setCurrentPlayer(next)

    // AI move
    if (gameMode === 'ai' && next !== playerStone) {
      setThinking(true)
      setTimeout(() => {
        const move = findBestMove(newBoard, next, difficulty)
        if (move) {
          const [aiR, aiC] = move
          const aiBoard = placeStone(newBoard, aiR, aiC, next)
          setBoard(aiBoard)
          setLastMove({ row: aiR, col: aiC })

          if (checkFiveInARow(aiBoard, aiR, aiC, next)) {
            setWinner(next)
            setWinLine(getWinLine(aiBoard, aiR, aiC, next))
            setPhase('over')
          } else {
            setCurrentPlayer(next === 'black' ? 'white' : 'black')
            setMoveHistory(prev => [...prev, { row: aiR, col: aiC, stone: next }])
          }
        }
        setThinking(false)
      }, 200)
    }
  }, [board, currentPlayer, playerStone, gameMode, difficulty, moveHistory, winner, phase, thinking])

  const handleUndo = useCallback(() => {
    if (moveHistory.length === 0 || thinking) return
    const undoCount = gameMode === 'ai' ? Math.min(2, moveHistory.length) : 1
    const newHistory = moveHistory.slice(0, -undoCount)
    const newBoard = createBoard()
    for (const m of newHistory) {
      newBoard[m.row][m.col] = m.stone
    }
    setBoard(newBoard)
    setMoveHistory(newHistory)
    setLastMove(newHistory.length > 0 ? { row: newHistory[newHistory.length - 1]!.row, col: newHistory[newHistory.length - 1]!.col } : null)
    setCurrentPlayer(newHistory.length > 0 ? (newHistory[newHistory.length - 1]!.stone === 'black' ? 'white' : 'black') : 'black')
  }, [moveHistory, playerStone, thinking, gameMode])

  const handleForfeit = useCallback(() => {
    if (phase !== 'playing') return
    setForfeitBy(currentPlayer)
    setWinner(currentPlayer === 'black' ? 'white' : 'black')
    setPhase('over')
  }, [currentPlayer, phase])

  const boardToCoord = (clientX: number, clientY: number, rect: DOMRect): [number, number] | null => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = (clientX - rect.left) * scaleX
    const y = (clientY - rect.top) * scaleY
    const col = Math.round((x - PADDING) / CELL_SIZE)
    const row = Math.round((y - PADDING) / CELL_SIZE)
    if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) return null
    const dx = Math.abs(x - (PADDING + col * CELL_SIZE))
    const dy = Math.abs(y - (PADDING + row * CELL_SIZE))
    if (dx > STONE_RADIUS + 4 || dy > STONE_RADIUS + 4) return null
    return [row, col]
  }

  const canvasRef = useRef<HTMLCanvasElement>(null)

  const drawBoard = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, BOARD_PX, BOARD_PX)

    // Background
    ctx.fillStyle = '#dcb35c'
    ctx.fillRect(0, 0, BOARD_PX, BOARD_PX)

    // Grid lines
    ctx.strokeStyle = '#333'
    ctx.lineWidth = 1
    for (let i = 0; i < BOARD_SIZE; i++) {
      const pos = PADDING + i * CELL_SIZE
      ctx.beginPath()
      ctx.moveTo(PADDING, pos)
      ctx.lineTo(PADDING + (BOARD_SIZE - 1) * CELL_SIZE, pos)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(pos, PADDING)
      ctx.lineTo(pos, PADDING + (BOARD_SIZE - 1) * CELL_SIZE)
      ctx.stroke()
    }

    // Star points (天元和星位)
    const stars = [3, 7, 11]
    ctx.fillStyle = '#333'
    for (const r of stars) {
      for (const c of stars) {
        ctx.beginPath()
        ctx.arc(PADDING + c * CELL_SIZE, PADDING + r * CELL_SIZE, 3, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // Win line highlight
    if (winLine) {
      ctx.fillStyle = 'rgba(255, 0, 0, 0.15)'
      for (const [r, c] of winLine) {
        ctx.fillRect(
          PADDING + c * CELL_SIZE - CELL_SIZE / 2,
          PADDING + r * CELL_SIZE - CELL_SIZE / 2,
          CELL_SIZE,
          CELL_SIZE
        )
      }
    }

    // Stones
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const stone = board[r][c]
        if (!stone) continue

        const x = PADDING + c * CELL_SIZE
        const y = PADDING + r * CELL_SIZE
        const gradient = ctx.createRadialGradient(x - 3, y - 3, 2, x, y, STONE_RADIUS)

        if (stone === 'black') {
          gradient.addColorStop(0, '#555')
          gradient.addColorStop(1, '#111')
        } else {
          gradient.addColorStop(0, '#fff')
          gradient.addColorStop(1, '#ccc')
        }

        ctx.beginPath()
        ctx.arc(x, y, STONE_RADIUS, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()
        ctx.strokeStyle = stone === 'black' ? '#000' : '#999'
        ctx.lineWidth = 1
        ctx.stroke()

        // Last move marker
        if (lastMove && lastMove.row === r && lastMove.col === c) {
          ctx.fillStyle = stone === 'black' ? '#ff0' : '#f00'
          ctx.beginPath()
          ctx.arc(x, y, 4, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }

    // Hover preview
    if (hoverPos && !winner && !thinking) {
      const { row, col } = hoverPos
      if (board[row][col] === null) {
        if (currentPlayer === 'black' || (gameMode === 'ai' && currentPlayer === playerStone)) {
          const x = PADDING + col * CELL_SIZE
          const y = PADDING + row * CELL_SIZE
          ctx.globalAlpha = 0.4
          ctx.beginPath()
          ctx.arc(x, y, STONE_RADIUS, 0, Math.PI * 2)
          ctx.fillStyle = currentPlayer === 'black' ? '#333' : '#ddd'
          ctx.fill()
          ctx.globalAlpha = 1
        }
      }
    }
  }, [board, winLine, lastMove, hoverPos, currentPlayer, playerStone, gameMode, winner, thinking])

  useEffect(() => {
    drawBoard()
  }, [drawBoard])

  // Phase 1: Color/mode selection
  if (phase === 'select') {
    return (
      <div className="app">
        <h1 className="title">五子棋</h1>
        <div className="select-panel">
          <h2>游戏设置</h2>
          <div className="select-section">
            <label>游戏模式</label>
            <div className="btn-group">
              <button className={`btn ${gameMode === 'ai' ? 'active' : ''}`} onClick={() => setGameMode('ai')}>人机对战</button>
              <button className={`btn ${gameMode === 'pvp' ? 'active' : ''}`} onClick={() => setGameMode('pvp')}>双人对战</button>
            </div>
          </div>
          {gameMode === 'ai' && (
            <div className="select-section">
              <label>AI 难度</label>
              <div className="btn-group">
                {(Object.entries(DIFFICULTY_CONFIG) as [Difficulty, { label: string }][]).map(([key, cfg]) => (
                  <button key={key} className={`btn ${difficulty === key ? 'active' : ''}`} onClick={() => setDifficulty(key)}>
                    {cfg.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="select-section">
            <label>选择执棋</label>
            <div className="btn-group">
              <button className="btn active" onClick={() => startGame('black', gameMode, difficulty)}>
                ⚫ 执黑先行
              </button>
              <button className="btn" onClick={() => startGame('white', gameMode, difficulty)}>
                ⚪ 执白后行
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="game-header">
        <h1 className="title">五子棋</h1>
        <button className="btn small" onClick={resetGame}>新游戏</button>
      </header>

      <div className="board-container">
        <canvas
          ref={canvasRef}
          width={BOARD_PX}
          height={BOARD_PX}
          className="board-canvas"
          onClick={(e) => {
            const rect = canvasRef.current!.getBoundingClientRect()
            const pos = boardToCoord(e.clientX, e.clientY, rect)
            if (pos) handleCellClick(pos[0], pos[1])
          }}
          onMouseMove={(e) => {
            const rect = canvasRef.current!.getBoundingClientRect()
            const pos = boardToCoord(e.clientX, e.clientY, rect)
            setHoverPos(pos ? { row: pos[0], col: pos[1] } : null)
          }}
          onMouseLeave={() => setHoverPos(null)}
        />
        {thinking && <div className="thinking-overlay">AI 思考中...</div>}
      </div>

      <div className="game-info">
        <div className="info-row">
          <span className="turn-indicator">
            {winner
              ? `🏆 ${winner === 'black' ? '黑棋' : '白棋'} 获胜！`
              : forfeitBy
                ? `${forfeitBy === 'black' ? '黑棋' : '白棋'} 认输`
                : `当前回合：${currentPlayer === 'black' ? '⚫ 黑棋' : '⚪ 白棋'}${thinking ? '（AI 思考中...）' : ''}`
            }
          </span>
          {gameMode === 'ai' && (
            <span className="stone-info">
              你执 {playerStone === 'black' ? '⚫ 黑棋' : '⚪ 白棋'}（{DIFFICULTY_CONFIG[difficulty].label}）
            </span>
          )}
        </div>
        {forbiddenWarning && <div className="warning">{forbiddenWarning}</div>}
        <div className="info-actions">
          <button className="btn small" onClick={handleUndo} disabled={moveHistory.length === 0 || (gameMode === 'ai' && moveHistory.length < 2) || thinking}>
            悔棋
          </button>
          <button className="btn small danger" onClick={handleForfeit} disabled={!!winner || thinking}>
            认输
          </button>
        </div>
      </div>
    </div>
  )
}
