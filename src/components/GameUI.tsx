import React from 'react';
import { Heart, Zap, Star, Package, Coins, Sword, Shield, Bug, Box } from 'lucide-react';
import { Status, Item, Message } from '../types';
import { Dice } from './Dice';
import { AnimationOverlay } from './AnimationOverlay';

import { WORKER_URLS } from '../constants';

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
  selectedAnimation?: string | null;
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
  selectedAnimation,
  botResponse
}: GameUIProps) {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [showDebug, setShowDebug] = React.useState(false);
  const [showShake, setShowShake] = React.useState(false);
  const [showRollMessage, setShowRollMessage] = React.useState(false);
  const [pendingSubmit, setPendingSubmit] = React.useState(false);
  const [hideCurrentMoves, setHideCurrentMoves] = React.useState(false);
  const [leftHandItem, setLeftHandItem] = React.useState<Item | null>(null);
  const [rightHandItem, setRightHandItem] = React.useState<Item | null>(null);
  const [rightHandUrl, setRightHandUrl] = React.useState<string | null>(null);
  const [leftHandUrl, setLeftHandUrl] = React.useState<string | null>(null);
  const [isGeneratingItems, setIsGeneratingItems] = React.useState(false);
  const [summaryImages, setSummaryImages] = React.useState<Map<number, string>>(new Map());
  const [isGeneratingSummary, setIsGeneratingSummary] = React.useState(false);
  const itemImageCache = React.useRef<Map<string, string>>(new Map());
  const maxRetries = 3;

  const generateImage = async (prompt: string, retryCount = 0): Promise<string | null> => {
    if (messages.length < 3) return;
    
    try {
      const response = await fetch('https://tamagotchipfp.brancaskitchen.workers.dev', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt,
          width: 1024,
          height: 1024,
          scheduler: "K_EULER",
          num_outputs: 1,
          guidance_scale: 0,
          negative_prompt: "worst quality, low quality, realistic, photorealistic, photograph, western art style",
          num_inference_steps: 4
        })
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      
      if (!data.output?.[0]) {
        throw new Error('No image URL in response');
      }
      
      return data.output[0];
      
    } catch (err) {
      console.error(`Image generation attempt ${retryCount + 1} failed:`, err);
      if (retryCount < maxRetries - 1) {
        console.log('Retrying image generation...');
        return generateImage(prompt, retryCount + 1);
      }
      return null;
    }
  };

  // Generate summary image for last 3 messages
  const generateSummaryImage = async (messages: Message[]) => {
    if (messages.length < 3) return;
    
    setIsGeneratingSummary(true);
    const messageIndex = messages.length - 1;
    
    try {
      const lastThreeMessages = messages.slice(-3)
        .map(m => {
          const messageMatch = m.content.match(/\[MESSAGE\]([\s\S]*?)\[\/MESSAGE\]/);
          return m.isUser ? m.content.trim() : (messageMatch ? messageMatch[1].trim() : m.content.trim());
        })
        .join(' | ');

      const characterDesc = characterInfo?.description 
        ? `${characterInfo.description.gender} ${characterInfo.description.type} with ${characterInfo.description.look}` 
        : '';

      const imagePrompt = `anime illustration of ${characterDesc} in the following scene: ${lastThreeMessages}, high quality anime art style, studio ghibli inspired, detailed background`;

      const imageUrl = await generateImage(imagePrompt);
      if (imageUrl) {
        setSummaryImages(prev => new Map(prev).set(messageIndex, imageUrl));
      }
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  // Check for every third message
  React.useEffect(() => {
    if (messages.length > 0 && messages.length % 3 === 0 && !messages[messages.length - 1].isSystem) {
      generateSummaryImage(messages);
    }
  }, [messages.length]);

  const generateItemImage = async (item: Item) => {
    const cachedUrl = itemImageCache.current.get(item.name);
    if (cachedUrl) {
      return cachedUrl;
    }

    try {
      const response = await fetch(WORKER_URLS.ITEM, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt: `${item.name} on white background, single product` })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      const imageUrl = data.output?.[0] || null;
      
      if (imageUrl) {
        itemImageCache.current.set(item.name, imageUrl);
      }
      
      return imageUrl;
    } catch (err) {
      console.error('Failed to generate item image:', err);
      return null;
    }
  };

  // Update item URLs when items change
  React.useEffect(() => {
    if (leftHandItem) {
      setIsGeneratingItems(true);
      generateItemImage(leftHandItem).then(url => {
        setLeftHandUrl(url);
        setIsGeneratingItems(false);
      });
    } else {
      setLeftHandUrl(null);
    }
  }, [leftHandItem]);

  React.useEffect(() => {
    if (rightHandItem) {
      setIsGeneratingItems(true);
      generateItemImage(rightHandItem).then(url => {
        setRightHandUrl(url);
        setIsGeneratingItems(false);
      });
    } else {
      setRightHandUrl(null);
    }
  }, [rightHandItem]);
  const [diceDisabled, setDiceDisabled] = React.useState(false);
  const [expNotification, setExpNotification] = React.useState<{ amount: number; timestamp: number } | null>(null);
  const [expChangeTimestamp, setExpChangeTimestamp] = React.useState<number | null>(null);


  // Watch for EXP changes in messages
  React.useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && !lastMessage.isUser) {
      const expMatch = botResponse.match(/\[EXP\](\d+)\[\/EXP\]/);
      if (expMatch) {
        const amount = parseInt(expMatch[1]);
        setExpNotification({ amount, timestamp: Date.now() });
        setExpChangeTimestamp(Date.now());
        setTimeout(() => setExpNotification(null), 2000);
        setTimeout(() => setExpChangeTimestamp(null), 2000);
      }
    }
  }, [messages, botResponse]);

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

  // Reset dice state when input changes
  React.useEffect(() => {
    if (input.trim()) {
      setDiceDisabled(false);
      handlers.setDiceRoll(undefined);
    }
  }, [input]);

  // Handle move suggestion click
  const handleMoveClick = (move: string) => {
    console.log('Move clicked:', move);
    onInputChange({ target: { value: move } } as React.ChangeEvent<HTMLInputElement>);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submit attempted:', { input: input.trim(), diceRoll: currentRequest.diceRoll });
    const currentInput = input.trim();
    if (!currentInput) return;
    
    if (!currentRequest.diceRoll) {
      console.log('No dice roll yet, showing shake animation');
      setShowShake(true);
      setShowRollMessage(true);
      setTimeout(() => setShowShake(false), 300);
      setTimeout(() => setShowRollMessage(false), 2000);
      return;
    }
    
    console.log('Submitting with dice roll:', currentRequest.diceRoll);
    handlers.handleDirectSubmit(currentInput, currentRequest.diceRoll);
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
    <div className="h-screen flex flex-col md:flex-row bg-black relative overflow-hidden">
      {/* Left Column - Chat */}
      <div className={`w-full flex flex-col p-2 md:border-r border-[#33ff33]/20 transition-all duration-300 ${showDebug ? 'md:w-1/2 lg:w-2/5' : 'md:w-2/3 lg:w-3/4'}`}>
        <div 
          className="flex-1 overflow-y-auto space-y-0.5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#33ff33]/20 hover:scrollbar-thumb-[#33ff33]/40 relative"
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
              <div className="flex items-start gap-2 break-words w-full">
                <span className="select-none">
                  {message.isSystem ? '⚡' : message.isUser ? '>' : '$'}
                </span>
                <div className="flex flex-col w-full">
                  {/* Message content */}
                  <div className="flex gap-4 w-full">
                    {/* Show summary image only for bot responses */}
                    {!message.isUser && (index + 1) % 3 === 0 && (
                      <div className="w-32 h-32 rounded-lg overflow-hidden flex-shrink-0 bg-black/20">
                        <img 
                          src={summaryImages.get(index)} 
                          alt="Chat summary"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Hide broken images
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        {isGeneratingSummary && index === messages.length - 1 && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#33ff33]" />
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Message text */}
                    <div className="whitespace-pre-wrap break-words flex-1">
                      {message.content
                        .replace(/\[(MOVES|MV|MVES|STATS|DAMAGE|ENEMY)\].*?\[\/(?:MOVES|MV|MVES|STATS|DAMAGE|ENEMY)\]/g, '')
                        .replace(/\[EXP\]\d+\[\/EXP\]/g, '')
                        .replace(/^\$\s*\$\s*/, '')
                        .replace(/^\$\s*/, '')
                        .trim()}
                      {/* Show floating EXP notification */}
                      {!message.isUser && expNotification && messages[messages.length - 1] === message && (
                        <div 
                          className="inline-block ml-2 text-white animate-fade-out"
                          style={{
                            animation: 'fadeOut 2s forwards',
                            opacity: Math.max(0, 1 - (Date.now() - expNotification.timestamp) / 2000)
                          }}
                        >
                          <span className="text-white">+{expNotification.amount} EXP</span>
                        </div>
                      )}
                    </div>
                  </div>
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
        <div className="mt-auto pt-2 flex gap-2 items-end">
          {/* Moves and Input Container */}
          <div className="flex-1 flex flex-col gap-2 relative">
            {/* Moves Section */}
            <div className="mb-2 pb-2 border-b border-[#33ff33]/20">
              <div className="flex flex-wrap gap-2 justify-start">
                {messages[messages.length - 1]?.suggestions ? (
                  messages[messages.length - 1].suggestions.map((move) => (
                    <button
                      key={move}
                      onClick={() => handleMoveClick(move)}
                      className="text-sm px-3 py-1 border border-[#33ff33]/40 rounded hover:bg-[#33ff33]/10 transition-colors whitespace-nowrap max-w-full"
                    >
                      {move}
                    </button>
                  ))
                ) : null}
              </div>
            </div>

            {/* Input Form */}
            <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
              <div className="flex-1 flex gap-1">
              <textarea
                ref={inputRef}
                value={input || ''}
                onChange={onInputChange}
                placeholder="Type a message..."
                className={`w-full h-24 bg-transparent border-0 text-[#33ff33] placeholder-[#33ff33]/40 focus:ring-0 px-1 text-sm resize-none ${showShake ? 'shake' : ''}`}
                disabled={isLoading}
                rows={4}
              />
              </div>

              {/* Dice Container */}
              <div className={`w-24 h-24 border ${input.trim() && !currentRequest.diceRoll ? 'border-[#33ff33]' : 'border-[#33ff33]/20'} rounded relative transition-colors ${!currentRequest.diceRoll && showShake ? 'shake' : ''}`}>
                <Dice 
                  className="dice-container"
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
            </form>
          </div>
        </div>
      </div>

      {/* Right Column - Status */}
      <div className={`w-full md:w-1/4 p-2 flex flex-col border-r border-[#33ff33]/20 overflow-y-auto transition-all duration-300 ${showDebug ? '' : 'md:w-1/3 lg:w-1/4'}`}>
        {/* Level */}
        {allStats.length > 0 && characterInfo && (
          <div className="mb-2">
            <div className="flex items-start gap-4">
              {/* Character Image */}
              <div className="w-32 h-32 rounded-sm border-2 border-[#33ff33] overflow-hidden flex-shrink-0">
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
              {/* Character Info */}
              <div className="flex-1">
                <h2 className="text-lg font-bold">{characterInfo.name}</h2>
                <div className="text-sm opacity-80">Level {level.value} {characterInfo.type}</div>
                <div className="text-xs opacity-70 mt-1">
                  EXP: {level.exp || 0}/{level.maxExp || 100}
                </div>
                <div className="w-full bg-[#33ff33]/20 rounded-full h-1.5 mt-1">
                  <div
                    className="h-1.5 rounded-full transition-all duration-300 flex"
                  >
                    <div 
                      className={`h-full transition-all duration-300 ${
                        expChangeTimestamp && Date.now() - expChangeTimestamp < 2000
                          ? 'bg-gray-300'
                          : 'bg-[#33ff33]'
                      }`}
                      style={{ 
                        width: `${((level.exp || 0) / (level.maxExp || 100)) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Vital Stats */}
        {vitals.length > 0 && (
          <div className="flex gap-4 mb-2">
            <div className="flex-1">
              <div className="space-y-2">
                {/* Health and Energy */}
                {vitals.slice(0, 2).map((status, index) => (
                  <div key={index} className="flex flex-col space-y-1">
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
                    <div className="w-full bg-[#33ff33]/20 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full transition-all duration-300 flex"
                      >
                        {/* Base value bar */}
                        <div 
                          className="h-full bg-[#33ff33] transition-all duration-300"
                          style={{ 
                            width: `${((status.value - (status.change || 0)) / (status.maxValue || status.value)) * 100}%` 
                          }}
                        />
                        {/* Change indicator */}
                        {status.change && (
                          <div 
                            className={`h-full transition-all duration-300 ${
                              status.change > 0 ? 'bg-gray-300' : 'bg-orange-500'
                            }`}
                            style={{ 
                              width: `${(Math.abs(status.change) / (status.maxValue || status.value)) * 100}%`
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Combat Stats */}
                <div className="flex gap-4 mt-4">
                  <div className="flex-1 border border-[#33ff33] rounded p-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sword className="w-4 h-4" />
                        <span className="text-sm">DMG</span>
                      </div>
                      <span className="text-base font-bold">
                        {(vitals[2]?.value || 0) + (inventory.find(i => i.type === 'weapon')?.value || 0)}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 border border-[#33ff33] rounded p-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        <span className="text-sm">DEF</span>
                      </div>
                      <span className="text-base font-bold">
                        {(vitals[3]?.value || 0) + (inventory.find(i => i.type === 'armor')?.value || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Second Image Container */}
            <div className="w-32 h-32 rounded-sm border-2 border-[#33ff33] overflow-hidden flex-shrink-0">
              <AnimationOverlay
                selectedAnimation={selectedAnimation ? 
                  `${WORKER_URLS.ANIMATION}/file/${selectedAnimation}` : 
                  `${WORKER_URLS.ANIMATION}/file/Animations/Looking.gif`
                }
                leftHandUrl={leftHandUrl}
                rightHandUrl={rightHandUrl}
                isGenerating={isGeneratingItems}
              />
            </div>
          </div>
        )}

        {/* RPG Stats */}
        {stats.length > 0 && (
          <div className="border-t border-[#33ff33]/20 pt-2 mb-2">
            <h2 className="text-xs uppercase mb-4 opacity-80">Character Stats</h2>
            <div className="grid grid-cols-3 grid-rows-2 gap-4">
              {stats.map((stat, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex items-center gap-3 w-full">
                    <div className="flex items-center gap-2">
                      {stat.icon}
                      <span className="text-xs uppercase opacity-80">
                        {stat.name === 'Strength' ? 'STR' : stat.name === 'Dexterity' ? 'DEX' : stat.name === 'Endurance' ? 'END' : stat.name === 'Agility' ? 'AGI' : stat.name === 'Wisdom' ? 'WIS' : stat.name === 'Charisma' ? 'CHR' : stat.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {(() => {
                        const itemBonus = inventory
                          .filter(item => item.statBonus?.stat.toLowerCase() === stat.name.toLowerCase())
                          .reduce((sum, item) => sum + (item.statBonus?.value || 0), 0);
                        
                        return (
                          <div className="flex items-center gap-1">
                            <span className="text-lg font-bold w-6 text-left">{stat.value}</span>
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
          <div className="border-t border-[#33ff33]/20 pt-2 mb-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                <h2 className="text-xs uppercase opacity-80">Inventory</h2>
              </div>
              <div className="flex items-center gap-1 text-[#ffd700]">
                <Coins className="w-4 h-4" />
                <span className="text-sm">{coins}C</span>
              </div>
            </div>
            <div className="space-y-2">
              {inventory.map((item, index) => (
                <div key={index} className="text-sm flex items-center justify-between">
                  <div 
                    className={`flex items-center gap-2 flex-1 ${
                      'cursor-pointer hover:bg-[#33ff33]/10 px-2 py-1 rounded transition-colors'
                    }`}
                    onClick={() => {
                      // If item is already equipped in either hand, unequip it
                      if (leftHandItem === item) {
                        setLeftHandItem(null);
                      } else if (rightHandItem === item) {
                        setRightHandItem(null);
                      } else if (!leftHandItem) {
                        // If item is not equipped and left hand is empty, equip to left hand
                        // First unequip from right hand if it's equipped there
                        if (rightHandItem === item) {
                          setRightHandItem(null);
                        }
                        setLeftHandItem(item);
                      } else if (!rightHandItem) {
                        // If item is not equipped and right hand is empty, equip to right hand
                        // First unequip from left hand if it's equipped there
                        if (leftHandItem === item) {
                          setLeftHandItem(null);
                        }
                        setRightHandItem(item);
                      }
                    }}
                  >
                    <span className="w-4 flex items-center">
                      {item.type === 'weapon' && <Sword className="w-3 h-3" />}
                      {item.type === 'armor' && <Shield className="w-3 h-3" />}
                      {item.type === 'tool' && <Box className="w-3 h-3" />}
                      {item.type === 'material' && <Box className="w-3 h-3" />}
                      {item.type === 'coins' && <Coins className="w-3 h-3" />}
                      {item.type === 'item' && <Package className="w-3 h-3" />}
                    </span>
                    <span className={`transition-colors duration-300 ${
                      item.rarity === 'legendary' ? 'text-[#ffd700]' :
                      item.rarity === 'epic' ? 'text-purple-400' :
                      item.rarity === 'rare' ? 'text-blue-400' :
                      item.rarity === 'uncommon' ? 'text-[#33ff33]' :
                      'text-[#33ff33]'
                    } truncate`}>{item.name.split('|')[0].trim()}</span>
                    {item === leftHandItem && (
                      <span className="ml-1 text-xs opacity-70">(L)</span>
                    )}
                    {item === rightHandItem && (
                      <span className="ml-1 text-xs opacity-70">(R)</span>
                    )}
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
      <div className={`absolute right-0 top-0 h-full flex transition-all duration-300 ${showDebug ? '' : 'translate-x-[calc(100%-1rem)]'}`}>
        <button 
          onClick={() => setShowDebug(!showDebug)}
          className="absolute -left-8 top-1/2 -translate-y-1/2 rotate-90 bg-black border border-[#33ff33]/20 px-2 py-1 text-xs rounded-t flex items-center gap-1 hover:bg-[#33ff33]/10 transition-colors z-10"
        >
          <Bug className="w-3 h-3 -rotate-90" />
          <span>Debug</span>
        </button>
        <div className={`w-full md:w-96 h-full p-4 flex flex-col border-l border-[#33ff33]/20 bg-black transition-all duration-300 ${showDebug ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex flex-col gap-4 h-full">
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
                {currentRequest.imageRequest ? JSON.stringify(currentRequest.imageRequest, null, 2) : '(no image request)'}
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