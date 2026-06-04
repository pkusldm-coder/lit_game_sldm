import { useNavigate } from 'react-router-dom'

const GAMES = [
  {
    path: '/2048',
    title: '2048',
    desc: '经典数字合成游戏',
    emoji: '🔢',
    color: '#edc22e',
  },
  {
    path: '/gomoku',
    title: '五子棋',
    desc: '15×15 棋盘，AI 对战',
    emoji: '⚫',
    color: '#f7971e',
  },
  {
    path: '/sudoku',
    title: '数独',
    desc: '九宫格推理填空',
    emoji: '🧩',
    color: '#4caf50',
  },
  {
    path: '/linkgame',
    title: '连连看',
    desc: '过关模式，配对消除',
    emoji: '🔗',
    color: '#e74c3c',
  },
  {
    path: '/matchgame',
    title: '消消乐',
    desc: '3连消除，高分过关',
    emoji: '🍎',
    color: '#f39c12',
  },
  {
    path: '/klotski',
    title: '华容道',
    desc: '滑块移出曹操',
    emoji: '🎴',
    color: '#e74c3c',
  },
]

export default function Home() {
  const navigate = useNavigate()
  return (
    <div className="hub-home">
      <h1 className="hub-title">小游戏合集</h1>
      <p className="hub-subtitle">选择一款游戏开始</p>
      <div className="hub-cards">
        {GAMES.map(g => (
          <button key={g.path} className="hub-card" onClick={() => navigate(g.path)}>
            <span className="hub-card-emoji">{g.emoji}</span>
            <span className="hub-card-title">{g.title}</span>
            <span className="hub-card-desc">{g.desc}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
