import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AppJungle from '@jungle/App'

export default function GameJungle() {
  const navigate = useNavigate()

  useEffect(() => {
    const prevBg = document.body.style.background
    const prevColor = document.body.style.color
    const prevOverflow = document.body.style.overflow
    const prevTouchAction = document.body.style.touchAction
    const prevUserSelect = document.body.style.userSelect
    document.body.style.background = '#2d5a1e'
    document.body.style.color = '#eee'
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
    <div className="jungle">
      <button className="hub-back" onClick={() => navigate('/boardgames')}>← 返回</button>
      <AppJungle />
    </div>
  )
}