// src/app/components/ClientLayout.tsx
'use client';

import { useEffect } from 'react';
import { gameStorage } from '@/components/game/GameStorage';
import { ReactNode } from 'react';

const clearOldStorageItems = () => {
  if (typeof window === 'undefined') return;

  const lastCleanup = sessionStorage.getItem('last_storage_cleanup');
  const now = Date.now();
  
  if (!lastCleanup || now - parseInt(lastCleanup) > 24 * 60 * 60 * 1000) {
    gameStorage.cleanup();
    sessionStorage.setItem('last_storage_cleanup', now.toString());
  }
};

export default function ClientLayout({
  children,
}: {
  children: ReactNode;
}) {
  useEffect(() => {
    clearOldStorageItems();
  }, []);

  return <>{children}</>;
}