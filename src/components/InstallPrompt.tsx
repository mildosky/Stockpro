import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if previously dismissed
    const dismissed = localStorage.getItem('install_dismissed');
    if (dismissed) {
      const dismissedDate = new Date(dismissed);
      const hoursSinceDismissed = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60);
      if (hoursSinceDismissed < 24) return; // Don't show again for 24 hours
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Auto-show after 5 seconds if not dismissed
    const timer = setTimeout(() => {
      if (!isInstalled && !localStorage.getItem('install_dismissed')) {
        setShowPrompt(true);
      }
    }, 5000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      clearTimeout(timer);
    };
  }, [isInstalled]);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      // Show manual install instructions
      alert(
        'To install StockPro as a standalone app:\n\n' +
        '• Chrome/Edge: Click the install icon (⊕) in the address bar\n' +
        '• Safari (Mac): File → Add to Dock\n' +
        '• Safari (iOS): Share → Add to Home Screen\n' +
        '• Firefox: Click the install icon in the address bar'
      );
      setShowPrompt(false);
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('install_dismissed', new Date().toISOString());
  };

  if (isInstalled || !showPrompt) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white rounded-xl shadow-2xl border border-slate-200 p-4 max-w-sm animate-[slideUp_0.3s_ease-out]">
      <button onClick={handleDismiss} className="absolute top-2 right-2 p-1 hover:bg-slate-100 rounded-lg text-slate-400">
        <X size={14} />
      </button>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <Download size={18} className="text-indigo-600" />
        </div>
        <div>
          <h3 className="font-semibold text-sm text-slate-800">Install StockPro</h3>
          <p className="text-xs text-slate-500 mt-1">
            Install as a standalone desktop app for offline access and a better experience.
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleInstall}
              className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700"
            >
              Install App
            </button>
            <button
              onClick={handleDismiss}
              className="px-3 py-1.5 text-slate-500 text-xs font-medium hover:bg-slate-100 rounded-lg"
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
