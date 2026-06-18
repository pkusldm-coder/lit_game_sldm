import type { FC } from 'react'
import type { GameState } from '../core/types'
import { getShape, COLORS } from '../core/pieces'
import { useRef, useEffect } from 'react'

interface HeaderProps {
  gs: GameState
}

const CS = 22

const PiecePreview: FC<{ type: string }> = ({ type }) => {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, 4 * CS, 4 * CS)
    const shape = getShape(type as any, 0)
    ctx.fillStyle = COLORS[type as keyof typeof COLORS]
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (!shape[r][c]) continue
        const x = (c + (4 - shape.length) / 2) * CS + 1
        const y = (r + (4 - shape.length) / 2) * CS + 1
        ctx.fillRect(x, y, CS - 2, CS - 2)
      }
    }
  }, [type])
  return <canvas ref={ref} width={4 * CS} height={4 * CS} className="tg-prev-canvas" />
}

const Header: FC<HeaderProps> = ({ gs }) => (
  <div className="tg-header">
    <div className="tg-stats">
      <div className="tg-stat">
        <span className="tg-stat-label">分数</span>
        <span className="tg-stat-val score">{gs.score}</span>
      </div>
      <div className="tg-stat">
        <span className="tg-stat-label">等级</span>
        <span className="tg-stat-val level">{gs.level}</span>
      </div>
      <div className="tg-stat">
        <span className="tg-stat-label">行数</span>
        <span className="tg-stat-val lines">{gs.lines}</span>
      </div>
      <div className="tg-next-box">
        <span className="tg-next-label">下一个</span>
        <PiecePreview type={gs.next} />
      </div>
    </div>
  </div>
)

export default Header
