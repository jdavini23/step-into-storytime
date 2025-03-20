"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

interface CharacterCreatorProps {
  onSubmit: (character: any) => void
}

export default function CharacterCreator({ onSubmit }: CharacterCreatorProps) {
  const [character, setCharacter] = useState({
    name: "",
    age: "",
    traits: [] as string[],
    appearance: "",
  })
  const [currentTrait, setCurrentTrait] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCharacter((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const addTrait = () => {
    if (currentTrait.trim() && !character.traits.includes(currentTrait.trim())) {
      setCharacter((prev) => ({
        ...prev,
        traits: [...prev.traits, currentTrait.trim()],
      }))
      setCurrentTrait("")
    }
  }

  const removeTrait = (trait: string) => {
    setCharacter((prev) => ({
      ...prev,
      traits: prev.traits.filter((t) => t !== trait),
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (character.name && character.age) {
      onSubmit(character)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Character Name</Label>
          <Input
            id="name"
            name="name"
            value={character.name}
            onChange={handleChange}
            placeholder="e.g., Emma"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="age">Age</Label>
          <Input
            id="age"
            name="age"
            value={character.age}
            onChange={handleChange}
            placeholder="e.g., 8 years old"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="traits">Character Traits</Label>
        <div className="flex gap-2">
          <Input
            id="traits"
            value={currentTrait}
            onChange={(e) => setCurrentTrait(e.target.value)}
            placeholder="e.g., brave, curious"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                addTrait()
              }
            }}
          />
          <Button type="button" onClick={addTrait} variant="outline">
            Add
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 mt-2">
          {character.traits.map((trait) => (
            <Badge key={trait} variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1">
              {trait}
              <button
                type="button"
                onClick={() => removeTrait(trait)}
                className="h-4 w-4 rounded-full hover:bg-slate-200 flex items-center justify-center"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove {trait}</span>
              </button>
            </Badge>
          ))}
          {character.traits.length === 0 && (
            <span className="text-sm text-slate-500 italic">Add some traits that describe your character</span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="appearance">Appearance (optional)</Label>
        <Input
          id="appearance"
          name="appearance"
          value={character.appearance}
          onChange={handleChange}
          placeholder="e.g., curly red hair, green eyes"
        />
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={!character.name || !character.age}
          className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
        >
          Create Character
        </Button>
      </div>
    </form>
  )
}

