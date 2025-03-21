import { Suspense } from 'react';
import Navbar from '@/components/navbar';
import StoryContent from '@/components/story/story-content';
import StoryControls from '@/components/story/story-controls';
import Footer from '@/components/sections/footer';
import Loading from '@/components/loading';

interface PageProps {
  params: {
    id: string;
  };
}

export default function StoryPage({ params }: PageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-violet-50">
      <Navbar />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <Suspense fallback={<Loading />}>
            <StoryContent storyId={params.id} />
          </Suspense>
          <div className="mt-8">
            <StoryControls />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
