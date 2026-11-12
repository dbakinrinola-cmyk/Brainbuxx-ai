import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Download,
  RotateCcw,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Clock,
  Send,
} from 'lucide-react';
import { GeneratedImageItem } from '../types';

interface ImageStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageGallery: GeneratedImageItem[];
  onImageGenerated: (image: GeneratedImageItem) => void;
  onSendToChat?: (prompt: string, imageUrl: string) => void;
}

export const ImageStudioModal: React.FC<ImageStudioModalProps> = ({
  isOpen,
  onClose,
  imageGallery,
  onImageGenerated,
  onSendToChat,
}) => {
  const [prompt, setPrompt] = useState('');
  const [selectedRatio, setSelectedRatio] = useState('1:1');
  const [selectedStyle, setSelectedStyle] = useState('Photorealistic');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState<GeneratedImageItem | null>(
    imageGallery[0] || null
  );

  if (!isOpen) return null;

  const aspectRatios = [
    { label: 'Square (1:1)', value: '1:1', desc: 'Social & Avatars' },
    { label: 'Landscape (16:9)', value: '16:9', desc: 'Cinematic widescreen' },
    { label: 'Standard (4:3)', value: '4:3', desc: 'Presentations & Displays' },
    { label: 'Portrait (9:16)', value: '9:16', desc: 'Stories & Mobile' },
    { label: 'Vertical (3:4)', value: '3:4', desc: 'Editorial & Posters' },
  ];

  const styles = [
    'Photorealistic',
    'Cinematic',
    'Minimalist',
    'Digital art',
    '3D illustration',
    'Watercolour',
    'Anime',
    'Cartoon',
  ];

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          aspectRatio: selectedRatio,
          style: selectedStyle,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to generate image.');
      }

      const newItem: GeneratedImageItem = {
        id: `img_${Date.now()}`,
        prompt: prompt.trim(),
        imageUrl: data.imageUrl,
        style: selectedStyle,
        aspectRatio: selectedRatio,
        timestamp: Date.now(),
      };

      setCurrentImage(newItem);
      onImageGenerated(newItem);
    } catch (err: any) {
      console.error('Image generation error:', err);
      setErrorMessage(
        err.message ||
          'Failed to generate image. Please check API quota or try modifying the prompt.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (imageUrl: string, filenamePrompt: string) => {
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `brainbuxx_${filenamePrompt.slice(0, 20).replace(/\s+/g, '_')}_${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs">
      <div className="relative flex flex-col w-full max-w-4xl max-h-[92vh] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-200/80 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                Brainbuxx Image Studio
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Powered by Gemini Visual Generation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Column (5 cols) */}
          <div className="lg:col-span-5 flex flex-col space-y-4">
            {/* Prompt input */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                Creative Prompt
              </label>
              <textarea
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the image in detail... e.g., A minimalist Scandinavian coffee roastery bathed in gentle morning sunlight"
                className="w-full p-3 text-xs sm:text-sm bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-xl outline-none focus:ring-1 focus:ring-purple-500 text-neutral-900 dark:text-neutral-100 resize-none"
              />
            </div>

            {/* Aspect Ratio Selector */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                Aspect Ratio
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-3 gap-1.5">
                {aspectRatios.map((ratio) => (
                  <button
                    key={ratio.value}
                    type="button"
                    onClick={() => setSelectedRatio(ratio.value)}
                    className={`p-2 text-left rounded-lg text-xs font-medium border transition-all ${
                      selectedRatio === ratio.value
                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 font-semibold'
                        : 'border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    <div className="font-mono text-[11px]">{ratio.value}</div>
                    <div className="text-[10px] text-neutral-400 truncate">{ratio.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Style Selector */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                Visual Style
              </label>
              <div className="flex flex-wrap gap-1.5">
                {styles.map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => setSelectedStyle(style)}
                    className={`px-2.5 py-1 text-xs rounded-lg transition-colors border ${
                      selectedStyle === style
                        ? 'border-purple-600 bg-purple-600 text-white font-medium'
                        : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all"
            >
              {isGenerating ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating Artwork...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Image</span>
                </>
              )}
            </button>

            {/* Error Display */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>{errorMessage}</p>
              </div>
            )}

            {/* Prompt Inspiration suggestions */}
            <div className="pt-2">
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1">
                Quick Inspiration
              </span>
              <div className="space-y-1">
                {[
                  'Architectural pavilion made of sustainable curved bamboo in lush jungle',
                  'Cosy vintage bookstore with steaming cup of Earl Grey tea beside open novel',
                  'Futuristic solar observatory on an Icelandic plateau at dusk',
                ].map((sug, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPrompt(sug)}
                    className="w-full text-left p-1.5 rounded text-[11px] text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors line-clamp-1"
                  >
                    "{sug}"
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Preview & Gallery Column (7 cols) */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            {/* Main Stage */}
            <div className="flex-1 min-h-[300px] flex items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800 p-3 overflow-hidden relative">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-purple-600 animate-pulse">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                    Generating high-fidelity visual...
                  </p>
                  <p className="text-xs text-neutral-400 max-w-xs">
                    Applying {selectedStyle} rendering and compositional balance.
                  </p>
                </div>
              ) : currentImage ? (
                <div className="relative w-full h-full flex flex-col items-center justify-center group">
                  <img
                    src={currentImage.imageUrl}
                    alt={currentImage.prompt}
                    referrerPolicy="no-referrer"
                    className="max-h-[360px] w-auto max-w-full rounded-xl object-contain shadow-md"
                  />
                  {/* Floating Action Overlay */}
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={() => handleDownload(currentImage.imageUrl, currentImage.prompt)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-xs font-medium rounded-lg shadow-2xs transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                    <button
                      onClick={() => {
                        setPrompt(currentImage.prompt);
                        handleGenerate();
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-xs font-medium rounded-lg shadow-2xs transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Generate Again</span>
                    </button>
                    {onSendToChat && (
                      <button
                        onClick={() => {
                          onSendToChat(
                            `Let's analyze and discuss this image generated from prompt: "${currentImage.prompt}"`,
                            currentImage.imageUrl
                          );
                          onClose();
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white hover:bg-purple-700 text-xs font-medium rounded-lg shadow-2xs transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Discuss in Chat</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center text-neutral-400">
                  <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
                  <p className="text-xs">Your generated artwork will appear here.</p>
                </div>
              )}
            </div>

            {/* Recent Studio History Thumbnail Strip */}
            {imageGallery.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Recent Creations ({imageGallery.length})</span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {imageGallery.map((img) => (
                    <button
                      key={img.id}
                      onClick={() => setCurrentImage(img)}
                      className={`relative shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                        currentImage?.id === img.id
                          ? 'border-purple-600 ring-2 ring-purple-500/20'
                          : 'border-transparent hover:border-neutral-300 dark:hover:border-neutral-700'
                      }`}
                    >
                      <img
                        src={img.imageUrl}
                        alt={img.prompt}
                        className="w-16 h-16 object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
