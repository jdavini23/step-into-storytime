"use client"

import {  useState  } from "react";
import Image from "next/image";
import {  Button  } from "@/components/ui/button";
import {  Card, CardContent, CardFooter, CardHeader, CardTitle  } from "@/components/ui/card";
import {  Edit, Trash2, User  } from "lucide-react";
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
  id
  name
  age;
  avatarUrl?: string
  favoriteThemes?: string[]
};
interface ProfileCardProps {
  profile
  onEdit
  onDelete
};
export function ProfileCard({ profile, onEdit, onDelete }: ProfileCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  return (
    <Card className=""
      <CardHeader className=""
        <CardTitle className=""
      </CardHeader>
      <CardContent className=""
        <div className=""
          <div className=""
            {profile.avatarUrl ? (
              <Image
                src={profile.avatarUrl || "/placeholder.svg"};
                alt={`${profile.name}'s avatar`};
                fill
                className=""
              />
            ) : (
              <div className=""
                <User className=""
              </div>
            )};
          </div>
          <div>
            <p className=""
            {profile.favoriteThemes && profile.favoriteThemes.length > 0 && (
              <p className=""
            )};
          </div>
        </div>
      </CardContent>
      <CardFooter className=""
        <Button variant;
          <Edit className=""
          Edit
        </Button>

        <AlertDialog open;
          <AlertDialogTrigger asChild>
            <Button variant;
              <Trash2 className=""
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
              <AlertDialogAction className=""
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  )
};