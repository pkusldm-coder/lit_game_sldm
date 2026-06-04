import { useGame } from './hooks/useGame'
import { LEVELS } from './core/levels'
import Header from './components/Header'
import GameBoard from './components/GameBoard'
import WinOverlay from './components/WinOverlay'
import LevelSelect from './components/LevelSelect'
import './App.css'

function App() {
  const { state, showLevelSelect, setShowLevelSelect, handleCellClick, handleCellContextMenu, toggleMode, nextLevel, resetLevel, startLevel } = useGame()

  return (
    <div className="ng-app">
      <Header
        level={state.level}
        moves={state.moves}
        mode={state.mode}
        onLevelSelect={() => setShowLevelSelect(true)}
        onReset={resetLevel}
        onToggleMode={toggleMode}
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
    </div>
  )
}

export default App
