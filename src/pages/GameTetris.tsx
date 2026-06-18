import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AppTetris from '@tetris/App'
import ErrorBoundary from '../components/ErrorBoundary'

export default function GameTetris() {
  const navigate = useNavigate()

  useEffect(() => {
    const prevBg = document.body.style.background
    const prevOverflow = document.body.style.overflow
    const prevTouchAction = document.body.style.touchAction
    const prevUserSelect = document.body.style.userSelect
    document.body.style.background = '#1a1a2e'
    document.body.style.overflow = 'hidden'
    document.body.style.touchAction = 'none'
    document.body.style.userSelect = 'none'
    return () => {
      document.body.style.background = prevBg
      document.body.style.overflow = prevOverflow
      document.body.style.touchAction = prevTouchAction
      document.body.style.userSelect = prevUserSelect
    }
  }, [])

  return (
    <div className="tetris">
      <button className="hub-back" onClick={() => navigate('/')}>← 返回</button>
      <ErrorBoundary>
        <AppTetris />
      </ErrorBoundary>
    </div>
  )
}
