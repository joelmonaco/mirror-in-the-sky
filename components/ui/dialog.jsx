"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = (
  {
    ref,
    className,
    ...props
  }
) => (<DialogPrimitive.Overlay
  ref={ref}
  className={cn(
    "fixed inset-0 bg-black/80 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
    "backdrop-blur-xs",
    className
  )}
  {...props} />)
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = (
  {
    ref,
    className,
    children,
    ...props
  }
) => (<DialogPortal>
  <DialogOverlay />
  <DialogPrimitive.Content
    ref={ref}
    className={cn(
      "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] safari-icon-fix gap-4 bg-white p-6 shadow-lg duration-200 rounded-3xl dark:bg-gray-900",
      "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
      "max-h-[100dvh] sm:h-auto sm:max-h-[100dvh] overflow-y-auto",
      className
    )}
    {...props}>
    {children}
    <DialogPrimitive.Close
      className="absolute right-4 top-4 rounded-xs opacity-70 ring-offset-transparent transition-opacity hover:opacity-100 outline-hidden focus:outline-hidden focus:ring-2 focus:ring-transparent focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-transparent data-[state=open]:text-slate-500 dark:ring-offset-transparent dark:focus:ring-transparent dark:data-[state=open]:bg-transparent dark:data-[state=open]:text-slate-400">
      <X className="h-6 w-6 text-black dark:text-white" />
      <span className="sr-only">Close</span>
    </DialogPrimitive.Close>
  </DialogPrimitive.Content>
</DialogPortal>)
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}) => (
  <div
    className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}
    {...props} />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}) => (
  <div
    className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
    {...props} />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = (
  {
    ref,
    className,
    ...props
  }
) => (<DialogPrimitive.Title
  ref={ref}
  className={cn("text-lg font-semibold leading-none tracking-tight", className)}
  {...props} />)
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = (
  {
    ref,
    className,
    ...props
  }
) => (<DialogPrimitive.Description
  ref={ref}
  className={cn("text-sm text-gray-500 dark:text-gray-400", className)}
  {...props} />)
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
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
}
