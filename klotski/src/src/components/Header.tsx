import type { FC } from 'react'
import { getTotalLevels } from '../core/levels'
import './Header.css'

interface HeaderProps {
  levelIndex: number
  levelName: string
  moves: number
  onLevelSelect: () => void
  onReset: () => void
  onRules: () => void
}

const Header: FC<HeaderProps> = ({ levelIndex, levelName, moves, onLevelSelect, onReset, onRules }) => {
  return (
    <div className="kl-header">
      <div className="kl-header-left">
        <span className="kl-level">{levelName}</span>
      </div>
      <div className="kl-header-center">
        <span className="kl-moves">步数: {moves}</span>
      </div>
      <div className="kl-header-right">
        <button className="kl-rules-btn" onClick={onRules}>?</button>
        <button className="kl-reset-btn" onClick={onReset}>🔄</button>
        <button className="kl-level-btn" onClick={onLevelSelect}>🎯</button>
      </div>
    </div>
  )
}

export default Header
