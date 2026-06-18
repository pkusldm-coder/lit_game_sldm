import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AppJunqi from '@junqi/App'

export default function GameJunqi() {
  const navigate = useNavigate()

  useEffect(() => {
    const prevBg = document.body.style.background
    const prevColor = document.body.style.color
    const prevUserSelect = document.body.style.userSelect
    document.body.style.background = '#2d1b0e'
    document.body.style.color = '#eee'
    document.body.style.userSelect = 'none'
    return () => {
      document.body.style.background = prevBg
      document.body.style.color = prevColor
      document.body.style.userSelect = prevUserSelect
    }
  }, [])

  return (
    <div className="junqi">
      <button className="hub-back" onClick={() => navigate('/boardgames')}>← 返回</button>
      <AppJunqi />
    </div>
  )
}
