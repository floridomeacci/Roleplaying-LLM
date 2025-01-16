import { ReactNode } from 'react';

export interface InventoryItem {
  type: 'weapon' | 'armor' | 'item' | 'material' | 'coins';
  name: string;
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  statBonus?: {
    stat: string;
    value: number;
  };
  damage?: number;
  defense?: number;
  effect?: number;
  description?: string;
  quantity?: number;
}

export interface Status {
  name: string;
  value: number;
  maxValue?: number;
  icon: ReactNode;
  key: string;
  change?: number;
  exp?: number;
  maxExp?: number;
}

export interface Message {
  content: string;
  isUser: boolean;
  isSystem?: boolean;
  suggestions?: string[];
}

export interface CharacterInfo {
  characterInfo: {
    name: string;
    type: string;
    backstory: string;
    mission: string;
    profileImage?: string;
  } | null;
}