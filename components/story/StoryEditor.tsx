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
  const [story, setStory] = useState<any | null>(null);

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const response = await fetch(`/api/stories/${storyId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch story');
        }
        const data = await response.json();

        // Parse the content if it's a string
        if (typeof data.content === 'string') {
          try {
            data.content = JSON.parse(data.content);
          } catch (e) {
            // If parsing fails, set default structure
            data.content = {
              en: [data.content || ''],
              es: [''],
            };
          }
        }

        setStory(data);
      } catch (error) {
        console.error('Error loading story:', error);
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
      // Ensure content has the correct structure
      const formattedStory = {
        ...story,
        content: {
          en: Array.isArray(story.content?.en) ? story.content.en : [],
          es: Array.isArray(story.content?.es) ? story.content.es : [],
        },
        updated_at: new Date().toISOString(),
      };

      const response = await fetch(`/api/stories/${storyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedStory),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update story');
      }

      toast.success('Story updated successfully');
      onSave();
    } catch (error) {
      console.error('Error updating story:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to update story'
      );
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
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="title">
            Title
          </label>
          <Input
            id="title"
            value={story.title || ''}
            onChange={(e) => setStory({ ...story, title: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="description">
            Description
          </label>
          <Textarea
            id="description"
            value={story.description || ''}
            onChange={(e) =>
              setStory({ ...story, description: e.target.value })
            }
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="targetAge">
              Target Age
            </label>
            <Input
              id="targetAge"
              type="number"
              min={1}
              max={12}
              value={story.targetAge || ''}
              onChange={(e) =>
                setStory({ ...story, targetAge: parseInt(e.target.value) || 6 })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="readingLevel">
              Reading Level
            </label>
            <Select
              value={story.readingLevel || 'beginner'}
              onValueChange={(value: ReadingLevel) =>
                setStory({ ...story, readingLevel: value })
              }
            >
              <SelectTrigger id="readingLevel">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Story Content (English)</label>
          <div className="space-y-4">
            {(story.content.en || []).map(
              (paragraph: string, index: number) => (
                <Textarea
                  key={index}
                  value={paragraph}
                  onChange={(e) => {
                    const newContent = [...(story.content.en || [])];
                    newContent[index] = e.target.value;
                    setStory({
                      ...story,
                      content: { ...story.content, en: newContent },
                    });
                  }}
                  className="min-h-[100px]"
                />
              )
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Story Content (Spanish)</label>
          <div className="space-y-4">
            {(story.content.es || []).map(
              (paragraph: string, index: number) => (
                <Textarea
                  key={index}
                  value={paragraph}
                  onChange={(e) => {
                    const newContent = [...(story.content.es || [])];
                    newContent[index] = e.target.value;
                    setStory({
                      ...story,
                      content: { ...story.content, es: newContent },
                    });
                  }}
                  className="min-h-[100px]"
                />
              )
            )}
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
