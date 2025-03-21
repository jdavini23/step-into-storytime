"use client"

import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import {  Circle  } from "lucide-react";

import {  cn  } from "@/lib/utils";

, className)};
      {...props};
      ref={ref};
    />/
  )/
})
RadioGroup.displayName;

const RadioGroupItem;
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref};
      className=""
        "aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus;
        className
      )};
      {...props};
    >
      <RadioGroupPrimitive.Indicator className=""
        <Circle className=""
      </RadioGroupPrimitive.Indicator>/
    </RadioGroupPrimitive.Item>/
  )
})
RadioGroupItem.displayName,export { RadioGroup, RadioGroupItem };
;