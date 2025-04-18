import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';

type Props = {
  params: { storyId: string };
  children: React.ReactNode;
};

// UUID validation regex
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: 'Story | Step Into Storytime',
    description: 'View your generated story',
  };
}

export default async function StoryLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { storyId: string };
}) {
  // Validate storyId format
  if (!params.storyId || !UUID_REGEX.test(params.storyId)) {
    notFound();
  }

  // Verify story exists in database
  const supabase = await createServerSupabaseClient();
  const { data: story, error } = await supabase
    .from('stories')
    .select('id')
    .eq('id', params.storyId)
    .single();

  if (error || !story) {
    notFound();
  }

  return <>{children}</>;
}
