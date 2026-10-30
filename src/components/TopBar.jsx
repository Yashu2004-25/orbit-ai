import React from 'react';
import { PanelLeft, SquarePen } from 'lucide-react';
import ModelPicker from './ModelPicker.jsx';
import OrbitLogo from './OrbitLogo.jsx';

export default function TopBar({
  onToggleSidebar,
  models,
  selectedModel,
  onSelectModel,
  onNewChat,
}) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between h-14 px-3 sm:px-4 bg-main/80 backdrop-blur-md border-b border-border-subtle safe-top">
      {/* Left section: Sidebar toggle, Orbit brand icon & Model Picker */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
          title="Toggle sidebar"
          className="p-2 rounded-xl text-text-muted hover:text-text-main hover:bg-hover transition-colors"
        >
          <PanelLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1.5 pl-1 pr-1">
          <OrbitLogo size={22} />
          <span className="font-semibold text-sm tracking-tight text-text-main hidden sm:inline">
            Orbit
          </span>
        </div>

        <ModelPicker
          models={models}
          selectedModel={selectedModel}
          onSelectModel={onSelectModel}
        />
      </div>

      {/* Right section: New Chat shortcut */}
      <div className="flex items-center gap-1">
        <button
          onClick={onNewChat}
          aria-label="New chat"
          title="New chat"
          className="p-2 rounded-xl text-text-muted hover:text-text-main hover:bg-hover transition-colors"
        >
          <SquarePen className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
