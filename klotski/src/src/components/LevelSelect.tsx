import type { FC } from 'react'
import { LEVELS } from '../core/levels'
import './LevelSelect.css'

interface LevelSelectProps {
  currentIndex: number
  onSelect: (index: number) => void
  onClose: () => void
}

const DIFFICULTY: Record<number, string> = {
  0: '简单',
  1: '简单',
  2: '中等',
  3: '中等',
  4: '困难',
  5: '困难',
  6: '大师',
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
              <span className="kl-level-item-diff">{DIFFICULTY[i] || '大师'}</span>
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
