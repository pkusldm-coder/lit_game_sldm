import { useNavigate } from 'react-router-dom'
import App2048 from '@game2048/App'

export default function Game2048() {
  const navigate = useNavigate()
  return (
    <div className="g2048">
      <button className="hub-back" onClick={() => navigate('/')}>← 返回</button>
      <App2048 />
    </div>
  )
}
