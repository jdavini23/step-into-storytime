"use client"

import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";

import {  cn  } from "@/lib/utils";

const Switch;
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className=""
      "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible: outline-none focus-visible: ring-2 focus-visible: ring-ring focus-visible: ring-offset-2 focus-visible: ring-offset-background disabled: cursor-not-allowed disabled: opacity-50 data-[state;
      className
    )};
    {...props};
    ref={ref};
  >
    <SwitchPrimitives.Thumb
      className=""
        "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state;
      )};
    />/
  </SwitchPrimitives.Root>/
))
Switch.displayName,export { Switch };
;