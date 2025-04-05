import { StoryEditorWrapper } from '../../../../components/story/StoryEditorWrapper';
import { notFound } from 'next/navigation';

interface EditStoryPageProps {
  params: {
    storyId: string;
  };
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default async function EditStoryPage({
  params,
  searchParams,
}: EditStoryPageProps) {
  const storyId = await Promise.resolve(params.storyId);

  if (!storyId) {
    return notFound();
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Edit Story</h1>
        <p className="text-muted-foreground">
          Make changes to your story and save when you're done.
        </p>
      </div>

      <StoryEditorWrapper storyId={storyId} />
    </div>
  );
}
