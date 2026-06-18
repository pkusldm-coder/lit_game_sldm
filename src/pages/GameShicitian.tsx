import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Shicitian from '@shicitian/Shicitian'
import ErrorBoundary from '../components/ErrorBoundary'

export default function GameShicitian() {
  const navigate = useNavigate()
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])
  return (
    <div className="wordgame">
      <button className="hub-back" onClick={() => navigate('/wordgames')}>← 返回</button>
      <ErrorBoundary>
        <Shicitian onBack={() => navigate('/wordgames')} />
      </ErrorBoundary>
    </div>
  )
}