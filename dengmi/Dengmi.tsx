import { useState, useRef } from 'react'
import type { GameState } from '@wordcore/types'
import { initGameFrom, submitAnswer, nextRiddle, getDifficultyLabel } from '@wordcore/game'
import RIDDLES from './riddles'

const CATEGORY_MAP: Record<string, string> = {
  object: '物品', animal: '动物', food: '食物',
  place: '地名', nature: '自然', other: '其他',
}

interface Props { onBack: () => void }

export default function Dengmi({ onBack }: Props) {
  const [state, setState] = useState<GameState>(() => initGameFrom(RIDDLES))
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handlePick(ch: string) {
    if (state.showResult) {
      if (timerRef.current) clearTimeout(timerRef.current)
      setState(prev => nextRiddle(prev))
      return
    }
    const riddle = state.riddles[state.index]
    const correct = ch === riddle.answer
    setState(prev => submitAnswer(prev, ch))
    const delay = correct ? 1200 : 2800
    timerRef.current = setTimeout(() => {
      setState(prev => nextRiddle(prev))
      timerRef.current = null
    }, delay)
  }

  function handleRestart() {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = null
    setState(initGameFrom(RIDDLES))
  }

  if (state.done) {
    const total = state.riddles.length
    return (
      <div className="dm-app">
        <div className="dm-result">
          <div className="dm-result-title">猜灯谜结束</div>
          <div className="dm-result-score">{state.score} / {total}</div>
          <div className="dm-result-bar-wrap">
            <div className="dm-result-bar" style={{ width: `${(state.score / total) * 100}%` }} />
          </div>
          <div className="dm-result-msg">
            {state.score === total ? '全对！灯谜大师！' : state.score >= total * 0.7 ? '猜得真不错！' : '下次加油！'}
          </div>
          <button className="dm-btn dm-btn-primary" onClick={handleRestart}>再来一轮</button>
          <button className="dm-btn" style={{ background: '#3a1515', color: '#d99' }} onClick={onBack}>返回</button>
        </div>
      </div>
    )
  }

  const riddle = state.riddles[state.index]
  const total = state.riddles.length
  const catLabel = CATEGORY_MAP[riddle.category || ''] || riddle.category || ''

  return (
    <div className="dm-app">
      <div className="dm-header">
        <div className="wg-bar">
          <button className="wg-bar-btn" onClick={onBack}>← 返回</button>
          <div className="dm-title">猜灯谜</div>
        </div>
        <div className="dm-progress">
          <div className="dm-progress-bar" style={{ width: `${((state.index + 1) / total) * 100}%` }} />
        </div>
        <div className="dm-stat-row">
          <span>{state.index + 1}/{total}</span>
          {catLabel && <span className="dm-tag">{catLabel}</span>}
          <span className="dm-tag">{getDifficultyLabel(riddle.difficulty)}</span>
          <span className="dm-score">得分：{state.score}</span>
        </div>
      </div>

      <div className="dm-hint">{riddle.hint}</div>

      <div className="dm-options">
        {riddle.options.map(ch => {
          let cls = 'dm-opt'
          if (state.showResult) {
            if (ch === riddle.answer) cls += ' dm-opt-correct'
            else if (ch === state.showResult.selected && !state.showResult.correct) cls += ' dm-opt-wrong'
            else cls += ' dm-opt-dim'
          }
          return (
            <button key={ch} className={cls} onClick={() => handlePick(ch)}>
              {ch}
            </button>
          )
        })}
      </div>

      {state.showResult && (
        <div className="dm-explain">
          {state.showResult.correct ? '✓ 对了！' : '✗ 不对哦'}
          <br />
          {riddle.explanation}
        </div>
      )}
    </div>
  )
}
