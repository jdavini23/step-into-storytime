import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Mic, SmilePlus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (message: string) => Promise<void>;
  isGenerating: boolean;
}

export function ChatInput({ onSend, isGenerating }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault(); // Prevent form submission
    if (!input.trim() || isGenerating) return;

    try {
      await onSend(input);
      setInput('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent newline
      handleSend();
    }
  };

  return (
    <form onSubmit={handleSend} className="p-4 flex gap-3">
      <div className="relative flex-1">
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className={cn(
            'px-6 py-4 bg-white rounded-full border',
            'text-base placeholder:text-gray-400',
            'border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20',
            isGenerating && 'opacity-50'
          )}
          disabled={isGenerating}
          onKeyDown={handleKeyDown}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8 hover:bg-primary/5"
            onClick={() => setIsRecording(!isRecording)}
          >
            <Mic
              className={cn(
                'h-4 w-4',
                isRecording ? 'text-red-500' : 'text-primary/70'
              )}
            />
          </Button>
          <Button
            type="submit"
            size="icon"
            variant="ghost"
            className="h-8 w-8 hover:bg-primary/5"
            disabled={!input.trim() || isGenerating}
          >
            <Send className="h-4 w-4 text-primary/70" />
          </Button>
        </div>
      </div>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className={cn(
          'h-12 w-12 rounded-full',
          'bg-white border border-primary/20',
          'hover:bg-primary/5 hover:border-primary/30'
        )}
      >
        <SmilePlus className="h-5 w-5 text-primary/70" />
      </Button>
    </form>
  );
}
