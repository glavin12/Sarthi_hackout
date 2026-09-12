'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Landing/redirect page for Saarthi.
 * Automatically redirects the user to the main /dashboard route.
 */
export function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-saarthi-bg flex items-center justify-center">
      <div className="text-center animate-fade-in">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-saarthi-healthy animate-pulse" />
          <h1 className="text-sm tracking-[0.3em] font-light text-saarthi-text-primary uppercase">
            Saarthi
          </h1>
        </div>
        <p className="text-xs font-light text-saarthi-text-muted">
          Understand · Decide · Assist · Protect
        </p>
      </div>
    </div>
  );
}

export default Home;
