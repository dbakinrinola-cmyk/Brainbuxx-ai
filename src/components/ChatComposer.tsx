import React, { useRef, useState, useEffect } from 'react';
import {
  ArrowUp,
  Paperclip,
  Mic,
  MicOff,
  Image as ImageIcon,
  Square,
  X,
  FileText,
  FileSpreadsheet,
} from 'lucide-react';
import { FileAttachment } from '../types';
import { formatFileSize, processUploadedFile, SUPPORTED_EXTENSIONS } from '../utils/fileParser';

interface ChatComposerProps {
  onSendMessage: (content: string, attachments: FileAttachment[]) => void;
  onStopGeneration?: () => void;
  isGenerating?: boolean;
  onOpenImageStudio: () => void;
  disabled?: boolean;
}

export const ChatComposer: React.FC<ChatComposerProps> = ({
  onSendMessage,
  onStopGeneration,
  isGenerating = false,
  onOpenImageStudio,
  disabled = false,
}) => {
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recognitionError, setRecognitionError] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const recordingTimerRef = useRef<any>(null);

  // Auto-resize textarea based on input
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 180)}px`;
    }
  }, [content]);

  // Handle Voice Input via Web Speech Recognition API
  const startVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setRecognitionError('Speech recognition is not supported in this browser.');
      setTimeout(() => setRecognitionError(null), 3500);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
        setRecordingSeconds(0);
        recordingTimerRef.current = setInterval(() => {
          setRecordingSeconds((prev) => prev + 1);
        }, 1000);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setContent((prev) => {
            const trimmed = prev.trim();
            return trimmed ? `${trimmed} ${transcript}` : transcript;
          });
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
          setRecognitionError(`Voice input error: ${event.error}`);
          setTimeout(() => setRecognitionError(null), 3000);
        }
        stopVoiceInput();
      };

      recognition.onend = () => {
        stopVoiceInput();
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err: any) {
      setRecognitionError('Could not start microphone.');
      setTimeout(() => setRecognitionError(null), 3000);
      stopVoiceInput();
    }
  };

  const stopVoiceInput = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    setIsRecording(false);
  };

  const cancelVoiceInput = () => {
    stopVoiceInput();
  };

  // Handle File Uploads
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const files = Array.from(e.target.files);
    for (const file of files) {
      try {
        const attachment = await processUploadedFile(file);
        setAttachments((prev) => [...prev, attachment]);
      } catch (err: any) {
        setRecognitionError(err.message || 'Error uploading file.');
        setTimeout(() => setRecognitionError(null), 3500);
      }
    }
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isGenerating && onStopGeneration) {
      onStopGeneration();
      return;
    }
    if ((!content.trim() && attachments.length === 0) || disabled) return;

    onSendMessage(content.trim(), attachments);
    setContent('');
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-3 sm:px-4 pb-3 sm:pb-5">
      {/* Voice Recognition Notification / Error banner */}
      {recognitionError && (
        <div className="mb-2 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 flex items-center justify-between">
          <span>{recognitionError}</span>
          <button onClick={() => setRecognitionError(null)}>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Composer Box */}
      <div className="relative rounded-2xl bg-neutral-50 dark:bg-neutral-800/90 border border-neutral-200/90 dark:border-neutral-700/80 shadow-xs focus-within:border-neutral-300 dark:focus-within:border-neutral-600 focus-within:bg-white dark:focus-within:bg-neutral-800 transition-all p-2.5 sm:p-3">
        {/* Attachment Previews */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2 pb-2 border-b border-neutral-200/60 dark:border-neutral-700/60">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center gap-2 px-2.5 py-1 bg-white dark:bg-neutral-700/70 border border-neutral-200 dark:border-neutral-600 rounded-lg text-xs"
              >
                {att.type === 'image' && att.previewUrl ? (
                  <img
                    src={att.previewUrl}
                    alt={att.name}
                    className="w-6 h-6 rounded object-cover"
                  />
                ) : att.name.endsWith('.csv') || att.name.endsWith('.xlsx') ? (
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                ) : (
                  <FileText className="w-4 h-4 text-blue-600" />
                )}
                <span className="font-medium text-neutral-800 dark:text-neutral-200 truncate max-w-[140px]">
                  {att.name}
                </span>
                <span className="text-[10px] text-neutral-400">
                  ({formatFileSize(att.size)})
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveAttachment(att.id)}
                  className="p-0.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-white rounded"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Live Voice Recording Status Bar */}
        {isRecording && (
          <div className="flex items-center justify-between px-3 py-1.5 mb-2 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200/80 dark:border-red-900/40 text-red-700 dark:text-red-300 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
              <span className="font-medium">Listening... speak naturally</span>
              <span className="text-[11px] font-mono opacity-80">
                ({recordingSeconds}s)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={stopVoiceInput}
                className="px-2 py-0.5 font-medium bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Done
              </button>
              <button
                type="button"
                onClick={cancelVoiceInput}
                className="text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Text Input Area */}
        <textarea
          ref={textareaRef}
          rows={1}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message Brainbuxx or upload files..."
          disabled={disabled}
          className="w-full bg-transparent text-sm sm:text-base text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 outline-none resize-none leading-relaxed min-h-[38px] max-h-[180px]"
        />

        {/* Composer Controls Bottom Row */}
        <div className="flex items-center justify-between pt-1">
          {/* Left tools: Attachments, Image shortcut */}
          <div className="flex items-center gap-1 text-neutral-500 dark:text-neutral-400">
            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={SUPPORTED_EXTENSIONS.join(',')}
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Attach document or image"
              className="p-1.5 sm:p-2 rounded-xl hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/50 dark:hover:bg-neutral-700 transition-colors"
              title="Attach files (PDF, DOCX, TXT, CSV, images)"
            >
              <Paperclip className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </button>

            <button
              type="button"
              onClick={onOpenImageStudio}
              aria-label="AI Image Generator"
              className="p-1.5 sm:p-2 rounded-xl hover:text-purple-600 dark:hover:text-purple-400 hover:bg-neutral-200/50 dark:hover:bg-neutral-700 transition-colors"
              title="Generate images with AI Image Studio"
            >
              <ImageIcon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </button>

            {/* Voice Input Button */}
            <button
              type="button"
              onClick={isRecording ? stopVoiceInput : startVoiceInput}
              aria-label={isRecording ? 'Stop voice recording' : 'Start voice input'}
              className={`p-1.5 sm:p-2 rounded-xl transition-colors ${
                isRecording
                  ? 'text-red-600 bg-red-100 dark:bg-red-900/40'
                  : 'hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/50 dark:hover:bg-neutral-700'
              }`}
              title="Voice input (Speech to Text)"
            >
              {isRecording ? (
                <MicOff className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              ) : (
                <Mic className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              )}
            </button>
          </div>

          {/* Right action: Send or Stop */}
          <div className="flex items-center gap-2">
            {isGenerating ? (
              <button
                type="button"
                onClick={onStopGeneration}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-white text-white dark:text-neutral-900 text-xs font-semibold shadow-xs transition-colors"
                title="Stop response generation"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={(!content.trim() && attachments.length === 0) || disabled}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed shadow-xs transition-all"
                title="Send message (Enter)"
              >
                <ArrowUp className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.5]" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="text-center mt-2">
        <span className="text-[11px] text-neutral-400 dark:text-neutral-500 font-sans">
          Brainbuxx AI may make mistakes. Verify important facts and figures.
        </span>
      </div>
    </div>
  );
};
