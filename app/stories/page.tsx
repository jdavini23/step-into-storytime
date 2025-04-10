'use client';

import { useState, useEffect } from 'react';
import { StoryList } from '@/components/story/StoryList';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import type { Story } from '@/contexts/story-context';

export default function StoriesPage() {
  const router = useRouter();
  const [stories, setStories] = useState<Story[]>([]);
  const [deleteStoryId, setDeleteStoryId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStories = async () => {
      console.log('[DEBUG] Starting to fetch stories in StoriesPage');
      try {
        const response = await fetch('/api/stories');
        console.log('[DEBUG] Stories API response:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
        });

        if (!response.ok) {
          console.error('[DEBUG] Failed to fetch stories:', {
            status: response.status,
            statusText: response.statusText,
          });
          throw new Error(
            `Failed to fetch stories: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();
        console.log('[DEBUG] Successfully fetched stories:', {
          count: data.stories?.length || 0,
          firstStoryId: data.stories?.[0]?.id,
          timestamp: new Date().toISOString(),
        });
        setStories(data.stories || []);
      } catch (error) {
        console.error('[DEBUG] Error in fetchStories:', {
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        });
        toast.error('Failed to load stories');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStories();
  }, []);

  const handleEdit = (story: Story) => {
    router.push(`/story/${story.id}/edit`);
  };

  const handleDelete = async (storyId: string) => {
    try {
      const response = await fetch(`/api/stories/${storyId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete story');
      }

      setStories((prevStories) =>
        prevStories.filter((story) => story.id !== storyId)
      );
      toast.success('Story deleted successfully');
    } catch (error) {
      toast.error('Failed to delete story');
    }
    setDeleteStoryId(null);
  };

  const handleShare = async (story: Story) => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/story/${story.id}`
      );
      toast.success('Story link copied to clipboard');
    } catch (error) {
      toast.error('Failed to share story');
    }
  };

  const handleFavorite = async (storyId: string, isFavorite: boolean) => {
    try {
      const response = await fetch(`/api/stories/${storyId}/favorite`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isFavorite }),
      });

      if (!response.ok) {
        throw new Error('Failed to update favorite status');
      }

      toast.success(
        isFavorite ? 'Added to favorites' : 'Removed from favorites'
      );
    } catch (error) {
      toast.error('Failed to update favorite status');
    }
  };

  const handleSelect = (story: Story) => {
    router.push(`/story/${story.id}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <StoryList
        stories={stories}
        onEdit={handleEdit}
        onDelete={(storyId) => setDeleteStoryId(storyId)}
        onShare={handleShare}
        onFavorite={handleFavorite}
        onSelect={handleSelect}
      />

      <AlertDialog
        open={!!deleteStoryId}
        onOpenChange={() => setDeleteStoryId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              story.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteStoryId && handleDelete(deleteStoryId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
