import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Conversation,
  Message,
  FileAttachment,
  GeneratedImageItem,
  UserSettings,
} from './types';
import {
  loadConversations,
  saveConversations,
  loadCurrentConversationId,
  saveCurrentConversationId,
  loadSettings,
  saveSettings,
  loadImageGallery,
  saveImageGallery,
  hasPlayedSplashThisSession,
  markSplashPlayedThisSession,
} from './utils/storage';
import { SplashScreen } from './components/SplashScreen';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { WelcomeView } from './components/WelcomeView';
import { ChatMessage } from './components/ChatMessage';
import { ChatComposer } from './components/ChatComposer';
import { ImageStudioModal } from './components/ImageStudioModal';
import { SettingsModal } from './components/SettingsModal';
import { VoiceSpeechBar } from './components/VoiceSpeechBar';

export default function App() {
  // Splash Screen State
  const [showSplash, setShowSplash] = useState<boolean>(() => !hasPlayedSplashThisSession());

  // Settings State
  const [settings, setSettings] = useState<UserSettings>(() => loadSettings());

  // Conversations State
  const [conversations, setConversations] = useState<Conversation[]>(() => loadConversations());
  const [activeConvId, setActiveConvId] = useState<string | null>(() => {
    const savedId = loadCurrentConversationId();
    const loaded = loadConversations();
    if (savedId && loaded.some((c) => c.id === savedId)) {
      return savedId;
    }
    return loaded.length > 0 ? loaded[0].id : null;
  });

  // UI Modals & Drawers
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isImageStudioOpen, setIsImageStudioOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [imageGallery, setImageGallery] = useState<GeneratedImageItem[]>(() => loadImageGallery());

  // Generation & Streaming State
  const [isGenerating, setIsGenerating] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Voice Text-to-Speech State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSpeechPaused, setIsSpeechPaused] = useState(false);
  const [currentSpeakingText, setCurrentSpeakingText] = useState<string | null>(null);

  // Save changes to localStorage
  useEffect(() => {
    saveConversations(conversations);
  }, [conversations]);

  useEffect(() => {
    saveCurrentConversationId(activeConvId);
  }, [activeConvId]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    saveImageGallery(imageGallery);
  }, [imageGallery]);

  // Handle Theme switching (Light / Dark / System)
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (settings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System mode
      const isDarkSystem = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDarkSystem) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [settings.theme]);

  // Adjust default mobile sidebar visibility on initial load
  useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, []);

  // Keyboard shortcut: Ctrl+N / Cmd+N for New Chat
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleNewChat();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Active conversation helper
  const activeConversation = conversations.find((c) => c.id === activeConvId);
  const activeMessages = activeConversation?.messages || [];

  // Scroll to bottom when new messages arrive
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  useEffect(() => {
    scrollToBottom('smooth');
  }, [activeMessages.length, isGenerating, scrollToBottom]);

  // Splash complete handler
  const handleSplashComplete = () => {
    markSplashPlayedThisSession();
    setShowSplash(false);
  };

  // Create New Chat
  const handleNewChat = () => {
    const newConv: Conversation = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: 'New Conversation',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConvId(newConv.id);
    stopSpeaking();
  };

  // Delete Conversation
  const handleDeleteConversation = (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConvId === id) {
      const remaining = conversations.filter((c) => c.id !== id);
      setActiveConvId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  // Toggle Pin / Favorite
  const handleTogglePin = (id: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isPinned: !c.isPinned } : c))
    );
  };

  // Rename Conversation Title
  const handleRenameTitle = (newTitle: string) => {
    if (!activeConvId) return;
    setConversations((prev) =>
      prev.map((c) => (c.id === activeConvId ? { ...c, title: newTitle } : c))
    );
  };

  // Stop Generation
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);

    // Turn off streaming indicator on messages
    if (activeConvId) {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== activeConvId) return c;
          return {
            ...c,
            messages: c.messages.map((m) => ({ ...m, isStreaming: false })),
          };
        })
      );
    }
  };

  // Send Message Flow
  const handleSendMessage = async (
    content: string,
    attachments: FileAttachment[] = [],
    isRegeneration: boolean = false
  ) => {
    let currentConvId = activeConvId;

    // Create a new conversation if none exists
    if (!currentConvId || !conversations.some((c) => c.id === currentConvId)) {
      const newConv: Conversation = {
        id: `conv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        title: content ? content.slice(0, 30) : 'New Conversation',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [],
      };
      setConversations((prev) => [newConv, ...prev]);
      currentConvId = newConv.id;
      setActiveConvId(newConv.id);
    }

    const userMessageId = `msg_user_${Date.now()}`;
    const aiMessageId = `msg_ai_${Date.now()}`;

    const userMessage: Message = {
      id: userMessageId,
      role: 'user',
      content: content,
      timestamp: Date.now(),
      attachments: attachments,
    };

    const aiPlaceholder: Message = {
      id: aiMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true,
      modelUsed: settings.selectedModel,
    };

    // Update conversation with user message and AI placeholder
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id !== currentConvId) return conv;
        const updatedMessages = isRegeneration
          ? [...conv.messages, aiPlaceholder]
          : [...conv.messages, userMessage, aiPlaceholder];
        return {
          ...conv,
          updatedAt: Date.now(),
          messages: updatedMessages,
        };
      })
    );

    setIsGenerating(true);
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      // Find current conversation messages up to this point
      const currentConv = conversations.find((c) => c.id === currentConvId);
      const historyMessages = isRegeneration
        ? currentConv?.messages || []
        : [...(currentConv?.messages || []), userMessage];

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          messages: historyMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          attachments: attachments,
          model: settings.selectedModel,
          customInstruction: settings.customInstructions,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulatedText = '';

      if (reader) {
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.replace('data: ', '').trim());
                if (data.error) {
                  throw new Error(data.error);
                }
                if (data.text) {
                  accumulatedText += data.text;
                  // Update message streaming content
                  setConversations((prev) =>
                    prev.map((c) => {
                      if (c.id !== currentConvId) return c;
                      return {
                        ...c,
                        messages: c.messages.map((m) =>
                          m.id === aiMessageId
                            ? { ...m, content: accumulatedText, isStreaming: true }
                            : m
                        ),
                      };
                    })
                  );
                }
              } catch (parseErr) {
                console.warn('Error parsing stream event', parseErr);
              }
            }
          }
        }
      }

      // Finalize message
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== currentConvId) return c;
          return {
            ...c,
            messages: c.messages.map((m) =>
              m.id === aiMessageId
                ? {
                    ...m,
                    content: accumulatedText || 'Brainbuxx response completed.',
                    isStreaming: false,
                  }
                : m
            ),
          };
        })
      );

      // Auto-generate title for first exchange
      const activeConvObj = conversations.find((c) => c.id === currentConvId);
      if (
        activeConvObj &&
        (activeConvObj.title === 'New Conversation' || activeConvObj.messages.length <= 2)
      ) {
        fetch('/api/title', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userMessage: content,
            aiResponse: accumulatedText,
          }),
        })
          .then((r) => r.json())
          .then((data) => {
            if (data?.title) {
              setConversations((prev) =>
                prev.map((c) =>
                  c.id === currentConvId ? { ...c, title: data.title } : c
                )
              );
            }
          })
          .catch(() => {});
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Generation aborted by user.');
      } else {
        console.error('Chat error:', err);
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id !== currentConvId) return c;
            return {
              ...c,
              messages: c.messages.map((m) =>
                m.id === aiMessageId
                  ? {
                      ...m,
                      isStreaming: false,
                      error: err.message || 'Failed to complete response.',
                    }
                  : m
              ),
            };
          })
        );
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  // Regenerate Response
  const handleRegenerate = () => {
    if (!activeConversation || activeMessages.length === 0 || isGenerating) return;

    // Find last user message
    let lastUserIndex = -1;
    for (let i = activeMessages.length - 1; i >= 0; i--) {
      if (activeMessages[i].role === 'user') {
        lastUserIndex = i;
        break;
      }
    }

    if (lastUserIndex === -1) return;

    const lastUserMessage = activeMessages[lastUserIndex];
    // Remove subsequent AI messages
    const trimmedMessages = activeMessages.slice(0, lastUserIndex + 1);

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConvId ? { ...c, messages: trimmedMessages } : c
      )
    );

    // Resend
    handleSendMessage(
      lastUserMessage.content,
      lastUserMessage.attachments || [],
      true
    );
  };

  // Edit User Message & Resend
  const handleEditUserMessage = (messageId: string, newContent: string) => {
    if (!activeConversation || isGenerating) return;

    const targetIdx = activeMessages.findIndex((m) => m.id === messageId);
    if (targetIdx === -1) return;

    const oldAttachments = activeMessages[targetIdx].attachments || [];
    // Slice conversation up to this edited user message
    const trimmedMessages = activeMessages.slice(0, targetIdx);

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConvId ? { ...c, messages: trimmedMessages } : c
      )
    );

    // Send updated content
    handleSendMessage(newContent, oldAttachments);
  };

  // Feedback (Like / Dislike)
  const handleFeedback = (messageId: string, feedback: 'like' | 'dislike') => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== activeConvId) return c;
        return {
          ...c,
          messages: c.messages.map((m) =>
            m.id === messageId
              ? { ...m, feedback: m.feedback === feedback ? null : feedback }
              : m
          ),
        };
      })
    );
  };

  // Voice Text-to-Speech Engine
  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    // Strip markdown formatting for cleaner speech
    const cleanText = text
      .replace(/```[\s\S]*?```/g, 'Code block omitted.')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/[#*_~>]/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = settings.voiceSpeed || 1.0;
    utterance.pitch = settings.voicePitch || 1.0;

    if (settings.voiceVoiceURI) {
      const voices = window.speechSynthesis.getVoices();
      const match = voices.find((v) => v.voiceURI === settings.voiceVoiceURI);
      if (match) utterance.voice = match;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsSpeechPaused(false);
      setCurrentSpeakingText(text);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsSpeechPaused(false);
      setCurrentSpeakingText(null);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsSpeechPaused(false);
      setCurrentSpeakingText(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  const pauseSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.pause();
      setIsSpeechPaused(true);
    }
  };

  const resumeSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.resume();
      setIsSpeechPaused(false);
    }
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsSpeechPaused(false);
      setCurrentSpeakingText(null);
    }
  };

  // Image Studio Handlers
  const handleImageGenerated = (image: GeneratedImageItem) => {
    setImageGallery((prev) => [image, ...prev]);
  };

  const handleSendImageToChat = (prompt: string, imageUrl: string) => {
    handleSendMessage(prompt, [
      {
        id: `att_img_${Date.now()}`,
        name: 'generated_image.png',
        size: 250000,
        type: 'image',
        mimeType: 'image/png',
        previewUrl: imageUrl,
        data: imageUrl.replace(/^data:image\/[a-z]+;base64,/, ''),
      },
    ]);
  };

  // Clear all history
  const handleClearAllHistory = () => {
    setConversations([]);
    setActiveConvId(null);
    localStorage.removeItem('brainbuxx_conversations_v1');
    localStorage.removeItem('brainbuxx_current_conv_id_v1');
  };

  // Replay splash screen
  const handleReplaySplash = () => {
    setShowSplash(true);
  };

  // Font size multiplier class
  const fontSizeClass =
    settings.fontSize === 'small'
      ? 'text-sm'
      : settings.fontSize === 'large'
      ? 'text-lg'
      : 'text-base';

  return (
    <div className={`flex h-screen w-screen overflow-hidden bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 ${fontSizeClass}`}>
      {/* Opening Splash Screen */}
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}

      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        conversations={conversations}
        activeConversationId={activeConvId}
        onSelectConversation={(id) => {
          setActiveConvId(id);
          stopSpeaking();
        }}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
        onTogglePin={handleTogglePin}
        onOpenImageStudio={() => setIsImageStudioOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        userEmail="Workspace User"
      />

      {/* Main Chat Workspace */}
      <main className="flex-1 flex flex-col h-full min-w-0 bg-white dark:bg-neutral-900 relative">
        {/* Top Navbar */}
        <Navbar
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          activeTitle={activeConversation?.title || 'Brainbuxx AI'}
          onRenameTitle={handleRenameTitle}
          onNewChat={handleNewChat}
          onOpenImageStudio={() => setIsImageStudioOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          currentTheme={settings.theme}
          onToggleTheme={() =>
            setSettings((prev) => ({
              ...prev,
              theme: prev.theme === 'dark' ? 'light' : 'dark',
            }))
          }
          selectedModel={settings.selectedModel}
          onSelectModel={(model) => setSettings((prev) => ({ ...prev, selectedModel: model }))}
        />

        {/* Chat Messages Viewport */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {activeMessages.length === 0 ? (
            <WelcomeView
              onSelectPrompt={(prompt) => handleSendMessage(prompt)}
              onOpenImageStudio={() => setIsImageStudioOpen(true)}
            />
          ) : (
            <div className="py-4 space-y-1">
              {activeMessages.map((message, idx) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  isLastAiMessage={
                    message.role === 'assistant' && idx === activeMessages.length - 1
                  }
                  onRegenerate={handleRegenerate}
                  onEditUserMessage={handleEditUserMessage}
                  onFeedback={handleFeedback}
                  onSpeak={speakText}
                  isSpeakingThis={currentSpeakingText === message.content}
                  onStopSpeaking={stopSpeaking}
                />
              ))}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          )}
        </div>

        {/* Floating Voice Speech Controls Bar */}
        <VoiceSpeechBar
          isSpeaking={isSpeaking}
          isPaused={isSpeechPaused}
          onPause={pauseSpeaking}
          onResume={resumeSpeaking}
          onStop={stopSpeaking}
        />

        {/* Bottom Message Input Area */}
        <ChatComposer
          onSendMessage={handleSendMessage}
          onStopGeneration={handleStopGeneration}
          isGenerating={isGenerating}
          onOpenImageStudio={() => setIsImageStudioOpen(true)}
        />
      </main>

      {/* Dedicated Image Studio Modal */}
      <ImageStudioModal
        isOpen={isImageStudioOpen}
        onClose={() => setIsImageStudioOpen(false)}
        imageGallery={imageGallery}
        onImageGenerated={handleImageGenerated}
        onSendToChat={handleSendImageToChat}
      />

      {/* Settings & Preferences Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={(newVals) => setSettings((prev) => ({ ...prev, ...newVals }))}
        onClearAllHistory={handleClearAllHistory}
        onReplaySplash={handleReplaySplash}
      />
    </div>
  );
}
