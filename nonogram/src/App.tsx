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
  '根据行列旁边的数字线索还原图案',
  '数字表示该行/列连续填充格子的数量',
  '多个数字表示多组填充，组之间至少空一格',
  '点击格子填充（黑色），再点取消',
  '长按或右键标记为叉（确定此处不填充）',
  '切换 填充/标记 模式切换操作方式',
  '所有格子正确填充即获胜',
]

function App() {
  const { state, showLevelSelect, setShowLevelSelect, handleCellClick, handleCellContextMenu, toggleMode, nextLevel, resetLevel, startLevel } = useGame()
  const [showRules, setShowRules] = useState(false)

  return (
    <div className="ng-app">
      <Header
        level={state.level}
        moves={state.moves}
        mode={state.mode}
        onLevelSelect={() => setShowLevelSelect(true)}
        onReset={resetLevel}
        onToggleMode={toggleMode}
        onRules={() => setShowRules(true)}
      />
      <GameBoard
        board={state.board}
        gridSize={state.gridSize}
        rowClues={state.rowClues}
        colClues={state.colClues}
        onCellClick={handleCellClick}
        onCellContextMenu={handleCellContextMenu}
      />
      {state.won && (
        <WinOverlay
          level={state.level}
          hasNext={state.level < LEVELS.length}
          onNext={nextLevel}
          onRetry={resetLevel}
        />
      )}
      {showLevelSelect && (
        <LevelSelect
          currentIndex={state.level - 1}
          onSelect={startLevel}
          onClose={() => setShowLevelSelect(false)}
        />
      )}
      {showRules && (
        <RulesModal
          title="数织规则"
          rules={RULES}
          onClose={() => setShowRules(false)}
        />
      )}
    </div>
  )
}

export default App
