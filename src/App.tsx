import React from 'react';
import { GameUI } from './components/GameUI';
import { Onboarding } from './components/Onboarding';
import { DeathPopup } from './components/DeathPopup';
import { LevelUpPopup } from './components/LevelUpPopup';
import { CreationLoading } from './components/CreationLoading';
import { useGameState } from './hooks/useGameState';

function App() {
  const { state, handlers } = useGameState();
  const isDead = state.allStats.find(stat => stat.key === 'health')?.value === 0;
  const showLevelUp = state.showLevelUpPopup && state.skillPoints > 0;

  return (
    <div className="h-screen bg-black text-[#33ff33] font-mono flex flex-col overflow-hidden">
      {/* Mission Banner */}
      {state.characterInfo?.mission && (
        <div className="w-full bg-white/5 text-white px-4 py-3 text-center text-sm border-b border-white/10 font-mono h-[150px] flex items-center justify-center whitespace-normal">
          Mission: {state.characterInfo.mission}
        </div>
      )}

      {/* Start Dialog */}
      {state.showStartDialog && (
        <Onboarding onCharacterCreated={handlers.handleCharacterCreated} />
      )}
      
      {/* Creation Loading Screen */}
      {state.isCreating && (
        <CreationLoading onComplete={() => handlers.setIsCreating(false)} />
      )}

      {/* Death Popup */}
      {isDead && <DeathPopup onReset={handlers.handleReset} />}

      {/* Level Up Popup */}
      {showLevelUp && (
        <LevelUpPopup
          stats={state.allStats}
          onDistribute={handlers.handleDistributeStat}
          remainingPoints={state.skillPoints}
          onClose={() => handlers.setShowLevelUpPopup(false)}
        />
      )}
      {/* Game UI */}
      <GameUI
        messages={state.messages}
        input={state.input}
        isLoading={state.isLoading}
        characterInfo={state.characterInfo}
        allStats={state.allStats}
        inventory={state.inventory}
        coins={state.coins}
        shouldAutoScroll={state.shouldAutoScroll}
        onScroll={handlers.handleScroll}
        onSubmit={handlers.handleSubmit}
        onInputChange={(e) => handlers.setInput(e.target.value)}
        onUndo={handlers.handleUndo}
        onSuggestionClick={(suggestion) => handlers.setInput(suggestion)}
        handlers={handlers}
        currentRequest={state.currentRequest}
        botResponse={state.botResponse}
      />
    </div>
  );
}

export default App;