import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { ChevronRight, MoreHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";

const BreadCrumb = React.forwardRef(
  ({ ...props }, ref) => (
    <nav ref={ref} aria-label="breadcrumb" {...props} />
  )
);
BreadCrumb.displayName = "BreadCrumb";

const BreadCrumbList = React.forwardRef(
  ({ className, ...props }, ref) => (
    <ol
      ref={ref}
      className={cn(
        "flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5",
        className
      )}
      {...props}
    />
  )
);
BreadCrumbList.displayName = "BreadCrumbList";

const BreadCrumbItem = React.forwardRef(
  ({ className, ...props }, ref) => (
    <li
      ref={ref}
      className={cn("inline-flex items-center gap-1.5", className)}
      {...props}
    />
  )
);
BreadCrumbItem.displayName = "BreadCrumbItem";

const BreadCrumbLink = React.forwardRef(
  ({ asChild, className, ...props }, ref) => {
    const Comp = asChild ? Slot : "a";

    return (
      <Comp
        ref={ref}
        className={cn(
          "transition-colors hover:text-foreground",
          className
        )}
        {...props}
      />
    );
  }
);
BreadCrumbLink.displayName = "BreadCrumbLink";

const BreadCrumbPage = React.forwardRef(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn("font-normal text-foreground", className)}
      {...props}
    />
  )
);
BreadCrumbPage.displayName = "BreadCrumbPage";

const BreadCrumbSeparator = ({
  children,
  className,
  ...props
}) => (
  <li
    role="presentation"
    aria-hidden="true"
    className={cn(
      "[&>svg]:w-3.5 [&>svg]:h-3.5",
      className
    )}
    {...props}
  >
    {children ?? <ChevronRight />}
  </li>
);

BreadCrumbSeparator.displayName = "BreadCrumbSeparator";

const BreadCrumbEllipsis = ({
  className,
  ...props
}) => (
  <span
    role="presentation"
    aria-hidden="true"
    className={cn(
      "flex h-9 w-9 items-center justify-center",
      className
    )}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More</span>
  </span>
);

BreadCrumbEllipsis.displayName = "BreadCrumbEllipsis";

export {
  BreadCrumb,
  BreadCrumbList,
  BreadCrumbItem,
  BreadCrumbLink,
  BreadCrumbPage,
  BreadCrumbSeparator,
  BreadCrumbEllipsis,
};