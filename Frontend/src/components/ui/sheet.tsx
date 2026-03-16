import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";
const Sheet = SheetPrimitive.Root;
const SheetTrigger = SheetPrimitive.Trigger;
const SheetPortal = SheetPrimitive.Portal;

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-in fade-in",
      className
    )}
    {...props}
  />
));
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;

type SheetContentProps = React.ComponentPropsWithoutRef<
  typeof SheetPrimitive.Content
> & {
  side?: "left" | "right" | "bottom";
};

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(({ className, children, side = "right", ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <SheetPrimitive.Content
      ref={ref}
      className={cn(
        "fixed z-50 bg-white dark:bg-gray-900 shadow-xl",
        "animate-in duration-300",
        {
          "slide-in-from-right top-0 bottom-0 right-0 w-80": side === "right",
          "slide-in-from-left top-0 bottom-0 left-0 w-80": side === "left",
          "slide-in-from-bottom left-0 right-0 bottom-0 h-80": side === "bottom",
        },
        className
      )}
      {...props}
    >
      {children}
      <SheetPrimitive.Close className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
        <X className="h-5 w-5" />
      </SheetPrimitive.Close>
    </SheetPrimitive.Content>
  </SheetPortal>
));

SheetContent.displayName = SheetPrimitive.Content.displayName;

const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("p-4 border-b border-gray-200 dark:border-gray-700", className)} {...props} />
);

const SheetTitle = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h2 className={cn("text-lg font-semibold", className)} {...props} />
);

export { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle };
