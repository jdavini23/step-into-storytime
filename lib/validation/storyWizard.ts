import { z } from 'zod';

export const characterSchema = z.object({
  name: z.string().min(1, 'Name is required').max(32, 'Name too long'),
  age: z.string().min(1, 'Age is required'),
  gender: z.string().min(1, 'Gender is required'),
  traits: z.array(z.string()).max(5, 'Max 5 traits'),
  customTrait: z.string().optional(),
});

export const settingSchema = z.string().min(1, 'Setting is required');
export const themeSchema = z.string().min(1, 'Theme is required');
export const lengthSchema = z.number().min(1, 'Length required').max(60, 'Length too long');

export const storyWizardSchema = z.object({
  character: characterSchema,
  setting: settingSchema,
  theme: themeSchema,
  length: lengthSchema,
});
