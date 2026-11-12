import React, { useState } from 'react';
import {
  Menu,
  Plus,
  Sparkles,
  Sun,
  Moon,
  Settings,
  Image as ImageIcon,
  Check,
  Edit2,
} from 'lucide-react';
import { ThemeMode } from '../types';
import { PWAInstallButton } from './PWAInstallButton';

interface NavbarProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  activeTitle?: string;
  onRenameTitle?: (newTitle: string) => void;
  onNewChat: () => void;
  onOpenImageStudio: () => void;
  onOpenSettings: () => void;
  currentTheme: ThemeMode;
  onToggleTheme: () => void;
  selectedModel: string;
  onSelectModel: (model: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  sidebarOpen,
  onToggleSidebar,
  activeTitle = 'New Conversation',
  onRenameTitle,
  onNewChat,
  onOpenImageStudio,
  onOpenSettings,
  currentTheme,
  onToggleTheme,
  selectedModel,
  onSelectModel,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(activeTitle);
  const [showModelMenu, setShowModelMenu] = useState(false);

  const handleTitleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempTitle.trim() && onRenameTitle) {
      onRenameTitle(tempTitle.trim());
    }
    setIsEditingTitle(false);
  };

  const models = [
    {
      id: 'gemini-3.8-flash',
      name: 'Gemini 3.8 Flash',
      tag: 'Fast & Versatile',
      desc: 'Optimal balance of speed, multimodal reasoning, and coding.',
    },
    {
      id: 'gemini-3.1-flash-lite',
      name: 'Gemini 3.1 Flash Lite',
      tag: 'Ultra Fast',
      desc: 'Rapid conversational responses with minimal latency.',
    },
  ];

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-3 sm:px-4 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm border-b border-neutral-200/80 dark:border-neutral-800 transition-colors">
      {/* Left zone: Sidebar toggle + Title */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          className="p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Brand or Conversation Title */}
        <div className="flex items-center gap-2 min-w-0">
          {isEditingTitle ? (
            <form onSubmit={handleTitleSubmit} className="flex items-center gap-1.5">
              <input
                type="text"
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                autoFocus
                onBlur={handleTitleSubmit}
                className="px-2 py-0.5 text-sm font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded border border-neutral-300 dark:border-neutral-700 outline-none focus:ring-1 focus:ring-blue-500 w-44 sm:w-60"
              />
              <button
                type="submit"
                className="p-1 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
              >
                <Check className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-1.5 group min-w-0">
              <h1 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 truncate max-w-[150px] sm:max-w-xs md:max-w-md">
                {activeTitle}
              </h1>
              {onRenameTitle && (
                <button
                  onClick={() => {
                    setTempTitle(activeTitle);
                    setIsEditingTitle(true);
                  }}
                  className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded transition-opacity"
                  title="Rename title"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right zone: Model picker + Image Studio + New Chat + Theme + Settings */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Model Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowModelMenu(!showModelMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200/70 dark:hover:bg-neutral-700 rounded-lg transition-colors border border-neutral-200/60 dark:border-neutral-700/60"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="hidden sm:inline">
              {models.find((m) => m.id === selectedModel)?.name || 'Gemini 3.8 Flash'}
            </span>
            <span className="sm:hidden">Gemini</span>
          </button>

          {showModelMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowModelMenu(false)}
              />
              <div className="absolute right-0 mt-1.5 w-64 bg-white dark:bg-neutral-800 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-700 p-1.5 z-50">
                <div className="px-2.5 py-1.5 text-[11px] font-semibold text-neutral-400 dark:text-neutral-400 uppercase tracking-wider">
                  Select Engine
                </div>
                {models.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      onSelectModel(m.id);
                      setShowModelMenu(false);
                    }}
                    className={`w-full text-left p-2 rounded-lg transition-colors flex flex-col gap-0.5 ${
                      selectedModel === m.id
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-950 dark:text-blue-200'
                        : 'hover:bg-neutral-100 dark:hover:bg-neutral-700/60 text-neutral-800 dark:text-neutral-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold">{m.name}</span>
                      <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-mono">
                        {m.tag}
                      </span>
                    </div>
                    <span className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-1">
                      {m.desc}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Clickable PWA Install Button */}
        <PWAInstallButton variant="navbar" />

        {/* Create Image Shortcut */}
        <button
          onClick={onOpenImageStudio}
          className="hidden md:flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          title="AI Image Generator"
        >
          <ImageIcon className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
          <span>Create Image</span>
        </button>

        {/* New Chat Button */}
        <button
          onClick={onNewChat}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 rounded-lg shadow-sm transition-colors"
          title="Start new conversation"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New Chat</span>
        </button>

        {/* Dark/Light mode toggle */}
        <button
          onClick={onToggleTheme}
          aria-label="Toggle theme"
          className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          {currentTheme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-neutral-600" />
          )}
        </button>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          aria-label="Open Settings"
          className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
