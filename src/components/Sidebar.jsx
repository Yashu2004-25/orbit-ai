import React, { useState } from 'react';
import {
  SquarePen,
  Settings,
  MoreHorizontal,
  Trash2,
  Pencil,
  X,
  Check,
  PanelLeftClose,
} from 'lucide-react';
import OrbitLogo from './OrbitLogo.jsx';

export default function Sidebar({
  isOpen,
  onClose,
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onRenameChat,
  onDeleteChat,
  onOpenSettings,
}) {
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [activeMenuId, setActiveMenuId] = useState(null);

  const startEditing = (chat) => {
    setEditingId(chat.id);
    setEditingTitle(chat.title);
    setActiveMenuId(null);
  };

  const saveEditing = (id) => {
    if (editingTitle.trim()) {
      onRenameChat(id, editingTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <>
      {/* Mobile Backdrop overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-xs transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 flex flex-col w-[260px] sm:w-[280px] bg-sidebar border-r border-border-subtle safe-top safe-bottom transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:hidden'
        }`}
      >
        {/* Top Header: Brand & New Chat */}
        <div className="p-3 border-b border-border-subtle/50 space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <OrbitLogo size={24} />
              <span className="font-semibold text-sm tracking-tight text-text-main">Orbit</span>
            </div>
            {/* Close button for mobile drawer */}
            <button
              onClick={onClose}
              aria-label="Close sidebar"
              className="md:hidden p-1.5 rounded-xl text-text-muted hover:text-text-main hover:bg-hover"
            >
              <PanelLeftClose className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 768) onClose();
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl border border-border-subtle bg-main hover:bg-hover text-text-main text-sm font-medium transition-all shadow-xs min-h-[40px]"
          >
            <span>New chat</span>
            <SquarePen className="w-4 h-4 text-text-muted" />
          </button>
        </div>

        {/* Chat History List */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
          <div className="px-2 pb-1.5 text-xs font-semibold text-text-muted uppercase tracking-wider">
            Recent Chats
          </div>

          {chats.map((chat) => {
            const isActive = chat.id === activeChatId;
            const isEditing = editingId === chat.id;

            if (isEditing) {
              return (
                <div
                  key={chat.id}
                  className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-hover border border-border-subtle"
                >
                  <input
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEditing(chat.id);
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    autoFocus
                    className="flex-1 bg-transparent text-sm text-text-main focus:outline-hidden min-h-[32px]"
                  />
                  <button
                    onClick={() => saveEditing(chat.id)}
                    className="p-1 rounded text-emerald-500 hover:bg-main"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="p-1 rounded text-text-muted hover:bg-main"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            }

            return (
              <div
                key={chat.id}
                className={`group relative flex items-center justify-between rounded-xl px-3 py-2.5 min-h-[44px] cursor-pointer text-sm transition-colors ${
                  isActive
                    ? 'bg-hover text-text-main font-medium'
                    : 'text-text-muted hover:text-text-main hover:bg-hover/60'
                }`}
                onClick={() => {
                  onSelectChat(chat.id);
                  if (window.innerWidth < 768) onClose();
                }}
              >
                <span className="truncate pr-4 flex-1">{chat.title}</span>

                {/* More options menu */}
                <div
                  className={`flex items-center gap-1 ${
                    isActive || activeMenuId === chat.id
                      ? 'opacity-100'
                      : 'opacity-0 group-hover:opacity-100'
                  }`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() =>
                      setActiveMenuId((prev) => (prev === chat.id ? null : chat.id))
                    }
                    aria-label="Chat options"
                    className="p-1 rounded-lg text-text-muted hover:text-text-main hover:bg-main transition-colors"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>

                  {/* Dropdown for Rename & Delete */}
                  {activeMenuId === chat.id && (
                    <div className="absolute right-2 top-11 w-32 rounded-xl bg-main border border-border-subtle shadow-xl py-1 z-30">
                      <button
                        onClick={() => startEditing(chat)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-text-main hover:bg-hover text-left"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Rename</span>
                      </button>
                      <button
                        onClick={() => {
                          onDeleteChat(chat.id);
                          setActiveMenuId(null);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-500 hover:bg-rose-500/10 text-left"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Section: Settings */}
        <div className="p-3 border-t border-border-subtle/50">
          <button
            onClick={() => {
              onOpenSettings();
              if (window.innerWidth < 768) onClose();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-hover text-text-main text-sm font-medium transition-colors min-h-[44px]"
          >
            <Settings className="w-5 h-5 text-text-muted" />
            <span>Settings</span>
          </button>
        </div>
      </aside>
    </>
  );
}
