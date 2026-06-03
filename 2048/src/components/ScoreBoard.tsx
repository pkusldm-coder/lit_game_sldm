import type { FC } from 'react'
import type { Difficulty } from '../core/types'
import { DIFFICULTY_CONFIG } from '../core/config'
import './ScoreBoard.css'

interface ScoreBoardProps {
  score: number
  highScore: number
  difficulty: Difficulty
}

const ScoreBoard: FC<ScoreBoardProps> = ({ score, highScore, difficulty }) => {
  return (
    <div className="score-board">
      <div className="score-panel">
        <div className="score-label">分数</div>
        <div className="score-value" key={score}>{score}</div>
      </div>
      <div className="score-panel">
        <div className="score-label">最高 ({DIFFICULTY_CONFIG[difficulty].label})</div>
        <div className={`score-value${highScore > 0 && score >= highScore ? ' new-record' : ''}`}>{highScore}</div>
      </div>
    </div>
  )
}

export default ScoreBoard