import { useState, useRef, useEffect } from 'react'
import {
  createInitialBoard, getMoves, applyMove, isCheckmate,
  hasAnyMove, nextPlayer,
} from './core/GameEngine'
import { findBestMove } from './core/ai'
import type { Board, Move, Player, GamePhase, Difficulty } from './core/types'
import { PIECE_NAMES, ROWS, COLS } from './core/types'
import './App.css'

const CELL = 48
const PAD = 24
const BOARD_W = (COLS - 1) * CELL + PAD * 2
const BOARD_H = (ROWS - 1) * CELL + PAD * 2
const PIECE_R = 20

type GameMode = '1human' | '2human'

export default function App() {
  const [phase, setPhase] = useState<GamePhase>('select')
  const [board, setBoard] = useState<Board>(() => createInitialBoard())
  const [currentPlayer, setCurrentPlayer] = useState<Player>('red')
  const [humanColor, setHumanColor] = useState<Player>('red')
  const [gameMode, setGameMode] = useState<GameMode>('1human')
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [winner, setWinner] = useState<Player | null>(null)
  const [selectedPos, setSelectedPos] = useState<[number, number] | null>(null)
  const [validMoves, setValidMoves] = useState<Move[]>([])
  const [message, setMessage] = useState('')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const isHuman = (color: Player) => {
    if (gameMode === '2human') return true
    return color === humanColor
  }

  const resetGame = () => {
    setBoard(createInitialBoard())
    setCurrentPlayer('red')
    setWinner(null)
    setSelectedPos(null)
    setValidMoves([])
    setMessage('')
    setPhase('select')
  }

  const startGame = (color: Player, mode: GameMode, diff: Difficulty) => {
    setBoard(createInitialBoard())
    setCurrentPlayer('red')
    setHumanColor(color)
    setGameMode(mode)
    setDifficulty(diff)
    setWinner(null)
    setSelectedPos(null)
    setValidMoves([])
    setPhase('playing')
    setMessage(isHuman('red') ? '红方走棋' : 'AI思考中...')
  }

  const finishMove = (nb: Board, mover: Player) => {
    if (isCheckmate(nb, nextPlayer(mover))) {
      setWinner(mover)
      setPhase('over')
      setMessage(`${mover === 'red' ? '红' : '黑'}方获胜！`)
      return
    }
    if (!hasAnyMove(nb, nextPlayer(mover))) {
      setWinner(mover)
      setPhase('over')
      setMessage(`${mover === 'red' ? '红' : '黑'}方获胜（对方无子可走）`)
      return
    }
    const next = nextPlayer(mover)
    setCurrentPlayer(next)
    setMessage(isHuman(next) ? `${next === 'red' ? '红' : '黑'}方走棋` : 'AI思考中...')
  }

  const doMove = (fromR: number, fromC: number, toR: number, toC: number) => {
    const nb = applyMove(board, { fromRow: fromR, fromCol: fromC, toRow: toR, toCol: toC })
    setBoard(nb)
    setSelectedPos(null)
    setValidMoves([])
    finishMove(nb, currentPlayer)
  }

  const handleCellClick = (r: number, c: number) => {
    if (phase !== 'playing' || winner || !isHuman(currentPlayer)) return
    const piece = board[r][c]

    if (selectedPos) {
      const hit = validMoves.find(m => m.toRow === r && m.toCol === c)
      if (hit) {
        doMove(selectedPos[0], selectedPos[1], r, c)
        return
      }
      if (piece && piece.player === currentPlayer) {
        setSelectedPos([r, c])
        setValidMoves(getMoves(board, r, c))
        return
      }
      setSelectedPos(null)
      setValidMoves([])
      return
    }

    if (piece && piece.player === currentPlayer) {
      setSelectedPos([r, c])
      setValidMoves(getMoves(board, r, c))
    }
  }

  const aiProcessing = useRef(false)
  const doMoveRef = useRef(doMove)
  doMoveRef.current = doMove

  useEffect(() => {
    if (phase !== 'playing' || winner || currentPlayer === humanColor || aiProcessing.current) return
    if (gameMode === '2human') return
    aiProcessing.current = true
    const timer = setTimeout(() => {
      try {
        const move = findBestMove(board, currentPlayer, difficulty)
        if (move) {
          doMoveRef.current(move.fromRow, move.fromCol, move.toRow, move.toCol)
        }
      } catch (e) {
        console.error('AI error', e)
      }
      aiProcessing.current = false
    }, 300)
    return () => clearTimeout(timer)
  }, [phase, currentPlayer, winner, board, difficulty, gameMode, humanColor])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, BOARD_W, BOARD_H)
    ctx.fillStyle = '#f0d9b5'
    ctx.fillRect(0, 0, BOARD_W, BOARD_H)

    // board grid
    ctx.strokeStyle = '#333'
    ctx.lineWidth = 1
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const x = PAD + c * CELL
        const y = PAD + r * CELL
        if (r < ROWS - 1) {
          const inRiver = r === 4
          if (!inRiver || c === 0 || c === COLS - 1) {
            ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + CELL); ctx.stroke()
          }
        }
        if (c < COLS - 1) {
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + CELL, y); ctx.stroke()
        }
      }
    }

    // river
    const riverY = PAD + 4.5 * CELL
    ctx.strokeStyle = '#333'
    ctx.lineWidth = 1
    ctx.setLineDash([])
    ctx.font = 'bold 18px serif'
    ctx.fillStyle = '#333'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('楚 河', PAD + 1.5 * CELL, riverY)
    ctx.fillText('漢 界', PAD + 6.5 * CELL, riverY)

    // palace diagonals
    for (const [r1, c1, r2, c2] of [[0,3,2,5],[0,5,2,3],[7,3,9,5],[7,5,9,3]]) {
      ctx.beginPath()
      ctx.moveTo(PAD + c1 * CELL, PAD + r1 * CELL)
      ctx.lineTo(PAD + c2 * CELL, PAD + r2 * CELL)
      ctx.stroke()
    }

    // pieces
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const x = PAD + c * CELL
        const y = PAD + r * CELL
        const p = board[r][c]
        if (!p) continue

        const isSelected = selectedPos && selectedPos[0] === r && selectedPos[1] === c
        const isValid = validMoves.some(m => m.toRow === r && m.toCol === c)

        if (isSelected) {
          ctx.beginPath(); ctx.arc(x, y, PIECE_R + 3, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(255,200,0,0.5)'; ctx.fill()
        }
        if (isValid) {
          ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2)
          ctx.fillStyle = board[r][c] ? 'rgba(255,0,0,0.4)' : 'rgba(0,200,0,0.4)'
          ctx.fill()
        }

        ctx.beginPath(); ctx.arc(x, y, PIECE_R, 0, Math.PI * 2)
        ctx.fillStyle = '#fce8c8'
        ctx.fill()
        ctx.strokeStyle = p.player === 'red' ? '#c00' : '#111'
        ctx.lineWidth = 2
        ctx.stroke()

        ctx.fillStyle = p.player === 'red' ? '#c00' : '#111'
        ctx.font = 'bold 16px serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(PIECE_NAMES[p.player][p.type], x + 0.5, y - 0.5)
      }
    }
  }, [board, selectedPos, validMoves])

  const boardToRC = (clientX: number, clientY: number, rect: DOMRect): [number, number] | null => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const sx = canvas.width / rect.width
    const sy = canvas.height / rect.height
    const x = (clientX - rect.left) * sx
    const y = (clientY - rect.top) * sy
    const c = Math.round((x - PAD) / CELL)
    const r = Math.round((y - PAD) / CELL)
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return null
    if (Math.abs(x - (PAD + c * CELL)) > CELL * 0.45) return null
    if (Math.abs(y - (PAD + r * CELL)) > CELL * 0.45) return null
    return [r, c]
  }

  if (phase === 'select') {
    return (
      <div className="chess-app">
        <h1 className="chess-title">中国象棋</h1>
        <div className="chess-select">
          <h2>游戏设置</h2>
          <div className="chess-section">
            <label>模式</label>
            <div className="chess-btn-group">
              <button className={`chess-btn ${gameMode === '1human' ? 'active' : ''}`} onClick={() => setGameMode('1human')}>1人 vs AI</button>
              <button className={`chess-btn ${gameMode === '2human' ? 'active' : ''}`} onClick={() => setGameMode('2human')}>2人对弈</button>
            </div>
          </div>
          {gameMode === '1human' && (
            <div className="chess-section">
              <label>选择颜色</label>
              <div className="chess-btn-group">
                <button className="chess-btn" style={{ background: '#c00', color: '#fff' }} onClick={() => startGame('red', '1human', difficulty)}>红方（先手）</button>
                <button className="chess-btn" style={{ background: '#222', color: '#fff' }} onClick={() => startGame('black', '1human', difficulty)}>黑方（后手）</button>
              </div>
            </div>
          )}
          {gameMode === '2human' && (
            <div className="chess-section">
              <button className="chess-btn" onClick={() => startGame('red', '2human', difficulty)}>开始对弈</button>
            </div>
          )}
          <div className="chess-section">
            <label>AI难度</label>
            <div className="chess-btn-group">
              {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
                <button key={d} className={`chess-btn ${difficulty === d ? 'active' : ''}`} onClick={() => setDifficulty(d)}>
                  {d === 'easy' ? '简单' : d === 'medium' ? '中等' : '困难'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="chess-app">
      <header className="chess-header">
        <h1 className="chess-title-sm">中国象棋</h1>
        <button className="chess-btn small" onClick={resetGame}>新游戏</button>
      </header>
      <div className="chess-turn">{message}</div>
      <div className="chess-board-wrap">
        <canvas
          ref={canvasRef}
          width={BOARD_W}
          height={BOARD_H}
          className="chess-canvas"
          onClick={(e) => {
            const rect = canvasRef.current!.getBoundingClientRect()
            const pos = boardToRC(e.clientX, e.clientY, rect)
            if (pos) handleCellClick(pos[0], pos[1])
          }}
        />
      </div>
      {winner && (
        <div className="chess-win">
          <div className="chess-win-text">{winner === 'red' ? '🔴 红方获胜！' : '⚫ 黑方获胜！'}</div>
          <button className="chess-btn" onClick={resetGame}>再来一局</button>
        </div>
      )}
    </div>
  )
}
