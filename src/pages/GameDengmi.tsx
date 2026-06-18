import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Dengmi from '@dengmi/Dengmi'
import ErrorBoundary from '../components/ErrorBoundary'

export default function GameDengmi() {
  const navigate = useNavigate()
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])
  return (
    <div className="wordgame">
      <button className="hub-back" onClick={() => navigate('/wordgames')}>← 返回</button>
      <ErrorBoundary>
        <Dengmi onBack={() => navigate('/wordgames')} />
      </ErrorBoundary>
    </div>
  )
}