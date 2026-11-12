import React, { useState } from 'react';
import {
  Copy,
  Check,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  Volume2,
  VolumeX,
  Share2,
  Edit3,
  FileText,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { marked } from 'marked';
import { Message, FileAttachment } from '../types';

interface ChatMessageProps {
  message: Message;
  isLastAiMessage?: boolean;
  onRegenerate?: () => void;
  onEditUserMessage?: (messageId: string, newContent: string) => void;
  onFeedback?: (messageId: string, feedback: 'like' | 'dislike') => void;
  onSpeak?: (text: string) => void;
  isSpeakingThis?: boolean;
  onStopSpeaking?: () => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isLastAiMessage,
  onRegenerate,
  onEditUserMessage,
  onFeedback,
  onSpeak,
  isSpeakingThis,
  onStopSpeaking,
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [shareToast, setShareToast] = useState(false);

  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Brainbuxx AI Insight',
        text: message.content,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(message.content);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2000);
    }
  };

  const handleSaveEdit = () => {
    if (editContent.trim() && onEditUserMessage) {
      onEditUserMessage(message.id, editContent.trim());
      setIsEditing(false);
    }
  };

  // Convert markdown to HTML safely using marked
  const renderedHtml = React.useMemo(() => {
    if (isUser) return '';
    try {
      return marked.parse(message.content || '', { gfm: true, breaks: true }) as string;
    } catch {
      return message.content;
    }
  }, [message.content, isUser]);

  return (
    <div
      className={`group w-full py-4 px-3 sm:px-6 transition-colors ${
        isUser
          ? 'bg-transparent'
          : 'bg-neutral-50/50 dark:bg-neutral-900/30 border-y border-neutral-100/80 dark:border-neutral-800/60'
      }`}
    >
      <div className="max-w-3xl mx-auto flex gap-3 sm:gap-4">
        {/* Avatar Mark */}
        {!isUser ? (
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-neutral-900 dark:bg-neutral-100 flex items-center justify-center text-white dark:text-neutral-900 shrink-0 shadow-2xs mt-0.5">
            <svg
              className="w-4 h-4 sm:w-4.5 sm:h-4.5"
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
        ) : (
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-blue-600/10 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold text-xs flex items-center justify-center shrink-0 mt-0.5">
            You
          </div>
        )}

        {/* Message Content Container */}
        <div className="flex-1 min-w-0">
          {/* Header Name & Timestamp */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
              {isUser ? 'You' : 'Brainbuxx'}
            </span>
            <span className="text-[11px] text-neutral-400 dark:text-neutral-500">
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>

          {/* Attachments preview if present */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {message.attachments.map((att: FileAttachment) => (
                <div
                  key={att.id}
                  className="flex items-center gap-2 p-1.5 pr-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs"
                >
                  {att.type === 'image' && att.previewUrl ? (
                    <img
                      src={att.previewUrl}
                      alt={att.name}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded object-cover border border-neutral-200 dark:border-neutral-700"
                    />
                  ) : att.name.endsWith('.csv') || att.name.endsWith('.xlsx') ? (
                    <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <FileText className="w-5 h-5 text-blue-600" />
                  )}
                  <div className="flex flex-col truncate max-w-[160px]">
                    <span className="font-medium text-neutral-800 dark:text-neutral-200 truncate">
                      {att.name}
                    </span>
                    <span className="text-[10px] text-neutral-400 uppercase">
                      {att.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* User message edit mode */}
          {isUser && isEditing ? (
            <div className="mt-1 space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-2.5 text-sm bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg outline-none focus:ring-1 focus:ring-blue-500 text-neutral-800 dark:text-neutral-200 resize-y min-h-[70px]"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveEdit}
                  className="px-3 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                >
                  Save & Resubmit
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : isUser ? (
            /* User plain text display */
            <div className="text-sm sm:text-base text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap leading-relaxed">
              {message.content}
            </div>
          ) : (
            /* AI Markdown Prose Display */
            <div className="brainbuxx-prose dark:text-neutral-200">
              {message.error ? (
                <div className="flex items-start gap-2.5 p-3 my-2 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-300 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold">Unable to complete response</p>
                    <p className="mt-0.5 text-neutral-600 dark:text-neutral-400">
                      {message.error}
                    </p>
                    {onRegenerate && (
                      <button
                        onClick={onRegenerate}
                        className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 font-medium bg-red-100 dark:bg-red-900/50 hover:bg-red-200 rounded text-red-800 dark:text-red-200 transition-colors"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Retry</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div
                  dangerouslySetInnerHTML={{ __html: renderedHtml }}
                  className="prose-container"
                />
              )}

              {/* Streaming loading indicator */}
              {message.isStreaming && !message.content && (
                <div className="flex items-center gap-1.5 py-2 text-xs text-neutral-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse delay-100" />
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse delay-200" />
                  <span className="ml-1 text-[11px] font-sans">Brainbuxx is thinking...</span>
                </div>
              )}
            </div>
          )}

          {/* Action Row */}
          <div className="flex items-center gap-1 mt-2.5 pt-1 text-neutral-400 dark:text-neutral-500">
            {isUser ? (
              /* User actions: edit */
              <button
                onClick={() => {
                  setEditContent(message.content);
                  setIsEditing(true);
                }}
                className="opacity-0 group-hover:opacity-100 focus:opacity-100 flex items-center gap-1 px-2 py-1 text-xs hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-all"
                title="Edit message"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            ) : (
              /* AI actions: Copy, Speak, Regenerate, Like, Dislike, Share */
              <>
                <button
                  onClick={handleCopy}
                  className="p-1.5 rounded hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  title="Copy to clipboard"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>

                {onSpeak && (
                  <button
                    onClick={() => {
                      if (isSpeakingThis && onStopSpeaking) {
                        onStopSpeaking();
                      } else {
                        onSpeak(message.content);
                      }
                    }}
                    className={`p-1.5 rounded transition-colors ${
                      isSpeakingThis
                        ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/30'
                        : 'hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                    title={isSpeakingThis ? 'Stop speaking' : 'Read aloud'}
                  >
                    {isSpeakingThis ? (
                      <VolumeX className="w-3.5 h-3.5" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}

                {isLastAiMessage && onRegenerate && (
                  <button
                    onClick={onRegenerate}
                    className="p-1.5 rounded hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    title="Regenerate response"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}

                {onFeedback && (
                  <>
                    <button
                      onClick={() => onFeedback(message.id, 'like')}
                      className={`p-1.5 rounded hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${
                        message.feedback === 'like' ? 'text-blue-600' : ''
                      }`}
                      title="Good response"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onFeedback(message.id, 'dislike')}
                      className={`p-1.5 rounded hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${
                        message.feedback === 'dislike' ? 'text-amber-600' : ''
                      }`}
                      title="Poor response"
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}

                <button
                  onClick={handleShare}
                  className="p-1.5 rounded hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  title="Share response"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>

                {shareToast && (
                  <span className="text-[11px] text-emerald-600 ml-1">Copied link/text!</span>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
