import type { FC } from 'react'
import './GameRules.css'

const GameRules: FC = () => {
  return (
    <div className="game-rules">
      <h3>游戏规则</h3>
      <ul>
        <li>使用 <strong>方向键</strong> 或 <strong>WASD</strong> 滑动所有方块，也可 <strong>鼠标拖拽</strong> 或 <strong>触屏滑动</strong></li>
        <li>每次滑动，所有方块会沿该方向尽可能移动到尽头</li>
        <li>两个相同数字的方块碰撞时会 <strong>合并</strong>，数值翻倍（如 2+2=4）</li>
        <li>合并只能发生在滑动方向最远的一对，不会连锁合并</li>
        <li>每完成一次有效滑动，棋盘上会随机出现一个新方块（90% 为 2，10% 为 4）</li>
        <li>困难模式下还会出现 <strong>8</strong>（10% 概率）</li>
        <li>目标：合并出 <strong>2048</strong> 方块！</li>
        <li>当棋盘填满且无法再合并时，游戏结束</li>
        <li>你拥有 <strong>3 次</strong> 消除机会，可点击「消除」按钮后选中任意方块移除</li>
      </ul>
    </div>
  )
}

export default GameRules