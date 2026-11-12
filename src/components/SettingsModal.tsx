import React, { useState, useEffect } from 'react';
import {
  X,
  Sun,
  Moon,
  Laptop,
  Type,
  Volume2,
  Trash2,
  ShieldCheck,
  Info,
  Sparkles,
  RotateCcw,
  Check,
} from 'lucide-react';
import { UserSettings, ThemeMode, FontSize } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onClearAllHistory: () => void;
  onReplaySplash: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onClearAllHistory,
  onReplaySplash,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'voice' | 'personalisation' | 'about'>('general');
  const [confirmClear, setConfirmClear] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [customInstructions, setCustomInstructions] = useState(settings.customInstructions || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const updateVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
      };
      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  if (!isOpen) return null;

  const handleSaveCustomInstructions = () => {
    onUpdateSettings({ customInstructions });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs">
      <div className="relative flex flex-col w-full max-w-2xl max-h-[90vh] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200/80 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              Settings & Preferences
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-5 pt-3 border-b border-neutral-200/60 dark:border-neutral-800 overflow-x-auto">
          {[
            { id: 'general', label: 'General' },
            { id: 'personalisation', label: 'Personalisation' },
            { id: 'voice', label: 'Voice & Speech' },
            { id: 'about', label: 'About & Privacy' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-2 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              {/* Appearance */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
                  Appearance Theme
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'light', label: 'Light', icon: Sun },
                    { id: 'dark', label: 'Dark', icon: Moon },
                    { id: 'system', label: 'System', icon: Laptop },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => onUpdateSettings({ theme: item.id as ThemeMode })}
                        className={`flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-medium border transition-all ${
                          settings.theme === item.id
                            ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-900/30 text-blue-900 dark:text-blue-200 font-semibold'
                            : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Text Size */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
                  Reading Text Size
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'small', label: 'Compact', size: '14px' },
                    { id: 'medium', label: 'Default', size: '16px' },
                    { id: 'large', label: 'Spacious', size: '18px' },
                  ].map((size) => (
                    <button
                      key={size.id}
                      onClick={() => onUpdateSettings({ fontSize: size.id as FontSize })}
                      className={`p-2.5 rounded-xl text-xs border text-center transition-all ${
                        settings.fontSize === size.id
                          ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-900/30 text-blue-900 dark:text-blue-200 font-semibold'
                          : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                      }`}
                    >
                      <div className="font-medium">{size.label}</div>
                      <div className="text-[10px] text-neutral-400">{size.size}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Replay Intro Animation */}
              <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200 block">
                    Brainbuxx Opening Animation
                  </span>
                  <span className="text-[11px] text-neutral-400 block">
                    Replay the handwritten cursive logo reveal sequence
                  </span>
                </div>
                <button
                  onClick={() => {
                    onReplaySplash();
                    onClose();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Replay Intro</span>
                </button>
              </div>

              {/* Clear History */}
              <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <span className="text-xs font-semibold text-red-600 dark:text-red-400 block mb-1">
                  Danger Zone
                </span>
                {!confirmClear ? (
                  <button
                    onClick={() => setConfirmClear(true)}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-900/50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear all conversation history</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60">
                    <span className="text-xs text-red-700 dark:text-red-300 flex-1">
                      Are you sure? This cannot be undone.
                    </span>
                    <button
                      onClick={() => {
                        onClearAllHistory();
                        setConfirmClear(false);
                      }}
                      className="px-2.5 py-1 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded transition-colors"
                    >
                      Yes, Clear All
                    </button>
                    <button
                      onClick={() => setConfirmClear(false)}
                      className="px-2 py-1 text-xs text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/50 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Personalisation Tab */}
          {activeTab === 'personalisation' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
                  Custom Instructions
                </label>
                <p className="text-xs text-neutral-500 mb-2">
                  What would you like Brainbuxx to know about you to provide better, more tailored responses? (e.g. "I am a senior frontend engineer, prefer concise code samples without fluff.")
                </p>
                <textarea
                  rows={5}
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  placeholder="Tell Brainbuxx your role, communication style, or domain preferences..."
                  className="w-full p-3 text-xs sm:text-sm bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-xl outline-none focus:ring-1 focus:ring-blue-500 text-neutral-900 dark:text-neutral-100 resize-y"
                />
              </div>

              <div className="flex items-center justify-between">
                {savedSuccess ? (
                  <span className="text-xs text-emerald-600 flex items-center gap-1 font-medium">
                    <Check className="w-3.5 h-3.5" />
                    Instructions saved successfully
                  </span>
                ) : (
                  <span className="text-[11px] text-neutral-400">
                    Applied automatically to future prompts.
                  </span>
                )}
                <button
                  onClick={handleSaveCustomInstructions}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          )}

          {/* Voice Tab */}
          {activeTab === 'voice' && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                  Speech Rate ({settings.voiceSpeed}x)
                </label>
                <input
                  type="range"
                  min="0.75"
                  max="1.5"
                  step="0.05"
                  value={settings.voiceSpeed}
                  onChange={(e) =>
                    onUpdateSettings({ voiceSpeed: parseFloat(e.target.value) })
                  }
                  className="w-full accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-neutral-400 mt-0.5">
                  <span>Slow (0.75x)</span>
                  <span>Normal (1.0x)</span>
                  <span>Fast (1.5x)</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                  Speech Pitch ({settings.voicePitch})
                </label>
                <input
                  type="range"
                  min="0.8"
                  max="1.2"
                  step="0.05"
                  value={settings.voicePitch}
                  onChange={(e) =>
                    onUpdateSettings({ voicePitch: parseFloat(e.target.value) })
                  }
                  className="w-full accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-neutral-400 mt-0.5">
                  <span>Deep</span>
                  <span>Default</span>
                  <span>High</span>
                </div>
              </div>

              {availableVoices.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                    Synthesizer Voice
                  </label>
                  <select
                    value={settings.voiceVoiceURI || ''}
                    onChange={(e) => onUpdateSettings({ voiceVoiceURI: e.target.value })}
                    className="w-full p-2.5 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl outline-none text-neutral-800 dark:text-neutral-200"
                  >
                    <option value="">Default System Voice</option>
                    {availableVoices.map((voice) => (
                      <option key={voice.voiceURI} value={voice.voiceURI}>
                        {voice.name} ({voice.lang})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* About & Privacy Tab */}
          {activeTab === 'about' && (
            <div className="space-y-4 text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700">
                <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center shrink-0">
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2a4 4 0 0 0-4 4v1H7a5 5 0 0 0-5 5c0 2.2 1.4 4 3.4 4.7.2 2.5 2.1 4.3 4.6 4.3h4a4 4 0 0 0 4-4v-1h1a5 5 0 0 0 5-5c0-2.2-1.4-4-3.4-4.7-.2-2.5-2.1-4.3-4.6-4.3h-1V6a4 4 0 0 0-4-4Z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 dark:text-white">
                    Brainbuxx AI
                  </h3>
                  <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                    Developed by VHS Science and Innovation
                  </p>
                  <p className="text-[11px] text-neutral-400">
                    "Think Clearly. Create Freely."
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
                  Engine & Research
                </h4>
                <p>
                  Engineered and developed by VHS Science and Innovation. Brainbuxx AI combines Google Gemini models with conversational context-awareness, remembering full dialog trajectories, document analyses (PDF, spreadsheets, text), and creative visual workflows.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
                  Progressive Web App (PWA)
                </h4>
                <p>
                  Built as a standalone, installable PWA. Click the "Install PWA" button in the navigation bar or sidebar to add Brainbuxx AI to your home screen or desktop application launcher.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-neutral-800 dark:text-neutral-200 mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Privacy & Storage Notice</span>
                </h4>
                <p>
                  Conversations and settings are stored locally on your device using client-side persistent storage. API keys and sensitive requests are handled securely via server-side execution without exposing secret tokens.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
