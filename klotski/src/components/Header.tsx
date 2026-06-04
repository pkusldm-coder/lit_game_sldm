import type { FC } from 'react'
import { getTotalLevels } from '../core/levels'
import './Header.css'

interface HeaderProps {
  levelIndex: number
  moves: number
  onLevelSelect: () => void
  onReset: () => void
}

const Header: FC<HeaderProps> = ({ levelIndex, moves, onLevelSelect, onReset }) => {
  const total = getTotalLevels()
  return (
    <div className="kl-header">
      <div className="kl-header-left">
        <span className="kl-level">第 {levelIndex + 1}/{total} 关</span>
      </div>
      <div className="kl-header-center">
        <span className="kl-moves">步数: {moves}</span>
      </div>
      <div className="kl-header-right">
        <button className="kl-reset-btn" onClick={onReset}>🔄</button>
        <button className="kl-level-btn" onClick={onLevelSelect}>🎯</button>
      </div>
    </div>
  )
}

export default Header
