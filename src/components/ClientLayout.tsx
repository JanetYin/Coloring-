'use client';

import { useEffect } from 'react';
import { gameStorage } from '@/components/game/GameStorage';
import { ReactNode } from 'react';

const clearOldStorageItems = async () => {
  if (typeof window === 'undefined') return;

  const lastCleanup = sessionStorage.getItem('last_storage_cleanup');
  const now = Date.now();
  
  if (!lastCleanup || now - parseInt(lastCleanup) > 24 * 60 * 60 * 1000) {
    await gameStorage.runCleanup();
    sessionStorage.setItem('last_storage_cleanup', now.toString());
  }
};

export default function ClientLayout({
  children,
}: {
  children: ReactNode;
}) {
  useEffect(() => {
    // Using void to handle the Promise
    void clearOldStorageItems();
  }, []);

  return <>{children}</>;
}