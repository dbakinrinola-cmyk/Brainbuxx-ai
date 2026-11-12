import React, { useState } from 'react';
import { Download, Smartphone, Check, X, Share } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'navbar' | 'sidebar' | 'banner';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'navbar' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);

  // If already running inside standalone PWA window
  if (isInstalled) {
    if (variant === 'sidebar') {
      return (
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 text-xs font-medium bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/30">
          <Check className="w-3.5 h-3.5" />
          <span>App Installed</span>
        </div>
      );
    }
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        setJustInstalled(true);
        setTimeout(() => setJustInstalled(false), 3000);
      }
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      {variant === 'navbar' && (
        <button
          onClick={handleClick}
          title="Install Brainbuxx AI as a Progressive Web App"
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200/80 dark:border-blue-700/60 rounded-lg shadow-2xs transition-all shrink-0 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Install PWA</span>
          <span className="sm:hidden">Install</span>
        </button>
      )}

      {variant === 'sidebar' && (
        <button
          onClick={handleClick}
          className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-100/60 dark:hover:bg-blue-900/40 border border-blue-200/50 dark:border-blue-900/30 rounded-lg transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Install Brainbuxx PWA</span>
          </div>
          <span className="text-[10px] uppercase font-mono px-1 py-0.5 rounded bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
            PWA
          </span>
        </button>
      )}

      {/* Guided Install Modal for browsers without automatic prompt or iOS Safari */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-neutral-900 p-5 shadow-2xl border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600">
                  <Smartphone className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                  Install Brainbuxx AI
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs text-neutral-600 dark:text-neutral-300">
              <p>
                Install Brainbuxx AI to your home screen or desktop for instantaneous launching, distraction-free windowing, and offline capability.
              </p>

              {isIOS ? (
                <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 space-y-2">
                  <p className="font-semibold text-neutral-800 dark:text-neutral-200">
                    To install on iPhone or iPad:
                  </p>
                  <ol className="list-decimal pl-4 space-y-1 text-neutral-600 dark:text-neutral-400">
                    <li className="flex items-center gap-1.5">
                      <span>1. Tap the</span>
                      <Share className="w-3.5 h-3.5 text-blue-600 inline" />
                      <span><strong>Share</strong> button in Safari toolbar.</span>
                    </li>
                    <li>2. Scroll down and tap <strong>Add to Home Screen</strong>.</li>
                    <li>3. Tap <strong>Add</strong> in the top right corner.</li>
                  </ol>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 space-y-1.5">
                  <p className="font-semibold text-neutral-800 dark:text-neutral-200">
                    Browser installation:
                  </p>
                  <p>
                    Click the <strong>Install</strong> icon in your browser address bar or menu, or press the install button.
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-1">
              {isInstallable && (
                <button
                  onClick={async () => {
                    await install();
                    setShowModal(false);
                  }}
                  className="flex-1 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
                >
                  Prompt Install Now
                </button>
              )}
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-xl transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
