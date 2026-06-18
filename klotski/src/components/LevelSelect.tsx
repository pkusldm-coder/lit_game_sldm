import type { FC } from 'react'
import { LEVELS } from '../core/levels'
import './LevelSelect.css'

interface LevelSelectProps {
  currentIndex: number
  onSelect: (index: number) => void
  onClose: () => void
}

const DIFFICULTY_TIERS = ['简单', '简单', '中等', '中等', '困难', '困难', '大师']

function getDifficulty(index: number): string {
  return DIFFICULTY_TIERS[index] || '大师'
}

const LevelSelect: FC<LevelSelectProps> = ({ currentIndex, onSelect, onClose }) => {
  return (
    <div className="kl-level-overlay" onClick={onClose}>
      <div className="kl-level-panel" onClick={e => e.stopPropagation()}>
        <h2>选择关卡</h2>
        <div className="kl-level-list">
          {LEVELS.map((level, i) => (
            <button
              key={i}
              className={`kl-level-item${i === currentIndex ? ' active' : ''}`}
              onClick={() => onSelect(i)}
            >
              <span className="kl-level-item-num">{i + 1}</span>
              <span className="kl-level-item-name">{level.name}</span>
              <span className="kl-level-item-diff">{getDifficulty(i)}</span>
              <span className="kl-level-item-moves">{level.moves}步</span>
            </button>
          ))}
        </div>
        <button className="kl-level-close" onClick={onClose}>取消</button>
      </div>
    </div>
  )
}

export default LevelSelect
