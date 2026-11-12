import { Conversation, GeneratedImageItem, UserSettings } from '../types';

const STORAGE_KEYS = {
  CONVERSATIONS: 'brainbuxx_conversations_v1',
  CURRENT_CONVERSATION_ID: 'brainbuxx_current_conv_id_v1',
  SETTINGS: 'brainbuxx_settings_v1',
  IMAGE_GALLERY: 'brainbuxx_image_gallery_v1',
  SPLASH_PLAYED: 'brainbuxx_splash_played_session',
};

export const DEFAULT_SETTINGS: UserSettings = {
  theme: 'light',
  fontSize: 'medium',
  voiceSpeed: 1.0,
  voicePitch: 1.0,
  customInstructions: '',
  selectedModel: 'gemini-3.8-flash',
};

export function loadSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Failed to load settings from localStorage', e);
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings to localStorage', e);
  }
}

export function loadConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
    if (raw) {
      const parsed: Conversation[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load conversations from localStorage', e);
  }
  return [];
}

export function saveConversations(conversations: Conversation[]): void {
  try {
    // Only persist lightweight content (clean preview URLs before saving)
    const cleaned = conversations.map((conv) => ({
      ...conv,
      messages: conv.messages.map((msg) => ({
        ...msg,
        isStreaming: false,
        attachments: msg.attachments?.map((att) => ({
          id: att.id,
          name: att.name,
          size: att.size,
          type: att.type,
          mimeType: att.mimeType,
          // If image/pdf is too large to fit in localStorage 5MB quota, retain metadata
          data: att.data && att.data.length < 500000 ? att.data : undefined,
          textContent: att.textContent && att.textContent.length < 50000 ? att.textContent : undefined,
        })),
      })),
    }));
    localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(cleaned));
  } catch (e) {
    console.warn('LocalStorage quota warning, trimming old attachments to save space', e);
    try {
      // Emergency trim if quota exceeded
      const trimmed = conversations.map((conv) => ({
        ...conv,
        messages: conv.messages.map((msg) => ({
          ...msg,
          attachments: msg.attachments?.map((att) => ({
            id: att.id,
            name: att.name,
            size: att.size,
            type: att.type,
            mimeType: att.mimeType,
          })),
        })),
      }));
      localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(trimmed));
    } catch (err) {
      console.error('Could not save even trimmed conversations', err);
    }
  }
}

export function loadCurrentConversationId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_CONVERSATION_ID);
  } catch {
    return null;
  }
}

export function saveCurrentConversationId(id: string | null): void {
  try {
    if (id) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_CONVERSATION_ID, id);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_CONVERSATION_ID);
    }
  } catch (e) {
    console.error('Failed to save current conv id', e);
  }
}

export function loadImageGallery(): GeneratedImageItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.IMAGE_GALLERY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Failed to load image gallery', e);
  }
  return [];
}

export function saveImageGallery(images: GeneratedImageItem[]): void {
  try {
    // Keep max 20 recent images in localStorage to avoid quota issues
    const trimmed = images.slice(0, 20);
    localStorage.setItem(STORAGE_KEYS.IMAGE_GALLERY, JSON.stringify(trimmed));
  } catch (e) {
    console.error('Failed to save image gallery', e);
  }
}

export function hasPlayedSplashThisSession(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_KEYS.SPLASH_PLAYED) === 'true';
  } catch {
    return false;
  }
}

export function markSplashPlayedThisSession(): void {
  try {
    sessionStorage.setItem(STORAGE_KEYS.SPLASH_PLAYED, 'true');
  } catch {}
}
