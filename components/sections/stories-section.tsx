'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { BookOpen, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface StoryCardProps {
  title: string;
  description: string;
  image: string;
  author: string;
  date: string;
  onReadClick: () => void;
}

export default function StoriesSection() {
  const router = useRouter();

  return (
    <section className="py-20 md:py-28" id="stories">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-sm font-medium mb-4">
            <BookOpen className="h-4 w-4 mr-2" />
            <span>Story Showcase</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Featured Stories
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Explore our collection of magical adventures created by families
            like yours
          </p>
        </div>

        <Tabs defaultValue="fairy-tales" className="max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-4 mb-8 bg-slate-100 p-1 rounded-lg">
            <TabsTrigger
              value="fairy-tales"
              className="rounded-md data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
            >
              Fairy Tales
            </TabsTrigger>
            <TabsTrigger
              value="space"
              className="rounded-md data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
            >
              Space Adventures
            </TabsTrigger>
            <TabsTrigger
              value="animals"
              className="rounded-md data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
            >
              Animal Friends
            </TabsTrigger>
            <TabsTrigger
              value="superhero"
              className="rounded-md data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
            >
              Superhero Journeys
            </TabsTrigger>
          </TabsList>

          <TabsContent value="fairy-tales" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <StoryCard
                title="The Enchanted Forest"
                description="Join Lily as she discovers a magical forest filled with talking animals and fairy friends."
                image="/placeholder.svg?height=300&width=500"
                author="Created by Emma's family"
                date="2 days ago"
                onReadClick={() => router.push('/story')}
              />
              <StoryCard
                title="The Dragon's Treasure"
                description="Max must solve riddles to find the friendly dragon's lost treasure before sunset."
                image="/placeholder.svg?height=300&width=500"
                author="Created by Noah's family"
                date="1 week ago"
                onReadClick={() => router.push('/story')}
              />
            </div>
          </TabsContent>

          <TabsContent value="space" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <StoryCard
                title="Journey to the Stars"
                description="Captain Zoe and her robot friend explore a new planet with rainbow waterfalls."
                image="/placeholder.svg?height=300&width=500"
                author="Created by Zoe's family"
                date="3 days ago"
                onReadClick={() => router.push('/story')}
              />
              <StoryCard
                title="The Moon Picnic"
                description="Sam and his family take a magical rocket ship to have lunch on the moon!"
                image="/placeholder.svg?height=300&width=500"
                author="Created by Sam's family"
                date="5 days ago"
                onReadClick={() => router.push('/story')}
              />
            </div>
          </TabsContent>

          <TabsContent value="animals" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <StoryCard
                title="The Brave Little Bunny"
                description="Hop along with Benny Bunny as he helps his woodland friends prepare for winter."
                image="/placeholder.svg?height=300&width=500"
                author="Created by Lily's family"
                date="1 day ago"
                onReadClick={() => router.push('/story')}
              />
              <StoryCard
                title="Ocean Friends"
                description="Dive deep with Ollie the Octopus as he organizes an underwater birthday party."
                image="/placeholder.svg?height=300&width=500"
                author="Created by Oliver's family"
                date="4 days ago"
                onReadClick={() => router.push('/story')}
              />
            </div>
          </TabsContent>

          <TabsContent value="superhero" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <StoryCard
                title="Super Emma"
                description="Emma discovers she can fly and uses her new powers to help her neighborhood."
                image="/placeholder.svg?height=300&width=500"
                author="Created by Emma's family"
                date="6 days ago"
                onReadClick={() => router.push('/story')}
              />
              <StoryCard
                title="The Invisible Friend"
                description="Tyler and his invisible friend team up to solve mysteries at the playground."
                image="/placeholder.svg?height=300&width=500"
                author="Created by Tyler's family"
                date="2 weeks ago"
                onReadClick={() => router.push('/story')}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}

function StoryCard({
  title,
  description,
  image,
  author,
  date,
  onReadClick,
}: StoryCardProps) {
  return (
    <Card className="border-0 shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group">
      <div className="relative h-56 overflow-hidden">
        <Image
          src={image || '/placeholder.svg'}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-transparent flex items-end">
          <div className="p-6">
            <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
            <p className="text-slate-200 text-sm line-clamp-2">{description}</p>
          </div>
        </div>
      </div>
      <CardContent className="pt-4 pb-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-500">{author}</span>
          <span className="text-xs text-slate-400">{date}</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          variant="ghost"
          className="w-full text-violet-600 hover:text-violet-700 hover:bg-violet-50"
          onClick={onReadClick}
        >
          Read Preview <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
