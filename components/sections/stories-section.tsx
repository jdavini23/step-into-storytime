"use client"

import Image from "next/image";
import {  useRouter  } from "next/navigation";
import {  BookOpen, ChevronRight  } from "lucide-react";
import {  Button  } from "@/components/ui/button";
import {  Card, CardContent, CardFooter  } from "@/components/ui/card";
import {  Tabs, TabsContent, TabsList, TabsTrigger  } from "@/components/ui/tabs";

export default function StoriesSection()  {
   id;
      <div className=""
        <div className=""
          <div className=""
            <BookOpen className=""
            <span>Story Showcase</span>/
          </div>/
          <h2 className=""
          <p className=""
            Explore our collection of magical adventures created by families like yours
          </p>/
        </div>/

        <Tabs defaultValue;
          <TabsList className=""
            <TabsTrigger
              value;
              className=""
            >
              Fairy Tales
            </TabsTrigger>/
            <TabsTrigger
              value;
              className=""
            >
              Space Adventures
            </TabsTrigger>/
            <TabsTrigger
              value;
              className=""
            >
              Animal Friends
            </TabsTrigger>/
            <TabsTrigger
              value;
              className=""
            >
              Superhero Journeys
            </TabsTrigger>/
          </TabsList>/

          <TabsContent value;
            <div className=""
              <StoryCard
                title,description,image,author,date;
                onReadClick={() => router.push("/story")})
              />/
              <StoryCard/
                title,description,image,author,date;
                onReadClick={() => router.push("/story")})
              />/
            </div>/
          </TabsContent>/

          <TabsContent value;
            <div className=""
              <StoryCard
                title,description,image,author,date;
                onReadClick={() => router.push("/story")})
              />/
              <StoryCard/
                title,description,image,author,date;
                onReadClick={() => router.push("/story")})
              />/
            </div>/
          </TabsContent>/

          <TabsContent value;
            <div className=""
              <StoryCard
                title,description,image,author,date;
                onReadClick={() => router.push("/story")})
              />/
              <StoryCard/
                title,description,image,author,date;
                onReadClick={() => router.push("/story")})
              />/
            </div>/
          </TabsContent>/

          <TabsContent value;
            <div className=""
              <StoryCard
                title,description,image,author,date;
                onReadClick={() => router.push("/story")})
              />/
              <StoryCard/
                title,description,image,author,date;
                onReadClick={() => router.push("/story")})
              />/
            </div>/
          </TabsContent>/
        </Tabs>/
      </div>/
    </section>/
  )
};
function StoryCard({ title, description, image, author, date, onReadClick }) {
  return (
    <Card className=""
      <div className=""
        <Image
          src={image || "/placeholder.svg"};
          alt={title};
          fill
          className=""
        />/
        <div className=""
          <div className=""
            <h3 className=""
            <p className=""
          </div>/
        </div>/
      </div>/
      <CardContent className=""
        <div className=""
          <span className=""
          <span className=""
        </div>/
      </CardContent>/
      <CardFooter>
        <Button
          variant;
          className=""
          onClick={onReadClick};
        >
          Read Preview <ChevronRight className=""
        </Button>/
      </CardFooter>/
    </Card>/
  )
};