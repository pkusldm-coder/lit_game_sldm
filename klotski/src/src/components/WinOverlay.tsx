import type { FC } from 'react'

interface WinOverlayProps {
  levelName: string
  moves: number
  hasNext: boolean
  onNext: () => void
  onRetry: () => void
}

const WinOverlay: FC<WinOverlayProps> = ({ levelName, moves, hasNext, onNext, onRetry }) => {
  return (
    <div className="kl-win-overlay">
      <div className="kl-win-card">
        <h2>🎉 过关！</h2>
        <p>{levelName}</p>
        <p className="kl-win-moves">步数: {moves}</p>
        {hasNext ? (
          <button className="kl-win-btn" onClick={onNext}>下一关 →</button>
        ) : (
          <>
            <p className="kl-win-end">🎊 全部通关！</p>
            <button className="kl-win-btn" onClick={onRetry}>再玩一次</button>
          </>
        )}
      </div>
    </div>
  )
}

export default WinOverlay
