"use client"

import * as React from "react"
import * as ContextMenuPrimitive from "@radix-ui/react-context-menu"
import { Check, ChevronRight, Circle } from "lucide-react"

import { cn } from "@/lib/utils"

const ContextMenu = ContextMenuPrimitive.Root

const ContextMenuTrigger = ContextMenuPrimitive.Trigger

const ContextMenuGroup = ContextMenuPrimitive.Group

const ContextMenuPortal = ContextMenuPrimitive.Portal

const ContextMenuSub = ContextMenuPrimitive.Sub

const ContextMenuRadioGroup = ContextMenuPrimitive.RadioGroup

const ContextMenuSubTrigger = (
  {
    ref,
    className,
    inset,
    children,
    ...props
  }
) => (<ContextMenuPrimitive.SubTrigger
  ref={ref}
  className={cn(
    "flex cursor-default select-none items-center rounded-xs px-2 py-1.5 text-sm outline-hidden focus:bg-slate-100 focus:text-slate-900 data-[state=open]:bg-slate-100 data-[state=open]:text-slate-900 dark:focus:bg-slate-800 dark:focus:text-slate-50 dark:data-[state=open]:bg-slate-800 dark:data-[state=open]:text-slate-50",
    inset && "pl-8",
    className
  )}
  {...props}>
  {children}
  <ChevronRight className="ml-auto h-4 w-4" />
</ContextMenuPrimitive.SubTrigger>)
ContextMenuSubTrigger.displayName = ContextMenuPrimitive.SubTrigger.displayName

const ContextMenuSubContent = (
  {
    ref,
    className,
    ...props
  }
) => (<ContextMenuPrimitive.SubContent
  ref={ref}
  className={cn(
    "z-50 min-w-[8rem] overflow-hidden rounded-md border border-slate-200 bg-white p-1 text-slate-950 shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 dark:border-slate-800 dark:bg-gray-800 dark:text-slate-50",
    className
  )}
  {...props} />)
ContextMenuSubContent.displayName = ContextMenuPrimitive.SubContent.displayName

const ContextMenuContent = (
  {
    ref,
    className,
    ...props
  }
) => (<ContextMenuPrimitive.Portal>
  <ContextMenuPrimitive.Content
    ref={ref}
    className={cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border border-slate-200 bg-white p-1 text-slate-950 shadow-md animate-in fade-in-80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 dark:border-slate-800 dark:bg-gray-800 dark:text-slate-50",
      className
    )}
    {...props} />
</ContextMenuPrimitive.Portal>)
ContextMenuContent.displayName = ContextMenuPrimitive.Content.displayName

const ContextMenuItem = (
  {
    ref,
    className,
    inset,
    ...props
  }
) => (<ContextMenuPrimitive.Item
  ref={ref}
  className={cn(
    "relative flex cursor-default select-none items-center rounded-xs px-2 py-1.5 text-sm outline-hidden focus:bg-slate-100 focus:text-slate-900 data-disabled:pointer-events-none data-disabled:opacity-50 dark:focus:bg-slate-800 dark:focus:text-slate-50",
    inset && "pl-8",
    className
  )}
  {...props} />)
ContextMenuItem.displayName = ContextMenuPrimitive.Item.displayName

const ContextMenuCheckboxItem = (
  {
    ref,
    className,
    children,
    checked,
    ...props
  }
) => (<ContextMenuPrimitive.CheckboxItem
  ref={ref}
  className={cn(
    "relative flex cursor-default select-none items-center rounded-xs py-1.5 pl-8 pr-2 text-sm outline-hidden focus:bg-slate-100 focus:text-slate-900 data-disabled:pointer-events-none data-disabled:opacity-50 dark:focus:bg-slate-800 dark:focus:text-slate-50",
    className
  )}
  checked={checked}
  {...props}>
  <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
    <ContextMenuPrimitive.ItemIndicator>
      <Check className="h-4 w-4" />
    </ContextMenuPrimitive.ItemIndicator>
  </span>
  {children}
</ContextMenuPrimitive.CheckboxItem>)
ContextMenuCheckboxItem.displayName =
  ContextMenuPrimitive.CheckboxItem.displayName

const ContextMenuRadioItem = (
  {
    ref,
    className,
    children,
    ...props
  }
) => (<ContextMenuPrimitive.RadioItem
  ref={ref}
  className={cn(
    "relative flex cursor-default select-none items-center rounded-xs py-1.5 pl-8 pr-2 text-sm outline-hidden focus:bg-slate-100 focus:text-slate-900 data-disabled:pointer-events-none data-disabled:opacity-50 dark:focus:bg-slate-800 dark:focus:text-slate-50",
    className
  )}
  {...props}>
  <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
    <ContextMenuPrimitive.ItemIndicator>
      <Circle className="h-2 w-2 fill-current" />
    </ContextMenuPrimitive.ItemIndicator>
  </span>
  {children}
</ContextMenuPrimitive.RadioItem>)
ContextMenuRadioItem.displayName = ContextMenuPrimitive.RadioItem.displayName

const ContextMenuLabel = (
  {
    ref,
    className,
    inset,
    ...props
  }
) => (<ContextMenuPrimitive.Label
  ref={ref}
  className={cn(
    "px-2 py-1.5 text-sm font-semibold text-slate-950 dark:text-slate-50",
    inset && "pl-8",
    className
  )}
  {...props} />)
ContextMenuLabel.displayName = ContextMenuPrimitive.Label.displayName

const ContextMenuSeparator = (
  {
    ref,
    className,
    ...props
  }
) => (<ContextMenuPrimitive.Separator
  ref={ref}
  className={cn("-mx-1 my-1 h-px bg-slate-200 dark:bg-slate-800", className)}
  {...props} />)
ContextMenuSeparator.displayName = ContextMenuPrimitive.Separator.displayName

const ContextMenuShortcut = ({
  className,
  ...props
}) => {
  return (
    (<span
      className={cn(
        "ml-auto text-xs tracking-widest text-slate-500 dark:text-slate-400",
        className
      )}
      {...props} />)
  );
}
ContextMenuShortcut.displayName = "ContextMenuShortcut"

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
}
