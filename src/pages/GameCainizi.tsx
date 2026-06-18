import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Cainizi from '@cainizi/Cainizi'
import ErrorBoundary from '../components/ErrorBoundary'

export default function GameCainizi() {
  const navigate = useNavigate()
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])
  return (
    <div className="wordgame">
      <button className="hub-back" onClick={() => navigate('/wordgames')}>← 返回</button>
      <ErrorBoundary>
        <Cainizi onBack={() => navigate('/wordgames')} />
      </ErrorBoundary>
    </div>
  )
}