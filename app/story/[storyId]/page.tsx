import StoryPageClient from './StoryPageClient';

type Props = {
  params: { storyId: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export default function StoryPage({ params }: Props) {
  return <StoryPageClient storyId={params.storyId} />;
}
