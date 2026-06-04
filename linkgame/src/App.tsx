import { useGame } from './hooks/useGame'
import Header from './components/Header'
import GameBoard from './components/GameBoard'
import WinOverlay from './components/WinOverlay'
import './App.css'

function App() {
  const { state, shuffled, handleCellClick, nextLevel, handleShuffle, startNewGame } = useGame()

  return (
    <div className="link-app">
      <Header
        level={state.level}
        pairsRemaining={state.pairsRemaining}
        onHome={() => startNewGame(1)}
        onShuffle={handleShuffle}
        shuffled={shuffled}
      />
      <GameBoard
        board={state.board}
        selected={state.selected}
        path={state.path}
        onCellClick={handleCellClick}
      />
      {state.won && (
        <WinOverlay
          level={state.level}
          onNextLevel={nextLevel}
        />
      )}
    </div>
  )
}

export default App
