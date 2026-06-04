import { useState } from 'react'
import { useGame } from './hooks/useGame'
import { LEVELS } from './core/levels'
import Header from './components/Header'
import GameBoard from './components/GameBoard'
import WinOverlay from './components/WinOverlay'
import LevelSelect from './components/LevelSelect'
import RulesModal from './components/RulesModal'
import './App.css'

const RULES = [
  '点击选中一个方块，然后点击方向箭头移动',
  '方块只能向空白方向滑动一格',
  '曹操（2×2 大方块）是你要保护的对象',
  '目标：将曹操移动到棋盘底部中央的出口',
  '曹操到达底部中央即获胜',
  '步数越少越好，挑战最少步数通关',
  '经典布局：横刀立马、兵临城下等 7 个关卡',
]

function App() {
  const { state, showLevelSelect, setShowLevelSelect, handleSelect, handleMove, resetLevel, nextLevel, startLevel } = useGame()
  const [showRules, setShowRules] = useState(false)

  return (
    <div className="kl-app">
      <Header
        levelIndex={state.levelIndex}
        levelName={LEVELS[state.levelIndex].name}
        moves={state.moves}
        onLevelSelect={() => setShowLevelSelect(true)}
        onReset={resetLevel}
        onRules={() => setShowRules(true)}
      />
      <GameBoard
        blocks={state.blocks}
        selectedId={state.selectedId}
        onSelect={handleSelect}
        onMove={handleMove}
      />
      {state.won && (
        <WinOverlay
          levelName={LEVELS[state.levelIndex].name}
          moves={state.moves}
          hasNext={state.levelIndex + 1 < LEVELS.length}
          onNext={nextLevel}
          onRetry={() => startLevel(state.levelIndex)}
        />
      )}
      {showLevelSelect && (
        <LevelSelect
          currentIndex={state.levelIndex}
          onSelect={startLevel}
          onClose={() => setShowLevelSelect(false)}
        />
      )}
      {showRules && (
        <RulesModal
          title="华容道规则"
          rules={RULES}
          onClose={() => setShowRules(false)}
        />
      )}
    </div>
  )
}

export default App
