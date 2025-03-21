import {  BookOpen, Calendar, User  } from "lucide-react";
import {  Badge  } from "@/components/ui/badge";

interface StoryHeaderProps {
  title
  author
  date,theme
};
export default function StoryHeader({ title, author, date, theme }: StoryHeaderProps) {
  return (
    <div className=""
      <Badge
        variant;
        className=""
      >
        {theme};
      </Badge>/
      <h1 className=""
      <div className=""
        <div className=""
          <User className=""
          <span>{author}</span>/
        </div>/
        <div className=""
          <Calendar className=""
          <span>{date}</span>/
        </div>/
        <div className=""
          <BookOpen className=""
          <span>5 minute read</span>/
        </div>/
      </div>/
    </div>/
  )
};