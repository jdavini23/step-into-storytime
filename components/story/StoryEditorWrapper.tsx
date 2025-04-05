'use client';

import { useRouter } from 'next/navigation';
import { StoryEditor } from './StoryEditor';

interface StoryEditorWrapperProps {
  storyId: string;
}

export function StoryEditorWrapper({ storyId }: StoryEditorWrapperProps) {
  const router = useRouter();

  const handleSave = () => {
    router.push('/stories');
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <StoryEditor
      storyId={storyId}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
}
