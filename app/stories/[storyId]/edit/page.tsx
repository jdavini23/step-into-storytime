'use client';

import { useRouter } from 'next/navigation';
import { StoryEditor } from '@/components/story/StoryEditor';

interface EditStoryPageProps {
  params: {
    storyId: string;
  };
}

export default function EditStoryPage({ params }: EditStoryPageProps) {
  const router = useRouter();

  const handleSave = () => {
    router.push('/stories');
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Edit Story</h1>
        <p className="text-muted-foreground">
          Make changes to your story and save when you're done.
        </p>
      </div>

      <StoryEditor
        storyId={params.storyId}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </div>
  );
}
