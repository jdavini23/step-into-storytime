export const steps = [
  { number: 'welcome', label: 'Welcome', color: 'text-[#64B5F6]' },
  { number: 'character_name', label: 'Name', color: 'text-[#81C784]' },
  { number: 'character_age', label: 'Age', color: 'text-[#81C784]' },
  { number: 'character_traits', label: 'Traits', color: 'text-[#81C784]' },
  { number: 'setting', label: 'Setting', color: 'text-[#FFB74D]' },
  { number: 'theme', label: 'Theme', color: 'text-[#FF8A65]' },
  { number: 'plot_elements', label: 'Elements', color: 'text-[#FF8A65]' },
  { number: 'length', label: 'Length', color: 'text-[#BA68C8]' },
  { number: 'preview', label: 'Preview', color: 'text-[#BA68C8]' },
  { number: 'complete', label: 'Complete', color: 'text-[#BA68C8]' },
] as const;

export type StepNumber = (typeof steps)[number]['number'];
