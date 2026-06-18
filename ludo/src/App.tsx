import { useState, useCallback, useRef, useEffect } from 'react'
import {
  createInitialPieces, rollDice, getValidMoves, applyMove, checkWin,
  nextPlayer, getPieceCoord, getTrackCoord, getHomeCoord,
  getGoalCoord, getTrackCellColor, hasAllHome,
  TRACK_SIZE, HOME_SIZE,
} from './core/GameEngine'
import { chooseMove } from './core/ai'
import type { PlayerColor, Piece, GamePhase, Difficulty } from './core/types'
import { PLAYER_ORDER, COLOR_NAMES, COLOR_HEX, COLOR_HEX_DARK, GOAL_PROGRESS } from './core/types'
import './App.css'

const GRID_ROWS = 15
const GRID_COLS = 15
const CELL_SIZE = 36
const PIECE_RADIUS = 13
const BOARD_W = GRID_COLS * CELL_SIZE
const BOARD_H = GRID_ROWS * CELL_SIZE

const CORNER_CELLS: [number, number, PlayerColor][] = [
  [0,0,'green'],[0,1,'green'],[0,2,'green'],[0,3,'green'],[0,4,'green'],[0,5,'green'],
  [1,0,'green'],[1,1,'green'],[1,2,'green'],[1,3,'green'],[1,4,'green'],[1,5,'green'],
  [2,0,'green'],[2,1,'green'],[2,2,'green'],[2,3,'green'],[2,4,'green'],[2,5,'green'],
  [3,0,'green'],[3,1,'green'],[3,2,'green'],[3,3,'green'],[3,4,'green'],[3,5,'green'],
  [4,0,'green'],[4,1,'green'],[4,2,'green'],[4,3,'green'],[4,4,'green'],[4,5,'green'],
  [5,0,'green'],[5,1,'green'],[5,2,'green'],[5,3,'green'],[5,4,'green'],[5,5,'green'],
  [0,9,'yellow'],[0,10,'yellow'],[0,11,'yellow'],[0,12,'yellow'],[0,13,'yellow'],[0,14,'yellow'],
  [1,9,'yellow'],[1,10,'yellow'],[1,11,'yellow'],[1,12,'yellow'],[1,13,'yellow'],[1,14,'yellow'],
  [2,9,'yellow'],[2,10,'yellow'],[2,11,'yellow'],[2,12,'yellow'],[2,13,'yellow'],[2,14,'yellow'],
  [3,9,'yellow'],[3,10,'yellow'],[3,11,'yellow'],[3,12,'yellow'],[3,13,'yellow'],[3,14,'yellow'],
  [4,9,'yellow'],[4,10,'yellow'],[4,11,'yellow'],[4,12,'yellow'],[4,13,'yellow'],[4,14,'yellow'],
  [5,9,'yellow'],[5,10,'yellow'],[5,11,'yellow'],[5,12,'yellow'],[5,13,'yellow'],[5,14,'yellow'],
  [9,0,'red'],[9,1,'red'],[9,2,'red'],[9,3,'red'],[9,4,'red'],[9,5,'red'],
  [10,0,'red'],[10,1,'red'],[10,2,'red'],[10,3,'red'],[10,4,'red'],[10,5,'red'],
  [11,0,'red'],[11,1,'red'],[11,2,'red'],[11,3,'red'],[11,4,'red'],[11,5,'red'],
  [12,0,'red'],[12,1,'red'],[12,2,'red'],[12,3,'red'],[12,4,'red'],[12,5,'red'],
  [13,0,'red'],[13,1,'red'],[13,2,'red'],[13,3,'red'],[13,4,'red'],[13,5,'red'],
  [14,0,'red'],[14,1,'red'],[14,2,'red'],[14,3,'red'],[14,4,'red'],[14,5,'red'],
  [9,9,'blue'],[9,10,'blue'],[9,11,'blue'],[9,12,'blue'],[9,13,'blue'],[9,14,'blue'],
  [10,9,'blue'],[10,10,'blue'],[10,11,'blue'],[10,12,'blue'],[10,13,'blue'],[10,14,'blue'],
  [11,9,'blue'],[11,10,'blue'],[11,11,'blue'],[11,12,'blue'],[11,13,'blue'],[11,14,'blue'],
  [12,9,'blue'],[12,10,'blue'],[12,11,'blue'],[12,12,'blue'],[12,13,'blue'],[12,14,'blue'],
  [13,9,'blue'],[13,10,'blue'],[13,11,'blue'],[13,12,'blue'],[13,13,'blue'],[13,14,'blue'],
  [14,9,'blue'],[14,10,'blue'],[14,11,'blue'],[14,12,'blue'],[14,13,'blue'],[14,14,'blue'],
]

const CAMP_CENTER: Record<PlayerColor, [number, number]> = {
  red: [12, 2],
  green: [2, 2],
  yellow: [2, 12],
  blue: [12, 12],
}

type GameMode = '1human' | '2human'

export default function App() {
  const [phase, setPhase] = useState<GamePhase>('select')
  const [pieces, setPieces] = useState<Piece[]>(() => createInitialPieces())
  const [currentPlayer, setCurrentPlayer] = useState<PlayerColor>('red')
  const [humanColor, setHumanColor] = useState<PlayerColor>('red')
  const [gameMode, setGameMode] = useState<GameMode>('1human')
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [winner, setWinner] = useState<PlayerColor | null>(null)
  const [diceValue, setDiceValue] = useState<number | null>(null)
  const [validTargets, setValidTargets] = useState<Piece[]>([])
  const [message, setMessage] = useState('')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const isHuman = useCallback((color: PlayerColor) => {
    if (gameMode === '1human') return color === humanColor
    return color === humanColor || color === nextPlayer(humanColor)
  }, [gameMode, humanColor])

  const resetGame = useCallback(() => {
    setPieces(createInitialPieces())
    setCurrentPlayer('red')
    setWinner(null)
    setDiceValue(null)
    setValidTargets([])
    setMessage('')
    setPhase('select')
  }, [])

  const startGame = useCallback((color: PlayerColor, mode: GameMode, diff: Difficulty) => {
    setPieces(createInitialPieces())
    setCurrentPlayer('red')
    setHumanColor(color)
    setGameMode(mode)
    setDifficulty(diff)
    setWinner(null)
    setDiceValue(null)
    setValidTargets([])
    setPhase('playing')
    setMessage(isHuman('red') ? '点击骰子开始' : `${COLOR_NAMES['red']}方回合`)
  }, [isHuman])

  const finishMove = useCallback((newPieces: Piece[], dice: number, mover: PlayerColor) => {
    if (checkWin(newPieces, mover)) {
      setWinner(mover)
      setPhase('over')
      setMessage(`${COLOR_NAMES[mover]}方获胜！`)
      return
    }
    if (dice === 6) {
      setMessage(`🎲 掷出6！${COLOR_NAMES[mover]}方额外回合`)
    } else {
      const next = nextPlayer(mover)
      setCurrentPlayer(next)
      setMessage(`${COLOR_NAMES[next]}方回合`)
    }
    setDiceValue(null)
    setValidTargets([])
  }, [])

  const humanRoll = useCallback(() => {
    if (winner || !isHuman(currentPlayer) || diceValue !== null || validTargets.length > 0) return
    const val = rollDice()
    setDiceValue(val)
    const valid = getValidMoves(pieces, currentPlayer, val)
    setValidTargets(valid)
    if (valid.length === 0) {
      setMessage(`🎲 ${val}，无可用棋子，跳过`)
      setTimeout(() => finishMove(pieces, val, currentPlayer), 800)
    } else if (valid.length === 1) {
      const chosen = valid[0]
      const newPieces = applyMove(pieces, chosen, val)
      setPieces(newPieces)
      finishMove(newPieces, val, currentPlayer)
    } else {
      setMessage(`🎲 ${val}，点击棋子移动`)
    }
  }, [winner, currentPlayer, pieces, diceValue, validTargets, isHuman, finishMove])

  const humanSelectPiece = useCallback((piece: Piece) => {
    if (!diceValue || winner || !isHuman(currentPlayer)) return
    const newPieces = applyMove(pieces, piece, diceValue!)
    setPieces(newPieces)
    finishMove(newPieces, diceValue!, currentPlayer)
  }, [pieces, diceValue, currentPlayer, winner, isHuman, finishMove])

  const handleCanvasClick = useCallback((row: number, col: number) => {
    if (!isHuman(currentPlayer) || validTargets.length === 0 || winner) return
    for (const p of validTargets) {
      const [pr, pc] = getPieceCoord(p)
      if (pr === row && pc === col) {
        humanSelectPiece(p)
        return
      }
    }
  }, [currentPlayer, validTargets, winner, isHuman, humanSelectPiece])

  useEffect(() => {
    if (phase !== 'playing' || winner || isHuman(currentPlayer) || diceValue !== null || validTargets.length > 0) return

    const delay = setTimeout(() => {
      setMessage(`${COLOR_NAMES[currentPlayer]}方（AI）思考中...`)
      const thinkDelay = setTimeout(() => {
        const val = rollDice()
        setDiceValue(val)
        const valid = getValidMoves(pieces, currentPlayer, val)

        if (valid.length === 0) {
          setMessage(`${COLOR_NAMES[currentPlayer]}方无可用棋子，跳过`)
          setTimeout(() => finishMove(pieces, val, currentPlayer), 500)
          return
        }

        const chosen = chooseMove(pieces, currentPlayer, val, difficulty)
        if (!chosen) {
          setTimeout(() => finishMove(pieces, val, currentPlayer), 500)
          return
        }

        const newPieces = applyMove(pieces, chosen, val)
        setPieces(newPieces)
        finishMove(newPieces, val, currentPlayer)
      }, 600)
      return () => clearTimeout(thinkDelay)
    }, 400)
    return () => clearTimeout(delay)
  }, [phase, currentPlayer, winner, diceValue, validTargets, pieces, difficulty, isHuman, finishMove])

  const drawDiceFace = useCallback((ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, value: number) => {
    const dot = (x: number, y: number) => {
      ctx.beginPath()
      ctx.arc(cx + x * size, cy + y * size, size * 0.18, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.fillStyle = '#fff'
    ctx.fillRect(cx - size * 0.8, cy - size * 0.8, size * 1.6, size * 1.6)
    ctx.strokeStyle = '#333'
    ctx.lineWidth = 2
    ctx.strokeRect(cx - size * 0.8, cy - size * 0.8, size * 1.6, size * 1.6)

    ctx.fillStyle = '#333'
    const D: Record<number, [number, number][]> = {
      1: [[0,0]],
      2: [[-0.4,-0.4],[0.4,0.4]],
      3: [[-0.4,-0.4],[0,0],[0.4,0.4]],
      4: [[-0.4,-0.4],[-0.4,0.4],[0.4,-0.4],[0.4,0.4]],
      5: [[-0.4,-0.4],[-0.4,0.4],[0,0],[0.4,-0.4],[0.4,0.4]],
      6: [[-0.4,-0.4],[-0.4,0],[0.4,-0.4],[0.4,0],[-0.4,0.4],[0.4,0.4]],
    }
    for (const [dx, dy] of D[value] ?? []) dot(dx, dy)
  }, [])

  const drawBoard = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, BOARD_W, BOARD_H)

    // background
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, BOARD_W, BOARD_H)

    // corner background hints
    const cornerSet = new Set<string>()
    for (const [r, c, color] of CORNER_CELLS) {
      cornerSet.add(`${r},${c}`)
      ctx.fillStyle = COLOR_HEX[color]
      ctx.globalAlpha = 0.08
      ctx.fillRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE)
      ctx.globalAlpha = 1
    }

    // track cells
    for (let i = 0; i < TRACK_SIZE; i++) {
      const [r, c] = getTrackCoord(i)
      const x = c * CELL_SIZE
      const y = r * CELL_SIZE
      const cellColor = getTrackCellColor(i)
      if (cellColor) {
        ctx.fillStyle = COLOR_HEX[cellColor]
        ctx.globalAlpha = 0.35
        ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE)
        ctx.globalAlpha = 1
      }
      ctx.strokeStyle = '#888'
      ctx.lineWidth = 1
      ctx.strokeRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2)
    }

    // corner decorative circles
    for (const color of PLAYER_ORDER) {
      const [cr, cc] = CAMP_CENTER[color]
      const cx = cc * CELL_SIZE + CELL_SIZE / 2
      const cy = cr * CELL_SIZE + CELL_SIZE / 2
      ctx.beginPath()
      ctx.arc(cx, cy, CELL_SIZE * 1.8, 0, Math.PI * 2)
      ctx.fillStyle = COLOR_HEX[color]
      ctx.globalAlpha = 0.15
      ctx.fill()
      ctx.globalAlpha = 1
      ctx.strokeStyle = COLOR_HEX_DARK[color]
      ctx.lineWidth = 2
      ctx.stroke()
    }

    // home stretch cells
    for (const color of PLAYER_ORDER) {
      for (let i = 0; i < HOME_SIZE; i++) {
        const [r, c] = getHomeCoord(color, i)
        ctx.fillStyle = COLOR_HEX[color]
        ctx.globalAlpha = 0.7
        ctx.fillRect(c * CELL_SIZE + 1, r * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2)
        ctx.globalAlpha = 1
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 1
        ctx.strokeRect(c * CELL_SIZE + 1, r * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2)
      }
    }

    // goal
    const [gr, gc] = getGoalCoord()
    const gx = gc * CELL_SIZE, gy = gr * CELL_SIZE
    ctx.fillStyle = '#f7971e'
    ctx.fillRect(gx + 2, gy + 2, CELL_SIZE - 4, CELL_SIZE - 4)
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2
    ctx.strokeRect(gx + 2, gy + 2, CELL_SIZE - 4, CELL_SIZE - 4)
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 10px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('GOAL', gx + CELL_SIZE / 2, gy + CELL_SIZE / 2)

    // hangar cells
    for (const p of pieces) {
      if (p.progress === GOAL_PROGRESS) continue
      if (p.progress < 0) {
        const [r, c] = getPieceCoord(p)
        ctx.fillStyle = COLOR_HEX[p.color]
        ctx.globalAlpha = 0.2
        ctx.fillRect(c * CELL_SIZE + 4, r * CELL_SIZE + 4, CELL_SIZE - 8, CELL_SIZE - 8)
        ctx.globalAlpha = 1
      }
    }

    // pieces
    for (const p of pieces) {
      if (p.progress === GOAL_PROGRESS) continue
      const [r, c] = getPieceCoord(p)
      const cx = c * CELL_SIZE + CELL_SIZE / 2
      const cy = r * CELL_SIZE + CELL_SIZE / 2
      const isValid = validTargets.some(t => t.color === p.color && t.id === p.id)
      ctx.beginPath()
      ctx.arc(cx, cy, isValid ? PIECE_RADIUS + 2 : PIECE_RADIUS, 0, Math.PI * 2)
      ctx.fillStyle = COLOR_HEX[p.color]
      ctx.fill()
      ctx.strokeStyle = isValid ? '#fff' : COLOR_HEX_DARK[p.color]
      ctx.lineWidth = isValid ? 3 : 2
      ctx.stroke()
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 9px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(String(p.id + 1), cx, cy)
    }

    // dice on canvas if rolled
    if (diceValue) {
      const dsize = 22
      drawDiceFace(ctx, BOARD_W - dsize - 8, dsize + 8, dsize, diceValue)
    }
  }, [pieces, validTargets, diceValue, drawDiceFace])

  useEffect(() => { drawBoard() }, [drawBoard])

  const boardToCoord = (clientX: number, clientY: number, rect: DOMRect): [number, number] | null => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = (clientX - rect.left) * scaleX
    const y = (clientY - rect.top) * scaleY
    const col = Math.floor(x / CELL_SIZE)
    const row = Math.floor(y / CELL_SIZE)
    if (row < 0 || row >= GRID_ROWS || col < 0 || col >= GRID_COLS) return null
    return [row, col]
  }

  if (phase === 'select') {
    return (
      <div className="ludo-app">
        <h1 className="ludo-title">飞行棋</h1>
        <div className="ludo-select">
          <h2>游戏设置</h2>
          <div className="ludo-section">
            <label>玩家数</label>
            <div className="ludo-btn-group">
              <button className={`ludo-btn ${gameMode === '1human' ? 'active' : ''}`} onClick={() => setGameMode('1human')}>1人+3AI</button>
              <button className={`ludo-btn ${gameMode === '2human' ? 'active' : ''}`} onClick={() => setGameMode('2human')}>2人+2AI</button>
            </div>
          </div>
          {gameMode === '1human' && (
            <div className="ludo-section">
              <label>选择颜色</label>
              <div className="ludo-btn-group">
                {PLAYER_ORDER.map(c => (
                  <button key={c} className="ludo-btn" style={{ background: COLOR_HEX[c], color: '#fff' }} onClick={() => startGame(c, gameMode, difficulty)}>
                    {COLOR_NAMES[c]}方
                  </button>
                ))}
              </div>
            </div>
          )}
          {gameMode === '2human' && (
            <div className="ludo-section">
              <label>选择颜色（你和下一家）</label>
              <div className="ludo-btn-group">
                {PLAYER_ORDER.map(c => (
                  <button key={c} className="ludo-btn" style={{ background: COLOR_HEX[c], color: '#fff' }} onClick={() => startGame(c, gameMode, difficulty)}>
                    {COLOR_NAMES[c]}+{COLOR_NAMES[nextPlayer(c)]}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="ludo-section">
            <label>AI难度</label>
            <div className="ludo-btn-group">
              {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
                <button key={d} className={`ludo-btn ${difficulty === d ? 'active' : ''}`} onClick={() => setDifficulty(d)}>
                  {d === 'easy' ? '简单' : d === 'medium' ? '中等' : '困难'}
                </button>
              ))}
            </div>
          </div>
          <div className="ludo-rules">
            <h3>规则</h3>
            <p>掷6出库，掷6加回合</p>
            <p>走到对手棋子位置，送对手回库</p>
            <p>4枚棋子全部到家即获胜</p>
            <p>需精确掷数到家</p>
          </div>
        </div>
      </div>
    )
  }

  const homeCounts = PLAYER_ORDER.map(c => hasAllHome(pieces, c))
  const canRoll = isHuman(currentPlayer) && diceValue === null && validTargets.length === 0 && !winner

  return (
    <div className="ludo-app">
      <header className="ludo-header">
        <h1 className="ludo-title-sm">飞行棋</h1>
        <button className="ludo-btn small" onClick={resetGame}>新游戏</button>
      </header>

      <div className="ludo-dice-area">
        <div className={`ludo-dice ${canRoll ? 'clickable' : ''}`} onClick={canRoll ? humanRoll : undefined}>
          {diceValue ?? '🎲'}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {canRoll && <span className="ludo-dice-label">点我掷骰</span>}
          <div className="ludo-msg">{message}</div>
        </div>
      </div>

      <div className="ludo-board-wrap">
        <canvas
          ref={canvasRef}
          width={BOARD_W}
          height={BOARD_H}
          className="ludo-canvas"
          onClick={(e) => {
            const rect = canvasRef.current!.getBoundingClientRect()
            const pos = boardToCoord(e.clientX, e.clientY, rect)
            if (pos) handleCanvasClick(pos[0], pos[1])
          }}
        />
      </div>

      <div className="ludo-score">
        {PLAYER_ORDER.map((c, i) => (
          <span key={c} style={{ color: COLOR_HEX[c] }}>
            {COLOR_NAMES[c]}: {homeCounts[i]}/4到家
          </span>
        ))}
      </div>

      {winner && (
        <div className="ludo-win-overlay">
          <div className="ludo-win-text" style={{ color: COLOR_HEX[winner] }}>
            {isHuman(winner) ? '🎉 你赢了！' : `${COLOR_NAMES[winner]}方获胜！`}
          </div>
          <button className="ludo-btn" onClick={resetGame}>再来一局</button>
        </div>
      )}
    </div>
  )
}
