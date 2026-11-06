import * as LabelPrimitive from "@radix-ui/react-label"
import { Info } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import * as React from "react"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

type LabelProps = React.ComponentProps<typeof LabelPrimitive.Root> & {
  /** Explanation shown when hovering (or tapping, on phones) the help icon. */
  tooltip?: React.ReactNode
  /** Lucide icon for the help trigger. Defaults to Info. */
  tooltipIcon?: LucideIcon
}

function Label({ className, tooltip, tooltipIcon, ...props }: LabelProps) {
  const label = (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )

  if (!tooltip) {
    return label
  }

  // The icon sits next to the <label>, not inside it: a click inside a label
  // would be forwarded to the input.
  return (
    <span className="inline-flex items-center gap-1.5">
      {label}
      <LabelTooltip content={tooltip} icon={tooltipIcon ?? Info} />
    </span>
  )
}

function LabelTooltip({
  content,
  icon: Icon,
}: {
  content: React.ReactNode
  icon: LucideIcon
}) {
  const [open, setOpen] = React.useState(false)

  return (
    <Tooltip open={open} onOpenChange={setOpen}>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label="Mais informações sobre este campo"
          onClick={(event) => {
            // Radix closes tooltips on click; keep it open so a tap shows it on phones.
            event.preventDefault()
            setOpen(true)
          }}
          onPointerLeave={(event) => {
            // On touch screens pointerleave fires right after the tap.
            if (event.pointerType === "touch") {
              event.preventDefault()
            }
          }}
          className="inline-flex size-4 cursor-help items-center justify-center rounded-full text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Icon className="size-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-64 text-xs leading-relaxed">
        {content}
      </TooltipContent>
    </Tooltip>
  )
}

export { Label }
export type { LabelProps }
