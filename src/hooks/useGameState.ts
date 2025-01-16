import React from 'react';
import { Message, Status, Item } from '../types';
import { generateCharacter, CHARACTER_CREATION_PROMPT } from '../characterCreation';
import { CharacterClass, CharacterArchetype } from '../data/characterData';

interface GameState {
  messages: Message[];
  input: string;
  isCreating: boolean;
  showStartDialog: boolean;
  characterInfo: {
    name: string;
    type: string;
    backstory: string;
  } | null;
  currentEnemy: {
    type: string;
    hp: number;
    str?: number;
    def?: number;
  } | null;
  gameState: 'exploring' | 'combat' | 'merchant';
  botResponse: string;
  currentRequest: {
    prompt: string;
    template: string;
    diceRoll?: number;
  };
  isLoading: boolean;
  allStats: Status[];
  inventory: Item[];
  skillPoints: number;
  showLevelUpPopup: boolean;
  coins: number;
  shouldAutoScroll: boolean;
}

export function useGameState() {
  const [state, setState] = React.useState<GameState>({
    messages: [],
    input: '',
    isCreating: false,
    history: [],
    showStartDialog: true,
    characterInfo: null,
    currentEnemy: null,
    gameState: 'exploring',
    merchantInventory: [],
    botResponse: '',
    currentRequest: { prompt: '', template: '' },
    isLoading: false,
    allStats: [],
    inventory: [],
    skillPoints: 0,
    showLevelUpPopup: false,
    coins: 0,
    shouldAutoScroll: true
  });

  const saveState = () => {
    setState(prev => ({
      ...prev,
      history: [...prev.history, {
        messages: prev.messages,
        allStats: prev.allStats,
        inventory: prev.inventory,
        coins: prev.coins,
        currentEnemy: prev.currentEnemy,
        gameState: prev.gameState
      }]
    }));
  };

  const handleUndo = () => {
    setState(prev => {
      if (prev.history.length === 0) return prev;
      
      const lastState = prev.history[prev.history.length - 1];
      const newHistory = prev.history.slice(0, -1);
      
      return {
        ...prev,
        messages: lastState.messages,
        allStats: lastState.allStats,
        inventory: lastState.inventory,
        coins: lastState.coins,
        currentEnemy: lastState.currentEnemy,
        gameState: lastState.gameState,
        history: newHistory
      };
    });
  };
  const updateStats = (changes: { [key: string]: number }) => {
    setState(prev => ({
      ...prev,
      allStats: prev.allStats.map(stat => {
        const maxValue = stat.maxValue || 100;

        if (stat.key === 'level' && changes.exp) {
          const newExp = (stat.exp || 0) + changes.exp;
          const maxExp = stat.maxExp || 100;
          if (newExp >= maxExp) {
            // Level up! Award skill points
            setState(prevState => ({
              ...prevState,
              skillPoints: prevState.skillPoints + 3,
              showLevelUpPopup: true
            }));
            return {
              ...stat,
              value: stat.value + 1,
              exp: 0,
              maxExp: maxExp * 1.5
            };
          }
          return {
            ...stat,
            exp: newExp
          };
        }

        const change = changes[stat.key];
        if (change !== undefined) {
          const newValue = Math.max(0, Math.min(maxValue, stat.value + change));
          return {
            ...stat,
            change,
            value: newValue
          };
        }

        return {
          ...stat,
          change: undefined
        };
      })
    }));
  };

  const parseStatChanges = (response: string) => {
    try {
      let changes: { [key: string]: number } = {};

      const match = response.match(/\[STATS\](.*?)\[\/STATS\]/s);
      if (match) {
        const statsPart = match[1].trim();
        statsPart.split(/\s*,\s*/).forEach(pair => {
          const [key, valueStr] = pair.split(/:\s*|\s+/);
          
          if (key && valueStr) {
            const cleanKey = key.toLowerCase().trim();
            const cleanValue = valueStr.trim();
            
            const numValue = parseInt(cleanValue);
            if (!isNaN(numValue)) {
              changes[cleanKey] = numValue;
            }
          }
        });
      }

      const damageMatch = response.match(/\[DAMAGE\](.*?)\[\/DAMAGE\]/s);
      if (damageMatch) {
        const damage = parseInt(damageMatch[1].trim());
        if (!isNaN(damage) && state.currentEnemy) {
          setState(prev => ({
            ...prev,
            currentEnemy: prev.currentEnemy ? {
              ...prev.currentEnemy,
              hp: Math.max(0, prev.currentEnemy.hp - damage)
            } : null
          }));
        }
      }

      const expMatch = response.match(/\[EXP\](\d+)\[\/EXP\]/s);
      if (expMatch) {
        const exp = parseInt(expMatch[1]);
        if (!isNaN(exp)) {
          changes.exp = exp;
        }
      }
      
      // Parse inventory removals
      const removeInventoryMatches = response.match(/\[REMOVE_INV\](.*?)\[\/REMOVE_INV\]/gs);
      if (removeInventoryMatches) {
        const itemsToRemove = removeInventoryMatches.map(match =>
          match.replace(/\[REMOVE_INV\]|\[\/REMOVE_INV\]/g, '')
            .split('|')[0]  // Get just the item name, ignore any additional parameters
            .trim()
        );
        
        if (itemsToRemove.length > 0) {
          setState(prev => ({
            ...prev,
            inventory: prev.inventory.filter(item => {
              // Case-insensitive comparison and handle partial matches
              return !itemsToRemove.some(removeItem => 
                item.name.toLowerCase().includes(removeItem.toLowerCase())
              );
            })
          }));
        }
      }

      // Parse inventory additions
      const addInventoryMatches = response.match(/\[ADD_INV\](.*?)\[\/ADD_INV\]/gs);
      if (addInventoryMatches) {
        let newItems: Item[] = [];
        
        addInventoryMatches.forEach(match => {
          const itemData = match
            .replace(/\[ADD_INV\]|\[\/ADD_INV\]/g, '')
            .trim()
            .split(/\||\s*x/)  // Split by either | or x
            .map(part => part.trim());
          
          let [name, typeOrQuantity, valueStr = '0', quantityStr = '1', rarityStr = ''] = itemData;
          
          // If the second part is a number, it's a quantity
          let type = 'item';
          let quantity = 1;
          if (/^\d+$/.test(typeOrQuantity)) {
            quantity = parseInt(typeOrQuantity);
          } else if (typeOrQuantity) {
            type = typeOrQuantity;
          }
          
          // Parse rarity from the first character if it exists
          let rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | undefined;
          if (rarityStr) {
            switch (rarityStr.toLowerCase()) {
              case 'c': rarity = 'common'; break;
              case 'u': rarity = 'uncommon'; break;
              case 'r': rarity = 'rare'; break;
              case 'e': rarity = 'epic'; break;
              case 'l': rarity = 'legendary'; break;
            }
          }
          
          // Parse value - handle 'none' as undefined
          const value = valueStr.toLowerCase() === 'none' ? undefined : parseInt(valueStr);
          
          const newItem = {
            name,
            type: type.toLowerCase() as 'weapon' | 'armor' | 'item' | 'material',
            value,
            quantity: quantity,
            rarity
          };
          
          // Check if this item should be stacked
          const existingItemIndex = newItems.findIndex(item => 
            item.name === newItem.name && 
            item.type === newItem.type &&
            item.value === newItem.value &&
            item.rarity === newItem.rarity
          );
          
          if (existingItemIndex !== -1) {
            newItems[existingItemIndex].quantity = (newItems[existingItemIndex].quantity || 1) + (newItem.quantity || 1);
          } else {
            newItems.push(newItem);
          }
        });
        
        if (newItems.length > 0) {
          setState(prev => ({
            ...prev,
            inventory: mergeInventory(prev.inventory, newItems)
          }));
        }
      }
      
      // Helper function to merge and stack inventory items
      function mergeInventory(currentInventory: Item[], newItems: Item[]): Item[] {
        const mergedInventory = [...currentInventory];
        
        newItems.forEach(newItem => {
          // Don't stack weapons or armor
          if (newItem.type === 'weapon' || newItem.type === 'armor') {
            mergedInventory.push(newItem);
            return;
          }
          
          const existingItemIndex = mergedInventory.findIndex(item => 
            item.name === newItem.name && 
            item.type === newItem.type &&
            item.value === newItem.value &&
            item.rarity === newItem.rarity
          );
          
          if (existingItemIndex !== -1) {
            mergedInventory[existingItemIndex].quantity = 
              (mergedInventory[existingItemIndex].quantity || 1) + (newItem.quantity || 1);
          } else {
            mergedInventory.push(newItem);
          }
        });
        
        return mergedInventory;
      }

      // Parse coin changes
      const coinsMatch = response.match(/\[COINS\]([+-]?\d+)\[\/COINS\]/);
      if (coinsMatch) {
        const coinChange = parseInt(coinsMatch[1]);
        if (!isNaN(coinChange)) {
          setState(prev => ({
            ...prev,
            coins: prev.coins + coinChange
          }));
        }
      }

      return changes;
    } catch (error) {
      console.warn('Error parsing stat changes:', error);
      return null;
    }
  };

  const parseSuggestions = (response: string) => {
    // Check for all variants of the MOVES tag
    const patterns = [
      /\[(MOVES|MV|MVES)\](.*?)\[\/(?:MOVES|MV|MVES)\]/si,  // Standard bracket format
      /_(MOVES|MV|MVES)\](.*?)\[\/(?:MOVES|MV|MVES)_/si,    // Underscore format
      /\[Moves\](.*?)\[\/Moves\]/si                          // Title case format
    ];
    
    // Try each pattern until we find a match
    for (const pattern of patterns) {
      const match = response.match(pattern);
      if (match) {
        // For standard patterns, the moves are in capture group 2
        // For the title case pattern, they're in group 1
        const movesStr = pattern === patterns[2] ? match[1] : match[2];
        return movesStr.trim().split(',').map(move => move.trim());
      }
    }
    
    return null;
  };

  const handleSubmit = async (prompt: string, diceRoll: number) => {
    console.log('handleSubmit called:', { prompt, diceRoll });
    if (!prompt.trim() || state.isLoading || !diceRoll) return;

    console.log('Proceeding with submission');
    // Save current state before making changes
    saveState();

    const strengthStat = state.allStats.find(s => s.key === 'strength')?.value || 0;
    const dexterityStat = state.allStats.find(s => s.key === 'dexterity')?.value || 0;
    const healthStat = state.allStats.find(s => s.key === 'health')?.value || 0;
    const maxHealth = state.allStats.find(s => s.key === 'health')?.maxValue || 100;
    const energyStat = state.allStats.find(s => s.key === 'energy')?.value || 0;
    const maxEnergy = state.allStats.find(s => s.key === 'energy')?.maxValue || 20;
    const level = state.allStats.find(s => s.key === 'level')?.value || 1;
    const exp = state.allStats.find(s => s.key === 'level')?.exp || 0;
    const maxExp = state.allStats.find(s => s.key === 'level')?.maxExp || 100;
    const enduranceStat = state.allStats.find(s => s.key === 'endurance')?.value || 0;
    const agilityStat = state.allStats.find(s => s.key === 'agility')?.value || 0;
    const luckStat = state.allStats.find(s => s.key === 'luck')?.value || 0;
    const charismaStat = state.allStats.find(s => s.key === 'charisma')?.value || 0;
    const baseDamage = state.allStats.find(s => s.key === 'damage')?.value || 0;
    const baseDefense = state.allStats.find(s => s.key === 'defense')?.value || 0;
    const weaponDamage = state.inventory.find(i => i.type === 'weapon')?.value || 0;
    const armorDefense = state.inventory.find(i => i.type === 'armor')?.value || 0;
    const totalDamage = baseDamage + weaponDamage;
    const totalDefense = baseDefense + armorDefense;

    // Calculate stat bonuses from items
    const itemBonuses = state.inventory.reduce((acc, item) => {
      if (item.statBonus) {
        const stat = item.statBonus.stat.toLowerCase();
        acc[stat] = (acc[stat] || 0) + item.statBonus.value;
      }
      return acc;
    }, {} as Record<string, number>);

    const promptTemplate = `<|begin_of_text|><|start_header_id|>system<|end_header_id|>

You are a character in an RPG game. Keep responses concise and use natural, conversational language. You MUST track and update all character stats appropriately.

CRITICAL: You MUST wrap the main message that should appear in the terminal with [MESSAGE] and [/MESSAGE] tags.
Example: [MESSAGE]You enter the dark cave. The air is damp and cold.[/MESSAGE]

${state.currentRequest.diceRoll ? `[DICE]Rolled ${state.currentRequest.diceRoll} on d20[/DICE]\n` : ''}

DICE ROLL RULES:
1. When a d20 roll is present, use it to determine success:
   - 1-5: Critical failure (negative worst possible outcome)
   - 6-10: Failure (bad outcome)
   - 11-15: Partial success (mixed outcome)
   - 16-19: Success (good outcome)
   - 20: Critical success (best possible outcome)
2. Examples:
   - Sneaking (roll: 3): "You trip and fall, alerting everyone!"
   - Negotiating (roll: 8): "They reject your offer outright."
   - Searching (roll: 13): "You find something, but it's not what you hoped for."
   - Fighting (roll: 17): "Your attack lands perfectly!"
   - Hacking (roll: 20): "You gain complete system access!"
3. ALWAYS consider the roll when determining outcomes

Character Status:
${state.characterInfo?.name || 'Unknown'}
Level ${level} ${state.characterInfo?.type || 'Unknown'}
EXP: ${exp}/${maxExp}
Health: ${healthStat}/${maxHealth}
Energy: ${energyStat}/${maxEnergy}
DMG: ${totalDamage} (Base: ${baseDamage} + Weapon: ${weaponDamage})
DEF: ${totalDefense} (Base: ${baseDefense} + Armor: ${armorDefense})

Core Stats:
- Strength: ${strengthStat}${itemBonuses.strength ? ` (+${itemBonuses.strength} from items)` : ''}
- Dexterity: ${dexterityStat}${itemBonuses.dexterity ? ` (+${itemBonuses.dexterity} from items)` : ''}
- Endurance: ${enduranceStat}${itemBonuses.endurance ? ` (+${itemBonuses.endurance} from items)` : ''}
- Agility: ${agilityStat}${itemBonuses.agility ? ` (+${itemBonuses.agility} from items)` : ''}
- Luck: ${luckStat}${itemBonuses.luck ? ` (+${itemBonuses.luck} from items)` : ''}
- Charisma: ${charismaStat}${itemBonuses.charisma ? ` (+${itemBonuses.charisma} from items)` : ''}

CRITICAL: You MUST use these tags for ANY changes:
1. Adding items: [ADD_INV]Item Name|type|value|quantity|rarity[/ADD_INV]
   Rarity is indicated by a single letter:
   - C: Common (white)
   - U: Uncommon (green)
   - R: Rare (blue)
   - E: Epic (purple)
   - L: Legendary (gold)
   Example: [ADD_INV]Dragon Slayer|weapon|15|1|L[/ADD_INV]
2. Removing items: [REMOVE_INV]Item Name[/REMOVE_INV]
3. Adding coins: [COINS]+amount[/COINS]
4. Removing coins: [COINS]-amount[/COINS]
5. Stat changes: [STATS]stat +/-amount[/STATS]
6. Experience gain: [EXP]amount[/EXP]
7. Available moves: [MOVES]move1,move2,move3[/MOVES]

IMPORTANT RULES:
1. ALWAYS close [MOVES] with [/MOVES]
2. When player takes physical or reputational damage, use [STATS]health -amount[/STATS]
3. When a command takes energy, use [STATS]energy -amount[/STATS]
4. When items break, sell or are removed from inventory, use [REMOVE_INV]Item Name[/REMOVE_INV]
5. Award experience for anything even the mundane with [EXP]amount[/EXP]
6. Consider player's stats when calculating success/damage
7. Higher strength = more physical damage
8. Higher dexterity = better defense
9. Higher endurance = less energy cost
10. Higher agility = better dodge chance
11. Higher luck = better critical hits and item finds
12. Higher charisma = better NPC interactions

Game State: ${state.gameState}
Current Enemy: ${state.currentEnemy ? state.currentEnemy.type : 'None'}

Inventory:
${state.inventory.map(item => `- ${item.name}${item.type === 'weapon' ? ` (+${item.value} DMG)` : item.type === 'armor' ? ` (+${item.value} DEF)` : item.quantity ? ` x${item.quantity}` : ''}`).join('\n')}
Coins: ${state.coins}C

Previous context: ${state.messages.slice(-3).map(m => m.content).join(' | ')}

Example responses:
1. Taking damage, can be emotional damage as well: "Someone hits you! [STATS]health -5[/STATS]"
2. Using energy: "You walk to the kitchen. [STATS]energy -2[/STATS]"
3. Breaking item: "Your computer breaks! [REMOVE_INV]Wooden Shield[/REMOVE_INV]"
4. Gaining experience: "You got Liza fired! [EXP]25[/EXP]"
5. Multiple changes: "You find a healing potion and use it immediately! [ADD_INV]Healing Potion|item|15|1[/ADD_INV] [STATS]health +15[/STATS] [REMOVE_INV]Healing Potion[/REMOVE_INV]"

Remember:
1. ALWAYS use proper tags for ANY changes
2. Keep responses concise and clear
3. Be RUTHLESS - dangerous actions have DEADLY consequences
4. Maintain immersive RPG atmosphere
5. ALWAYS provide available actions with [MOVES]action1,action2[/MOVES]
6. EVERY action must consume energy (0-10):
   - Light actions (looking, talking): 1 energy
   - Medium actions (searching, gathering): 2-5 energy
   - Heavy actions (fighting, running): 6-8 energy
   - Endurance stat reduces energy cost by 1 (minimum 0)
   Example: If endurance is 2, a heavy action costs 1 energy instead of 3
7. If not enough energy, action fails catastrophically
8. ALWAYS check energy before allowing actions
9. Resting restores 5-10 energy based on endurance
10. CRITICAL: Dangerous or foolish actions can result in instant death or being fired
    Examples:
    - Jumping into lava: instant death
    - Doing something ilegal at level 1: instant fired
    - Drinking unknown substances: possible death
    - Fighting when exhausted: severe penalties or death
    - Ignoring warnings: deadly consequences
11. NO MERCY for obviously fatal or stupid choices
12. Scale damage based on danger level:
    - Minor threats: 5-15 damage
    - Moderate threats: 15-30 damage
    - Severe threats: 30-50 damage
    - Fatal threats: Instant death or 50+ damage


<|eot_id|><|start_header_id|>user<|end_header_id|>

${state.input}<|eot_id|><|start_header_id|>assistant<|end_header_id|>`;

    setState(prev => ({
      ...prev,
      currentRequest: {
        prompt: state.input,
        template: promptTemplate
      },
      isLoading: true,
      messages: [...prev.messages, { content: state.input, isUser: true }],
      input: ''
    }));

    try {
      const response = await fetch('https://tamagotchi.brancaskitchen.workers.dev/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          top_p: 0.9,
          prompt: promptTemplate,
          max_tokens: 256,
          min_tokens: 64,
          temperature: 0.7,
          prompt_template: promptTemplate
        })
      });

      const data = await response.json();
      const output = Array.isArray(data.output) ? data.output.join('') : data.output;
      
      // Extract all message contents from [MESSAGE] tags
      let messageMatches = output.matchAll(/\[MESSAGE\]([\s\S]*?)\[\/MESSAGE\]/gs);
      let messages = Array.from(messageMatches, m => m[1].trim());
      
      // If no [MESSAGE] tags found, try to clean up the output
      if (messages.length === 0) {
        // Convert any underscore-style tags to bracket style
        const cleanedResponse = output
          .replace(/^[^[]*/, '[MESSAGE]$&[/MESSAGE]')  // Wrap non-tag content
          .replace(/_MOVES\]/g, '[MOVES]')
          .replace(/\[\/MOVES_/g, '[/MOVES]')
          .replace(/_MESSAGE\]/g, '[MESSAGE]')
          .replace(/\[\/MESSAGE_/g, '[/MESSAGE]');
          
        messageMatches = cleanedResponse.matchAll(/\[MESSAGE\]([\s\S]*?)\[\/MESSAGE\]/gs);
        messages = Array.from(messageMatches, m => m[1].trim());
      }
      
      let cleanedOutput = messages.length > 0
        ? messages.join('\n\n')
        : output
            .replace(/^\$\s*\$\s*/, '')
            .replace(/^\$\s*/, '')
            .trim();

      const statChanges = parseStatChanges(output);
      if (statChanges) {
        updateStats(statChanges);
      }

      const suggestions = parseSuggestions(output);
      
      // Remove any empty lines that might be left after removing tags
      cleanedOutput = cleanedOutput
        .replace(/\n\s*\n/g, '\n')
        .replace(/^\s*\n/, '')
        .replace(/\n\s*$/, '');
      
      setState(prev => ({
        ...prev,
        botResponse: output,
        messages: [
          ...prev.messages,
          { 
            content: cleanedOutput,
            isUser: false,
            suggestions: suggestions || undefined
          }
        ],
        isLoading: false
      }));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.warn('Chat error:', errorMessage);
      
      setState(prev => ({
        ...prev,
        messages: [
          ...prev.messages,
          {
            content: `An error occurred: ${errorMessage}. Please try again.`,
            isUser: false,
            isSystem: true
          }
        ],
        isLoading: false
      }));
    }
  };

  const handleCharacterCreated = async (characterData: {
    path: string;
    name: string;
  }) => {
    setState(prev => ({
      ...prev,
      isCreating: true,
      showStartDialog: false,
      inventory: [],
      coins: 0
    }));
    
    const generatedStats = generateCharacter();
    
    const characterRequest = `Generate a character name and backstory based on these stats and starting items:
Path: ${characterData.path}
Name: ${characterData.name}
Level: 1
Attack: ${generatedStats.find(s => s.key === 'damage')?.value}
Defense: ${generatedStats.find(s => s.key === 'defense')?.value}`;
    
    setState(prev => ({
      ...prev,
      currentRequest: {
        prompt: characterRequest,
        template: CHARACTER_CREATION_PROMPT
      },
      messages: [{
        content: "Creating your character...",
        isUser: false
      }]
    }));
    
    try {
      const response = await fetch('https://tamagotchi.brancaskitchen.workers.dev/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          top_p: 0.9,
          prompt: characterRequest,
          max_tokens: 512,
          min_tokens: 64,
          temperature: 0.7,
          prompt_template: CHARACTER_CREATION_PROMPT
        })
      });

      const data = await response.json();
      const output = Array.isArray(data.output) ? data.output.join('') : data.output;

      const weaponMatch = output.match(/\[WEAPON\](.*?)(\d+)DMG\[\/WEAPON\]/);
      const armorMatch = output.match(/\[ARMOR\](.*?)(\d+)DEF\[\/ARMOR\]/);
      const itemMatches = output.matchAll(/\[ITEM\](.*?)(?:(\d+)HP)?\[\/ITEM\]/g);
      const coinsMatch = output.match(/\[COINS\](\d+)\[\/COINS\]/);
      const nameMatch = output.match(/\[NAME\](.*?)\[\/NAME\]/);
      const backstoryMatch = output.match(/\[BACKSTORY\](.*?)\[\/BACKSTORY\]/);
      const typeMatch = output.match(/\[TYPE\](.*?)\[\/TYPE\]/);
      const missionMatch = output.match(/\[MISSION\](.*?)\[\/MISSION\]/);
      const genderMatch = output.match(/\[GENDER\](.*?)\[\/GENDER\]/);
      const lookMatch = output.match(/\[LOOK\](.*?)\[\/LOOK\]/);
      const movesMatch = output.match(/\[MOVES\](.*?)\[\/MOVES\]/);
      
      // Generate profile image based on character
      let profileImage = '';
      try {
        const type = typeMatch ? typeMatch[1].toLowerCase().replace(/[^a-z\s]/g, '') : '';
        const gender = genderMatch ? genderMatch[1].toLowerCase().replace(/[^a-z\s]/g, '') : '';
        const look = lookMatch ? lookMatch[1].replace(/[^a-z\s,]/g, '') : '';
        const prompt = `professional corporate headshot portrait photo of a ${gender} ${type}, ${look}, wearing business attire, office setting, natural pose, neutral expression, high quality, 4k, realistic, detailed, cinematic lighting, professional photography`;

        const response = await fetch('https://productai.brancaskitchen.workers.dev/api/recraft/predictions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            input: {
              prompt,
              negative_prompt: "cartoon, anime, illustration, painting, drawing, 3d, cgi, watermark, signature, blurry, distorted, deformed, low quality, bad quality, text, multiple people, group photo",
              width: 512,
              height: 512,
              guidance_scale: 8.5,
              num_inference_steps: 75,
              seed: Math.floor(Math.random() * 1000000)
            }
          })
        });

        const data = await response.json();
        
        if (data.id) {
          // Poll for the result
          let result;
          let attempts = 0;
          const maxAttempts = 30; // 30 seconds timeout

          while (!result) {
            if (attempts >= maxAttempts) {
              console.error('Image generation timed out');
              break;
            }

            const statusResponse = await fetch(`https://productai.brancaskitchen.workers.dev/api/recraft/predictions/${data.id}`);
            const statusData = await statusResponse.json();
            
            if (statusData.status === 'succeeded') {
              result = statusData;
              profileImage = statusData.output;
              break;
            } else if (statusData.status === 'failed') {
              console.error('Image generation failed:', statusData.error);
              break;
            }
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            attempts++;
          }
        }
      } catch (error) {
        console.error('Error generating profile image:', error);
      }
      
      if (nameMatch && backstoryMatch && typeMatch && missionMatch) {
        const name = nameMatch[1].trim();
        const type = typeMatch[1].trim();
        const backstory = backstoryMatch[1].trim();
        const mission = missionMatch ? missionMatch[1].trim() : '';
        const moves = movesMatch ? movesMatch[1].split(',').map(move => move.trim()) : [];

        const newInventory = [];
        
        if (weaponMatch) {
          newInventory.push({
            name: weaponMatch[1].trim(),
            type: 'weapon' as const,
            value: parseInt(weaponMatch[2])
          });
        }
        
        if (armorMatch) {
          newInventory.push({
            name: armorMatch[1].trim(),
            type: 'armor' as const,
            value: parseInt(armorMatch[2])
          });
        }
        
        for (const match of itemMatches) {
          newInventory.push({
            name: match[1].trim(),
            type: 'item' as const,
            quantity: 1,
            value: match[2] ? parseInt(match[2]) : undefined
          });
        }

        setState(prev => ({
          ...prev,
          allStats: generatedStats,
          isCreating: false,
          inventory: newInventory,
          coins: coinsMatch ? parseInt(coinsMatch[1]) : 0,
          characterInfo: { name, type, backstory, mission, profileImage },
          botResponse: output,
          messages: [{
            content: `Welcome, ${name}!\n\n${backstory}\n\nWhat would you like to do?`,
            isUser: false,
            suggestions: moves
          }]
        }));
      }
    } catch (error) {
      console.error('Error generating character:', error);
      setState(prev => ({
        ...prev,
        botResponse: 'Error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        messages: [{
          content: "There was an error connecting to the server. Please try again.",
          isUser: false
        }]
      }));
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 50;
    setState(prev => ({ ...prev, shouldAutoScroll: isAtBottom }));
  };

  return {
    state,
    handlers: {
      // Direct submission handler that bypasses the form
      handleDirectSubmit: (prompt: string, diceRoll: number) => {
        console.log('handleDirectSubmit called:', { prompt, diceRoll });
        if (!prompt.trim() || state.isLoading || !diceRoll) return;
        handleSubmit(prompt, diceRoll);
      },
      handleReset: () => {
        setState({
          messages: [],
          input: '',
          history: [],
          showStartDialog: true,
          characterInfo: null,
          currentEnemy: null,
          gameState: 'exploring',
          merchantInventory: [],
          botResponse: '',
          currentRequest: { prompt: '', template: '' },
          isLoading: false,
          allStats: [],
          inventory: [],
          coins: 0,
          shouldAutoScroll: true
        });
      },
      handleSubmit,
      handleCharacterCreated,
      handleScroll,
      handleDistributeStat: (statKey: string) => {
        if (state.skillPoints > 0) {
          setState(prev => ({
            ...prev,
            skillPoints: prev.skillPoints - 1,
            allStats: prev.allStats.map(stat =>
              stat.key === statKey
                ? { ...stat, value: stat.value + 1 }
                : stat
            )
          }));
        }
      },
      setShowLevelUpPopup: (show: boolean) => {
        setState(prev => ({ ...prev, showLevelUpPopup: show }));
      },
      setIsCreating: (creating: boolean) => {
        setState(prev => ({ ...prev, isCreating: creating }));
      },
      setInput: (input: string) => setState(prev => ({ ...prev, input })),
      setDiceRoll: (value: number) => setState(prev => ({
        ...prev,
        currentRequest: { ...prev.currentRequest, diceRoll: value }
      })),
      handleUndo,
    }
  };
}