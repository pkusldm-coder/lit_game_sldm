import type { FC } from 'react'
import './WinOverlay.css'

interface WinOverlayProps {
  level: number
  onNextLevel: () => void
}

const WinOverlay: FC<WinOverlayProps> = ({ level, onNextLevel }) => {
  return (
    <div className="lg-win-overlay">
      <div className="lg-win-card">
        <h2>🎉 过关！</h2>
        <p>第 {level} 关完成</p>
        <button className="lg-next-btn" onClick={onNextLevel}>
          下一关 →
        </button>
      </div>
    </div>
  )
}

export default WinOverlay
