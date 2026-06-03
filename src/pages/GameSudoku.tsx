import { useNavigate } from 'react-router-dom'
import AppSudoku from '@sudoku/App'

export default function GameSudoku() {
  const navigate = useNavigate()
  return (
    <div className="sudoku">
      <button className="hub-back" onClick={() => navigate('/')}>← 返回</button>
      <AppSudoku />
    </div>
  )
}
