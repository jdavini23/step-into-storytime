import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { StoryData } from './common/types';
import { formatDistanceToNow } from 'date-fns';
import { MoreVertical, Edit, Trash, Share, Star } from 'lucide-react';

interface StoryListProps {
  stories: StoryData[];
  onEdit: (story: StoryData) => void;
  onDelete: (storyId: string) => void;
  onShare: (story: StoryData) => void;
  onFavorite: (storyId: string, isFavorite: boolean) => void;
  onSelect: (story: StoryData) => void;
}

// Helper function to format date safely
const formatDate = (dateString?: string | null) => {
  if (!dateString) return 'Recently';
  try {
    const date = new Date(dateString);
    // Check if date is valid
    if (isNaN(date.getTime())) return 'Recently';
    return `${formatDistanceToNow(date)} ago`;
  } catch (error) {
    return 'Recently';
  }
  console.log(`formatDate called with dateString: ${dateString}`); // Added log
};

export function StoryList({
  stories,
  onEdit,
  onDelete,
  onShare,
  onFavorite,
  onSelect,
}: StoryListProps) {
  const [favoriteStories, setFavoriteStories] = useState<Set<string>>(
    new Set()
  );

  const toggleFavorite = (storyId: string) => {
    const newFavorites = new Set(favoriteStories);
    if (newFavorites.has(storyId)) {
      newFavorites.delete(storyId);
      onFavorite(storyId, false);
    } else {
      newFavorites.add(storyId);
      onFavorite(storyId, true);
    }
    setFavoriteStories(newFavorites);
    console.log(`toggleFavorite called with storyId: ${storyId}`); // Added log
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Stories</h2>
        <Button
          variant="outline"
          onClick={() => {
            window.location.href = '/create';
          }}
        >
          Create New Story
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {stories.map((story) => (
          <Card
            key={story.id || 'temp-id'}
            className="p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => story.id && onSelect(story)}
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">{story.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {story.description}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Created {formatDate(story.created_at)}</span>
                  {story.main_character?.age && (
                    <>
                      <span>•</span>
                      <span>Age {story.main_character.age}</span>
                    </>
                  )}
                  {story.theme && (
                    <>
                      <span>•</span>
                      <span className="capitalize">{story.theme}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  // variant="ghost"
                  // size="icon"
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    story.id && toggleFavorite(story.id);
                  }}
                >
                  <Star
                    className={
                      story.id && favoriteStories.has(story.id)
                        ? 'fill-yellow-400 text-yellow-400'
                        : ''
                    }
                  />
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      // variant="ghost"
                      // size="icon"
                      onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
                        e.stopPropagation()
                      }
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        onEdit(story);
                      }}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        onShare(story);
                      }}
                    >
                      <Share className="mr-2 h-4 w-4" />
                      Share
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        story.id && onDelete(story.id);
                      }}
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </Card>
        ))}

        {stories.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              No stories yet. Create your first story!
            </p>
            <Button
              // variant="default"
              className="mt-4"
              onClick={() => (window.location.href = '/create')}
            >
              Create Story
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
