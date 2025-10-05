'use client';

import React from 'react';

interface ProviderProps {
  children: React.ReactNode;
}

// Placeholder app-level auth provider. Real implementation can wrap modules/auth context.
export default function AuthProvider({ children }: ProviderProps) {
  return <>{children}</>;
}


