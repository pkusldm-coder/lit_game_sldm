import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import App2048 from '@game2048/App'

export default function Game2048() {
  const navigate = useNavigate()

  useEffect(() => {
    const prevBg = document.body.style.background
    const prevColor = document.body.style.color
    const prevOverflow = document.body.style.overflow
    const prevTouchAction = document.body.style.touchAction
    const prevUserSelect = document.body.style.userSelect
    document.body.style.background = '#faf8ef'
    document.body.style.color = '#776e65'
    document.body.style.overflow = 'hidden'
    document.body.style.touchAction = 'none'
    document.body.style.userSelect = 'none'
    return () => {
      document.body.style.background = prevBg
      document.body.style.color = prevColor
      document.body.style.overflow = prevOverflow
      document.body.style.touchAction = prevTouchAction
      document.body.style.userSelect = prevUserSelect
    }
  }, [])

  return (
    <div className="g2048">
      <button className="hub-back" onClick={() => navigate('/')}>← 返回</button>
      <App2048 />
    </div>
  )
}
