import type { FC } from 'react'

interface WinOverlayProps {
  won: boolean
  level: number
  score: number
  targetScore: number
  onNextLevel: () => void
  onRetry: () => void
}

const WinOverlay: FC<WinOverlayProps> = ({ won, level, score, targetScore, onNextLevel, onRetry }) => {
  return (
    <div className="mg-win-overlay">
      <div className="mg-win-card">
        {won ? (
          <>
            <h2>🎉 过关！</h2>
            <p>第 {level} 关完成</p>
            <p className="mg-win-score">得分: {score} / {targetScore}</p>
            <button className="mg-next-btn" onClick={onNextLevel}>下一关 →</button>
          </>
        ) : (
          <>
            <h2>😢 失败</h2>
            <p>第 {level} 关未通过</p>
            <p className="mg-win-score">得分: {score} / {targetScore}</p>
            <button className="mg-next-btn" onClick={onRetry}>再试一次</button>
          </>
        )}
      </div>
    </div>
  )
}

export default WinOverlay
