import { useState, useRef, useEffect } from 'react'
import {
  createBoard, createBoardFlip, getMoves, applyMove, checkWin, nextPlayer, resolveCapture,
} from './core/GameEngine'
import { findBestMove } from './core/ai'
import type { Board, Player, Move, GamePhase, Difficulty, GameMode } from './core/types'
import { PIECE_NAMES, ROWS, COLS } from './core/types'
import './App.css'

const CELL = 60
const PAD = 28
const BOARD_W = (COLS - 1) * CELL + PAD * 2
const BOARD_H = (ROWS - 1) * CELL + PAD * 2
const PIECE_R = 24

export default function App() {
  const [phase, setPhase] = useState<GamePhase>('setup')
  const [board, setBoard] = useState<Board>(() => createBoard('hidden'))
  const [currentPlayer, setCurrentPlayer] = useState<Player>('red')
  const [humanColor, setHumanColor] = useState<Player>('red')
  const [gameMode, setGameMode] = useState<GameMode>('hidden')
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [winner, setWinner] = useState<Player | null>(null)
  const [selectedPos, setSelectedPos] = useState<[number, number] | null>(null)
  const [validMoves, setValidMoves] = useState<Move[]>([])
  const [message, setMessage] = useState('')
  const [captureMsg, setCaptureMsg] = useState<string | null>(null)
  const [showRules, setShowRules] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const isHuman = (color: Player) => color === humanColor

  const resetGame = () => {
    setBoard(createBoard(gameMode))
    setCurrentPlayer('red')
    setWinner(null)
    setSelectedPos(null)
    setValidMoves([])
    setMessage('')
    setCaptureMsg(null)
    setPhase('setup')
  }

  const startGame = (color: Player, mode: GameMode, diff: Difficulty) => {
    const initial = mode === 'flip' ? createBoardFlip() : createBoard(mode)
    if (mode === 'hidden') {
      for (let r = 0; r < ROWS; r++)
        for (let c = 0; c < COLS; c++) {
          const p = initial[r][c]
          if (p && p.player === color) p.revealed = true
        }
    }
    setBoard(initial)
    setCurrentPlayer('red')
    setHumanColor(color)
    setGameMode(mode)
    setDifficulty(diff)
    setWinner(null)
    setSelectedPos(null)
    setValidMoves([])
    setCaptureMsg(null)
    setPhase('playing')
    setMessage(isHuman('red') ? '红方走棋' : 'AI思考中...')
  }

  const doMove = (fromR: number, fromC: number, toR: number, toC: number) => {
    const attacker = board[fromR][fromC]
    const defender = board[toR][toC]
    const nb = applyMove(board, { fromRow: fromR, fromCol: fromC, toRow: toR, toCol: toC })

    if (defender) {
      const result = resolveCapture(attacker!, defender)
      const aName = PIECE_NAMES[attacker!.type]
      const dName = PIECE_NAMES[defender.type]
      let msg: string
      if (result === 'attackerWin') msg = `${aName} 吃掉了 ${dName}`
      else if (result === 'defenderWin') msg = `${aName} 被 ${dName} 吃掉`
      else msg = `${aName} 与 ${dName} 同归于尽`
      msg += ` (${attacker!.rank} vs ${defender.rank})`
      setCaptureMsg(msg)
      setTimeout(() => setCaptureMsg(null), 2500)
      setTimeout(() => setCaptureMsg(null), 2000)
    }

    const p = nb[toR][toC]
    if (p && gameMode !== 'hidden') p.revealed = true

    setBoard(nb)
    setSelectedPos(null)
    setValidMoves([])

    const w = checkWin(nb, currentPlayer)
    if (w) {
      setWinner(w)
      setPhase('over')
      setMessage(`${w === 'red' ? '红' : '蓝'}方获胜！`)
      return
    }

    const next = nextPlayer(currentPlayer)
    setCurrentPlayer(next)
    setMessage(isHuman(next) ? `${next === 'red' ? '红' : '蓝'}方走棋` : 'AI思考中...')
  }

  const handleCellClick = (r: number, c: number) => {
    if (phase !== 'playing' || winner || !isHuman(currentPlayer)) return
    const piece = board[r][c]

    if (gameMode === 'flip' && piece && piece.player === currentPlayer && !piece.revealed) {
      const nb = board.map(row => [...row])
      nb[r][c] = { ...nb[r][c]!, revealed: true }
      setBoard(nb as Board)
      return
    }

    if (selectedPos) {
      const hit = validMoves.find(m => m.toRow === r && m.toCol === c)
      if (hit) { doMove(selectedPos[0], selectedPos[1], r, c); return }
      if (piece && piece.player === currentPlayer && piece.revealed) {
        setSelectedPos([r, c])
        setValidMoves(getMoves(board, r, c))
        return
      }
      setSelectedPos(null); setValidMoves([]); return
    }

    if (piece && piece.player === currentPlayer && piece.revealed) {
      setSelectedPos([r, c])
      setValidMoves(getMoves(board, r, c))
    }
  }

  const aiProcessing = useRef(false)
  const doMoveRef = useRef(doMove)
  doMoveRef.current = doMove

  useEffect(() => {
    if (phase !== 'playing' || winner || currentPlayer === humanColor || aiProcessing.current) return
    aiProcessing.current = true
    const timer = setTimeout(() => {
      try {
        const move = findBestMove(board, currentPlayer, gameMode, difficulty)
        if (move) doMoveRef.current(move.fromRow, move.fromCol, move.toRow, move.toCol)
      } catch (e) {
        console.error('AI error', e)
      }
      aiProcessing.current = false
    }, 800)
    return () => clearTimeout(timer)
  }, [phase, currentPlayer, winner, board, difficulty, gameMode, humanColor])

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d'); if (!ctx) return

    ctx.clearRect(0, 0, BOARD_W, BOARD_H)
    ctx.fillStyle = '#f0d9b5'
    ctx.fillRect(0, 0, BOARD_W, BOARD_H)

    // grid
    ctx.strokeStyle = '#666'
    ctx.lineWidth = 1
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const x = PAD + c * CELL, y = PAD + r * CELL
        if (r < ROWS - 1) {
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + CELL); ctx.stroke()
        }
        if (c < COLS - 1) {
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + CELL, y); ctx.stroke()
        }
      }
    }

    // mountain center
    ctx.fillStyle = '#8b7355'
    ctx.fillRect(PAD + 2 * CELL - 6, PAD + 5 * CELL - 6, 12, 12)
    ctx.fillStyle = '#333'
    ctx.font = 'bold 14px serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('山', PAD + 2 * CELL, PAD + 5 * CELL)

    ctx.fillRect(PAD + 2 * CELL - 6, PAD + 6 * CELL - 6, 12, 12)
    ctx.fillText('山', PAD + 2 * CELL, PAD + 6 * CELL)

    // bunkers
    for (const [br, bc] of [[1,1],[1,3],[4,1],[4,3],[7,1],[7,3],[10,1],[10,3]]) {
      const x = PAD + bc * CELL, y = PAD + br * CELL
      ctx.fillStyle = 'rgba(200,180,140,0.5)'
      ctx.beginPath(); ctx.arc(x, y, 16, 0, Math.PI * 2); ctx.fill()
      ctx.strokeStyle = '#8b7355'
      ctx.lineWidth = 2
      ctx.beginPath(); ctx.arc(x, y, 14, 0, Math.PI * 2); ctx.stroke()
    }

    // pieces
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const x = PAD + c * CELL, y = PAD + r * CELL
        const p = board[r][c]; if (!p) continue

        const isSel = selectedPos && selectedPos[0] === r && selectedPos[1] === c
        const isVal = validMoves.some(m => m.toRow === r && m.toCol === c)
        const hidden = !p.revealed

        if (isSel) {
          ctx.beginPath(); ctx.arc(x, y, PIECE_R + 4, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(255,200,0,0.5)'; ctx.fill()
        }
        if (isVal) {
          ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2)
          ctx.fillStyle = board[r][c] ? 'rgba(255,0,0,0.4)' : 'rgba(0,200,0,0.4)'
          ctx.fill()
        }

        if (hidden) {
          ctx.beginPath(); ctx.arc(x, y, PIECE_R, 0, Math.PI * 2)
          ctx.fillStyle = '#888'; ctx.fill()
          ctx.strokeStyle = '#555'; ctx.lineWidth = 2; ctx.stroke()
          ctx.fillStyle = '#fff'
          ctx.font = 'bold 14px sans-serif'
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
          ctx.fillText('?', x + 0.5, y - 0.5)
        } else {
          const fg = p.player === 'red' ? ['#fce8c8', '#c00'] : ['#d0d0d0', '#111']
          ctx.beginPath(); ctx.arc(x, y, PIECE_R, 0, Math.PI * 2)
          ctx.fillStyle = fg[0]; ctx.fill()
          ctx.strokeStyle = fg[1]; ctx.lineWidth = 2; ctx.stroke()
          ctx.fillStyle = fg[1]
          ctx.font = 'bold 14px serif'
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
          ctx.fillText(PIECE_NAMES[p.type], x + 0.5, y - 0.5)
        }
      }
    }
  }, [board, selectedPos, validMoves, gameMode])

  const boardToRC = (clientX: number, clientY: number, rect: DOMRect): [number, number] | null => {
    const canvas = canvasRef.current; if (!canvas) return null
    const sx = canvas.width / rect.width, sy = canvas.height / rect.height
    const x = (clientX - rect.left) * sx, y = (clientY - rect.top) * sy
    const c = Math.round((x - PAD) / CELL), r = Math.round((y - PAD) / CELL)
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return null
    if (Math.abs(x - (PAD + c * CELL)) > CELL * 0.45 || Math.abs(y - (PAD + r * CELL)) > CELL * 0.45) return null
    return [r, c]
  }

  if (phase === 'setup') {
    return (
      <div className="jq-app">
        <div style={{background:'#500',color:'#ff0',padding:'4px 8px',fontSize:13,textAlign:'center'}}>
          [{phase}] P:{currentPlayer} H:{humanColor} AI:{aiProcessing.current?'busy':'idle'} {gameMode} {difficulty}
        </div>
        <h1 className="jq-title">军棋</h1>
        <div className="jq-select">
          <h2>游戏设置</h2>
          <div className="jq-section">
            <label>模式</label>
            <div className="jq-btn-group">
              <button className={`jq-btn ${gameMode === 'hidden' ? 'active' : ''}`} onClick={() => setGameMode('hidden')}>暗棋（隐藏）</button>
              <button className={`jq-btn ${gameMode === 'flip' ? 'active' : ''}`} onClick={() => setGameMode('flip')}>翻棋（随机布局）</button>
            </div>
          </div>
          <div className="jq-section">
            <label>选择颜色</label>
            <div className="jq-btn-group">
              <button className="jq-btn" style={{background:'#c00',color:'#fff'}} onClick={() => startGame('red', gameMode, difficulty)}>红方</button>
              <button className="jq-btn" style={{background:'#44a',color:'#fff'}} onClick={() => startGame('blue', gameMode, difficulty)}>蓝方</button>
            </div>
          </div>
          <div className="jq-section">
            <label>AI难度</label>
            <div className="jq-btn-group">
              {(['easy','medium','hard'] as Difficulty[]).map(d => (
                <button key={d} className={`jq-btn ${difficulty === d ? 'active' : ''}`} onClick={() => setDifficulty(d)}>
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
    <div className="jq-app">
      <div style={{background:'#500',color:'#ff0',padding:'4px 8px',fontSize:13,textAlign:'center'}}>
        [{phase}] P:{currentPlayer} H:{humanColor} AI:{aiProcessing.current?'busy':'idle'} {gameMode} {difficulty}
      </div>
      <header className="jq-header">
        <h1 className="jq-title-sm">军棋</h1>
        <div style={{display:'flex',gap:6}}>
          <button className="jq-btn small" onClick={() => setShowRules(true)}>规则</button>
          <button className="jq-btn small" onClick={resetGame}>新游戏</button>
        </div>
      </header>
      <div className="jq-turn">{message}</div>
      <div style={{fontSize:11,color:'#888',marginBottom:4}}>
        P:{currentPlayer} H:{humanColor} AI:{aiProcessing.current?'busy':'idle'} mode:{gameMode} diff:{difficulty} moveCount:{validMoves.length}
      </div>
      {captureMsg && <div className="jq-capture">{captureMsg}</div>}
      <div className="jq-board-wrap">
        <canvas
          ref={canvasRef}
          width={BOARD_W}
          height={BOARD_H}
          className="jq-canvas"
          onClick={(e) => {
            const rect = canvasRef.current!.getBoundingClientRect()
            const pos = boardToRC(e.clientX, e.clientY, rect)
            if (pos) handleCellClick(pos[0], pos[1])
          }}
        />
      </div>
      {winner && (
        <div className="jq-win">
          <div className="jq-win-text">{winner === 'red' ? '🔴 红方获胜！' : '🔵 蓝方获胜！'}</div>
          <button className="jq-btn" onClick={resetGame}>再来一局</button>
        </div>
      )}

      {showRules && (
        <div className="jq-overlay" onClick={() => setShowRules(false)}>
          <div className="jq-rules" onClick={e => e.stopPropagation()}>
            <h2>军棋规则</h2>
            <div className="jq-rules-section">
              <h3>棋子大小</h3>
              <p>司令 &gt; 军长 &gt; 师长 &gt; 旅长 &gt; 团长 &gt; 营长 &gt; 连长 &gt; 排长 &gt; 工兵</p>
              <p>炸弹：遇到任何棋子都同归于尽</p>
              <p>地雷：只有工兵可以挖，其他棋子碰到地雷即被消灭</p>
              <p>军旗：被对方吃掉则输棋</p>
            </div>
            <div className="jq-rules-section">
              <h3>走棋规则</h3>
              <p>每次走一格（上/下/左/右），不能斜走</p>
              <p>行营（圆圈标记）中的棋子不能被对方吃掉</p>
              <p>铁路上可以沿直线任意滑动（不能转弯），山界处铁路不通</p>
              <p>工兵在铁路上的走法更灵活，但本游戏简化处理，工兵与其他子在铁路上走法一致</p>
            </div>
            <div className="jq-rules-section">
              <h3>暗棋模式</h3>
              <p>双方棋子按固定布局摆放，红方在下、蓝方在上</p>
              <p>你只能看到自己棋子的名称，对方棋子显示为"?"</p>
              <p>当你吃掉对方棋子时，可以看到该棋子的名称</p>
            </div>
            <div className="jq-rules-section">
              <h3>翻棋模式</h3>
              <p>所有棋子随机打乱、面朝下放置在棋盘上</p>
              <p>点击己方棋子翻开（翻开后才能移动）</p>
              <p>开局时棋盘边缘的棋子自动翻开</p>
            </div>
            <div className="jq-rules-section">
              <h3>获胜条件</h3>
              <p>吃掉对方的军旗，或对方无棋可走</p>
            </div>
            <button className="jq-btn" onClick={() => setShowRules(false)} style={{marginTop:12}}>知道了</button>
          </div>
        </div>
      )}
    </div>
  )
}
