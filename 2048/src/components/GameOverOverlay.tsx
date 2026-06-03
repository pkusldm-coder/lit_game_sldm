import type { FC } from 'react'
import './GameOverOverlay.css'

interface GameOverOverlayProps {
  show: boolean
  score: number
  highScore: number
  onNewGame: () => void
}

const GameOverOverlay: FC<GameOverOverlayProps> = ({ show, score, highScore, onNewGame }) => {
  if (!show) return null

  return (
    <div className="game-over-overlay">
      <div className="game-over-content">
        <h2 className="game-over-title">游戏结束!</h2>
        <p className="game-over-score">分数: {score}</p>
        <p className="game-over-high">最高分: {highScore}</p>
        <button className="retry-btn" onClick={onNewGame}>再来一局</button>
      </div>
    </div>
  )
}

export default GameOverOverlay