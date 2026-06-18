import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLudo from '@ludo/App'

export default function GameLudo() {
  const navigate = useNavigate()

  useEffect(() => {
    const prevBg = document.body.style.background
    const prevColor = document.body.style.color
    const prevOverflow = document.body.style.overflow
    const prevTouchAction = document.body.style.touchAction
    const prevUserSelect = document.body.style.userSelect
    document.body.style.background = '#1a1a2e'
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
    <div className="ludo">
      <button className="hub-back" onClick={() => navigate('/boardgames')}>← 返回</button>
      <AppLudo />
    </div>
  )
}