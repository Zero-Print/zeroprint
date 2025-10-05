import * as React from 'react';

import { cn } from '@/lib/utils';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isClient, setIsClient] = React.useState(false);

  // Ensure we're on the client side to prevent hydration mismatches
  React.useEffect(() => {
    setIsClient(true);
  }, []);

  // Clean up browser extension attributes to prevent hydration warnings
  React.useEffect(() => {
    if (isClient && inputRef.current) {
      // Remove common browser extension attributes that cause hydration warnings
      const attributesToRemove = [
        'fdprocessedid',
        'data-lastpass-icon-root',
        'data-bitwarden-watching',
      ];
      attributesToRemove.forEach(attr => {
        if (inputRef.current?.hasAttribute(attr)) {
          inputRef.current.removeAttribute(attr);
        }
      });
    }
  }, [isClient]);

  return (
    <input
      ref={inputRef}
      type={type}
      data-slot='input'
      // Suppress hydration warnings for browser extension attributes
      suppressHydrationWarning={true}
      className={cn(
        'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
        className
      )}
      {...props}
    />
  );
}

export { Input };
