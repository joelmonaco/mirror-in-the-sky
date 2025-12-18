import * as React from "react"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg border border-slate-200 p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-slate-950 dark:border-slate-800 dark:[&>svg]:text-slate-50",
  {
    variants: {
      variant: {
        default: "bg-white text-slate-950 dark:bg-gray-800 dark:text-slate-50",
        warning:
          "border-orange-700 text-orange-700 dark:border-orange-700 [&>svg]:text-orange-700 dark:border-orange-700 dark:text-orange-700 dark:dark:border-orange-700 dark:[&>svg]:text-orange-700",
        destructive:
          "border-red-500/50 text-red-500 dark:border-red-500 [&>svg]:text-red-500 dark:border-red-900/50 dark:text-red-900 dark:dark:border-red-900 dark:[&>svg]:text-red-900",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = (
  {
    ref,
    className,
    variant,
    ...props
  }
) => (<div
  ref={ref}
  role="alert"
  className={cn(alertVariants({ variant }), className)}
  {...props} />)
Alert.displayName = "Alert"

const AlertTitle = (
  {
    ref,
    className,
    ...props
  }
) => (<h5
  ref={ref}
  className={cn("mb-1 font-medium leading-none tracking-tight", className)}
  {...props} />)
AlertTitle.displayName = "AlertTitle"

const AlertDescription = (
  {
    ref,
    className,
    ...props
  }
) => (<div
  ref={ref}
  className={cn("text-sm [&_p]:leading-relaxed", className)}
  {...props} />)
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
