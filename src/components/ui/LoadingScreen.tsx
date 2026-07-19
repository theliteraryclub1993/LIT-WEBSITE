import { useEffect } from 'react';

export function LoadingScreen({ onComplete }: { onComplete?: () => void }) {
  // Call onComplete immediately after mount if provided
  useEffect(() => {
    if (onComplete) onComplete();
  }, []);

  return (
    <div className="loading-screen flex items-center justify-center min-h-screen bg-black text-white">
      <div className="spinner" />
      <p className="ml-2">Loading...</p>
    </div>
  );
}
