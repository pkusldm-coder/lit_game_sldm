import { useState, useCallback, useRef, useEffect } from 'react'
import { createInitialBoard, getValidMoves, applyMove, checkWin, hasAnyMoves, ROWS, COLS, ANIMAL_EMOJI, getCellType } from './core/GameEngine'
import { findBestMove } from './core/ai'
import type { Board, Player, GamePhase, Difficulty, Move } from './core/types'
import './App.css'

const CELL_SIZE = 48
const PIECE_RADIUS = 20
const BOARD_PX_W = COLS * CELL_SIZE
const BOARD_PX_H = ROWS * CELL_SIZE

type GameMode = 'ai' | 'pvp'

export default function App() {
  const [phase, setPhase] = useState<GamePhase>('select')
  const [board, setBoard] = useState<Board>(() => createInitialBoard())
  const [currentPlayer, setCurrentPlayer] = useState<Player>('red')
  const [playerSide, setPlayerSide] = useState<Player>('red')
  const [gameMode, setGameMode] = useState<GameMode>('ai')
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [winner, setWinner] = useState<Player | null>(null)
  const [selectedPiece, setSelectedPiece] = useState<[number, number] | null>(null)
  const [validMoves, setValidMoves] = useState<[number, number][]>([])
  const [thinking, setThinking] = useState(false)
  const [lastMove, setLastMove] = useState<Move | null>(null)
  const [moveHistory, setMoveHistory] = useState<Move[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const resetGame = useCallback(() => {
    setBoard(createInitialBoard())
    setCurrentPlayer('red')
    setWinner(null)
    setSelectedPiece(null)
    setValidMoves([])
    setThinking(false)
    setLastMove(null)
    setMoveHistory([])
    setPhase('select')
  }, [])

  const startGame = useCallback((side: Player, mode: GameMode, diff: Difficulty) => {
    setBoard(createInitialBoard())
    setCurrentPlayer('red')
    setPlayerSide(side)
    setGameMode(mode)
    setDifficulty(diff)
    setWinner(null)
    setSelectedPiece(null)
    setValidMoves([])
    setThinking(false)
    setLastMove(null)
    setMoveHistory([])
    setPhase('playing')

    if (mode === 'ai' && side === 'blue') {
      setThinking(true)
      setTimeout(() => {
        const move = findBestMove(createInitialBoard(), 'red', diff)
        if (move) {
          const nb = applyMove(createInitialBoard(), move.fromRow, move.fromCol, move.toRow, move.toCol)
          setBoard(nb)
          setCurrentPlayer('blue')
          setLastMove(move)
          setMoveHistory([move])
        }
        setThinking(false)
      }, 400)
    }
  }, [])

  const handleCellClick = useCallback((row: number, col: number) => {
    if (thinking || phase !== 'playing' || winner) return

    const piece = board[row][col]

    if (gameMode === 'ai' && currentPlayer !== playerSide) return

    if (selectedPiece) {
      const [sr, sc] = selectedPiece
      const isValid = validMoves.some(([mr, mc]) => mr === row && mc === col)
      if (isValid) {
        const move: Move = { fromRow: sr, fromCol: sc, toRow: row, toCol: col }
        const newBoard = applyMove(board, sr, sc, row, col)
        const w = checkWin(newBoard)
        setBoard(newBoard)
        setLastMove(move)
        setMoveHistory(prev => [...prev, move])
        setSelectedPiece(null)
        setValidMoves([])

        if (w) {
          setWinner(w)
          setPhase('over')
          return
        }

        const next: Player = currentPlayer === 'red' ? 'blue' : 'red'

        if (!hasAnyMoves(newBoard, next)) {
          setWinner(currentPlayer)
          setPhase('over')
          return
        }

        setCurrentPlayer(next)

        if (gameMode === 'ai' && next !== playerSide) {
          setThinking(true)
          setTimeout(() => {
            const aiMove = findBestMove(newBoard, next, difficulty)
            if (aiMove) {
              const aiBoard = applyMove(newBoard, aiMove.fromRow, aiMove.fromCol, aiMove.toRow, aiMove.toCol)
              const aw = checkWin(aiBoard)
              setBoard(aiBoard)
              setLastMove(aiMove)
              setMoveHistory(prev => [...prev, aiMove])

              if (aw) {
                setWinner(aw)
                setPhase('over')
              } else {
                const nextAfterAi: Player = next === 'red' ? 'blue' : 'red'
                if (!hasAnyMoves(aiBoard, nextAfterAi)) {
                  setWinner(next)
                  setPhase('over')
                } else {
                  setCurrentPlayer(nextAfterAi)
                }
              }
            }
            setThinking(false)
          }, 300)
        }
      } else if (piece && piece.player === currentPlayer) {
        const moves = getValidMoves(board, row, col)
        setSelectedPiece([row, col])
        setValidMoves(moves)
      } else {
        setSelectedPiece(null)
        setValidMoves([])
      }
    } else {
      if (piece && piece.player === currentPlayer) {
        const moves = getValidMoves(board, row, col)
        setSelectedPiece([row, col])
        setValidMoves(moves)
      }
    }
  }, [board, currentPlayer, playerSide, gameMode, difficulty, selectedPiece, validMoves, winner, phase, thinking])

  const handleUndo = useCallback(() => {
    if (moveHistory.length === 0 || thinking) return
    const undoCount = gameMode === 'ai' ? Math.min(2, moveHistory.length) : 1
    const newHistory = moveHistory.slice(0, -undoCount)
    const nb = createInitialBoard()
    for (const m of newHistory) {
      nb[m.toRow][m.toCol] = nb[m.fromRow][m.fromCol]
      nb[m.fromRow][m.fromCol] = null
    }
    setBoard(nb)
    setMoveHistory(newHistory)
    setSelectedPiece(null)
    setValidMoves([])
    setLastMove(newHistory.length > 0 ? newHistory[newHistory.length - 1] : null)
    if (newHistory.length > 0) {
      const lastM = newHistory[newHistory.length - 1]
      const lastPiece = nb[lastM.toRow][lastM.toCol]
      setCurrentPlayer(lastPiece ? (lastPiece.player === 'red' ? 'blue' : 'red') : 'red')
    } else {
      setCurrentPlayer('red')
    }
  }, [moveHistory, thinking, gameMode])

  const boardToCoord = (clientX: number, clientY: number, rect: DOMRect): [number, number] | null => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = (clientX - rect.left) * scaleX
    const y = (clientY - rect.top) * scaleY
    const col = Math.floor(x / CELL_SIZE)
    const row = Math.floor(y / CELL_SIZE)
    if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return null
    return [row, col]
  }

  const drawBoard = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, BOARD_PX_W, BOARD_PX_H)

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const x = c * CELL_SIZE
        const y = r * CELL_SIZE
        const ct = getCellType(r, c)

        if (ct === 'water') {
          ctx.fillStyle = '#4a90d9'
          ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE)
          ctx.fillStyle = '#3a80c0'
          for (let i = 0; i < 3; i++) {
            const wx = x + 10 + i * 12
            const wy = y + CELL_SIZE / 2
            ctx.beginPath()
            ctx.arc(wx, wy, 4, 0, Math.PI, true)
            ctx.fill()
          }
        } else if (ct === 'trap-red' || ct === 'trap-blue') {
          ctx.fillStyle = '#d4a574'
          ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE)
          ctx.strokeStyle = ct === 'trap-red' ? '#c0392b' : '#2980b9'
          ctx.lineWidth = 2
          ctx.strokeRect(x + 4, y + 4, CELL_SIZE - 8, CELL_SIZE - 8)
          ctx.beginPath()
          ctx.moveTo(x + 4, y + 4)
          ctx.lineTo(x + CELL_SIZE - 4, y + CELL_SIZE - 4)
          ctx.moveTo(x + CELL_SIZE - 4, y + 4)
          ctx.lineTo(x + 4, y + CELL_SIZE - 4)
          ctx.stroke()
        } else if (ct === 'den-red' || ct === 'den-blue') {
          ctx.fillStyle = ct === 'den-red' ? '#c0392b' : '#2980b9'
          ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE)
          ctx.fillStyle = '#fff'
          ctx.font = 'bold 14px sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText('穴', x + CELL_SIZE / 2, y + CELL_SIZE / 2)
        } else {
          ctx.fillStyle = '#8fbc8f'
          ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE)
        }

        ctx.strokeStyle = '#5a5a5a'
        ctx.lineWidth = 1
        ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE)
      }
    }

    if (lastMove) {
      ctx.fillStyle = 'rgba(255, 255, 0, 0.2)'
      ctx.fillRect(lastMove.fromCol * CELL_SIZE, lastMove.fromRow * CELL_SIZE, CELL_SIZE, CELL_SIZE)
      ctx.fillRect(lastMove.toCol * CELL_SIZE, lastMove.toRow * CELL_SIZE, CELL_SIZE, CELL_SIZE)
    }

    if (selectedPiece) {
      const [sr, sc] = selectedPiece
      ctx.fillStyle = 'rgba(255, 200, 0, 0.4)'
      ctx.fillRect(sc * CELL_SIZE, sr * CELL_SIZE, CELL_SIZE, CELL_SIZE)
    }

    for (const [mr, mc] of validMoves) {
      ctx.fillStyle = 'rgba(0, 255, 0, 0.3)'
      ctx.fillRect(mc * CELL_SIZE, mr * CELL_SIZE, CELL_SIZE, CELL_SIZE)
    }

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const piece = board[r][c]
        if (!piece) continue

        const cx = c * CELL_SIZE + CELL_SIZE / 2
        const cy = r * CELL_SIZE + CELL_SIZE / 2

        const isSelected = selectedPiece && selectedPiece[0] === r && selectedPiece[1] === c
        const radius = isSelected ? PIECE_RADIUS + 2 : PIECE_RADIUS

        ctx.beginPath()
        ctx.arc(cx, cy, radius, 0, Math.PI * 2)
        ctx.fillStyle = piece.player === 'red' ? '#c0392b' : '#2980b9'
        ctx.fill()
        ctx.strokeStyle = piece.player === 'red' ? '#e74c3c' : '#3498db'
        ctx.lineWidth = isSelected ? 3 : 2
        ctx.stroke()

        ctx.fillStyle = '#fff'
        ctx.font = 'bold 16px "STKaiti","KaiTi","楷体",sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(ANIMAL_EMOJI[piece.type], cx, cy)
      }
    }
  }, [board, selectedPiece, validMoves, lastMove])

  useEffect(() => {
    drawBoard()
  }, [drawBoard])

  if (phase === 'select') {
    return (
      <div className="jungle-app">
        <h1 className="jungle-title">斗兽棋</h1>
        <div className="jungle-select">
          <h2>游戏设置</h2>
          <div className="jungle-section">
            <label>游戏模式</label>
            <div className="jungle-btn-group">
              <button className={`jungle-btn ${gameMode === 'ai' ? 'active' : ''}`} onClick={() => setGameMode('ai')}>人机对战</button>
              <button className={`jungle-btn ${gameMode === 'pvp' ? 'active' : ''}`} onClick={() => setGameMode('pvp')}>双人对战</button>
            </div>
          </div>
          {gameMode === 'ai' && (
            <div className="jungle-section">
              <label>AI 难度</label>
              <div className="jungle-btn-group">
                {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
                  <button key={d} className={`jungle-btn ${difficulty === d ? 'active' : ''}`} onClick={() => setDifficulty(d)}>
                    {d === 'easy' ? '简单' : d === 'medium' ? '中等' : '困难'}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="jungle-section">
            <label>选择阵营</label>
            <div className="jungle-btn-group">
              <button className="jungle-btn" onClick={() => startGame('red', gameMode, difficulty)}>
                🔴 红方（下方）
              </button>
              <button className="jungle-btn" onClick={() => startGame('blue', gameMode, difficulty)}>
                🔵 蓝方（上方）
              </button>
            </div>
          </div>
          <div className="jungle-rules">
            <h3>游戏规则</h3>
            <p>象→狮→虎→豹→狼→犬→猫→鼠，大吃小</p>
            <p>鼠可吃象，象不可吃鼠</p>
            <p>狮虎可跳河，鼠可入水</p>
            <p>敌方进入陷阱等级归零</p>
            <p>进入对方兽穴即获胜</p>
          </div>
        </div>
      </div>
    )
  }

  const redCount = board.flat().filter(p => p?.player === 'red').length
  const blueCount = board.flat().filter(p => p?.player === 'blue').length

  return (
    <div className="jungle-app">
      <header className="jungle-header">
        <h1 className="jungle-title-sm">斗兽棋</h1>
        <button className="jungle-btn small" onClick={resetGame}>新游戏</button>
      </header>

      <div className="jungle-board-wrap">
        <canvas
          ref={canvasRef}
          width={BOARD_PX_W}
          height={BOARD_PX_H}
          className="jungle-canvas"
          onClick={(e) => {
            const rect = canvasRef.current!.getBoundingClientRect()
            const pos = boardToCoord(e.clientX, e.clientY, rect)
            if (pos) handleCellClick(pos[0], pos[1])
          }}
        />
        {thinking && <div className="jungle-thinking">AI 思考中...</div>}
      </div>

      <div className="jungle-info">
        <div className="jungle-turn">
          {winner
            ? `🏆 ${winner === 'red' ? '红方' : '蓝方'} 获胜！`
            : `当前：${currentPlayer === 'red' ? '🔴 红方' : '🔵 蓝方'}${thinking ? '（AI思考中）' : ''}`
          }
        </div>
        <div className="jungle-pieces-info">
          红方 {redCount} 子 · 蓝方 {blueCount} 子
        </div>
        {winner && (
          <div className="jungle-win-overlay">
            <div className="jungle-win-text">
              {gameMode === 'ai'
                ? (winner === playerSide ? '🎉 你赢了！' : '😢 你输了！')
                : `🏆 ${winner === 'red' ? '红方' : '蓝方'} 获胜！`
              }
            </div>
            <button className="jungle-btn" onClick={resetGame}>再来一局</button>
          </div>
        )}
        <div className="jungle-actions">
          <button className="jungle-btn small" onClick={handleUndo} disabled={moveHistory.length === 0 || thinking}>
            悔棋
          </button>
        </div>
      </div>
    </div>
  )
}