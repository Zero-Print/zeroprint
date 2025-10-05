'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

interface NavigationContextType {
  previousPath: string | null;
  navigateBack: () => void;
}

const NavigationContext = createContext<NavigationContextType>({
  previousPath: null,
  navigateBack: () => {},
});

export const useNavigation = () => useContext(NavigationContext);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [previousPath, setPreviousPath] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (pathname !== currentPath && currentPath !== null) {
      setPreviousPath(currentPath);
    }
    setCurrentPath(pathname);
  }, [pathname, currentPath]);

  const navigateBack = () => {
    if (previousPath && !previousPath.startsWith('/auth')) {
      router.push(previousPath);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <NavigationContext.Provider value={{ previousPath, navigateBack }}>
      {children}
    </NavigationContext.Provider>
  );
}