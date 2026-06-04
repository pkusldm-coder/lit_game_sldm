import type { FC } from 'react'
import './Header.css'

interface HeaderProps {
  level: number
  score: number
  targetScore: number
  movesLeft: number
  onLevelSelect: () => void
}

const Header: FC<HeaderProps> = ({ level, score, targetScore, movesLeft, onLevelSelect }) => {
  return (
    <div className="mg-header">
      <div className="mg-header-left">
        <span className="mg-level">第 {level} 关</span>
      </div>
      <div className="mg-header-center">
        <span className="mg-score">⭐ {score} / {targetScore}</span>
        <span className="mg-moves">步数: {movesLeft}</span>
      </div>
      <div className="mg-header-right">
        <button className="mg-level-btn" onClick={onLevelSelect}>🎯</button>
      </div>
    </div>
  )
}

export default Header
