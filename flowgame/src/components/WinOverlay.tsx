import type { FC } from 'react'
import './WinOverlay.css'

interface WinOverlayProps {
  level: number
  hasNext: boolean
  onNext: () => void
  onRetry: () => void
}

const WinOverlay: FC<WinOverlayProps> = ({ level, hasNext, onNext, onRetry }) => (
  <div className="fg-win-overlay">
    <div className="fg-win-card">
      <h2>🎉 第 {level} 关完成!</h2>
      <p>所有颜色已连接</p>
      {hasNext && (
        <button className="fg-next-btn" onClick={onNext}>下一关 →</button>
      )}
      <button className="fg-retry-btn" onClick={onRetry}>再来一次</button>
    </div>
  </div>
)

export default WinOverlay
