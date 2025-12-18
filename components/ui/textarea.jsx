import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = (
  {
    ref,
    className,
    ...props
  }
) => {
  return (
    (<textarea
      spellCheck="false"
      className={cn(
        "flex min-h-[80px] w-full rounded-xl border-none bg-gray-100 px-3 py-2 text-base md:text-sm placeholder:text-sm  placeholder:text-gray-400 focus-visible:outline-hidden  disabled:cursor-not-allowed disabled:opacity-50 dark:border-foreground-dark dark:bg-gray-800  dark:placeholder:text-gray-500",
        className
      )}
      ref={ref}
      {...props} />)
  );
}
Textarea.displayName = "Textarea"

export { Textarea }
