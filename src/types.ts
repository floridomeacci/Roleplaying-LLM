import { ReactNode } from 'react';

export interface InventoryItem {
  type: 'weapon' | 'armor' | 'item' | 'material' | 'coins';
  name: string;
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  statBonus?: {
    stat: string;
    value: number;
    imageRequest?: {
      prompt: string;
      width: number;
      height: number;
      scheduler: string;
      num_outputs: number;
      guidance_scale: number;
      negative_prompt: string;
      num_inference_steps: number;
    };
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

interface CharacterDescription {
  type: string;
  gender: string;
  look: string;
}

export interface CharacterInfo {
  characterInfo: {
    name: string;
    type: string;
    backstory: string;
    mission: string;
    profileImage?: string;
    description?: CharacterDescription;
  } | null;
}