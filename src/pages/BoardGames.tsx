import { useNavigate } from 'react-router-dom'

const GAMES = [
  { path: '/gomoku', title: '五子棋', desc: '15×15 棋盘，AI 对战', emoji: '⚫', color: '#f7971e' },
  { path: '/chess', title: '中国象棋', desc: '楚河汉界，将帅对决', emoji: '♚', color: '#c0392b' },
  { path: '/junqi', title: '军棋', desc: '明棋暗棋翻棋，军旗争夺', emoji: '⚔️', color: '#2c3e50' },
  { path: '/jungle', title: '斗兽棋', desc: '动物等级对战，入穴获胜', emoji: '🦁', color: '#c0392b' },
  { path: '/ludo', title: '飞行棋', desc: '骰子竞速，四色争锋', emoji: '🎲', color: '#8e44ad' },
  { path: '/checkers', title: '跳棋', desc: '星形棋盘，跳跃前行', emoji: '🔶', color: '#27ae60' },
  { path: '/go', title: '围棋', desc: '黑白对弈，围地争胜', emoji: '⬛', color: '#2c3e50' },
]

export default function BoardGames() {
  const navigate = useNavigate()
  return (
    <div className="hub-home">
      <h1 className="hub-title">棋类游戏</h1>
      <p className="hub-subtitle">选择一款棋类开始对弈</p>
      <button className="hub-back" onClick={() => navigate('/')}>← 返回</button>
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