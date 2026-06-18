import type { FC } from 'react'
import type { GameState, Board } from '../core/types'
import { BOARD_W, BOARD_H } from '../core/types'
import { getShape, COLORS } from '../core/pieces'
import { getGhostY } from '../core/game'
import { useRef, useEffect } from 'react'

interface GameBoardProps {
  gs: GameState
  cellSize: number
}

function drawBoard(ctx: CanvasRenderingContext2D, board: Board, cs: number) {
  for (let y = 0; y < BOARD_H; y++) {
    for (let x = 0; x < BOARD_W; x++) {
      if (board[y][x]) {
        ctx.fillStyle = '#666'
        ctx.fillRect(x * cs + 1, y * cs + 1, cs - 2, cs - 2)
      }
    }
  }
}

function drawGhost(ctx: CanvasRenderingContext2D, gs: GameState, cs: number) {
  const shape = getShape(gs.piece, gs.rot)
  const gy = getGhostY(gs.board, shape, gs.pos.x, gs.pos.y)
  ctx.strokeStyle = COLORS[gs.piece]
  ctx.lineWidth = 1.5
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue
      const x = (gs.pos.x + c) * cs + 1.5
      const y = (gy + r) * cs + 1.5
      ctx.strokeRect(x, y, cs - 3, cs - 3)
    }
  }
}

function drawPiece(ctx: CanvasRenderingContext2D, gs: GameState, cs: number) {
  const shape = getShape(gs.piece, gs.rot)
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue
      const x = (gs.pos.x + c) * cs + 1
      const y = (gs.pos.y + r) * cs + 1
      ctx.fillStyle = COLORS[gs.piece]
      ctx.fillRect(x, y, cs - 2, cs - 2)
    }
  }
}

function drawGrid(ctx: CanvasRenderingContext2D, cs: number) {
  ctx.strokeStyle = '#222'
  ctx.lineWidth = 0.5
  for (let x = 0; x <= BOARD_W; x++) {
    ctx.beginPath(); ctx.moveTo(x * cs, 0); ctx.lineTo(x * cs, BOARD_H * cs); ctx.stroke()
  }
  for (let y = 0; y <= BOARD_H; y++) {
    ctx.beginPath(); ctx.moveTo(0, y * cs); ctx.lineTo(BOARD_W * cs, y * cs); ctx.stroke()
  }
}

const GameBoard: FC<GameBoardProps> = ({ gs, cellSize }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const w = BOARD_W * cellSize
  const h = BOARD_H * cellSize

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const cs = cellSize
    ctx.fillStyle = '#0d0d1a'
    ctx.fillRect(0, 0, w, h)
    drawGrid(ctx, cs)
    drawBoard(ctx, gs.board, cs)
    drawGhost(ctx, gs, cs)
    drawPiece(ctx, gs, cs)
  }, [gs, cellSize, w, h])

  return (
    <canvas
      ref={canvasRef}
      width={w}
      height={h}
      className="tg-canvas"
    />
  )
}

export default GameBoard
