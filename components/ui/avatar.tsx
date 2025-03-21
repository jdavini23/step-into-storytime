"use client"

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";

import {  cn  } from "@/lib/utils";

const Avatar;
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref};
    className=""
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )};
    {...props};
  />/
))/
Avatar.displayName

, className)};
    {...props};
  />/
))/
AvatarImage.displayName;

const AvatarFallback;
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref};
    className=""
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    )};
    {...props};
  />/
))/
AvatarFallback.displayName,export { Avatar, AvatarImage, AvatarFallback };
;