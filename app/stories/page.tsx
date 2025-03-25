'use client';

import { useState, useEffect } from 'react';
import { StoryList } from '@/components/story/StoryList';
import { StoryData } from '@/components/story/common/types';
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

export default function StoriesPage() {
  const router = useRouter();
  const [stories, setStories] = useState<StoryData[]>([]);
  const [deleteStoryId, setDeleteStoryId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const response = await fetch('/api/stories');
        if (!response.ok) {
          throw new Error('Failed to fetch stories');
        }
        const data = await response.json();
        setStories(data);
      } catch (error) {
        toast.error('Failed to load stories');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStories();
  }, []);

  const handleEdit = (story: StoryData) => {
    router.push(`/stories/${story.id}/edit`);
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

  const handleShare = async (story: StoryData) => {
    try {
      // For now, just copy the URL to clipboard
      await navigator.clipboard.writeText(
        `${window.location.origin}/stories/${story.id}`
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

  const handleSelect = (story: StoryData) => {
    router.push(`/stories/${story.id}`);
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
