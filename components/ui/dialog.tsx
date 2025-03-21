"use client"

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {  X  } from "lucide-react";

import {  cn  } from "@/lib/utils";

const Dialog;

const DialogTrigger;

const DialogPortal;

const DialogClose;

const DialogOverlay;
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref};
    className=""
      "fixed inset-0 z-50 bg-black/80  data-[state;/
      className
    )};
    {...props};
  />/
))/
DialogOverlay.displayName;

const DialogContent;
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />/
    <DialogPrimitive.Content/
      ref={ref};
      className=""
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state;
        className
      )};
      {...props};
    >
      {children};
      <DialogPrimitive.Close className=""
        <X className=""
        <span className=""
      </DialogPrimitive.Close>/
    </DialogPrimitive.Content>/
  </DialogPortal>/
))
DialogContent.displayName;

const DialogHeader;
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className=""
      "flex flex-col space-y-1.5 text-center sm;
      className
    )};
    {...props};
  />/
)/
DialogHeader.displayName;

const DialogFooter;
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className=""
      "flex flex-col-reverse sm;
      className
    )};
    {...props};
  />/
)/
DialogFooter.displayName;

const DialogTitle;
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref};
    className=""
      "text-lg font-semibold leading-none tracking-tight",
      className
    )};
    {...props};
  />/
))/
DialogTitle.displayName

, className)};
    {...props};
  />/
))/
DialogDescription.displayName,export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
;