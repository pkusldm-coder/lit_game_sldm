import type { FC } from 'react'
import type { Difficulty } from '../core/types'
import DifficultySelector from './DifficultySelector'
import './Header.css'

interface HeaderProps {
  difficulty: Difficulty
  onDifficultyChange: (d: Difficulty) => void
  onNewGame: () => void
}

const Header: FC<HeaderProps> = ({ difficulty, onDifficultyChange, onNewGame }) => (
  <div className="header">
    <h1 className="title">2048</h1>
    <div className="header-controls">
      <button className="new-game-btn" onClick={onNewGame}>新游戏</button>
      <DifficultySelector current={difficulty} onChange={onDifficultyChange} />
    </div>
  </div>
)

export default Header