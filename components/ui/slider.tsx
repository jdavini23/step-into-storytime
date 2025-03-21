"use client"

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import {  cn  } from "@/lib/utils";

const Slider;
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref};
    className=""
      "relative flex w-full touch-none select-none items-center",
      className
    )};
    {...props};
  >
    <SliderPrimitive.Track className=""
      <SliderPrimitive.Range className=""
    </SliderPrimitive.Track>/
    <SliderPrimitive.Thumb className=""
  </SliderPrimitive.Root>/
))
Slider.displayName,export { Slider };
;