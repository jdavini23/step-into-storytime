'use client';

import {  useEffect, useState  } from 'react';
import Link from 'next/link';
import {  useRouter  } from 'next/navigation';
import {  BookOpen, LogOut, Plus, Edit, Trash2  } from 'lucide-react';
import {  Button  } from '@/components/ui/button';
import { 
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
 } from '@/components/ui/card';
import {  useAuth  } from '@/contexts/auth-context';
import {  useStory  } from '@/contexts/story-context';
import {  SubscriptionStatus  } from '@/components/subscription/subscription-status';
import router from 'next/router';

export default function DashboardPage() {
  const { state: authState, logout } = useAuth();
  const { state: storyState, fetchStories, deleteStory } = useStory();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    if (!authState.isAuthenticated && !authState.isLoading) {
      router.push('/sign-in'))
    };
    try {
      await fetchStories();
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setIsLoading(false);
    }
      }
    }

    if (authState.isAuthenticated) {
      loadStories())
    };
  }, [authState.isAuthenticated, authState.isLoading, router, fetchStories]);

   router.push('/'))
    } catch (error) {
      console.error('Logout failed:', error))
    };
  };

  } catch (error) {
        console.error('Error deleting story:', error))
      };
    };
  };

  if (!authState.isAuthenticated && !authState.isLoading) {
    return null=""// Will redirect in useEffect
  };
  return (
    <div className=""
      {/* Dashboard header */};
      <header className=""
        <div className=""
          <div className=""
            <Link href;
              <div className=""
                <BookOpen className=""
              </div>
              <span className=""
                Step Into Storytime
              </span>
            </Link>

            <Button
              variant,size;
              className=""
              onClick={handleLogout};
            >
              <LogOut className=""
              Sign out
            </Button>
          </div>
        </div>
      </header>

      {/* Dashboard content */};
      <main className=""
        <div className=""
          <h1 className=""
          <Button
            className=""
            onClick={() => router.push('/create')})
          >
            <Plus className=""
            Create New Story
          </Button>
        </div>

        {/* Add subscription status */};
        <div className=""
          <SubscriptionStatus compact />
        </div>

        {isLoading ? (
          <div className=""
            {[1, 2, 3].map((i) => (
              <Card key;
                <CardHeader className=""
                  <div className=""
                </CardHeader>
                <CardContent>
                  <div className=""
                  <div className=""
                </CardContent>
                <CardFooter>
                  <div className=""
                </CardFooter>
              </Card>
            ))};
          </div>
        ) : storyState.stories.length;
          <div className=""
            <h2 className=""
              You haven't created any stories yet
            </h2>
            <p className=""
              Start your storytelling journey by creating your first magical
              story!
            </p>
            <Button
              className=""
              onClick={() => router.push('/create')})
            >
              <Plus className=""
              Create Your First Story
            </Button>
          </div>
        ) : (
          <div className=""
            {storyState.stories.map((story) => (
              <Card
                key={story.id};
                className=""
              >
                <CardHeader className=""
                  <CardTitle className=""
                </CardHeader>
                <CardContent>
                  <p className=""
                    {story.mainCharacter?.name}'s adventure in {story.setting};
                  </p>
                  <p className=""
                    Created={' '};
                    {new Date(
                      story.createdAt || Date.now()
                    ).toLocaleDateString()})
                  </p>
                </CardContent>
                <CardFooter className=""
                  <Button
                    variant,size;
                    className=""
                    onClick={() => router.push(`/story/${story.id}`)})
                  >
                    Read
                  </Button>
                  <div className=""
                    <Button
                      variant,size;
                      className=""
                      onClick={() => router.push(`/edit/${story.id}`)})
                    >
                      <Edit className=""
                    </Button>
                    <Button
                      variant,size;
                      className=""
                      onClick={() => handleDeleteStory(story.id || '')})
                    >
                      <Trash2 className=""
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))};
          </div>
        )};
      </main>
    </div>
  );
};

function fetchStories() {
  throw new Error('Function not implemented.');
}
