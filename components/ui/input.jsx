import * as React from "react"

import { cn } from "@/lib/utils"

const Input = (
  {
    ref,
    className,
    type,
    ...props
  }
) => {
  return (
    (<input
      type={type}
      spellCheck="false"
      className={cn(
        "flex h-14 w-full outline-hidden text-black bg-gray-100 px-3 py-2 text-sm placeholder:text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400  disabled:cursor-not-allowed disabled:opacity-50 dark:text-white dark:bg-gray-800 dark:placeholder:text-gray-500 ",
        className
      )}
      ref={ref}
      {...props} />)
  );
}
Input.displayName = "Input"

export { Input }
