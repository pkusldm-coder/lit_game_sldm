import { useState, useRef } from 'react'
import type { GameState } from '@wordcore/types'
import type { TrickRiddle } from './core/types'
import { initGameFrom, nextRiddle, getDifficultyLabel } from '@wordcore/game'
import RIDDLES from './core/riddles'

interface Props { onBack: () => void }

export default function Naojin({ onBack }: Props) {
  const [state, setState] = useState<GameState>(() => initGameFrom(RIDDLES as any))
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handlePick(ch: string) {
    if (state.showResult) {
      if (timerRef.current) clearTimeout(timerRef.current)
      setState(prev => nextRiddle(prev))
      return
    }
    const riddle = state.riddles[state.index] as unknown as TrickRiddle
    const correct = ch === riddle.answer
    setState(prev => ({ ...prev, showResult: { selected: ch, correct } }))
    const delay = correct ? 1200 : 2800
    timerRef.current = setTimeout(() => {
      setState(prev => nextRiddle(prev))
      timerRef.current = null
    }, delay)
  }

  function handleRestart() {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = null
    setState(initGameFrom(RIDDLES as any))
  }

  if (state.done) {
    const total = state.riddles.length
    return (
      <div className="nj-app">
        <div className="nj-result">
          <div className="nj-result-title">脑筋急转弯结束</div>
          <div className="nj-result-score">{state.score} / {total}</div>
          <div className="nj-result-bar-wrap">
            <div className="nj-result-bar" style={{ width: `${(state.score / total) * 100}%` }} />
          </div>
          <div className="nj-result-msg">
            {state.score === total ? '全对！脑筋天才！' : state.score >= total * 0.7 ? '反应真快！' : '再来一轮吧！'}
          </div>
          <button className="nj-btn nj-btn-primary" onClick={handleRestart}>再来一轮</button>
          <button className="nj-btn" style={{ background: '#2a2e0f', color: '#da5' }} onClick={onBack}>返回</button>
        </div>
      </div>
    )
  }

  const riddle = state.riddles[state.index] as unknown as TrickRiddle
  const total = state.riddles.length

  return (
    <div className="nj-app">
      <div className="nj-header">
        <div className="wg-bar">
          <button className="wg-bar-btn" onClick={onBack}>← 返回</button>
          <div className="nj-title">脑筋急转弯</div>
        </div>
        <div className="nj-progress">
          <div className="nj-progress-bar" style={{ width: `${((state.index + 1) / total) * 100}%` }} />
        </div>
        <div className="nj-stat-row">
          <span>{state.index + 1}/{total}</span>
          <span className="nj-tag">{getDifficultyLabel(riddle.difficulty)}</span>
          <span className="nj-score">得分：{state.score}</span>
        </div>
      </div>

      <div className="nj-question">{riddle.question}</div>

      <div className="nj-options">
        {riddle.options.map((ch, i) => {
          let cls = 'nj-opt'
          if (state.showResult) {
            if (ch === riddle.answer) cls += ' nj-opt-correct'
            else if (ch === state.showResult.selected && !state.showResult.correct) cls += ' nj-opt-wrong'
            else cls += ' nj-opt-dim'
          }
          return (
            <button key={`${ch}-${i}`} className={cls} onClick={() => handlePick(ch)}>
              {ch}
            </button>
          )
        })}
      </div>

      {state.showResult && (
        <div className="nj-explain">
          {state.showResult.correct ? '✓ 正确！' : `✗ 答案是「${riddle.answer}」`}
          <br />
          {riddle.explanation}
        </div>
      )}
    </div>
  )
}