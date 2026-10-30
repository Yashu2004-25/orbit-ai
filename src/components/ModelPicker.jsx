import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Sparkles } from 'lucide-react';

export default function ModelPicker({
  models,
  selectedModel,
  onSelectModel,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentModel = models.find((m) => m.id === selectedModel) || {
    id: selectedModel,
    name: selectedModel,
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-hover text-text-main text-sm font-medium transition-colors border border-transparent hover:border-border-subtle"
        aria-expanded={isOpen}
      >
        <span className="truncate max-w-[200px] sm:max-w-xs">{currentModel.name}</span>
        <ChevronDown className="w-4 h-4 text-text-muted flex-shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-64 sm:w-72 rounded-2xl bg-main border border-border-subtle shadow-xl py-1.5 z-50 text-text-main focus:outline-hidden">
          <div className="px-3 py-1.5 text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
            <span>Select Model</span>
          </div>

          <div className="max-h-60 overflow-y-auto py-1">
            {models.map((model) => {
              const isSelected = model.id === selectedModel;
              return (
                <button
                  key={model.id}
                  onClick={() => {
                    onSelectModel(model.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2 text-sm text-left hover:bg-hover transition-colors ${
                    isSelected ? 'font-medium text-text-main bg-hover/50' : 'text-text-muted hover:text-text-main'
                  }`}
                >
                  <span className="truncate pr-2">{model.name}</span>
                  {isSelected && <Check className="w-4 h-4 text-cyan-500 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

