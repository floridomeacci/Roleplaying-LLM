import React from 'react';
import { Heart, Zap, Star, Package, Coins, Sword, Shield, Bug, Box } from 'lucide-react';
import { Status, Item, Message } from '../types';
import { Dice } from './Dice';

interface GameUIProps {
  messages: Message[];
  input: string;
  isLoading: boolean;
  characterInfo: { name: string; type: string; backstory: string; mission: string; } | null;
  allStats: Status[];
  inventory: Item[];
  coins: number;
  shouldAutoScroll: boolean;
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSuggestionClick: (suggestion: string) => void;
  onUndo: () => void;
  handlers: any;
  currentRequest: {
    prompt: string;
    template: string;
    diceRoll?: number;
  };
  botResponse: string;
}

export function GameUI({
  messages,
  input,
  isLoading,
  characterInfo,
  allStats,
  inventory,
  coins,
  shouldAutoScroll,
  onScroll,
  onSubmit,
  onInputChange,
  onUndo,
  handlers,
  onSuggestionClick,
  currentRequest,
  botResponse
}: GameUIProps) {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [showShake, setShowShake] = React.useState(false);
  const [showRollMessage, setShowRollMessage] = React.useState(false);
  const [pendingSubmit, setPendingSubmit] = React.useState(false);
  const [hideCurrentMoves, setHideCurrentMoves] = React.useState(false);

  React.useEffect(() => {
    if (pendingSubmit && currentRequest.diceRoll) {
      handlers.handleDirectSubmit(input, currentRequest.diceRoll);
      setPendingSubmit(false);
    }
  }, [currentRequest.diceRoll, pendingSubmit]);

  React.useEffect(() => {
    if (shouldAutoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, shouldAutoScroll]);

  // Handle move suggestion click
  const handleMoveClick = (move: string) => {
    console.log('Move clicked:', move);
    setHideCurrentMoves(true);
    onSuggestionClick(move);
    const diceContainer = document.querySelector<HTMLDivElement>('.dice-container');
    if (diceContainer) {
      console.log('Triggering dice roll from move click');
      diceContainer.click();
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submit attempted:', { input: input.trim(), diceRoll: currentRequest.diceRoll });
    if (!input.trim()) return;
    
    if (!currentRequest.diceRoll) {
      console.log('No dice roll, showing shake animation');
      setShowShake(true);
      setShowRollMessage(true);
      setTimeout(() => setShowShake(false), 300);
      setTimeout(() => setShowRollMessage(false), 2000);
      return;
    }
    
    console.log('Submitting with dice roll:', currentRequest.diceRoll);
    handlers.handleDirectSubmit(input, currentRequest.diceRoll);
  };
  
  // Auto-focus input after submit
  React.useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
      setHideCurrentMoves(false);
    }
  }, [isLoading]);

  // Split stats into level, vitals, and character stats
  const level = allStats[0] || { name: 'Level', value: 1, icon: React.createElement(Star, { className: "w-6 h-6" }), key: 'level' };
  const vitals = allStats.length > 1 ? allStats.slice(1, 5) : []; // Health, Energy, DMG, DEF
  const stats = allStats.length > 5 ? allStats.slice(5) : []; // Character stats

  return (
    <div className="h-full flex flex-col md:flex-row bg-black">
      {/* Left Column - Chat */}
      <div className="w-full md:w-1/2 lg:w-2/5 flex flex-col p-2 md:border-r border-[#33ff33]/20">
        <div 
          className="h-[calc(100vh-12rem)] overflow-y-auto space-y-0.5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#33ff33]/20 hover:scrollbar-thumb-[#33ff33]/40 relative"
          onScroll={onScroll}
        >
          {messages.length === 0 && (
            <div className="flex items-start gap-2 opacity-60">
              <span className="select-none">$</span> Type a message and press Enter
            </div>
          )}
          
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex items-start mb-2 ${
                message.isSystem 
                  ? 'text-gray-500 text-sm font-mono' 
                  : message.isUser 
                    ? 'text-[#ffd700]' 
                    : 'text-[#33ff33]'
              }`}
            >
              <div className="flex items-start gap-2 break-words max-w-full">
                <span className="select-none">
                  {message.isSystem ? '⚡' : message.isUser ? '>' : '$'}
                </span>
                <div className="whitespace-pre-wrap break-words">
                  {message.content
                    .replace(/\[(MOVES|MV|MVES|STATS|DAMAGE|EXP|ENEMY)\].*?\[\/(?:MOVES|MV|MVES|STATS|DAMAGE|EXP|ENEMY)\]/g, '')
                    .replace(/^\$\s*\$\s*/, '')
                    .replace(/^\$\s*/, '')
                    .trim()}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 text-[#33ff33]">
                <div className="flex items-center">
                  <div className="w-2 h-4 bg-green-500 animate-pulse" />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Section with Moves, Input and Side Container */}
        <div className="mt-auto border-t border-[#33ff33]/20 pt-2 flex gap-2 items-end">
          {/* Moves and Input Container */}
          <div className="flex-1 flex flex-col gap-2">
            {/* Moves Section */}
            {messages[messages.length - 1]?.suggestions && !hideCurrentMoves && (
              <div className="mb-2">
                <div className="flex flex-wrap gap-2">
                  {messages[messages.length - 1].suggestions?.map((move, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleMoveClick(move)}
                      className="text-sm px-3 py-1 border border-[#33ff33]/40 rounded hover:bg-[#33ff33]/10 transition-colors"
                    >
                      {move}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Form */}
            <form onSubmit={handleFormSubmit} className="flex flex-col gap-2 relative">
              <div className="flex gap-1">
              <input
                type="text"
                ref={inputRef}
                value={input}
                onChange={onInputChange}
                placeholder="Type a message..."
                className={`flex-1 bg-transparent border-0 text-[#33ff33] placeholder-[#33ff33]/40 focus:ring-0 px-1 text-sm ${showShake ? 'shake' : ''}`}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={onUndo}
                disabled={isLoading}
                className="px-2 text-[#33ff33] hover:text-[#33ff33]/80 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                ↺
              </button>
              </div>

              <div className="flex gap-2">
                {/* Side Container */}
                <div className={`w-24 h-24 border border-[#33ff33]/20 rounded relative hover:border-[#33ff33]/40 transition-colors ${!currentRequest.diceRoll && showShake ? 'shake' : ''}`}>
                  <Dice 
                    className="dice-container"
                    disabled={!!currentRequest.diceRoll}
                    onRoll={(value) => {
                      handlers.setDiceRoll(value);
                      if (input.trim()) {
                        handlers.handleSubmit(new Event('submit') as React.FormEvent, input, value);
                      }
                    }}
                    onSubmit={() => setPendingSubmit(true)}
                  />
                  {currentRequest.diceRoll && (
                    <div className="absolute top-1 right-1 text-xs opacity-70">
                      d20: {currentRequest.diceRoll}
                    </div>
                  )}
                </div>

              <button
                type="submit"
                disabled={isLoading || !input.trim() || !currentRequest.diceRoll}
                className="flex-1 h-24 bg-[#33ff33]/10 border border-[#33ff33] rounded-lg hover:bg-[#33ff33]/20 disabled:opacity-50 disabled:cursor-not-allowed text-sm relative group tooltip-container submit-button flex items-center justify-center gap-2 transition-all"
              >
                <span>Send</span>
                <span className="transform group-hover:translate-x-0.5 transition-transform">→</span>
                {input.trim() && !currentRequest.diceRoll && !showRollMessage && (
                  <div className="absolute bottom-full right-0 mb-2 whitespace-nowrap bg-black border border-[#33ff33] text-[#33ff33] px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity z-50">
                    Roll the dice first
                  </div>
                )}
              </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Right Column - Status */}
      <div className="w-full md:w-1/4 p-4 flex flex-col border-r border-[#33ff33]/20 overflow-y-auto">
        {/* Level */}
        {allStats.length > 0 && characterInfo && (
          <div className="mb-4">
            <div className="mb-3 flex items-center justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-lg font-bold">{characterInfo.name}</h2>
                <div className="text-sm opacity-80">Level {level.value} {characterInfo.type}</div>
              </div>
              <div className="w-16 h-16 rounded-sm border-2 border-[#33ff33] overflow-hidden flex-shrink-0">
                {characterInfo.profileImage ? (
                  <img 
                    src={characterInfo.profileImage} 
                    alt={characterInfo.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#33ff33]/5 flex items-center justify-center">
                    <span className="text-[#33ff33]/40 text-2xl">?</span>
                  </div>
                )}
              </div>
            </div>
            <div className="text-xs text-center mt-1 opacity-70">
              EXP: {level.exp || 0}/{level.maxExp || 100}
            </div>
            <div className="w-full bg-[#33ff33]/20 rounded-full h-2 mt-1">
              <div
                className="bg-[#33ff33] h-2 rounded-full transition-all duration-300"
                style={{ width: `${((level.exp || 0) / (level.maxExp || 100)) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Vital Stats */}
        {vitals.length > 0 && (
          <div className="space-y-3 mb-4">
            {/* Health and Energy */}
            {vitals.slice(0, 2).map((status, index) => (
              <div key={index} className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {status.icon}
                    <span className="uppercase text-sm">{status.name}</span>
                    {status.change && (
                      <span className={`text-xs ${status.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {status.change > 0 ? '↑' : '↓'} {Math.abs(status.change)}
                      </span>
                    )}
                  </div>
                  <span className="text-sm">
                    {status.value}/{status.maxValue || status.value}
                  </span>
                </div>
                <div className="w-full bg-[#33ff33]/20 rounded-full h-2">
                  <div
                    className="bg-[#33ff33] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(status.value / (status.maxValue || status.value)) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {/* Combat Stats */}
            <div className="flex gap-4">
              <div className="flex-1 border border-[#33ff33] rounded p-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sword className="w-4 h-4" />
                    <span className="text-sm">DMG</span>
                  </div>
                  <span className="text-lg font-bold">
                    {(vitals[2]?.value || 0) + (inventory.find(i => i.type === 'weapon')?.value || 0)}
                  </span>
                </div>
              </div>
              <div className="flex-1 border border-[#33ff33] rounded p-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    <span className="text-sm">DEF</span>
                  </div>
                  <span className="text-lg font-bold">
                    {(vitals[3]?.value || 0) + (inventory.find(i => i.type === 'armor')?.value || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RPG Stats */}
        {stats.length > 0 && (
          <div className="border-t border-[#33ff33]/20 pt-3 mb-4">
            <h2 className="text-sm uppercase mb-4 opacity-80">Character Stats</h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              {stats.map((stat, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex items-center gap-3 w-full">
                    <div className="flex items-center gap-2">
                      {stat.icon}
                      <span className="text-xs uppercase opacity-80">
                        {stat.name === 'Strength' ? 'STR' :
                         stat.name === 'Dexterity' ? 'DEX' :
                         stat.name === 'Endurance' ? 'END' :
                         stat.name === 'Agility' ? 'AGI' :
                         stat.name === 'Luck' ? 'LCK' :
                         stat.name === 'Charisma' ? 'CHR' :
                         stat.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 ml-auto">
                      {(() => {
                        const itemBonus = inventory
                          .filter(item => item.statBonus?.stat.toLowerCase() === stat.name.toLowerCase())
                          .reduce((sum, item) => sum + (item.statBonus?.value || 0), 0);
                        
                        return (
                          <div className="flex items-center gap-1">
                            <span className="text-lg font-bold">{stat.value}</span>
                            {itemBonus > 0 && (
                              <span className="text-sm text-blue-400">+{itemBonus}</span>
                            )}
                          </div>
                        );
                      })()}
                      {stat.change && (
                        <span className={`text-xs ${stat.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {stat.change > 0 ? '↑' : '↓'} {Math.abs(stat.change)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Inventory */}
        {allStats.length > 0 && (
          <div className="border-t border-[#33ff33]/20 pt-3 mb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                <h2 className="text-sm uppercase opacity-80">Inventory</h2>
              </div>
              <div className="flex items-center gap-1 text-[#ffd700]">
                <Coins className="w-4 h-4" />
                <span className="text-sm">{coins}C</span>
              </div>
            </div>
            <div className="space-y-2">
              {inventory.map((item, index) => (
                <div key={index} className="text-sm flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="w-4 flex items-center">
                      {item.type === 'weapon' && <Sword className="w-3 h-3" />}
                      {item.type === 'armor' && <Shield className="w-3 h-3" />}
                      {item.type === 'tool' && <Box className="w-3 h-3" />}
                      {item.type === 'material' && <Box className="w-3 h-3" />}
                      {item.type === 'coins' && <Coins className="w-3 h-3" />}
                      {item.type === 'item' && <Package className="w-3 h-3" />}
                    </span>
                    <span className={`${
                      item.rarity === 'legendary' ? 'text-[#ffd700]' :
                      item.rarity === 'epic' ? 'text-purple-400' :
                      item.rarity === 'rare' ? 'text-blue-400' :
                      item.rarity === 'uncommon' ? 'text-green-400' :
                      'text-gray-200'
                    } truncate`}>{item.name.split('|')[0].trim()}</span>
                  </div>
                  <div className="text-xs opacity-70 text-right">
                    {item.type === 'weapon' && `+${item.value} DMG`}
                    {item.type === 'armor' && `+${item.value} DEF`}
                    {(item.type === 'item' || item.type === 'material' || !item.type) && (
                      <>
                        {item.statBonus && `+${item.statBonus.value} ${item.statBonus.stat}`}
                        {item.quantity && ` x${item.quantity}`}
                      </>
                    )}
                  </div>
                </div>
              ))}
              {inventory.length === 0 && (
                <div className="text-sm opacity-50 text-center">Empty</div>
              )}
            </div>
          </div>
        )}
        
        {/* Buy Me a Coffee Link */}
        <div className="mt-auto pt-4 text-right">
          <a
            href="https://buymeacoffee.com/floridomeacci"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#33ff33]/60 hover:text-[#33ff33] transition-colors"
          >
            ☕ Buy me a coffee
          </a>
        </div>
      </div>

      {/* Debug Panel */}
      <div className="w-full md:w-1/3 p-4 flex flex-col">
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-2 mb-2">
            <Bug className="w-4 h-4" />
            <h2 className="text-sm uppercase opacity-80">Debug Info</h2>
          </div>
          <div className="flex flex-col gap-4 h-full w-full">
            <div className="w-full overflow-y-auto text-xs font-mono whitespace-pre-wrap break-words opacity-80">
              <strong className="text-[#ffd700]">Request:</strong>
              <pre className="mt-1 text-[#33ff33]/70 h-[calc((100vh-18rem)/3)] overflow-y-auto whitespace-pre-wrap break-all">
                {currentRequest.prompt ? `prompt: "${currentRequest.prompt}"
prompt_template: "${currentRequest.template}"` : '(no input)'}
              </pre>
            </div>
            <div className="w-full overflow-y-auto text-xs font-mono whitespace-pre-wrap break-words opacity-80">
              <strong className="text-[#ffd700]">Image Request:</strong>
              <pre className="mt-1 text-[#33ff33]/70 h-[calc((100vh-18rem)/3)] overflow-y-auto whitespace-pre-wrap break-all">
                {characterInfo?.profileImage ? `prompt: "professional corporate headshot portrait of a ${characterInfo.type.toLowerCase()} in an office setting, wearing business attire, high quality, 4k, realistic"
output: "${characterInfo.profileImage}"` : '(no image request)'}
              </pre>
            </div>
            <div className="w-full overflow-y-auto text-xs font-mono whitespace-pre-wrap break-words opacity-80">
              <strong className="text-[#ffd700]">API Response:</strong>
              <pre className="mt-1 text-[#33ff33]/70 h-[calc((100vh-18rem)/3)] overflow-y-auto whitespace-pre-wrap break-all">
                {botResponse || 'No response yet'}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}