import type { FC } from 'react'
import './Header.css'

interface HeaderProps {
  level: number
  pairsRemaining: number
  onHome: () => void
  onShuffle: () => void
  shuffled: boolean
}

const Header: FC<HeaderProps> = ({ level, pairsRemaining, onHome, onShuffle, shuffled }) => {
  return (
    <div className="link-header">
      <button className="link-back" onClick={onHome}>← 返回</button>
      <div className="link-level-info">
        <span className="link-level">第 {level} 关</span>
        <span className="link-remain">剩余 {pairsRemaining} 对</span>
      </div>
      <button className="link-shuffle-btn" onClick={onShuffle} disabled={shuffled}>
        🔀 重排
      </button>
    </div>
  )
}

export default Header
