import type { FC } from 'react'
import { LEVELS } from '../core/levels'
import './LevelSelect.css'

const DIFFICULTY_LABELS = ['简单', '普通', '中等', '困难', '专家']

interface LevelSelectProps {
  currentIndex: number
  onSelect: (index: number) => void
  onClose: () => void
}

const LevelSelect: FC<LevelSelectProps> = ({ currentIndex, onSelect, onClose }) => (
  <div className="ng-level-overlay" onClick={onClose}>
    <div className="ng-level-panel" onClick={e => e.stopPropagation()}>
      <h2>选择关卡</h2>
      <div className="ng-level-list">
        {LEVELS.map((level, i) => (
          <button
            key={i}
            className={`ng-level-item${i === currentIndex ? ' active' : ''}`}
            onClick={() => onSelect(i)}
          >
            <span className="ng-level-item-num">{i + 1}</span>
            <span className="ng-level-item-name">{level.name}</span>
            <span className="ng-level-item-size">{level.gridSize}×{level.gridSize}</span>
            <span className="ng-level-item-diff">{DIFFICULTY_LABELS[i] || ''}</span>
          </button>
        ))}
      </div>
      <button className="ng-level-close" onClick={onClose}>关闭</button>
    </div>
  </div>
)

export default LevelSelect
