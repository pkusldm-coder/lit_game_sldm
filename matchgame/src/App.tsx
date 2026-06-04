import { useGame } from './hooks/useGame'
import Header from './components/Header'
import GameBoard from './components/GameBoard'
import WinOverlay from './components/WinOverlay'
import LevelSelect from './components/LevelSelect'
import './App.css'

function App() {
  const { state, showLevelSelect, setShowLevelSelect, handleCellClick, nextLevel, handleRetry, startNewGame } = useGame()

  return (
    <div className="mg-app">
      <Header
        level={state.level}
        score={state.score}
        targetScore={state.targetScore}
        movesLeft={state.movesLeft}
        onLevelSelect={() => setShowLevelSelect(true)}
      />
      <GameBoard
        board={state.board}
        selected={state.selected}
        onCellClick={handleCellClick}
      />
      {(state.won || state.lost) && (
        <WinOverlay
          won={state.won}
          level={state.level}
          score={state.score}
          targetScore={state.targetScore}
          onNextLevel={nextLevel}
          onRetry={handleRetry}
        />
      )}
      {showLevelSelect && (
        <LevelSelect
          onSelect={(level) => startNewGame(level)}
          onClose={() => setShowLevelSelect(false)}
        />
      )}
    </div>
  )
}

export default App
