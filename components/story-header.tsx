import { BookOpen, Calendar, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface StoryHeaderProps {
  title: string
  author: string
  date: string
  theme: string
}

export default function StoryHeader({ title, author, date, theme }: StoryHeaderProps) {
  return (
    <div className="text-center md:text-left">
      <Badge
        variant="outline"
        className="mb-4 bg-violet-100 text-violet-800 border-violet-200 hover:bg-violet-200 hover:text-violet-900"
      >
        {theme}
      </Badge>
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4 leading-tight">{title}</h1>
      <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 text-slate-600 text-sm">
        <div className="flex items-center">
          <User className="h-4 w-4 mr-2 text-violet-500" />
          <span>{author}</span>
        </div>
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-2 text-violet-500" />
          <span>{date}</span>
        </div>
        <div className="flex items-center">
          <BookOpen className="h-4 w-4 mr-2 text-violet-500" />
          <span>5 minute read</span>
        </div>
      </div>
    </div>
  )
}

