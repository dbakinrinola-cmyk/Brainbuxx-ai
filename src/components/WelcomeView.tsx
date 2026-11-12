import React from 'react';
import {
  BookOpen,
  PenTool,
  Image as ImageIcon,
  Lightbulb,
  ArrowUpRight,
} from 'lucide-react';

interface WelcomeViewProps {
  onSelectPrompt: (prompt: string) => void;
  onOpenImageStudio: () => void;
}

export const WelcomeView: React.FC<WelcomeViewProps> = ({
  onSelectPrompt,
  onOpenImageStudio,
}) => {
  const suggestions = [
    {
      title: 'Explain something',
      description: 'Quantum computing principles in simple terms with everyday analogies',
      icon: BookOpen,
      iconColor: 'text-blue-600 dark:text-blue-400',
      action: () =>
        onSelectPrompt(
          'Explain quantum computing principles in simple terms, using intuitive real-world analogies.'
        ),
    },
    {
      title: 'Write something',
      description: 'A thoughtful proposal for a sustainable community workspace project',
      icon: PenTool,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      action: () =>
        onSelectPrompt(
          'Draft a clear, professional project proposal for a sustainable community tech & creative workspace.'
        ),
    },
    {
      title: 'Create an image',
      description: 'Generate custom visual concepts with AI Image Studio',
      icon: ImageIcon,
      iconColor: 'text-purple-600 dark:text-purple-400',
      action: onOpenImageStudio,
    },
    {
      title: 'Help me solve a problem',
      description: 'Debug a performance bottleneck or brainstorm product architectures',
      icon: Lightbulb,
      iconColor: 'text-amber-600 dark:text-amber-400',
      action: () =>
        onSelectPrompt(
          'Help me optimize the architecture of a high-concurrency web application handling real-time data.'
        ),
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-2xl mx-auto px-4 py-8 text-center select-none">
      {/* Brainbuxx Logo Icon */}
      <div className="w-12 h-12 rounded-2xl bg-neutral-900 dark:bg-white flex items-center justify-center text-white dark:text-neutral-900 shadow-sm mb-3">
        <svg
          className="w-7 h-7"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2a4 4 0 0 0-4 4v1H7a5 5 0 0 0-5 5c0 2.2 1.4 4 3.4 4.7.2 2.5 2.1 4.3 4.6 4.3h4a4 4 0 0 0 4-4v-1h1a5 5 0 0 0 5-5c0-2.2-1.4-4-3.4-4.7-.2-2.5-2.1-4.3-4.6-4.3h-1V6a4 4 0 0 0-4-4Z" />
        </svg>
      </div>

      {/* Developer and context-aware badge */}
      <div className="mb-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200/80 dark:border-neutral-700 text-[11px] font-medium text-neutral-600 dark:text-neutral-300">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
        <span>Context-Aware Intelligence</span>
        <span className="text-neutral-300 dark:text-neutral-600">·</span>
        <span>Developed by VHS Science and Innovation</span>
      </div>

      {/* Main greeting */}
      <h2 className="text-2xl sm:text-3xl font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight">
        Hello! I'm Brainbuxx.
      </h2>
      <p className="mt-2 text-sm sm:text-base text-neutral-500 dark:text-neutral-400 max-w-lg leading-relaxed">
        Your ideas deserve intelligent answers. Deeply context-aware and ready to reason, code, create images, and analyze documents.
      </p>

      {/* Suggestion Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mt-8 text-left">
        {suggestions.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={item.action}
              className="group p-4 bg-white dark:bg-neutral-800/80 hover:bg-neutral-50 dark:hover:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700/80 rounded-xl shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between text-left"
            >
              <div className="flex items-start justify-between w-full">
                <div className={`p-2 rounded-lg bg-neutral-100 dark:bg-neutral-700/50 ${item.iconColor}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-neutral-300 dark:text-neutral-600 group-hover:text-neutral-700 dark:group-hover:text-neutral-300 transition-colors" />
              </div>
              <div className="mt-3">
                <span className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {item.title}
                </span>
                <span className="block mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-2">
                  {item.description}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
