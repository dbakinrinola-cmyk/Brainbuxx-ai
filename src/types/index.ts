export type Role = 'user' | 'assistant';

export interface FileAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  mimeType: string;
  data?: string; // Base64 data for images & PDFs
  textContent?: string; // Text content for txt, csv, code, etc.
  previewUrl?: string; // Local object URL for thumbnail preview
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  attachments?: FileAttachment[];
  feedback?: 'like' | 'dislike' | null;
  modelUsed?: string;
  isStreaming?: boolean;
  error?: string;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
  isPinned?: boolean;
}

export interface GeneratedImageItem {
  id: string;
  prompt: string;
  imageUrl: string;
  style: string;
  aspectRatio: string;
  timestamp: number;
}

export type ThemeMode = 'light' | 'dark' | 'system';
export type FontSize = 'small' | 'medium' | 'large';

export interface UserSettings {
  theme: ThemeMode;
  fontSize: FontSize;
  voiceSpeed: number; // 0.8 to 1.5
  voicePitch: number; // 0.8 to 1.2
  voiceVoiceURI?: string;
  customInstructions: string;
  hasSeenSplash?: boolean;
  selectedModel: string;
}
