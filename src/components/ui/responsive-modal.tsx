'use client';

import * as React from 'react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';

type ResponsiveModalContextValue = {
  isDesktop: boolean;
};

const ResponsiveModalContext = React.createContext<ResponsiveModalContextValue>({
  isDesktop: false,
});

export function useResponsiveModal(): ResponsiveModalContextValue {
  return React.useContext(ResponsiveModalContext);
}

export type ResponsiveModalProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
};

export function ResponsiveModal({ open, onOpenChange, children }: ResponsiveModalProps) {
  const mediaDesktop = useMediaQuery('(min-width: 768px)');
  const [lockedDesktop, setLockedDesktop] = React.useState<boolean | null>(null);

  if (open && lockedDesktop === null) {
    setLockedDesktop(mediaDesktop);
  } else if (!open && lockedDesktop !== null) {
    setLockedDesktop(null);
  }

  const isDesktop = open ? (lockedDesktop ?? mediaDesktop) : mediaDesktop;
  const contextValue = React.useMemo(() => ({ isDesktop }), [isDesktop]);

  if (isDesktop) {
    return (
      <ResponsiveModalContext.Provider value={contextValue}>
        <Dialog open={open} onOpenChange={onOpenChange}>
          {children}
        </Dialog>
      </ResponsiveModalContext.Provider>
    );
  }

  return (
    <ResponsiveModalContext.Provider value={contextValue}>
      <Drawer open={open} onOpenChange={onOpenChange}>
        {children}
      </Drawer>
    </ResponsiveModalContext.Provider>
  );
}

export function ResponsiveModalTrigger({
  ...props
}: React.ComponentProps<typeof DialogTrigger> & React.ComponentProps<typeof DrawerTrigger>) {
  const { isDesktop } = useResponsiveModal();
  if (isDesktop) {
    return <DialogTrigger {...props} />;
  }
  return <DrawerTrigger {...props} />;
}

export type ResponsiveModalContentProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
  className?: string;
  showClose?: boolean;
  showDragHandle?: boolean;
};

export function ResponsiveModalContent({
  children,
  className,
  showClose = true,
  showDragHandle = true,
  ...props
}: ResponsiveModalContentProps) {
  const { isDesktop } = useResponsiveModal();

  if (isDesktop) {
    return (
      <DialogContent
        showClose={showClose}
        className={cn(
          'sm:max-w-xl md:max-w-2xl max-h-[85vh] p-0 flex flex-col overflow-hidden rounded-3xl border border-border bg-card text-foreground shadow-2xl min-h-0',
          className,
        )}
        {...props}
      >
        {children}
      </DialogContent>
    );
  }

  return (
    <DrawerContent
      className={cn(
        'max-h-[92dvh] flex flex-col bg-card border-border text-foreground overflow-hidden min-h-0',
        className,
      )}
      {...props}
    >
      {showDragHandle && (
        <div className="mx-auto mt-2.5 mb-1 h-1.5 w-12 shrink-0 rounded-full bg-muted-foreground/30" />
      )}
      {children}
    </DrawerContent>
  );
}

export function ResponsiveModalHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { isDesktop } = useResponsiveModal();
  if (isDesktop) {
    return (
      <DialogHeader className={cn('p-6 pb-4 border-b border-border/60', className)} {...props}>
        {children}
      </DialogHeader>
    );
  }
  return (
    <DrawerHeader className={className} {...props}>
      {children}
    </DrawerHeader>
  );
}

export function ResponsiveModalTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  const { isDesktop } = useResponsiveModal();
  if (isDesktop) {
    return (
      <DialogTitle className={className} {...props}>
        {children}
      </DialogTitle>
    );
  }
  return (
    <DrawerTitle className={className} {...props}>
      {children}
    </DrawerTitle>
  );
}

export function ResponsiveModalDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  const { isDesktop } = useResponsiveModal();
  if (isDesktop) {
    return (
      <DialogDescription className={className} {...props}>
        {children}
      </DialogDescription>
    );
  }
  return (
    <DrawerDescription className={className} {...props}>
      {children}
    </DrawerDescription>
  );
}

export function ResponsiveModalFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { isDesktop } = useResponsiveModal();
  if (isDesktop) {
    return (
      <DialogFooter
        className={cn('p-4 border-t border-border/60 bg-muted/20', className)}
        {...props}
      >
        {children}
      </DialogFooter>
    );
  }
  return (
    <DrawerFooter className={className} {...props}>
      {children}
    </DrawerFooter>
  );
}

export function ResponsiveModalClose({
  ...props
}: React.ComponentProps<typeof DialogClose> & React.ComponentProps<typeof DrawerClose>) {
  const { isDesktop } = useResponsiveModal();
  if (isDesktop) {
    return <DialogClose {...props} />;
  }
  return <DrawerClose {...props} />;
}
