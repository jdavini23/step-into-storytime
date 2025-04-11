// Step types and validation
export type StepId =
  | 'welcome'
  | 'character'
  | 'setting'
  | 'theme'
  | 'length'
  | 'preview'
  | 'complete';

// Shared step configuration
export const STORY_STEPS = {
  welcome: {
    id: 'welcome',
    label: 'Welcome',
    color: 'text-[#64B5F6]',
    validation: null,
  },
  character: {
    id: 'character',
    label: 'Character',
    color: 'text-[#81C784]',
    validation: null,
  },
  setting: {
    id: 'setting',
    label: 'Setting',
    color: 'text-[#FFB74D]',
    validation: null,
  },
  theme: {
    id: 'theme',
    label: 'Theme',
    color: 'text-[#FF8A65]',
    validation: null,
  },
  length: {
    id: 'length',
    label: 'Length',
    color: 'text-[#BA68C8]',
    validation: null,
  },
  preview: {
    id: 'preview',
    label: 'Preview',
    color: 'text-[#BA68C8]',
    validation: null,
  },
  complete: {
    id: 'complete',
    label: 'Complete',
    color: 'text-[#BA68C8]',
    validation: null,
  },
} as const;

// Constants
export const SUGGESTED_TRAITS = [
  'Brave',
  'Curious',
  'Kind',
  'Creative',
  'Funny',
  'Smart',
  'Adventurous',
  'Caring',
  'Determined',
  'Friendly',
] as const;
