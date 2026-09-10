import React, { useEffect, useRef, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

type State = 'banner' | 'installing' | 'installed' | 'manual' | 'hidden';

/**
 * PWA Install Prompt — Desktop floating banner.
 *
 * Always visible (no dependency on `beforeinstallprompt` to render).
 * - If the browser supports the install API → shows Install button.
 * - If not (localhost / Firefox / Safari) → shows manual instructions.
 * Hidden on mobile (<768px) because mobile users use the sidebar button in Layout.tsx.
 */
const PWAInstallPrompt: React.FC = () => {
  const [state, setState] = useState<State>('hidden');
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {});
    }

    // Already installed as standalone PWA — don't show anything
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    // User already dismissed this session
    if (sessionStorage.getItem('pwa-dismissed') === '1') return;

    // Capture the install prompt if the browser fires it
    const onPrompt = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e as BeforeInstallPromptEvent;
    };
    window.addEventListener('beforeinstallprompt', onPrompt);

    // Successful install via browser chrome
    const onInstalled = () => setState('installed');
    window.addEventListener('appinstalled', onInstalled);

    // Always show the banner after a short delay regardless of the event
    const timer = setTimeout(() => setState('banner'), 1200);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt.current) {
      // Browser supports the install API — use it
      setState('installing');
      await deferredPrompt.current.prompt();
      const { outcome } = await deferredPrompt.current.userChoice;
      deferredPrompt.current = null;
      setState(outcome === 'accepted' ? 'installed' : 'banner');
    } else {
      // Localhost or unsupported browser — show manual instructions
      setState('manual');
    }
  };

  const handleDismiss = () => {
    setState('hidden');
    sessionStorage.setItem('pwa-dismissed', '1');
  };

  if (state === 'hidden') return null;

  return (
    <>
      {/* ── Success toast ─────────────────────────────────────────── */}
      {state === 'installed' && (
        <div
          role="status"
          aria-live="polite"
          className="pwa-desktop-only"
          style={{
            position: 'fixed', bottom: 24, right: 24, zIndex: 99999,
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 22px', borderRadius: 12,
            background: 'linear-gradient(135deg,#0c111b,#05080f)',
            border: '1px solid rgba(58,190,255,0.55)',
            boxShadow: '0 0 28px rgba(58,190,255,0.35),0 8px 32px rgba(0,0,0,0.6)',
            color: '#3abeff', fontFamily: "'Fira Code',monospace",
            fontSize: 14, fontWeight: 600,
            animation: 'pwa-in 0.4s ease',
          }}
        >
          <span style={{ fontSize: 18 }}>✓</span>
          CodeShare installed!
        </div>
      )}

      {/* ── Manual instructions (localhost / Safari / Firefox) ────── */}
      {state === 'manual' && (
        <div
          className="pwa-desktop-only"
          role="dialog"
          aria-label="How to install CodeShare"
          style={{
            position: 'fixed', bottom: 24, right: 24, zIndex: 99999,
            width: 340, padding: 20, borderRadius: 16,
            background: 'linear-gradient(135deg,#0c111b,#05080f)',
            border: '1px solid rgba(58,190,255,0.35)',
            boxShadow: '0 0 40px rgba(58,190,255,0.2),0 20px 60px rgba(0,0,0,0.7)',
            animation: 'pwa-in 0.4s ease',
          }}
        >
          <button onClick={handleDismiss} aria-label="Close"
            style={{ position:'absolute',top:10,right:10,background:'none',border:'none',
              color:'rgba(58,190,255,0.5)',cursor:'pointer',fontSize:16,padding:'2px 6px',borderRadius:6 }}>✕</button>

          <p style={{ margin:'0 0 10px',fontFamily:"'Fira Code',monospace",fontWeight:700,
            fontSize:13,color:'#e0f2fe' }}>
            📲 How to install CodeShare
          </p>
          <p style={{ margin:'0 0 12px',fontFamily:"'Fira Code',monospace",fontSize:11,
            color:'rgba(58,190,255,0.65)',lineHeight:1.6 }}>
            <strong style={{color:'#3abeff'}}>Chrome:</strong> Click the <code style={{background:'rgba(58,190,255,0.1)',
            padding:'1px 5px',borderRadius:4}}>⊕</code> icon in the address bar → "Install"<br/>
            <strong style={{color:'#3abeff'}}>Edge:</strong> Click the install icon in the address bar<br/>
            <strong style={{color:'#3abeff'}}>Safari (iOS):</strong> Share → "Add to Home Screen"
          </p>
          <button onClick={handleDismiss}
            style={{ width:'100%',padding:'9px 0',borderRadius:10,border:'1px solid rgba(58,190,255,0.25)',
              background:'transparent',color:'rgba(58,190,255,0.7)',fontFamily:"'Fira Code',monospace",
              fontSize:12,cursor:'pointer' }}>
            Got it
          </button>
        </div>
      )}

      {/* ── Main install banner ────────────────────────────────────── */}
      {(state === 'banner' || state === 'installing') && (
        <div
          id="pwa-install-banner"
          className="pwa-desktop-only"
          role="dialog"
          aria-label="Install CodeShare app"
          style={{
            position: 'fixed', bottom: 24, right: 24, zIndex: 99999,
            width: 'min(360px, calc(100vw - 32px))',
            padding: 20, borderRadius: 16,
            background: 'linear-gradient(135deg,#0c111b 0%,#05080f 100%)',
            border: '1px solid rgba(58,190,255,0.38)',
            boxShadow: '0 0 0 1px rgba(58,190,255,0.08),0 0 40px rgba(58,190,255,0.2),0 20px 60px rgba(0,0,0,0.75)',
            backdropFilter: 'blur(14px)',
            animation: 'pwa-in 0.45s cubic-bezier(0.22,1,0.36,1)',
          }}
        >
          {/* Close button */}
          <button
            id="pwa-close-btn"
            onClick={handleDismiss}
            aria-label="Dismiss"
            style={{ position:'absolute',top:10,right:10,background:'none',border:'none',
              color:'rgba(58,190,255,0.45)',cursor:'pointer',fontSize:16,
              padding:'2px 6px',borderRadius:6,transition:'color 0.2s',lineHeight:1 }}
            onMouseEnter={e => (e.currentTarget.style.color = '#3abeff')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(58,190,255,0.45)')}
          >✕</button>

          {/* Logo row */}
          <div style={{ display:'flex',alignItems:'center',gap:14,marginBottom:14 }}>
            {/* <CS> badge */}
            <div aria-hidden="true" style={{
              width:54, height:54, borderRadius:13,
              background:'linear-gradient(135deg,#0a0f1c,#05070d)',
              border:'1.5px solid rgba(58,190,255,0.55)',
              boxShadow:'0 0 16px rgba(58,190,255,0.25),inset 0 0 8px rgba(58,190,255,0.07)',
              display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,
              fontFamily:"'Fira Code','Courier New',monospace",
              fontWeight:800,fontSize:13,letterSpacing:'-0.5px',color:'#fff',
            }}>
              <span style={{color:'#3abeff',fontWeight:700}}>&lt;</span>CS
              <span style={{color:'#3abeff',fontWeight:700}}>&gt;</span>
            </div>

            <div>
              <p style={{ margin:0,fontFamily:"'Fira Code',monospace",fontWeight:700,
                fontSize:14,color:'#e0f2fe',lineHeight:1.3 }}>
                Install CodeShare
              </p>
              <p style={{ margin:'4px 0 0',fontFamily:"'Fira Code',monospace",fontSize:11,
                color:'rgba(58,190,255,0.6)',lineHeight:1.5 }}>
                Add to your device for offline access.
              </p>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height:1,marginBottom:14,
            background:'linear-gradient(90deg,transparent,rgba(58,190,255,0.2),transparent)' }}/>

          {/* Feature pills */}
          <div style={{ display:'flex',flexWrap:'wrap',gap:6,marginBottom:16 }}>
            {['⚡ Instant','📴 Offline','🖥️ Native','🔔 Alerts'].map(f => (
              <span key={f} style={{
                padding:'3px 9px',borderRadius:20,
                background:'rgba(58,190,255,0.07)',
                border:'1px solid rgba(58,190,255,0.18)',
                fontFamily:"'Fira Code',monospace",fontSize:10,
                color:'rgba(58,190,255,0.75)',
              }}>{f}</span>
            ))}
          </div>

          {/* Buttons */}
          <div style={{ display:'flex',gap:8 }}>
            <button
              id="pwa-install-btn"
              onClick={handleInstall}
              disabled={state === 'installing'}
              style={{
                flex:1,padding:'11px 0',borderRadius:10,border:'none',
                background: state==='installing'
                  ? 'rgba(58,190,255,0.2)'
                  : 'linear-gradient(135deg,#3abeff,#1a8fe0)',
                color: state==='installing' ? 'rgba(255,255,255,0.45)' : '#05070d',
                fontFamily:"'Fira Code',monospace",fontWeight:700,fontSize:13,
                cursor: state==='installing' ? 'not-allowed' : 'pointer',
                letterSpacing:'0.5px',transition:'all 0.2s',
                boxShadow: state==='installing' ? 'none' : '0 0 20px rgba(58,190,255,0.4)',
              }}
            >
              {state === 'installing' ? '⏳ Installing…' : '⬇ Install App'}
            </button>
            <button
              id="pwa-not-now-btn"
              onClick={handleDismiss}
              style={{
                padding:'11px 14px',borderRadius:10,
                background:'transparent',
                border:'1px solid rgba(58,190,255,0.22)',
                color:'rgba(58,190,255,0.55)',
                fontFamily:"'Fira Code',monospace",fontSize:13,
                cursor:'pointer',transition:'all 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor='rgba(58,190,255,0.5)';
                e.currentTarget.style.color='#3abeff';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor='rgba(58,190,255,0.22)';
                e.currentTarget.style.color='rgba(58,190,255,0.55)';
              }}
            >
              Not now
            </button>
          </div>
        </div>
      )}

      <style>{`
        /* Hide floating banner on mobile — sidebar has the button */
        .pwa-desktop-only { display: block !important; }
        @media (max-width: 767px) { .pwa-desktop-only { display: none !important; } }

        @keyframes pwa-in {
          from { opacity:0; transform:translateY(20px) scale(0.97); }
          to   { opacity:1; transform:translateY(0)    scale(1); }
        }
      `}</style>
    </>
  );
};

export default PWAInstallPrompt;
