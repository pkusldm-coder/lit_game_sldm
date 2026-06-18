import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()
  return (
    <div className="hub-home">
      <h1 className="hub-title">小游戏</h1>
      <p className="hub-subtitle">选择一个分类开始</p>
      <div className="hub-sections">
        <button className="hub-section-btn" onClick={() => navigate('/boardgames')}>
          <span className="hub-section-icon">♟️</span>
          <span className="hub-section-title">棋类游戏</span>
          <span className="hub-section-desc">五子棋 · 斗兽棋 · 飞行棋 · 跳棋 · 围棋</span>
        </button>
        <button className="hub-section-btn" onClick={() => navigate('/minigames')}>
          <span className="hub-section-icon">🎮</span>
          <span className="hub-section-title">智趣小游戏</span>
          <span className="hub-section-desc">2048 · 数独 · 连连看 · 消消乐 · 华容道 · 数连 · 数织 · 俄罗斯方块</span>
        </button>
        <button className="hub-section-btn" onClick={() => navigate('/wordgames')}>
          <span className="hub-section-icon">🏮</span>
          <span className="hub-section-title">文字游戏</span>
          <span className="hub-section-desc">猜字谜 · 猜灯谜 · 诗词接龙 · 诗词填字 · 脑筋急转弯 · 歇后语闯关</span>
        </button>
      </div>
    </div>
  )
}