import type { FC } from 'react'
import './WinOverlay.css'

interface WinOverlayProps {
  level: number
  hasNext: boolean
  onNext: () => void
  onRetry: () => void
}

const WinOverlay: FC<WinOverlayProps> = ({ level, hasNext, onNext, onRetry }) => (
  <div className="ng-win-overlay">
    <div className="ng-win-card">
      <h2>🎉 第 {level} 关完成!</h2>
      <p>图案已还原</p>
      {hasNext && (
        <button className="ng-next-btn" onClick={onNext}>下一关 →</button>
      )}
      <button className="ng-retry-btn" onClick={onRetry}>再来一次</button>
    </div>
  </div>
)

export default WinOverlay
