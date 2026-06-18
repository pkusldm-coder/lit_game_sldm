import type { FC } from 'react'
import { useState } from 'react'

const rules = [
  '使用 ← → 键移动方块，↑ 键旋转，↓ 键加速下落，空格键直接落底',
  '在手机上：左右滑动移动，上滑旋转，下滑加速',
  '将方块填满一行即可消除该行，消除行数越多得分越高',
  '消除 1 行得 100×等级 分，2 行 300×等级，3 行 500×等级，4 行 800×等级',
  '每消除 10 行升一级，方块下落速度加快',
  '方块堆到顶部则游戏结束',
]

const GameRules: FC = () => {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button className="tg-rules-btn" onClick={() => setOpen(true)}>?</button>
      {open && (
        <div className="tg-rules-overlay" onClick={() => setOpen(false)}>
          <div className="tg-rules-panel" onClick={e => e.stopPropagation()}>
            <h2>俄罗斯方块 规则</h2>
            <ol>
              {rules.map((r, i) => <li key={i}>{r}</li>)}
            </ol>
            <button className="tg-rules-close" onClick={() => setOpen(false)}>知道了</button>
          </div>
        </div>
      )}
    </>
  )
}

export default GameRules
