import type { FC } from 'react'
import type { Block as BlockData, Direction } from '../core/types'
import { canMoveAny } from '../core/logic'
import './Block.css'

interface BlockProps {
  block: BlockData
  blocks: BlockData[]
  selected: boolean
  onSelect: () => void
  onMove: (dir: Direction) => void
}

const BLOCK_COLORS: Record<string, string> = {
  '曹操': '#e74c3c',
  '关羽': '#27ae60',
  '张飞': '#2c3e50',
  '赵云': '#2980b9',
  '马超': '#f39c12',
  '黄忠': '#8e44ad',
  '兵': '#95a5a6',
}

const BlockEl: FC<BlockProps> = ({ block, blocks, selected, onSelect, onMove }) => {
  const dirs = canMoveAny(blocks, block.id)

  return (
    <div
      className={`kl-block${selected ? ' selected' : ''}`}
      style={{
        gridRow: `${block.row + 1} / span ${block.h}`,
        gridColumn: `${block.col + 1} / span ${block.w}`,
        background: BLOCK_COLORS[block.name] || '#95a5a6',
      }}
      onClick={() => {
        if (selected) {
          // try auto-move based on click position if selected
        }
        onSelect()
      }}
    >
      <span className="kl-block-name">{block.name}</span>
      {selected && dirs.length > 0 && (
        <div className="kl-block-arrows">
          {dirs.includes('up') && <button className="kl-arrow kl-arrow-up" onClick={(e) => { e.stopPropagation(); onMove('up') }}>▲</button>}
          {dirs.includes('left') && <button className="kl-arrow kl-arrow-left" onClick={(e) => { e.stopPropagation(); onMove('left') }}>◀</button>}
          {dirs.includes('down') && <button className="kl-arrow kl-arrow-down" onClick={(e) => { e.stopPropagation(); onMove('down') }}>▼</button>}
          {dirs.includes('right') && <button className="kl-arrow kl-arrow-right" onClick={(e) => { e.stopPropagation(); onMove('right') }}>▶</button>}
        </div>
      )}
    </div>
  )
}

export default BlockEl
