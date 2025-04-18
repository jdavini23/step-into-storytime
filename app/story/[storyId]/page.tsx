'use client';

import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/navbar/index';
import StoryContent from '@/components/story/story-content';
import StoryControls from '@/components/story/story-controls';
import Footer from '@/components/sections/footer';

// UUID validation regex
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

interface StoryPageProps {
  params: {
    storyId: string;
  };
}

export default function StoryPage({ params }: StoryPageProps) {
  const router = useRouter();
  const routeParams = useParams();
  const storyId = routeParams?.storyId as string;

  // Validate storyId format
  if (!storyId || !UUID_REGEX.test(storyId)) {
    // If not a valid UUID, show error or redirect
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-pink-100 via-blue-100 to-yellow-100 relative overflow-hidden">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="max-w-4xl w-full mx-auto">
            <div className="mt-8 bg-white rounded-2xl shadow-xl p-6">
              <h1 className="text-2xl font-bold text-red-600">
                Invalid Story ID
              </h1>
              <p className="mt-4">
                The story ID format is invalid. Please check the URL and try
                again.
              </p>
              <button
                onClick={() => router.push('/stories')}
                className="mt-4 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700"
              >
                Return to Stories
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-pink-100 via-blue-100 to-yellow-100 relative overflow-hidden">
      {/* Animated stars/clouds container (for future use) */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        id="storybook-bg-anim"
      >
        {/* Twinkling stars */}
        <span className="absolute top-10 left-1/4 text-yellow-200 text-3xl animate-twinkle select-none">
          ★
        </span>
        <span
          className="absolute top-1/3 left-3/4 text-yellow-300 text-2xl animate-twinkle select-none"
          style={{ animationDelay: '1s' }}
        >
          ★
        </span>
        <span
          className="absolute top-2/3 left-1/2 text-yellow-100 text-xl animate-twinkle select-none"
          style={{ animationDelay: '2s' }}
        >
          ★
        </span>
        {/* Floating clouds */}
        <span className="absolute bottom-10 left-1/5 text-blue-200 text-6xl animate-cloud select-none">
          ☁️
        </span>
        <span
          className="absolute bottom-1/4 right-1/6 text-blue-100 text-5xl animate-cloud select-none"
          style={{ animationDelay: '2s' }}
        >
          ☁️
        </span>
      </div>
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 md:py-12 z-10">
        <div className="max-w-3xl w-full mx-auto flex flex-col items-center justify-center mt-8 md:mt-12">
          <StoryContent storyId={storyId} />
          <StoryControls />
        </div>
      </main>
      <Footer />
    </div>
  );
}
