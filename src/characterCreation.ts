import React from 'react';
import { Status } from './types';
import { Heart, Zap, Sword, Shield, Timer, Star, Footprints, Smile } from 'lucide-react';

import nameList from './data/nameLists.json';

export function generateName(): string {
  const randomIndex = Math.floor(Math.random() * nameList.length);
  return nameList[randomIndex];
}

export const CHARACTER_CREATION_PROMPT = `<|begin_of_text|><|start_header_id|>system<|end_header_id|>

You are a RPG character creator. Using the provided path words, generate a unique role.

CRITICAL: You MUST use the provided words to create:
1. A purpose, this can be a job, lifegoal, or relationship (combine 2-3 of the words creatively)
2. A special ability or talent (use remaining word(s) creatively)
3. A location, workplace or time era. (incorporate at least one word)

CRITICAL: You MUST determine the character's gender based on their name and include physical appearance details.

You MUST follow this EXACT format:

[NAME]character name[/NAME]
[TYPE]job title[/TYPE]
[GENDER]male or female[/GENDER]
[LOOK]detailed physical appearance description[/LOOK]
[BACKSTORY]One sentence backstory[/BACKSTORY]
[MISSION]stealing milk form the zeven eleven[/MISSION]
[MOVES]Look around the office,Pet goat,Talk to sister[/MOVES]
[ITEM]Laptop|tool|none|1|C[/ITEM]
[ITEM]Pizza slice|item|none|1|U[/ITEM]
[ITEM]Plasma Rifle|item|none|1|C[/ITEM]
[COINS]5[/COINS]

Rules:
1. ALWAYS use proper opening and closing tags
2. Keep equipment balanced for new characters
3. ALWAYS include [GENDER] based on the name
4. ALWAYS include [LOOK] with 2-3 distinctive physical features
5. ALWAYS include a [MISSION] tag that's based on the provided path words
6. Make items fit the character's background
7. Make each character unique and memorable
8. ALWAYS include initial [MOVES] suggestions
9. NO combat or system tags in the response
10. Focus on character background and starting gear
11. Starting items should fit the character

<|eot_id|><|start_header_id|>user<|end_header_id|>

{prompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>`;

function distributePoints(totalPoints: number, numStats: number, maxPerStat: number): number[] {
  const stats = new Array(numStats).fill(0);
  const minPoints = Math.floor(totalPoints / (numStats * 2));
  
  stats.forEach((_, index) => {
    stats[index] = minPoints;
  });
  
  let remainingPoints = totalPoints - (minPoints * numStats);

  while (remainingPoints > 0) {
    const statIndex = Math.floor(Math.random() * numStats);
    if (stats[statIndex] < maxPerStat) {
      stats[statIndex]++;
      remainingPoints--;
    }
  }
  
  return stats.map((value, i) => ({ value, i }))
    .sort(() => Math.random() - 0.5)
    .map(({ value }) => value);
}

export function generateCharacter(): Status[] {
  const statValues = distributePoints(25, 6, 10);

  const baseHealth = 50 + (statValues[1] * 5);
  const baseEnergy = 20 + Math.floor(statValues[3] / 2);
  const totalDamage = 5 + statValues[0];
  const totalDefense = 5 + statValues[1];

  return [
    { 
      name: 'Level',
      value: 1,
      maxValue: 2,
      icon: React.createElement(Star, { className: "w-6 h-6" }),
      key: 'level',
      exp: 0,
      maxExp: 100
    },
    { 
      name: 'Health',
      value: baseHealth,
      maxValue: baseHealth,
      icon: React.createElement(Heart, { className: "w-6 h-6" }),
      key: 'health'
    },
    {
      name: 'Energy',
      value: baseEnergy,
      maxValue: baseEnergy,
      icon: React.createElement(Zap, { className: "w-6 h-6" }),
      key: 'energy'
    },
    { 
      name: 'DMG',
      value: totalDamage,
      maxValue: totalDamage,
      icon: React.createElement(Sword, { className: "w-6 h-6" }),
      key: 'damage'
    },
    { 
      name: 'DEF',
      value: totalDefense,
      maxValue: totalDefense,
      icon: React.createElement(Shield, { className: "w-6 h-6" }),
      key: 'defense'
    },
    {
      name: 'Strength',
      value: statValues[0],
      icon: React.createElement(Sword, { className: "w-4 h-4" }),
      key: 'strength'
    },
    {
      name: 'Dexterity',
      value: statValues[1],
      icon: React.createElement(Shield, { className: "w-4 h-4" }),
      key: 'dexterity'
    },
    {
      name: 'Endurance',
      value: statValues[2],
      icon: React.createElement(Timer, { className: "w-4 h-4" }),
      key: 'endurance'
    },
    {
      name: 'Agility',
      value: statValues[3],
      icon: React.createElement(Footprints, { className: "w-4 h-4" }),
      key: 'agility'
    },
    {
      name: 'Wisdom',
      value: statValues[4],
      icon: React.createElement(Star, { className: "w-4 h-4" }),
      key: 'wisdom'
    },
    {
      name: 'Charisma',
      value: statValues[5],
      icon: React.createElement(Smile, { className: "w-4 h-4" }),
      key: 'charisma'
    }
  ];
}