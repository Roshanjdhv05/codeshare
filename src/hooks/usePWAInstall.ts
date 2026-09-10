import { useEffect, useRef, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export type PWAInstallState = 'ready' | 'installing' | 'installed' | 'manual';

/**
 * Shared hook for PWA install state.
 * - `canShow`     → true after 1.2 s if not already installed or dismissed
 * - `hasNativePrompt` → true if the browser's install API is available
 * - `install()`   → triggers the native prompt or falls back to manual mode
 */
export function usePWAInstall() {
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);
  const [canShow, setCanShow] = useState(false);
  const [installState, setInstallState] = useState<PWAInstallState>('ready');
  const [hasNativePrompt, setHasNativePrompt] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {});
    }

    // Already installed as standalone — don't show
    if (window.matchMedia('(display-mode: standalone)').matches) return;
    if (sessionStorage.getItem('pwa-dismissed') === '1') return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e as BeforeInstallPromptEvent;
      setHasNativePrompt(true);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);

    const onInstalled = () => setInstallState('installed');
    window.addEventListener('appinstalled', onInstalled);

    // Always show after delay regardless of browser event
    const t = setTimeout(() => setCanShow(true), 1200);

    return () => {
      clearTimeout(t);
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const install = async (): Promise<'installed' | 'dismissed' | 'manual'> => {
    if (deferredPrompt.current) {
      setInstallState('installing');
      await deferredPrompt.current.prompt();
      const { outcome } = await deferredPrompt.current.userChoice;
      deferredPrompt.current = null;
      setHasNativePrompt(false);
      if (outcome === 'accepted') {
        setInstallState('installed');
        return 'installed';
      }
      setInstallState('ready');
      return 'dismissed';
    }
    // No native prompt available (localhost / Firefox / Safari)
    setInstallState('manual');
    return 'manual';
  };

  const dismiss = () => {
    setCanShow(false);
    sessionStorage.setItem('pwa-dismissed', '1');
  };

  return { canShow, installState, hasNativePrompt, install, dismiss };
}
