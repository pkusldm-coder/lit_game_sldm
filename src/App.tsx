import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Game2048 from './pages/Game2048'
import GameGomoku from './pages/GameGomoku'
import GameSudoku from './pages/GameSudoku'
import GameLink from './pages/GameLink'
import GameMatch from './pages/GameMatch'
import GameKlotski from './pages/GameKlotski'
import './App.css'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/2048" element={<Game2048 />} />
      <Route path="/gomoku" element={<GameGomoku />} />
      <Route path="/sudoku" element={<GameSudoku />} />
      <Route path="/linkgame" element={<GameLink />} />
      <Route path="/matchgame" element={<GameMatch />} />
      <Route path="/klotski" element={<GameKlotski />} />
    </Routes>
  )
}
