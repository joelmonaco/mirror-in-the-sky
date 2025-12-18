"use client"

import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"

import { cn } from "@/lib/utils"

const Popover = PopoverPrimitive.Root

const PopoverTrigger = PopoverPrimitive.Trigger

const PopoverContent = (
  {
    ref,
    className,
    align = "center",
    sideOffset = 4,
    ...props
  }
) => (<PopoverPrimitive.Content
  ref={ref}
  align={align}
  sideOffset={sideOffset}
  className={cn(
    "z-50 w-72 border-none ring-0 outline-1 outline-gray-opacity-6 p-4 text-gray-950 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:duration-200 data-[state=open]:duration-200 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-50",
    className
  )}
  {...props} />)
PopoverContent.displayName = PopoverPrimitive.Content.displayName

export { Popover, PopoverTrigger, PopoverContent }
