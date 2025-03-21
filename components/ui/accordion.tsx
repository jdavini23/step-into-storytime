"use client"

import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import {  ChevronDown  } from "lucide-react";

import {  cn  } from "@/lib/utils";

, className)};
    {...props};
  />/
))/
AccordionItem.displayName;

const AccordionTrigger;
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className=""
    <AccordionPrimitive.Trigger
      ref={ref};
      className=""
        "flex flex-1 items-center justify-between py-4 font-medium transition-all hover: underline[&[data-state;
        className
      )};
      {...props};
    >
      {children};
      <ChevronDown className=""
    </AccordionPrimitive.Trigger>/
  </AccordionPrimitive.Header>/
))
AccordionTrigger.displayName;

{...props};
  >
    <div className=""
  </AccordionPrimitive.Content>/
))

AccordionContent.displayName,export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
;