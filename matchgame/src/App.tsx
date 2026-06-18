import { useState, useCallback, useRef } from 'react'
import type { Board, Cell, DifficultyKey } from './core/types'
import { generateBoard, removeMatches, dropTiles, fillEmpty, swapTiles, resetIdCounter } from './core/board'
import { findMatches, hasAnyMove } from './core/matcher'
import { getFruit } from './core/emoji'
import { getLeaderboard, saveScore } from './core/leaderboard'
import './App.css'

const DIFFS: { key: DifficultyKey; label: string; rows: number; cols: number; tileTypes: number; maxSteps: number }[] = [
  { key: 'easy', label: '简单', rows: 6, cols: 6, tileTypes: 5, maxSteps: 25 },
  { key: 'medium', label: '中等', rows: 8, cols: 8, tileTypes: 7, maxSteps: 25 },
  { key: 'hard', label: '困难', rows: 10, cols: 10, tileTypes: 10, maxSteps: 25 },
]

type Screen = 'select' | 'playing' | 'result'

interface Popup {
  id: number
  row: number
  col: number
  text: string
}

function adjacent(a: Cell, b: Cell): boolean {
  return (Math.abs(a.row - b.row) + Math.abs(a.col - b.col)) === 1
}

function pause(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms))
}

function shuffle(board: Board): Board {
  const rs = board.length, cs = board[0].length
  const types: number[] = []
  for (const row of board) for (const t of row) if (t) types.push(t.type)
  for (let i = types.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [types[i], types[j]] = [types[j], types[i]]
  }
  const nb: Board = board.map(row => row.map(() => null))
  let idx = 0
  for (let r = 0; r < rs; r++) for (let c = 0; c < cs; c++) {
    if (board[r][c]) nb[r][c] = { id: board[r][c]!.id, type: types[idx++] }
  }
  return nb
}

let _pid = 0

export default function App() {
  const [screen, setScreen] = useState<Screen>('select')
  const [diff, setDiff] = useState<DifficultyKey>('easy')
  const [board, setBoard] = useState<Board>(() => generateBoard(6, 6, 5))
  const [sel, setSel] = useState<Cell | null>(null)
  const [score, setScore] = useState(0)
  const [steps, setSteps] = useState(25)
  const [flash, setFlash] = useState<Record<string, boolean>>({})
  const [popups, setPopups] = useState<Popup[]>([])
  const [combo, setCombo] = useState(0)
  const [rank, setRank] = useState(0)
  const busy = useRef(false)

  const cfg = DIFFS.find(d => d.key === diff)!

  const startGame = useCallback((dk: DifficultyKey) => {
    const c = DIFFS.find(d => d.key === dk)!
    resetIdCounter()
    setDiff(dk)
    setBoard(generateBoard(c.rows, c.cols, c.tileTypes))
    setSel(null)
    setScore(0)
    setSteps(c.maxSteps)
    setFlash({})
    setPopups([])
    setCombo(0)
    setRank(0)
    busy.current = false
    setScreen('playing')
  }, [])

  const cascade = useCallback(async (b: Board, baseScore: number, st: number, dk: DifficultyKey) => {
    busy.current = true
    const c = DIFFS.find(d => d.key === dk)!
    let cur = b
    let total = baseScore
    let cb = 0
    setPopups([])

    for (;;) {
      const res = findMatches(cur)
      if (res.allCells.length === 0) break
      cb++
      const pts = res.score * cb
      total += pts
      const ar = res.allCells.reduce((a, [r]) => a + r, 0) / res.allCells.length
      const ac = res.allCells.reduce((a, [, col]) => a + col, 0) / res.allCells.length
      setBoard(cur)
      setFlash(Object.fromEntries(res.allCells.map(([r, col]) => [`${r},${col}`, true])))
      setPopups(prev => [...prev, { id: _pid++, row: ar, col: ac, text: `+${pts}` }])
      setScore(total)
      setCombo(cb)
      await pause(350)

      cur = removeMatches(cur, res.allCells)
      setBoard(cur)
      setFlash({})
      await pause(80)

      cur = dropTiles(cur)
      setBoard(cur)
      await pause(80)

      cur = fillEmpty(cur, c.tileTypes)
      setBoard(cur)
      await pause(120)
    }

    if (!hasAnyMove(cur)) {
      for (let i = 0; i < 50; i++) { cur = shuffle(cur); if (hasAnyMove(cur)) break }
      setBoard(cur)
    }

    const ns = st - 1
    setScore(total)
    setSteps(ns)
    setCombo(0)
    setSel(null)
    setFlash({})
    busy.current = false

    if (ns <= 0) {
      await pause(600)
      setPopups([])
      const r = saveScore(dk, total)
      setRank(r)
      setScreen('result')
    } else {
      setTimeout(() => setPopups([]), 600)
    }
  }, [])

  const click = useCallback((r: number, c: number) => {
    if (busy.current || screen !== 'playing' || steps <= 0) return
    if (!sel) { setSel({ row: r, col: c }); return }
    if (sel.row === r && sel.col === c) { setSel(null); return }
    if (!adjacent(sel, { row: r, col: c })) { setSel({ row: r, col: c }); return }
    const sw = swapTiles(board, sel.row, sel.col, r, c)
    if (findMatches(sw).allCells.length === 0) { setSel({ row: r, col: c }); return }
    setSel(null)
    setBoard(sw)
    cascade(sw, score, steps, diff)
  }, [sel, board, score, steps, diff, screen, cascade])

  if (screen === 'select') {
    return (
      <div className="mg-app">
        <h1 className="mg-title">消消乐</h1>
        <div className="mg-diff-list">
          {DIFFS.map(d => (
            <div key={d.key} className="mg-diff-card">
              <button className={`mg-diff-btn mg-diff-btn--${d.key}`} onClick={() => startGame(d.key)}>
                <span className="mg-diff-label">{d.label}</span>
                <span className="mg-diff-info">{d.rows}×{d.cols} · {d.tileTypes}种 · {d.maxSteps}步</span>
              </button>
              <div className="mg-diff-lb">
                {(() => {
                  const lb = getLeaderboard(d.key)
                  return lb.length > 0
                    ? lb.map((e, i) => <div key={i} className="mg-lb-row">{i + 1}. {e.score}分 <span className="mg-lb-date">{e.date}</span></div>)
                    : <div className="mg-lb-empty">暂无记录</div>
                })()}
              </div>
            </div>
          ))}
        </div>
        <div className="mg-rules">
          <p>交换相邻水果，3个以上连成一线即可消除</p>
          <p>连续消除产生连击，分数翻倍</p>
          <p>25步内争取最高分！</p>
        </div>
      </div>
    )
  }

  if (screen === 'result') {
    const lb = getLeaderboard(diff)
    return (
      <div className="mg-app">
        <div className="mg-result">
          <h2>游戏结束</h2>
          <div className="mg-result-score">{score}分</div>
          {rank > 0 && <div className="mg-result-rank">排行榜 #{rank}</div>}
          <div className="mg-result-lb">
            <h3>{cfg.label}难度 排行榜</h3>
            {lb.length > 0
              ? lb.map((e, i) => <div key={i} className="mg-lb-row">{i + 1}. {e.score}分 <span className="mg-lb-date">{e.date}</span></div>)
              : <div className="mg-lb-empty">暂无记录</div>}
          </div>
          <div className="mg-result-btns">
            <button className="mg-btn mg-btn--primary" onClick={() => startGame(diff)}>再来一次</button>
            <button className="mg-btn mg-btn--secondary" onClick={() => setScreen('select')}>换难度</button>
          </div>
        </div>
      </div>
    )
  }

  const cols = board[0].length
  const emojiPx: Record<number, number> = { 6: 28, 8: 22, 10: 18 }
  const fs = emojiPx[cols] ?? 22

  const popupMap = new Map<string, Popup[]>()
  for (const p of popups) {
    const k = `${Math.round(p.row)},${Math.round(p.col)}`
    const arr = popupMap.get(k) ?? []
    arr.push(p)
    popupMap.set(k, arr)
  }

  return (
    <div className="mg-app">
      <div className="mg-header">
        <button className="mg-back" onClick={() => { if (!busy.current) setScreen('select') }}>←</button>
        <span className="mg-header-diff">{cfg.label}</span>
        <span className="mg-header-score">{score}分</span>
        <span className="mg-header-steps">👣 {steps}步</span>
        {combo > 1 && <span className="mg-header-combo">{combo}连击!</span>}
      </div>
      <div className="mg-board-wrap">
        <div className="mg-board" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {board.map((row, r) =>
            row.map((tile, c) => {
              const k = `${r},${c}`
              const ps = popupMap.get(k)
              return (
                <div key={k} className="mg-cell">
                  {tile && (
                    <div
                      className={[
                        'mg-tile',
                        flash[k] && 'mg-tile--flash',
                        sel?.row === r && sel?.col === c && 'mg-tile--sel',
                      ].filter(Boolean).join(' ')}
                      style={{ fontSize: fs }}
                      onClick={() => click(r, c)}
                    >
                      {getFruit(tile.type)}
                    </div>
                  )}
                  {ps?.map(p => (
                    <div key={p.id} className="mg-popup" style={{ fontSize: fs }}>{p.text}</div>
                  ))}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}