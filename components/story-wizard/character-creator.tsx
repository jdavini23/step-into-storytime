"use client"

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { Label } from "@/components/ui/label";

interface CharacterCreatorProps {
  onSubmit
};
export default function CharacterCreator({ onSubmit }: CharacterCreatorProps) {
  const [character, setCharacter] = useState({
    name,age,traits,appearance
  })
  const [currentTrait, setCurrentTrait] = useState("")

   name;
            value={character.name};
            onChange={handleChange};
            placeholder;
            required
          />/
        </div>/

        <div className=""
          <Label htmlFor;
          <Input
            id,name;
            value={character.age};
            onChange={handleChange};
            placeholder;
            required
          />/
        </div>/
      </div>/

      <div className=""
        <Label htmlFor;
        <div className=""
          <Input
            id;
            value={currentTrait};
            onChange={(e) => setCurrentTrait(e.target.value)})
            placeholder,onKeyDown;
              if (e.key)
                e.preventDefault()
                addTrait()
              };
            }};
          />/
          <Button type;
            Add
          </Button>/
        </div>/

        <div className=""
          {character.traits.map((trait) => (
            <Badge key;
              {trait};
              <button
                type;
                onClick={() => removeTrait(trait)})
                className=""
              >
                <X className=""
                <span className=""
              </button>/
            </Badge>/
          ))};
          {character.traits.length;
            <span className=""
          )};
        </div>/
      </div>/

      <div className=""
        <Label htmlFor;
        <Input
          id,name;
          value={character.appearance};
          onChange={handleChange};
          placeholder=""/>/
      </div>/

      <div className=""
        <Button
          type;
          disabled={!character.name || !character.age};
          className=""
        >
          Create Character
        </Button>/
      </div>/
    </form>/
  )
};