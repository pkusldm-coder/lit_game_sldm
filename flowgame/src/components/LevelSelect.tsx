import type { FC } from 'react'
import { LEVELS } from '../core/levels'
import './LevelSelect.css'

interface LevelSelectProps {
  currentIndex: number
  onSelect: (index: number) => void
  onClose: () => void
}

const DIFFICULTY_TIERS = ['简单', '普通', '中等', '困难', '专家']

function getDifficulty(index: number, total: number): string {
  const idx = Math.floor((index / total) * DIFFICULTY_TIERS.length)
  return DIFFICULTY_TIERS[Math.min(idx, DIFFICULTY_TIERS.length - 1)]
}

const LevelSelect: FC<LevelSelectProps> = ({ currentIndex, onSelect, onClose }) => (
  <div className="fg-level-overlay" onClick={onClose}>
    <div className="fg-level-panel" onClick={e => e.stopPropagation()}>
      <h2>选择关卡</h2>
      <div className="fg-level-list">
        {LEVELS.map((level, i) => (
          <button
            key={i}
            className={`fg-level-item${i === currentIndex ? ' active' : ''}`}
            onClick={() => onSelect(i)}
          >
            <span className="fg-level-item-num">{i + 1}</span>
            <span className="fg-level-item-name">{level.name}</span>
            <span className="fg-level-item-size">{level.gridSize}×{level.gridSize}</span>
            <span className="fg-level-item-diff">{getDifficulty(i, LEVELS.length)}</span>
          </button>
        ))}
      </div>
      <button className="fg-level-close" onClick={onClose}>关闭</button>
    </div>
  </div>
)

export default LevelSelect
