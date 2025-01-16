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
        <div className="w-full bg-[#33ff33] text-black px-2 py-1 text-sm border-b border-[#33ff33]/20 font-mono h-[56px] flex items-center whitespace-normal">
          <span className="font-bold">
            <span className="mr-2">&gt;</span>
            Mission: {state.characterInfo.mission}
          </span>
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