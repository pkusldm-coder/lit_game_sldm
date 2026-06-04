import type { FC } from 'react'
import './Header.css'

interface HeaderProps {
  level: number
  moves: number
  mode: 'fill' | 'mark'
  onLevelSelect: () => void
  onReset: () => void
  onToggleMode: () => void
  onRules: () => void
}

const Header: FC<HeaderProps> = ({ level, moves, mode, onLevelSelect, onReset, onToggleMode, onRules }) => (
  <div className="ng-header">
    <div className="ng-header-left">
      <span className="ng-level">第 {level} 关</span>
    </div>
    <div className="ng-header-center">
      <span className="ng-moves">步数: {moves}</span>
      <button className={`ng-mode-btn${mode === 'mark' ? ' active' : ''}`} onClick={onToggleMode}>
        {mode === 'fill' ? ' 填充' : ' 标记'}
      </button>
    </div>
    <div className="ng-header-right">
      <button className="ng-rules-btn" onClick={onRules}>?</button>
      <button className="ng-reset-btn" onClick={onReset}>重置</button>
      <button className="ng-level-btn" onClick={onLevelSelect}>选关</button>
    </div>
  </div>
)

export default Header
