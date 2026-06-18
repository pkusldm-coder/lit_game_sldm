import { useNavigate } from 'react-router-dom'

const GAMES = [
  { id: 'cainizi', title: '猜字谜', desc: '拆解汉字，猜出谜底', icon: '字', color: '#f7971e' },
  { id: 'dengmi', title: '猜灯谜', desc: '传统灯谜，包罗万象', icon: '谜', color: '#f44' },
  { id: 'shici', title: '诗词接龙', desc: '上句出题，下句接龙', icon: '诗', color: '#4a8' },
  { id: 'shicitian', title: '诗词填字', desc: '诗句缺字，填入正确', icon: '填', color: '#6ac' },
  { id: 'naojin', title: '脑筋急转弯', desc: '趣味问答，意想不到', icon: '转', color: '#da5' },
  { id: 'xiehouyu', title: '歇后语闯关', desc: '前半出题，后半接句', icon: '歇', color: '#e80' },
]

export default function WordGames() {
  const navigate = useNavigate()
  return (
    <div className="wg-home">
      <button className="hub-back" onClick={() => navigate('/')}>← 返回</button>
      <div className="wg-home-title">🏮 文字游戏</div>
      <div className="wg-home-sub">猜字谜 · 猜灯谜 · 诗词接龙 · 诗词填字 · 脑筋急转弯 · 歇后语闯关</div>
      <div className="wg-home-grid">
        {GAMES.map(g => (
          <button key={g.id} className="wg-home-card" onClick={() => navigate(`/word/${g.id}`)}>
            <div className="wg-home-icon" style={{ background: g.color }}>{g.icon}</div>
            <div className="wg-home-name">{g.title}</div>
            <div className="wg-home-desc">{g.desc}</div>
          </button>
        ))}
      </div>
    </div>
  )
}