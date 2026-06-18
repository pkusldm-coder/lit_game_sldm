import { useState, useCallback, useRef, useEffect } from 'react'
import { createBoard, placeStone, isValidMove, getAllValidMoves, calculateScore } from './core/GameEngine'
import { findBestMove } from './core/ai'
import type { Stone, Board, GamePhase, Difficulty, GameMode } from './core/types'
import { BOARD_SIZE } from './core/types'
import './App.css'

const CELL_SIZE = 24
const PADDING = 20
const STONE_RADIUS = 10
const BOARD_PX = (BOARD_SIZE - 1) * CELL_SIZE + PADDING * 2
const KOMI = 6.5
const STAR_POINTS = [[3,3],[3,9],[3,15],[9,3],[9,9],[9,15],[15,3],[15,9],[15,15]]

export default function App() {
  const [phase, setPhase] = useState<GamePhase>('select')
  const [board, setBoard] = useState<Board>(() => createBoard())
  const [currentPlayer, setCurrentPlayer] = useState<Stone>('black')
  const [playerStone, setPlayerStone] = useState<Stone>('black')
  const [gameMode, setGameMode] = useState<GameMode>('ai')
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [lastBoard, setLastBoard] = useState<Board | null>(null)
  const [captured, setCaptured] = useState({ black: 0, white: 0 })
  const [winner, setWinner] = useState<Stone | null>(null)
  const [scores, setScores] = useState<{ black: number; white: number } | null>(null)
  const [thinking, setThinking] = useState(false)
  const [lastMove, setLastMove] = useState<[number, number] | null>(null)
  const [hoverPos, setHoverPos] = useState<[number, number] | null>(null)
  const [passCount, setPassCount] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const resetGame = useCallback(() => {
    setBoard(createBoard()); setCurrentPlayer('black'); setLastBoard(null)
    setCaptured({ black: 0, white: 0 }); setWinner(null); setScores(null)
    setThinking(false); setLastMove(null); setPassCount(0); setPhase('select')
  }, [])

  const startGame = useCallback((stone: Stone, mode: GameMode, diff: Difficulty) => {
    setBoard(createBoard()); setCurrentPlayer('black'); setPlayerStone(stone)
    setGameMode(mode); setDifficulty(diff); setLastBoard(null)
    setCaptured({ black: 0, white: 0 }); setWinner(null); setScores(null)
    setThinking(false); setLastMove(null); setPassCount(0); setPhase('playing')
  }, [])

  const doAiMove = useCallback((b: Board, lb: Board | null, stone: Stone, prevCaptured: { black: number; white: number }, humanStone: Stone) => {
    setThinking(true)
    setTimeout(() => {
      const aiMoves = getAllValidMoves(b, stone, lb)
      if (aiMoves.length === 0) {
        const newPass = passCount + 1
        setPassCount(newPass)
        if (newPass >= 2) { endGame(b); setThinking(false); return }
        setCurrentPlayer(humanStone)
        setThinking(false)
        return
      }
      const move = findBestMove(b, stone, lb, difficulty)
      if (!move) { setCurrentPlayer(humanStone); setThinking(false); return }
      const [aiR, aiC] = move
      const aiBoard = placeStone(b, aiR, aiC, stone)
      if (!aiBoard) { setCurrentPlayer(humanStone); setThinking(false); return }
      const opponent: Stone = stone === 'black' ? 'white' : 'black'
      const newCaptured = { ...prevCaptured }
      newCaptured[stone] += countStonesDiff(b, aiBoard, opponent)
      setBoard(aiBoard); setLastBoard(b); setCaptured(newCaptured)
      setLastMove([aiR, aiC]); setPassCount(0); setCurrentPlayer(humanStone)
      setThinking(false)
    }, 300)
  }, [difficulty, passCount])

  function countStonesDiff(oldBoard: Board, newBoard: Board, stone: Stone): number {
    let old = 0, new_ = 0
    for (let r = 0; r < BOARD_SIZE; r++) for (let c = 0; c < BOARD_SIZE; c++) {
      if (oldBoard[r][c] === stone) old++
      if (newBoard[r][c] === stone) new_++
    }
    return old - new_
  }

  const handleCellClick = useCallback((row: number, col: number) => {
    if (thinking || phase !== 'playing' || winner) return
    if (gameMode === 'ai' && currentPlayer !== playerStone) return
    if (!isValidMove(board, row, col, currentPlayer, lastBoard)) return
    const newBoard = placeStone(board, row, col, currentPlayer)
    if (!newBoard) return
    const opponent: Stone = currentPlayer === 'black' ? 'white' : 'black'
    const newCaptured = { ...captured }
    newCaptured[currentPlayer] += countStonesDiff(board, newBoard, opponent)
    setBoard(newBoard); setLastBoard(board); setCaptured(newCaptured)
    setLastMove([row, col]); setPassCount(0)
    setCurrentPlayer(opponent)
    if (gameMode === 'ai' && opponent !== playerStone) {
      doAiMove(newBoard, board, opponent, newCaptured, playerStone)
    }
  }, [board, currentPlayer, playerStone, gameMode, lastBoard, captured, thinking, winner, phase, doAiMove])

  const handlePass = useCallback(() => {
    if (thinking || phase !== 'playing' || winner) return
    const newPass = passCount + 1
    setPassCount(newPass)
    if (newPass >= 2) { endGame(board); return }
    const next: Stone = currentPlayer === 'black' ? 'white' : 'black'
    setCurrentPlayer(next)
    if (gameMode === 'ai' && next !== playerStone) {
      doAiMove(board, lastBoard, next, captured, playerStone)
    }
  }, [thinking, phase, winner, passCount, board, currentPlayer, playerStone, gameMode, lastBoard, captured, doAiMove])

  const endGame = useCallback((finalBoard: Board) => {
    let blackTerritory = 0, whiteTerritory = 0
    const visited = new Set<string>()
    const dirs: [number, number][] = [[0,1],[0,-1],[1,0],[-1,0]]
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const key = `${r},${c}`
        if (finalBoard[r][c] !== null || visited.has(key)) continue
        const territoryStones = new Set<Stone>()
        const stack: [number, number][] = [[r, c]]
        let size = 0
        while (stack.length > 0) {
          const [sr, sc] = stack.pop()!
          const sk = `${sr},${sc}`
          if (visited.has(sk)) continue
          visited.add(sk)
          if (sr < 0 || sr >= BOARD_SIZE || sc < 0 || sc >= BOARD_SIZE) continue
          if (finalBoard[sr][sc] !== null) { territoryStones.add(finalBoard[sr][sc] as Stone); continue }
          size++
          for (const [dr, dc] of dirs) {
            const nr = sr + dr, nc = sc + dc
            if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) stack.push([nr, nc])
          }
        }
        if (territoryStones.size === 1) {
          const owner = territoryStones.values().next().value as Stone
          if (owner === 'black') blackTerritory += size
          else whiteTerritory += size
        }
      }
    }
    const finalScores = calculateScore(finalBoard, blackTerritory, whiteTerritory, KOMI)
    setScores(finalScores)
    setWinner(finalScores.black > finalScores.white ? 'black' : 'white')
    setPhase('over')
  }, [])

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
    return [row, col]
  }

  const drawBoard = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d'); if (!ctx) return
    ctx.clearRect(0, 0, BOARD_PX, BOARD_PX)
    ctx.fillStyle = '#dcb35c'; ctx.fillRect(0, 0, BOARD_PX, BOARD_PX)
    ctx.strokeStyle = '#333'; ctx.lineWidth = 1
    for (let i = 0; i < BOARD_SIZE; i++) {
      const pos = PADDING + i * CELL_SIZE
      ctx.beginPath(); ctx.moveTo(PADDING, pos); ctx.lineTo(PADDING + (BOARD_SIZE - 1) * CELL_SIZE, pos); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(pos, PADDING); ctx.lineTo(pos, PADDING + (BOARD_SIZE - 1) * CELL_SIZE); ctx.stroke()
    }
    ctx.fillStyle = '#333'
    for (const [sr, sc] of STAR_POINTS) {
      ctx.beginPath(); ctx.arc(PADDING + sc * CELL_SIZE, PADDING + sr * CELL_SIZE, 3, 0, Math.PI * 2); ctx.fill()
    }
    if (lastMove) {
      const [lr, lc] = lastMove
      ctx.fillStyle = 'rgba(255,255,0,0.3)'
      ctx.fillRect(PADDING + lc * CELL_SIZE - CELL_SIZE / 2, PADDING + lr * CELL_SIZE - CELL_SIZE / 2, CELL_SIZE, CELL_SIZE)
    }
    for (let r = 0; r < BOARD_SIZE; r++) for (let c = 0; c < BOARD_SIZE; c++) {
      const stone = board[r][c]; if (!stone) continue
      const x = PADDING + c * CELL_SIZE, y = PADDING + r * CELL_SIZE
      const g = ctx.createRadialGradient(x - 2, y - 2, 2, x, y, STONE_RADIUS)
      if (stone === 'black') { g.addColorStop(0, '#555'); g.addColorStop(1, '#111') }
      else { g.addColorStop(0, '#fff'); g.addColorStop(1, '#ccc') }
      ctx.beginPath(); ctx.arc(x, y, STONE_RADIUS, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill()
      ctx.strokeStyle = stone === 'black' ? '#000' : '#999'; ctx.lineWidth = 1; ctx.stroke()
      if (lastMove && lastMove[0] === r && lastMove[1] === c) {
        ctx.fillStyle = stone === 'black' ? '#ff0' : '#f00'
        ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill()
      }
    }
    if (hoverPos && !winner && !thinking && phase === 'playing') {
      const [hr, hc] = hoverPos
      if (board[hr][hc] === null && isValidMove(board, hr, hc, currentPlayer, lastBoard)) {
        ctx.globalAlpha = 0.4
        ctx.beginPath(); ctx.arc(PADDING + hc * CELL_SIZE, PADDING + hr * CELL_SIZE, STONE_RADIUS, 0, Math.PI * 2)
        ctx.fillStyle = currentPlayer === 'black' ? '#333' : '#ddd'; ctx.fill()
        ctx.globalAlpha = 1
      }
    }
  }, [board, lastMove, hoverPos, currentPlayer, lastBoard, winner, thinking, phase])

  useEffect(() => { drawBoard() }, [drawBoard])

  if (phase === 'select') {
    return (
      <div className="go-app">
        <h1 className="go-title">围棋</h1>
        <div className="go-select">
          <h2>游戏设置</h2>
          <div className="go-section">
            <label>游戏模式</label>
            <div className="go-btn-group">
              <button className={`go-btn ${gameMode === 'ai' ? 'active' : ''}`} onClick={() => setGameMode('ai')}>人机对战</button>
              <button className={`go-btn ${gameMode === 'pvp' ? 'active' : ''}`} onClick={() => setGameMode('pvp')}>双人对战</button>
            </div>
          </div>
          {gameMode === 'ai' && (
            <div className="go-section">
              <label>AI 难度</label>
              <div className="go-btn-group">
                {(['easy','medium','hard'] as Difficulty[]).map(d => (
                  <button key={d} className={`go-btn ${difficulty === d ? 'active' : ''}`} onClick={() => setDifficulty(d)}>
                    {d === 'easy' ? '简单' : d === 'medium' ? '中等' : '困难'}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="go-section">
            <label>选择执棋</label>
            <div className="go-btn-group">
              <button className="go-btn" onClick={() => startGame('black', gameMode, difficulty)}>⚫ 执黑先行</button>
              <button className="go-btn" onClick={() => startGame('white', gameMode, difficulty)}>⚪ 执白后行</button>
            </div>
          </div>
          <div className="go-rules">
            <h3>规则</h3>
            <p>19×19 棋盘，黑白交替落子</p>
            <p>围住对方棋子提子</p>
            <p>不可自杀，不可打劫重复</p>
            <p>双方连续虚 pass 终局计分</p>
            <p>白方贴目 6.5</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="go-app">
      <header className="go-header">
        <h1 className="go-title-sm">围棋</h1>
        <div className="go-header-actions">
          <button className="go-btn small" onClick={handlePass} disabled={thinking || !!winner}>Pass</button>
          <button className="go-btn small" onClick={resetGame}>新游戏</button>
        </div>
      </header>
      <div className="go-info">
        <span>{currentPlayer === 'black' ? '⚫ 黑方' : '⚪ 白方'}回合{thinking ? '（AI思考中）' : ''}</span>
        <span>黑提{captured.black} 白提{captured.white}</span>
      </div>
      <div className="go-board-wrap">
        <canvas ref={canvasRef} width={BOARD_PX} height={BOARD_PX} className="go-canvas"
          onClick={e => { const r = canvasRef.current!.getBoundingClientRect(); const p = boardToCoord(e.clientX, e.clientY, r); if (p) handleCellClick(p[0], p[1]) }}
          onMouseMove={e => { const r = canvasRef.current!.getBoundingClientRect(); setHoverPos(boardToCoord(e.clientX, e.clientY, r)) }}
          onMouseLeave={() => setHoverPos(null)}
        />
        {thinking && <div className="go-thinking">AI 思考中...</div>}
      </div>
      {winner && scores && (
        <div className="go-win-overlay">
          <div className="go-win-text">{winner === 'black' ? '⚫ 黑方胜' : '⚪ 白方胜'}</div>
          <div className="go-score-detail">黑 {scores.black} 点 vs 白 {scores.white} 点</div>
          {gameMode === 'ai' && <div className="go-win-detail">{winner === playerStone ? '🎉 你赢了！' : '😢 你输了！'}</div>}
          <button className="go-btn" onClick={resetGame}>再来一局</button>
        </div>
      )}
    </div>
  )
}