import type { FC } from 'react'

interface TimeoutOverlayProps {
  level: number
  onRetry: () => void
}

const TimeoutOverlay: FC<TimeoutOverlayProps> = ({ level, onRetry }) => {
  return (
    <div className="lg-win-overlay">
      <div className="lg-win-card">
        <h2>⏰ 时间到！</h2>
        <p>第 {level} 关挑战失败</p>
        <button className="lg-next-btn" onClick={onRetry}>
          再试一次
        </button>
      </div>
    </div>
  )
}

export default TimeoutOverlay
