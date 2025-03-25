export interface Setting {
  id: string;
  title: string;
  description: string;
}

export interface Theme {
  id: string;
  title: string;
  description: string;
}

export const SETTINGS: Setting[] = [
  {
    id: 'enchanted-forest',
    title: 'Enchanted Forest',
    description: 'A magical forest filled with mystical creatures and ancient secrets.',
  },
  {
    id: 'space-station',
    title: 'Space Station',
    description: 'A futuristic space station orbiting a distant planet.',
  },
  {
    id: 'underwater-city',
    title: 'Underwater City',
    description: 'A hidden city beneath the ocean waves.',
  },
  {
    id: 'dragon-castle',
    title: 'Dragon Castle',
    description: 'An ancient castle where dragons and humans live together.',
  },
];

export const THEMES: Theme[] = [
  {
    id: 'friendship',
    title: 'Friendship',
    description: 'A story about making friends and working together.',
  },
  {
    id: 'courage',
    title: 'Courage',
    description: 'A story about being brave and facing your fears.',
  },
  {
    id: 'discovery',
    title: 'Discovery',
    description: 'A story about exploring and learning new things.',
  },
  {
    id: 'kindness',
    title: 'Kindness',
    description: 'A story about helping others and showing compassion.',
  },
];

export const LENGTH_OPTIONS = [
  { id: 'short', title: 'Short', description: 'A quick 5-minute story' },
  { id: 'medium', title: 'Medium', description: 'A 10-minute story' },
  { id: 'long', title: 'Long', description: 'A 15-minute story' },
];
