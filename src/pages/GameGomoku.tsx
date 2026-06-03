import { useNavigate } from 'react-router-dom'
import AppGomoku from '@gomoku/App'

export default function GameGomoku() {
  const navigate = useNavigate()
  return (
    <div className="gomoku">
      <button className="hub-back" onClick={() => navigate('/')}>← 返回</button>
      <AppGomoku />
    </div>
  )
}
