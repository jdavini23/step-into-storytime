import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ChatOption } from './types';
import type { StepNumber } from './ChatSteps';

interface ChatQuickRepliesProps {
  currentStep: StepNumber;
  onSelect: (option: ChatOption) => void;
}

export function ChatQuickReplies({
  currentStep,
  onSelect,
}: ChatQuickRepliesProps) {
  const getQuickReplies = (): ChatOption[] => {
    switch (currentStep) {
      case 'character_traits':
        return [
          { id: 'brave', label: '🦁 Brave', value: 'brave' },
          { id: 'curious', label: '🔍 Curious', value: 'curious' },
          { id: 'kind', label: '💝 Kind', value: 'kind' },
          { id: 'clever', label: '🦊 Clever', value: 'clever' },
          { id: 'adventurous', label: '🌈 Adventurous', value: 'adventurous' },
        ];
      case 'setting':
        return [
          { id: 'forest', label: '🌳 Enchanted Forest', value: 'forest' },
          { id: 'space', label: '🚀 Outer Space', value: 'space' },
          { id: 'ocean', label: '🌊 Deep Ocean', value: 'ocean' },
          { id: 'castle', label: '🏰 Magical Castle', value: 'castle' },
        ];
      case 'theme':
        return [
          { id: 'friendship', label: '🤝 Friendship', value: 'friendship' },
          { id: 'adventure', label: '⚔️ Adventure', value: 'adventure' },
          { id: 'discovery', label: '🔮 Discovery', value: 'discovery' },
          { id: 'magic', label: '✨ Magic', value: 'magic' },
        ];
      case 'plot_elements':
        return [
          { id: 'dragon', label: '🐉 Friendly Dragon', value: 'dragon' },
          { id: 'fairy', label: '🧚‍♀️ Magical Fairy', value: 'fairy' },
          { id: 'treasure', label: '💎 Hidden Treasure', value: 'treasure' },
          { id: 'portal', label: '🌀 Magic Portal', value: 'portal' },
          { id: 'potion', label: '🧪 Magic Potion', value: 'potion' },
          { id: 'map', label: '🗺️ Ancient Map', value: 'map' },
        ];
      case 'length':
        return [
          { id: 'short', label: '📖 Short (5 min)', value: 'short' },
          { id: 'medium', label: '📚 Medium (10 min)', value: 'medium' },
          { id: 'long', label: '📚📚 Long (15 min)', value: 'long' },
        ];
      default:
        return [];
    }
  };

  const quickReplies = getQuickReplies();

  if (quickReplies.length === 0) return null;

  return (
    <div className="p-4">
      <div className="flex flex-wrap gap-2">
        {quickReplies.map((option) => (
          <Button
            key={option.id}
            onClick={() => onSelect(option)}
            className={cn(
              'bg-white hover:bg-primary/5 text-gray-800',
              'rounded-full px-6 py-2 border border-primary/20'
            )}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
