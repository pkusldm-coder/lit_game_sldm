import { useState, useCallback, useRef, useEffect } from 'react'
import {
  createInitialBoard, getAllMoves, applyMove, checkWin,
  nextPlayer, qrKey, parseKey,
  ALL_CELLS, getStartPositions, qrToPixel,
} from './core/GameEngine'
import { findBestMove } from './core/ai'
import type { PlayerColor, GamePhase, Difficulty, BoardMap } from './core/types'
import { PLAYER_ORDER, COLOR_NAMES, COLOR_HEX } from './core/types'
import './App.css'

const HEX_SIZE = 18
const PIECE_RADIUS = 8

type GameMode = '1p' | '2p' | '3p' | '6p'

function getPlayers(mode: GameMode): PlayerColor[] {
  if (mode === '1p' || mode === '2p') return ['red', 'yellow']
  if (mode === '3p') return ['red', 'yellow', 'green']
  return PLAYER_ORDER
}

function computeBounds(): { minX: number; maxX: number; minY: number; maxY: number } {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
  for (const [q, r] of ALL_CELLS) {
    const [x, y] = qrToPixel(q, r, HEX_SIZE)
    minX = Math.min(minX, x); maxX = Math.max(maxX, x)
    minY = Math.min(minY, y); maxY = Math.max(maxY, y)
  }
  return { minX, maxX, minY, maxY }
}

const BOUNDS = computeBounds()
const PAD = 30
const BOARD_W = BOUNDS.maxX - BOUNDS.minX + PAD * 2
const BOARD_H = BOUNDS.maxY - BOUNDS.minY + PAD * 2
const OFFSET_X = -BOUNDS.minX + PAD
const OFFSET_Y = -BOUNDS.minY + PAD

export default function App() {
  const [phase, setPhase] = useState<GamePhase>('select')
  const [board, setBoard] = useState<BoardMap>(() => createInitialBoard(['red', 'blue']))
  const [currentPlayer, setCurrentPlayer] = useState<PlayerColor>('red')
  const [players, setPlayers] = useState<PlayerColor[]>(['red', 'blue'])
  const [gameMode, setGameMode] = useState<GameMode>('2p')
  const [humanColor, setHumanColor] = useState<PlayerColor>('red')
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [winner, setWinner] = useState<PlayerColor | null>(null)
  const [selectedPiece, setSelectedPiece] = useState<string | null>(null)
  const [validMoves, setValidMoves] = useState<string[]>([])
  const [thinking, setThinking] = useState(false)
  const aiProcessing = useRef(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const isHuman = useCallback((color: PlayerColor) => {
    if (gameMode === '2p') return true
    return color === humanColor
  }, [gameMode, humanColor])

  const resetGame = useCallback(() => {
    aiProcessing.current = false
    setBoard(createInitialBoard(['red', 'blue']))
    setCurrentPlayer('red')
    setWinner(null)
    setSelectedPiece(null)
    setValidMoves([])
    setThinking(false)
    setPhase('select')
  }, [])

  const startGame = useCallback((human: PlayerColor, mode: GameMode, diff: Difficulty) => {
    const ps = getPlayers(mode)
    const nb = createInitialBoard(ps)
    setBoard(nb)
    setPlayers(ps)
    setCurrentPlayer(ps[0])
    setHumanColor(human)
    setGameMode(mode)
    setDifficulty(diff)
    setWinner(null)
    setSelectedPiece(null)
    setValidMoves([])
    setThinking(false)
    setPhase('playing')
  }, [])

  useEffect(() => {
    if (phase !== 'playing' || winner || isHuman(currentPlayer) || aiProcessing.current) return
    aiProcessing.current = true
    setThinking(true)
    const timer = setTimeout(() => {
      const move = findBestMove(board, currentPlayer, difficulty)
      if (move) {
        const [fq, fr, tq, tr] = move
        const nb = applyMove(board, fq, fr, tq, tr)
        setBoard(nb)
        if (checkWin(nb, currentPlayer)) {
          setWinner(currentPlayer)
          setPhase('over')
        } else {
          setCurrentPlayer(nextPlayer(currentPlayer, players))
        }
      } else {
        setCurrentPlayer(nextPlayer(currentPlayer, players))
      }
      setThinking(false)
      aiProcessing.current = false
      setSelectedPiece(null)
      setValidMoves([])
    }, 300)
    return () => clearTimeout(timer)
  }, [phase, currentPlayer, winner, board, players, difficulty, isHuman])

  const handleCellClick = useCallback((q: number, r: number) => {
    if (thinking || phase !== 'playing' || winner) return
    if (!isHuman(currentPlayer)) return

    const key = qrKey(q, r)

    if (selectedPiece) {
      if (validMoves.includes(key)) {
        const [fq, fr] = parseKey(selectedPiece)
        const nb = applyMove(board, fq, fr, q, r)
        setBoard(nb)
        if (checkWin(nb, currentPlayer)) {
          setWinner(currentPlayer)
          setPhase('over')
        } else {
          setCurrentPlayer(nextPlayer(currentPlayer, players))
        }
        setSelectedPiece(null)
        setValidMoves([])
      } else if (board.get(key) === currentPlayer) {
        const [sq, sr] = parseKey(key)
        const moves = getAllMoves(board, sq, sr).map(([mq, mr]) => qrKey(mq, mr))
        setSelectedPiece(key)
        setValidMoves(moves)
      } else {
        setSelectedPiece(null)
        setValidMoves([])
      }
    } else {
      if (board.get(key) === currentPlayer) {
        const [sq, sr] = parseKey(key)
        const moves = getAllMoves(board, sq, sr).map(([mq, mr]) => qrKey(mq, mr))
        setSelectedPiece(key)
        setValidMoves(moves)
      }
    }
  }, [board, currentPlayer, selectedPiece, validMoves, winner, phase, thinking, players, isHuman])

  const drawBoard = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, BOARD_W, BOARD_H)
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, BOARD_W, BOARD_H)

    for (const color of PLAYER_ORDER) {
      const positions = getStartPositions(color)
      for (const [q, r] of positions) {
        const [px, py] = qrToPixel(q, r, HEX_SIZE)
        ctx.fillStyle = COLOR_HEX[color]
        ctx.globalAlpha = 0.2
        ctx.beginPath()
        ctx.arc(px + OFFSET_X, py + OFFSET_Y, HEX_SIZE * 0.9, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 1
      }
    }

    for (const [q, r] of ALL_CELLS) {
      const [px, py] = qrToPixel(q, r, HEX_SIZE)
      const cx = px + OFFSET_X
      const cy = py + OFFSET_Y
      const key = qrKey(q, r)

      ctx.beginPath()
      ctx.arc(cx, cy, HEX_SIZE * 0.45, 0, Math.PI * 2)
      ctx.fillStyle = '#2a2a3e'
      ctx.fill()
      ctx.strokeStyle = '#444'
      ctx.lineWidth = 1
      ctx.stroke()

      if (selectedPiece === key) {
        ctx.fillStyle = 'rgba(255,200,0,0.4)'
        ctx.beginPath()
        ctx.arc(cx, cy, HEX_SIZE * 0.9, 0, Math.PI * 2)
        ctx.fill()
      }

      if (validMoves.includes(key)) {
        ctx.fillStyle = 'rgba(0,255,0,0.3)'
        ctx.beginPath()
        ctx.arc(cx, cy, HEX_SIZE * 0.9, 0, Math.PI * 2)
        ctx.fill()
      }

      const cellState = board.get(key)
      if (cellState) {
        ctx.beginPath()
        ctx.arc(cx, cy, PIECE_RADIUS, 0, Math.PI * 2)
        ctx.fillStyle = COLOR_HEX[cellState]
        ctx.fill()
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 1.5
        ctx.stroke()
      }
    }
  }, [board, selectedPiece, validMoves])

  useEffect(() => { drawBoard() }, [drawBoard])

  const boardToQR = (clientX: number, clientY: number, rect: DOMRect): [number, number] | null => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = (clientX - rect.left) * scaleX - OFFSET_X
    const y = (clientY - rect.top) * scaleY - OFFSET_Y

    let bestQ = 0, bestR = 0, bestDist = Infinity
    for (const [q, r] of ALL_CELLS) {
      const [px, py] = qrToPixel(q, r, HEX_SIZE)
      const dist = Math.abs(x - px) + Math.abs(y - py)
      if (dist < bestDist) { bestDist = dist; bestQ = q; bestR = r }
    }
    if (bestDist > HEX_SIZE * 2) return null
    return [bestQ, bestR]
  }

  if (phase === 'select') {
    return (
      <div className="chk-app">
        <h1 className="chk-title">跳棋</h1>
        <div className="chk-select">
          <h2>游戏设置</h2>
          <div className="chk-section">
            <label>玩家数</label>
            <div className="chk-btn-group">
              <button className={`chk-btn ${gameMode === '1p' ? 'active' : ''}`} onClick={() => setGameMode('1p')}>1人 vs AI</button>
              <button className={`chk-btn ${gameMode === '2p' ? 'active' : ''}`} onClick={() => setGameMode('2p')}>2人对弈</button>
              <button className={`chk-btn ${gameMode === '3p' ? 'active' : ''}`} onClick={() => setGameMode('3p')}>3人+AI</button>
              <button className={`chk-btn ${gameMode === '6p' ? 'active' : ''}`} onClick={() => setGameMode('6p')}>6人+AI</button>
            </div>
          </div>
          {gameMode === '1p' && (
              <div className="chk-section">
                <label>选择颜色</label>
                <div className="chk-btn-group">
                  {(['red', 'yellow'] as PlayerColor[]).map(c => {
                    const aiColor: PlayerColor = c === 'red' ? 'yellow' : 'red'
                    return (
                      <button key={c} className="chk-btn" style={{ background: COLOR_HEX[c], color: '#fff' }} onClick={() => startGame(c, gameMode, difficulty)}>
                        {COLOR_NAMES[c]}（AI对手：{COLOR_NAMES[aiColor]}）
                      </button>
                    )
                  })}
                </div>
              </div>
          )}
          {gameMode !== '1p' && gameMode !== '2p' && (
            <div className="chk-section">
              <label>选择颜色</label>
              <div className="chk-btn-group">
                {getPlayers(gameMode).map(c => (
                  <button key={c} className="chk-btn" style={{ background: COLOR_HEX[c], color: '#fff' }} onClick={() => startGame(c, gameMode, difficulty)}>
                    {COLOR_NAMES[c]}
                  </button>
                ))}
              </div>
            </div>
          )}
          {gameMode === '2p' && (
            <div className="chk-section">
              <button className="chk-btn" onClick={() => startGame('red', '2p', difficulty)}>
                🔴红 vs 🟡黄 开始
              </button>
            </div>
          )}
          <div className="chk-rules">
            <h3>规则</h3>
            <p>移动棋子到对面三角区</p>
            <p>可单步移动或跳跃</p>
            <p>可连续跳跃（跳链）</p>
            <p>全部到达对面即获胜</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="chk-app">
      <header className="chk-header">
        <h1 className="chk-title-sm">跳棋</h1>
        <button className="chk-btn small" onClick={resetGame}>新游戏</button>
      </header>
      <div className="chk-turn">
        {winner
          ? `🏆 ${COLOR_NAMES[winner]}方获胜！`
          : `当前：${COLOR_NAMES[currentPlayer]}方${thinking ? '（AI思考中）' : ''}`
        }
      </div>
      <div className="chk-board-wrap">
        <canvas
          ref={canvasRef}
          width={BOARD_W}
          height={BOARD_H}
          className="chk-canvas"
          onClick={(e) => {
            const rect = canvasRef.current!.getBoundingClientRect()
            const pos = boardToQR(e.clientX, e.clientY, rect)
            if (pos) handleCellClick(pos[0], pos[1])
          }}
        />
        {thinking && <div className="chk-thinking">AI 思考中...</div>}
      </div>
      {winner && (
        <div className="chk-win-overlay">
          <div className="chk-win-text" style={{ color: COLOR_HEX[winner] }}>
            {isHuman(winner) ? '🎉 你赢了！' : `${COLOR_NAMES[winner]}方获胜！`}
          </div>
          <button className="chk-btn" onClick={resetGame}>再来一局</button>
        </div>
      )}
    </div>
  )
}