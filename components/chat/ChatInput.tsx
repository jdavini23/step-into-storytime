import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Mic, SmilePlus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (message: string) => Promise<void>;
  isGenerating: boolean;
  maxLength?: number;
}

export function ChatInput({
  onSend,
  isGenerating,
  maxLength = 500, // reasonable default for story inputs
}: ChatInputProps) {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault(); // Prevent form submission
    const trimmedInput = input.trim();
    if (!trimmedInput || isGenerating || isSending) return;

    try {
      setIsSending(true);
      await onSend(trimmedInput);
      setInput('');
      // Focus the input after sending
      inputRef.current?.focus();
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent newline
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= maxLength) {
      setInput(value);
    }
  };

  const isDisabled = isGenerating || isSending;
  const remainingChars = maxLength - input.length;
  const showCharCount = input.length > maxLength * 0.8; // Show when near limit

  return (
    <form onSubmit={handleSend} className="p-4 flex gap-3">
      <div className="relative flex-1">
        <Input
          ref={inputRef}
          value={input}
          onChange={handleInputChange}
          placeholder="Type a message..."
          aria-label="Message input"
          aria-describedby="message-constraints"
          className={cn(
            'px-6 py-4 bg-white rounded-full border',
            'text-base placeholder:text-gray-400',
            'border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20',
            isDisabled && 'opacity-50'
          )}
          disabled={isDisabled}
          onKeyDown={handleKeyDown}
          maxLength={maxLength}
        />
        {showCharCount && (
          <span
            className={cn(
              'absolute right-24 top-1/2 -translate-y-1/2 text-sm',
              remainingChars < 50 ? 'text-orange-500' : 'text-gray-400'
            )}
            aria-hidden="true"
          >
            {remainingChars}
          </span>
        )}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8 hover:bg-primary/5"
            onClick={() => setIsRecording(!isRecording)}
            aria-label={isRecording ? 'Stop recording' : 'Start recording'}
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
            disabled={!input.trim() || isDisabled}
            aria-label="Send message"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 text-primary/70 animate-spin" />
            ) : (
              <Send className="h-4 w-4 text-primary/70" />
            )}
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
        aria-label="Add emoji"
      >
        <SmilePlus className="h-5 w-5 text-primary/70" />
      </Button>
      <span id="message-constraints" className="sr-only">
        Maximum {maxLength} characters allowed. Press Enter to send.
      </span>
    </form>
  );
}
