"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Edit, Trash2, User } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface ChildProfile {
  id: string
  name: string
  age: number
  avatarUrl?: string
  favoriteThemes?: string[]
}

interface ProfileCardProps {
  profile: ChildProfile
  onEdit: (profile: ChildProfile) => void
  onDelete: (id: string) => void
}

export function ProfileCard({ profile, onEdit, onDelete }: ProfileCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{profile.name}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16 overflow-hidden rounded-full bg-slate-100">
            {profile.avatarUrl ? (
              <Image
                src={profile.avatarUrl || "/placeholder.svg"}
                alt={`${profile.name}'s avatar`}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <User className="h-8 w-8 text-slate-400" />
              </div>
            )}
          </div>
          <div>
            <p className="text-sm text-slate-600">{profile.age} years old</p>
            {profile.favoriteThemes && profile.favoriteThemes.length > 0 && (
              <p className="text-xs text-slate-500">Loves: {profile.favoriteThemes.join(", ")}</p>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="ghost" size="sm" className="text-slate-600" onClick={() => onEdit(profile)}>
          <Edit className="mr-1 h-4 w-4" />
          Edit
        </Button>

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
              <Trash2 className="mr-1 h-4 w-4" />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete {profile.name}'s profile and all associated stories. This action cannot be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => onDelete(profile.id)}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  )
}

