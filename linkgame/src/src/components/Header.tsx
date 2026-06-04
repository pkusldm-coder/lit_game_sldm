import type { FC } from 'react'
import './Header.css'

interface HeaderProps {
  level: number
  timeLeft: number
  onHome: () => void
  onShuffle: () => void
  shuffled: boolean
  onLevelSelect: () => void
  onRules: () => void
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

const Header: FC<HeaderProps> = ({ level, timeLeft, onHome, onShuffle, shuffled, onLevelSelect, onRules }) => {
  const warning = timeLeft <= 10

  return (
    <div className="link-header">
      <button className="link-back" onClick={onHome}>← 返回</button>
      <div className="link-level-info">
        <span className="link-level">第 {level} 关</span>
        <span className={`link-timer${warning ? ' time-warning' : ''}`}>
          ⏱ {formatTime(timeLeft)}
        </span>
      </div>
      <div className="link-header-actions">
        <button className="link-rules-btn" onClick={onRules}>?</button>
        <button className="link-level-btn" onClick={onLevelSelect}></button>
        <button className="link-shuffle-btn" onClick={onShuffle} disabled={shuffled}>🔀</button>
      </div>
    </div>
  )
}

export default Header
