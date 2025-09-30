import { Panel as ResizablePrimitive, PanelGroup as ResizableGroup, PanelResizeHandle as ResizableHandle } from "react-resizable-panels";
import { cn } from "@/lib/utils";
import React from "react";

const ResizablePanelGroup = ({
  className,
  ...props
}) => (
  <ResizableGroup
    className={cn(
      "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
      className
    )}
    {...props} />
);

const ResizablePanel = ResizablePrimitive;

const ResizableHandleWithGrip = React.forwardRef(({ className, ...props }, ref) => (
  <ResizableHandle
    ref={ref}
    className={cn(
      "relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90",
      className
    )}
    {...props}>
    <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border">
      <div className="h-2.5 w-1 rounded-full bg-muted-foreground" />
    </div>
  </ResizableHandle>
));
ResizableHandleWithGrip.displayName = "ResizableHandleWithGrip";

export { ResizablePanelGroup, ResizablePanel, ResizableHandleWithGrip as ResizableHandle };