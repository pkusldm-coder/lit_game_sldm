import type { FC } from 'react'
import { getDifficultyOptions } from '../core/level'
import './LevelSelect.css'

interface LevelSelectProps {
  onSelect: (level: number) => void
  onClose: () => void
}

const DIFFICULTY_LABELS: Record<number, string> = {
  1: '简单',
  6: '中等',
  11: '困难',
  16: '大师',
}

const DIFFICULTY_COLORS: Record<number, string> = {
  1: '#4caf50',
  6: '#ff9800',
  11: '#f44336',
  16: '#9c27b0',
}

const LevelSelect: FC<LevelSelectProps> = ({ onSelect, onClose }) => {
  const options = getDifficultyOptions()

  return (
    <div className="mg-level-overlay" onClick={onClose}>
      <div className="mg-level-panel" onClick={e => e.stopPropagation()}>
        <h2>选择关卡</h2>
        <div className="mg-level-options">
          {options.map(opt => (
            <button
              key={opt.level}
              className="mg-level-option"
              style={{ borderColor: DIFFICULTY_COLORS[opt.level] }}
              onClick={() => onSelect(opt.level)}
            >
              <span className="mg-level-option-label">{opt.label}</span>
              <span className="mg-level-option-diff" style={{ color: DIFFICULTY_COLORS[opt.level] }}>
                {DIFFICULTY_LABELS[opt.level]}
              </span>
              <span className="mg-level-option-info">
                {opt.tileTypes}种 · 目标 {opt.targetScore} · {opt.maxMoves}步
              </span>
            </button>
          ))}
        </div>
        <button className="mg-level-close" onClick={onClose}>取消</button>
      </div>
    </div>
  )
}

export default LevelSelect
