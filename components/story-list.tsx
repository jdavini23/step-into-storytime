'use client';

import { Edit, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface Story {
  id: string;
  title: string;
  mainCharacter?: {
    name: string;
  };
  setting?: string;
  createdAt?: string;
}

interface StoryListProps {
  stories: Story[];
}

export function StoryList({ stories }: StoryListProps) {
  const router = useRouter();

  const handleEdit = (id: string) => {
    router.push(`/edit/${id}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this story?')) {
      return;
    }

    try {
      const response = await fetch(`/api/stories/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete story');
      }

      // Refresh the page to update the list
      router.refresh();
    } catch (error) {
      console.error('Error deleting story:', error);
    }
  };

  if (stories.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-2">
          You haven't created any stories yet
        </h2>
        <p className="text-muted-foreground mb-6">
          Start your storytelling journey by creating your first magical story!
        </p>
        <Button onClick={() => router.push('/create')}>
          Create Your First Story
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stories.map((story) => (
        <Card key={story.id} className="flex flex-col">
          <CardHeader>
            <CardTitle className="line-clamp-2">{story.title}</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-muted-foreground mb-2">
              {story.mainCharacter?.name}'s adventure in {story.setting}
            </p>
            <p className="text-sm text-muted-foreground">
              Created{' '}
              {story.createdAt
                ? new Date(story.createdAt).toLocaleDateString()
                : 'recently'}
            </p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/story/${story.id}`)}
            >
              Read
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(story.id)}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(story.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
