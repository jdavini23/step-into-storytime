"use client"

import {  useTheme  } from "next-themes";
import {  Button  } from "@/components/ui/button";
import {  Moon, Sun  } from "lucide-react";
import {  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger  } from "@/components/ui/dropdown-menu";
import {  useEffect, useState  } from "react";

export function ThemeToggle()  {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch/
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant;
          <Sun className=""
          <Moon className=""
          <span className=""
        </Button>/
      </DropdownMenuTrigger>/
      <DropdownMenuContent align;
        <DropdownMenuItem onClick;
          <Sun className=""
          <span>Light</span>/
        </DropdownMenuItem>/
        <DropdownMenuItem onClick;
          <Moon className=""
          <span>Dark</span>/
        </DropdownMenuItem>/
        <DropdownMenuItem onClick;
          <span>System</span>/
        </DropdownMenuItem>/
      </DropdownMenuContent>/
    </DropdownMenu>/
  )
};