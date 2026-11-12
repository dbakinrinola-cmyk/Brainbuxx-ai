import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  MessageSquare,
  Pin,
  Trash2,
  Settings,
  Image as ImageIcon,
  ChevronLeft,
  X,
  Sparkles,
} from 'lucide-react';
import { Conversation } from '../types';
import { PWAInstallButton } from './PWAInstallButton';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
  onTogglePin: (id: string) => void;
  onOpenImageStudio: () => void;
  onOpenSettings: () => void;
  userEmail?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onTogglePin,
  onOpenImageStudio,
  onOpenSettings,
  userEmail = 'User',
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter conversations by search term
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.messages.some((m) => m.content.toLowerCase().includes(q))
    );
  }, [conversations, searchQuery]);

  // Separate pinned and chronological groups
  const pinnedConversations = useMemo(() => {
    return filteredConversations.filter((c) => c.isPinned);
  }, [filteredConversations]);

  const chronologicalGroups = useMemo(() => {
    const unpinned = filteredConversations.filter((c) => !c.isPinned);
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    const today: Conversation[] = [];
    const yesterday: Conversation[] = [];
    const pastWeek: Conversation[] = [];
    const older: Conversation[] = [];

    unpinned.forEach((c) => {
      const diff = now - (c.updatedAt || c.createdAt);
      if (diff < oneDay) {
        today.push(c);
      } else if (diff < 2 * oneDay) {
        yesterday.push(c);
      } else if (diff < 7 * oneDay) {
        pastWeek.push(c);
      } else {
        older.push(c);
      }
    });

    return [
      { label: 'Today', items: today },
      { label: 'Yesterday', items: yesterday },
      { label: 'Previous 7 Days', items: pastWeek },
      { label: 'Older', items: older },
    ].filter((g) => g.items.length > 0);
  }, [filteredConversations]);

  return (
    <>
      {/* Mobile backdrop overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 flex flex-col w-[270px] sm:w-[280px] bg-neutral-50/90 dark:bg-neutral-900 border-r border-neutral-200/80 dark:border-neutral-800 transition-transform duration-300 ease-in-out shrink-0 select-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:-translate-x-full md:w-0 md:border-r-0 md:overflow-hidden'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-14 px-4 border-b border-neutral-200/60 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-neutral-900 flex items-center justify-center text-white shadow-xs">
              <svg
                className="w-4.5 h-4.5"
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
            <div className="flex flex-col">
              <span className="font-semibold text-sm tracking-tight text-neutral-900 dark:text-neutral-100">
                Brainbuxx AI
              </span>
              <span className="text-[10px] text-neutral-400 font-sans tracking-wide">
                VHS Science & Innovation
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Collapse sidebar"
            className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-200/50 dark:hover:bg-neutral-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 hidden md:block" />
            <X className="w-4 h-4 md:hidden" />
          </button>
        </div>

        {/* Primary Action Buttons: New Chat & Image Studio & PWA */}
        <div className="p-3 space-y-2">
          <button
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 768) onClose();
            }}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-neutral-800 dark:text-neutral-100 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700/80 rounded-xl border border-neutral-200/80 dark:border-neutral-700/80 shadow-2xs transition-all group"
          >
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
              <span>New Conversation</span>
            </div>
            <span className="text-[10px] font-mono text-neutral-400 px-1 py-0.5 rounded bg-neutral-100 dark:bg-neutral-700">
              Ctrl+N
            </span>
          </button>

          <button
            onClick={() => {
              onOpenImageStudio();
              if (window.innerWidth < 768) onClose();
            }}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/40 dark:hover:bg-neutral-800/80 rounded-lg transition-colors"
          >
            <ImageIcon className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>AI Image Studio</span>
          </button>

          {/* Clickable PWA Install Button */}
          <PWAInstallButton variant="sidebar" />
        </div>

        {/* Search input */}
        <div className="px-3 pb-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-neutral-200/40 dark:bg-neutral-800/60 border border-transparent focus:border-neutral-300 dark:focus:border-neutral-700 focus:bg-white dark:focus:bg-neutral-800 text-neutral-800 dark:text-neutral-200 rounded-lg outline-none transition-all placeholder:text-neutral-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-2 p-0.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Conversations List Scroll Area */}
        <div className="flex-1 overflow-y-auto px-3 py-1 space-y-4">
          {/* Pinned Section */}
          {pinnedConversations.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 px-2 mb-1 text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                <Pin className="w-3 h-3 text-blue-500" />
                <span>Saved & Pinned</span>
              </div>
              <div className="space-y-0.5">
                {pinnedConversations.map((conv) => (
                  <ConversationItem
                    key={conv.id}
                    conversation={conv}
                    isActive={conv.id === activeConversationId}
                    onSelect={() => {
                      onSelectConversation(conv.id);
                      if (window.innerWidth < 768) onClose();
                    }}
                    onTogglePin={() => onTogglePin(conv.id)}
                    onDelete={() => onDeleteConversation(conv.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Chronological groups */}
          {chronologicalGroups.map((group) => (
            <div key={group.label}>
              <div className="px-2 mb-1 text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                {group.label}
              </div>
              <div className="space-y-0.5">
                {group.items.map((conv) => (
                  <ConversationItem
                    key={conv.id}
                    conversation={conv}
                    isActive={conv.id === activeConversationId}
                    onSelect={() => {
                      onSelectConversation(conv.id);
                      if (window.innerWidth < 768) onClose();
                    }}
                    onTogglePin={() => onTogglePin(conv.id)}
                    onDelete={() => onDeleteConversation(conv.id)}
                  />
                ))}
              </div>
            </div>
          ))}

          {filteredConversations.length === 0 && (
            <div className="py-8 text-center text-xs text-neutral-400 dark:text-neutral-500">
              {searchQuery ? 'No matching conversations' : 'No past conversations yet.'}
            </div>
          )}
        </div>

        {/* Footer: User Profile + Settings */}
        <div className="p-3 border-t border-neutral-200/60 dark:border-neutral-800 space-y-1">
          <button
            onClick={onOpenSettings}
            className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/50 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2">
              <Settings className="w-3.5 h-3.5" />
              <span>Settings & Preferences</span>
            </div>
          </button>

          {/* User profile row */}
          <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-neutral-100/70 dark:bg-neutral-800/50 border border-neutral-200/50 dark:border-neutral-700/50">
            <div className="w-7 h-7 rounded-full bg-blue-600/10 text-blue-600 dark:text-blue-400 font-semibold text-xs flex items-center justify-center">
              {userEmail.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200 truncate">
                {userEmail}
              </span>
              <span className="text-[10px] text-neutral-400 truncate">
                Pro Workspace
              </span>
            </div>
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          </div>

          <div className="pt-1 px-1 text-center">
            <span className="text-[10px] text-neutral-400/80 dark:text-neutral-500 font-sans">
              Developed by VHS Science and Innovation
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};

// Reusable individual conversation row item
interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onSelect: () => void;
  onTogglePin: () => void;
  onDelete: () => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isActive,
  onSelect,
  onTogglePin,
  onDelete,
}) => {
  return (
    <div
      onClick={onSelect}
      className={`group relative flex items-center justify-between px-2.5 py-2 text-xs rounded-lg cursor-pointer transition-colors ${
        isActive
          ? 'bg-neutral-200/80 dark:bg-neutral-800 text-neutral-900 dark:text-white font-medium shadow-2xs'
          : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/50 hover:text-neutral-900 dark:hover:text-neutral-200'
      }`}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1 pr-2">
        <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-70" />
        <span className="truncate">{conversation.title || 'Untitled conversation'}</span>
      </div>

      {/* Hover action buttons */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin();
          }}
          className={`p-1 rounded hover:bg-neutral-300/60 dark:hover:bg-neutral-700 transition-colors ${
            conversation.isPinned ? 'text-blue-600 opacity-100' : 'text-neutral-400'
          }`}
          title={conversation.isPinned ? 'Unpin' : 'Pin conversation'}
        >
          <Pin className="w-3 h-3" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 rounded text-neutral-400 hover:text-red-600 hover:bg-neutral-300/60 dark:hover:bg-neutral-700 transition-colors"
          title="Delete conversation"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
