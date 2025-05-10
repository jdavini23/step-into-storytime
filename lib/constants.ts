// Character traits for story creation
export const characterTraits = [
  'Brave',
  'Kind',
  'Smart',
  'Curious',
  'Creative',
  'Funny',
  'Adventurous',
  'Caring',
  'Determined',
  'Friendly',
] as const;

export type CharacterTrait = (typeof characterTraits)[number];

// Story settings
export interface StorySettingDetails {
  label: string;
  icon: string;
  description: string;
}

export const storySettings = {
  forest: {
    label: 'Enchanted Forest',
    icon: '🌳',
    description: 'A magical woodland filled with wonder',
  },
  space: {
    label: 'Outer Space',
    icon: '🚀',
    description: 'An adventure among the stars',
  },
  ocean: {
    label: 'Deep Ocean',
    icon: '🌊',
    description: 'Mysteries beneath the waves',
  },
  castle: {
    label: 'Magical Castle',
    icon: '🏰',
    description: 'A grand palace of enchantment',
  },
} as const;

export type StorySettings = keyof typeof storySettings;

// Story themes
export const storyThemes = {
  'problem-solving': {
    label: 'Problem Solving',
    icon: '🧩',
    description: 'A story about overcoming challenges with creative thinking',
  },
  friendship: {
    label: 'Friendship',
    icon: '🤝',
    description: 'A tale about making friends and being kind to others',
  },
  adventure: {
    label: 'Adventure',
    icon: '🗺️',
    description: 'An exciting journey full of discovery and exploration',
  },
  discovery: {
    label: 'Discovery',
    icon: '🔍',
    description: 'Learning about the world and making new discoveries',
  },
  courage: {
    label: 'Courage',
    icon: '🦁',
    description: 'Being brave and facing your fears',
  },
  kindness: {
    label: 'Kindness',
    icon: '💝',
    description: 'Showing compassion and helping others',
  },
} as const;

export type StoryTheme = keyof typeof storyThemes;

// Story lengths
export const storyLengths = {
  short: {
    label: 'Short',
    duration: '5 minutes',
    paragraphs: 3,
  },
  medium: {
    label: 'Medium',
    duration: '10 minutes',
    paragraphs: 5,
  },
  long: {
    label: 'Long',
    duration: '15 minutes',
    paragraphs: 7,
  },
} as const;

export type StoryLength = keyof typeof storyLengths;

// Educational elements
export const educationalElements = {
  counting: {
    label: 'Counting & Numbers',
    icon: '🔢',
    description: 'Learn basic math concepts',
  },
  colors: {
    label: 'Colors & Shapes',
    icon: '🎨',
    description: 'Explore colors and geometric shapes',
  },
  animals: {
    label: 'Animals & Nature',
    icon: '🦊',
    description: 'Learn about different animals and their habitats',
  },
  emotions: {
    label: 'Emotions & Feelings',
    icon: '🥰',
    description: 'Understanding and expressing emotions',
  },
  manners: {
    label: 'Manners & Social Skills',
    icon: '🤗',
    description: 'Learning good behavior and social interaction',
  },
  science: {
    label: 'Science & Discovery',
    icon: '🔬',
    description: 'Basic scientific concepts and exploration',
  },
} as const;

export type EducationalElement = keyof typeof educationalElements;

// Reading levels
export const readingLevels = {
  beginner: {
    label: 'Beginner',
    ageRange: '3-5',
    description: 'Simple words and short sentences',
  },
  intermediate: {
    label: 'Intermediate',
    ageRange: '6-7',
    description: 'More complex sentences and vocabulary',
  },
  advanced: {
    label: 'Advanced',
    ageRange: '8+',
    description: 'Rich vocabulary and longer paragraphs',
  },
} as const;

export type ReadingLevel = keyof typeof readingLevels;
