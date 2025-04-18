'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, LogOut, Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { useStory } from '@/contexts/story-context';
import { SubscriptionStatus } from '@/components/subscription/subscription-status';
import { TagPill } from '@/components/story/TagPill';

export default function DashboardPage() {
  const router = useRouter();
  const { state: authState, logout } = useAuth();
  const { state: storyState, fetchStories, deleteStory } = useStory();
  const [isLoading, setIsLoading] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Extract unique tags from stories (use theme as tag)
  const uniqueTags = Array.from(
    new Set(
      (storyState.stories || [])
        .map((s) => s.theme || null)
        .filter((t): t is string => !!t)
    )
  );

  // Filter stories by selected tag (theme)
  const filteredStories = selectedTag
    ? storyState.stories.filter((s) => s.theme === selectedTag)
    : storyState.stories;

  // Handle authentication and story loading
  useEffect(() => {
    let mounted = true;

    const initializeDashboard = async () => {
      // Skip if already initialized or auth not ready
      if (hasInitialized || !authState.isInitialized) return;

      // Handle not authenticated case
      if (!authState.isLoading && !authState.isAuthenticated) {
        if (mounted) {
          router.push('/sign-in');
          setIsLoading(false);
          setHasInitialized(true);
        }
        return;
      }

      // Handle authenticated case
      if (authState.isAuthenticated && !storyState.loading) {
        try {
          await fetchStories();
        } catch (error) {
          console.error('[DEBUG] Error fetching stories:', error);
        } finally {
          if (mounted) {
            setIsLoading(false);
            setHasInitialized(true);
          }
        }
      }
    };

    initializeDashboard();

    return () => {
      mounted = false;
    };
  }, [
    authState.isInitialized,
    authState.isLoading,
    authState.isAuthenticated,
    storyState.loading,
    router,
    fetchStories,
    hasInitialized,
  ]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleDeleteStory = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this story?')) {
      try {
        await deleteStory(id);
      } catch (error) {
        console.error('Error deleting story:', error);
      }
    }
  };

  // Loading state JSX
  if (
    !authState.isInitialized ||
    authState.isLoading ||
    (isLoading && !hasInitialized)
  ) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 flex items-center justify-center mx-auto animate-pulse">
            <BookOpen className="h-4 w-4 text-white" />
          </div>
          <p className="mt-4 text-slate-600">
            {authState.isLoading
              ? 'Authenticating...'
              : 'Loading your stories...'}
          </p>
        </div>
      </div>
    );
  }

  // Will redirect in useEffect
  if (!authState.isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Dashboard header */}
      <header className="bg-white border-b border-slate-200 py-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 flex items-center justify-center mr-2">
                <BookOpen className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold text-slate-900">
                Step Into Storytime
              </span>
            </Link>

            <Button
              variant="outline"
              size="sm"
              className="flex items-center"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      {/* Dashboard content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Your Dashboard</h1>
          <Button
            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
            onClick={() => router.push('/create')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New Story
          </Button>
        </div>

        {/* Add subscription status */}
        <div className="mb-6">
          <SubscriptionStatus compact />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-0 shadow-md animate-pulse">
                <CardHeader className="pb-2">
                  <div className="h-6 bg-slate-200 rounded w-3/4 mb-2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                </CardContent>
                <CardFooter>
                  <div className="h-9 bg-slate-200 rounded w-full"></div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : storyState.stories.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">
              You haven't created any stories yet
            </h2>
            <p className="text-slate-600 mb-6">
              Start your storytelling journey by creating your first magical
              story!
            </p>
            <Button
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
              onClick={() => router.push('/create')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Story
            </Button>
          </div>
        ) : (
          <div>
            {/* Tag filter bar */}
            {uniqueTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {uniqueTags.map((tag) => (
                  <TagPill
                    key={tag}
                    label={tag}
                    selected={selectedTag === tag}
                    onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  />
                ))}
                {selectedTag && (
                  <TagPill
                    label="Clear"
                    selected={false}
                    onClick={() => setSelectedTag(null)}
                    className="bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                  />
                )}
              </div>
            )}
            {/* End Tag filter bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.isArray(filteredStories) &&
                filteredStories.map((story) => (
                  <Card
                    key={story.id}
                    className="border-0 shadow-md hover:shadow-lg transition-shadow"
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{story.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">
                        {story.character?.name}'s adventure in {story.setting}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Created{' '}
                        {story.created_at
                          ? new Date(story.created_at).toLocaleDateString()
                          : 'recently'}
                      </p>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-slate-600"
                        onClick={() => router.push(`/story/${story.id}`)}
                      >
                        Read
                      </Button>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-slate-600"
                          onClick={() => router.push(`/story/${story.id}/edit`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteStory(story.id || '')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
