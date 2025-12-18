"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "cursor-pointer select-none inline-flex items-center justify-center whitespace-nowrap   text-sm font-medium ring-offset-white transition-colors disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-gray-950",
  {
    variants: {
      variant: {
        default: "bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-50 dark:hover:bg-gray-600 font-semibold  ",
        destructive:
          "bg-red-500 text-gray-50 hover:bg-red-500/90 dark:bg-red-900 dark:text-gray-50 dark:hover:bg-red-900/90",
        outline:
          "border border-gray-200 bg-white hover:bg-gray-100 hover:text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700 dark:hover:text-gray-50",
        secondary:
          "bg-gray-50 text-gray-900 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-50 dark:hover:bg-gray-700",
        ghost: "text-black dark:text-white hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-gray-50",
        link: "text-gray-900 underline-offset-4 hover:underline dark:text-gray-50",
      },
      size: {
        default: "h-11 px-4 py-2",
        sm: "h-9   px-6",
        lg: "h-11   px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(
  ({
    className,
    variant,
    size,
    asChild = false,
    disabled,
    ...props
  }, ref) => {
    const Comp = asChild ? Slot : motion.button
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        whileTap={disabled ? undefined : { scale: 0.98 }}
        transition={{ duration: 0.1 }}
        disabled={disabled}
        {...props}
      />
    );
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
