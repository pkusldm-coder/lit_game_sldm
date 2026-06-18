import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Shici from '@shici/Shici'
import ErrorBoundary from '../components/ErrorBoundary'

export default function GameShici() {
  const navigate = useNavigate()
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])
  return (
    <div className="wordgame">
      <button className="hub-back" onClick={() => navigate('/wordgames')}>← 返回</button>
      <ErrorBoundary>
        <Shici onBack={() => navigate('/wordgames')} />
      </ErrorBoundary>
    </div>
  )
}