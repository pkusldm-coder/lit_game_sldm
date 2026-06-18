import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import MiniGames from './pages/MiniGames'
import WordGames from './pages/WordGames'
import BoardGames from './pages/BoardGames'
import Game2048 from './pages/Game2048'
import GameGomoku from './pages/GameGomoku'
import GameSudoku from './pages/GameSudoku'
import GameLink from './pages/GameLink'
import GameMatch from './pages/GameMatch'
import GameKlotski from './pages/GameKlotski'
import GameFlow from './pages/GameFlow'
import GameNonogram from './pages/GameNonogram'
import GameTetris from './pages/GameTetris'
import GameJungle from './pages/GameJungle'
import GameLudo from './pages/GameLudo'
import GameCheckers from './pages/GameCheckers'
import GameGo from './pages/GameGo'
import GameChess from './pages/GameChess'
import GameJunqi from './pages/GameJunqi'
import GameCainizi from './pages/GameCainizi'
import GameDengmi from './pages/GameDengmi'
import GameShici from './pages/GameShici'
import GameShicitian from './pages/GameShicitian'
import GameNaojin from './pages/GameNaojin'
import GameXiehouyu from './pages/GameXiehouyu'
import './App.css'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/boardgames" element={<BoardGames />} />
      <Route path="/minigames" element={<MiniGames />} />
      <Route path="/wordgames" element={<WordGames />} />
      <Route path="/2048" element={<Game2048 />} />
      <Route path="/gomoku" element={<GameGomoku />} />
      <Route path="/jungle" element={<GameJungle />} />
        <Route path="/ludo" element={<GameLudo />} />
        <Route path="/checkers" element={<GameCheckers />} />
        <Route path="/chess" element={<GameChess />} />
        <Route path="/junqi" element={<GameJunqi />} />
        <Route path="/go" element={<GameGo />} />
      <Route path="/sudoku" element={<GameSudoku />} />
      <Route path="/linkgame" element={<GameLink />} />
      <Route path="/matchgame" element={<GameMatch />} />
      <Route path="/klotski" element={<GameKlotski />} />
      <Route path="/flowgame" element={<GameFlow />} />
      <Route path="/nonogram" element={<GameNonogram />} />
      <Route path="/tetris" element={<GameTetris />} />
      <Route path="/word/cainizi" element={<GameCainizi />} />
      <Route path="/word/dengmi" element={<GameDengmi />} />
      <Route path="/word/shici" element={<GameShici />} />
      <Route path="/word/shicitian" element={<GameShicitian />} />
      <Route path="/word/naojin" element={<GameNaojin />} />
      <Route path="/word/xiehouyu" element={<GameXiehouyu />} />
    </Routes>
  )
}