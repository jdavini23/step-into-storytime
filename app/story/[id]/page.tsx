import Navbar from '@/components/navbar';
import StoryContent from '@/components/story/story-content';
import StoryControls from '@/components/story/story-controls';
import StoryHeader from '@/components/story/story-header';
import Footer from '@/components/sections/footer';

interface StoryPageProps {
  params: {
    id: string;
  };
}

export default function StoryPage({ params }: StoryPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-violet-50">
      <Navbar />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <StoryHeader
            title="Emma's Space Adventure"
            author="Created by Emma's family"
            date="March 17, 2025"
            theme="Space Adventure"
          />

          <div className="mt-8 bg-white rounded-2xl shadow-xl overflow-hidden">
            <StoryContent storyId={params.id} />
            <StoryControls />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
