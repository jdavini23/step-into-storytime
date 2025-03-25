import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StoryData } from './common/types';
import { toast } from 'sonner';

interface StoryEditorProps {
  storyId: string;
  onSave: () => void;
  onCancel: () => void;
}

type ReadingLevel = 'beginner' | 'intermediate' | 'advanced';

export function StoryEditor({ storyId, onSave, onCancel }: StoryEditorProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [story, setStory] = useState<StoryData | null>(null);

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const response = await fetch(`/api/stories/${storyId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch story');
        }
        const data = await response.json();
        setStory(data);
      } catch (error) {
        toast.error('Failed to load story');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStory();
  }, [storyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!story) return;

    setIsSaving(true);

    try {
      const response = await fetch(`/api/stories/${storyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(story),
      });

      if (!response.ok) {
        throw new Error('Failed to save story');
      }

      toast.success('Story saved successfully!');
      onSave();
    } catch (error) {
      toast.error('Failed to save story');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Card>
    );
  }

  if (!story) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">Story not found</div>
      </Card>
    );
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <Input value={story.title} onChange={(e) => setStory({ ...story, title: e.target.value })} />
        <Textarea value={story.content.en[0]} onChange={(e) => setStory({ ...story, content: { ...story.content, en: [e.target.value] } })} />
        <Select value={story.readingLevel} onValueChange={(value) => setStory({ ...story, readingLevel: value as ReadingLevel })}>
          <SelectTrigger><SelectValue placeholder="Select Reading Level" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
        <Button type="submit" disabled={isSaving}>Save Story</Button>
        <Button type="button" onClick={onCancel}>Cancel</Button>
      </form>
    </Card>
  );
}
