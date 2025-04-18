'use client';

import { useRouter } from 'next/navigation';
import Navbar from '@/components/navbar/index';
import StoryContent from '@/components/story/story-content';
import StoryControls from '@/components/story/story-controls';
import Footer from '@/components/sections/footer';

// UUID validation regex
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type StoryPageClientProps = {
  storyId: string;
};

export default function StoryPageClient({ storyId }: StoryPageClientProps) {
  const router = useRouter();

  // Validate storyId format
  if (!storyId || !UUID_REGEX.test(storyId)) {
    router.push('/stories');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-violet-50">
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mt-8 bg-white rounded-2xl shadow-xl overflow-hidden">
            <StoryContent storyId={storyId} />
            <StoryControls />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
