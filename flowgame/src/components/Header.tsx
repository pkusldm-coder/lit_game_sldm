import type { FC } from 'react'
import './Header.css'

interface HeaderProps {
  level: number
  moves: number
  onLevelSelect: () => void
  onReset: () => void
  onRules: () => void
}

const Header: FC<HeaderProps> = ({ level, moves, onLevelSelect, onReset, onRules }) => (
  <div className="fg-header">
    <div className="fg-header-left">
      <span className="fg-level">第 {level} 关</span>
    </div>
    <div className="fg-header-center">
      <span className="fg-moves">步数: {moves}</span>
    </div>
    <div className="fg-header-right">
      <button className="fg-rules-btn" onClick={onRules}>?</button>
      <button className="fg-reset-btn" onClick={onReset}>重置</button>
      <button className="fg-level-btn" onClick={onLevelSelect}>选关</button>
    </div>
  </div>
)

export default Header
