import React from 'react';
import { Lightbulb, Mail, Code, Calendar, Zap } from 'lucide-react';
import OrbitLogo from './OrbitLogo.jsx';

const SUGGESTIONS = [
  {
    icon: Lightbulb,
    title: 'Explain something simply',
    prompt: 'Explain quantum computing in simple terms that anyone can understand.',
  },
  {
    icon: Mail,
    title: 'Help me write an email',
    prompt: 'Help me draft a polite follow-up email to a client regarding project updates.',
  },
  {
    icon: Code,
    title: 'Debug my code',
    prompt: 'How do I debug a React component that is rendering infinitely?',
  },
  {
    icon: Calendar,
    title: 'Plan my day',
    prompt: 'Give me a structured schedule for a productive day focusing on deep work.',
  },
];

export default function EmptyState({ onSelectSuggestion }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none my-auto">
      {/* Abstract Blue & Black Hole Orbit Hero Section */}
      <div className="flex flex-col items-center mb-8 group">
        <div className="relative mb-3 transition-transform duration-300 group-hover:scale-105">
          <OrbitLogo size={88} />
        </div>

        {/* Orbit Brand Name */}
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-text-main">
          Orbit
        </h1>

        {/* Center Pill Subtitle: Powered by Groq */}
        <div className="mt-2.5 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-hover border border-border-subtle text-xs font-medium text-text-muted shadow-xs">
          <Zap className="w-3.5 h-3.5 text-sky-400 fill-sky-400" />
          <span>Powered by Groq • Ultra-fast Intelligence</span>
        </div>

        {/* Greeting Prompt */}
        <p className="mt-4 text-base sm:text-lg text-text-main/90 font-medium">
          What can I help with?
        </p>
      </div>

      {/* Suggestion Chips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
        {SUGGESTIONS.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={index}
              onClick={() => onSelectSuggestion(item.prompt)}
              className="flex items-center gap-3 p-3.5 text-left rounded-2xl border border-border-subtle bg-input hover:bg-hover text-text-main transition-all duration-150 group shadow-xs active:scale-[0.98]"
            >
              <div className="p-2 rounded-xl bg-main text-text-muted group-hover:text-sky-400 transition-colors border border-border-subtle/50 flex-shrink-0">
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium leading-snug line-clamp-2">
                {item.title}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
