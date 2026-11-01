import React, { useRef, useEffect, useState } from 'react';
import { ArrowUp, Square, Paperclip, X, FileText, Image as ImageIcon } from 'lucide-react';
import { ACCEPTED_FILES, parseChatFile } from '../services/files.js';

export default function ChatInput({ input, setInput, onSend, onStop, isStreaming, disabled }) {
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const [attachments, setAttachments] = useState([]);
  const [fileError, setFileError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  }, [input]);

  const addFiles = async (files) => {
    setFileError('');
    const parsed = [];
    for (const file of Array.from(files || [])) {
      try { parsed.push(await parseChatFile(file)); }
      catch (error) { setFileError(error.message); }
    }
    setAttachments((current) => [...current, ...parsed]);
  };

  const send = () => {
    if (!isStreaming && !disabled && (input.trim() || attachments.length)) {
      onSend(input, attachments);
      setAttachments([]);
      setFileError('');
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); send(); }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-3 sm:pb-5 safe-bottom">
      <div
        onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
        onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setIsDragging(false); }}
        onDrop={(event) => { event.preventDefault(); setIsDragging(false); addFiles(event.dataTransfer.files); }}
        className={`relative flex flex-col bg-input rounded-3xl border shadow-md transition-all duration-150 ${isDragging ? 'border-cyan-500 ring-2 ring-cyan-500/20' : 'border-border-subtle focus-within:border-text-muted/40'}`}
      >
        {attachments.length > 0 && <div className="flex flex-wrap gap-2 px-4 pt-3">
          {attachments.map((file, index) => <div key={`${file.name}-${index}`} className="flex items-center gap-2 max-w-full rounded-xl border border-border-subtle bg-main/60 px-2 py-1.5 text-xs">
            {file.type === 'image' ? <img src={file.preview} alt="" className="w-8 h-8 rounded object-cover" /> : <FileText className="w-4 h-4 text-text-muted" />}
            <span className="max-w-40 truncate">{file.name}</span>
            <button type="button" onClick={() => setAttachments((current) => current.filter((_, i) => i !== index))} aria-label={`Remove ${file.name}`} className="p-1 text-text-muted hover:text-text-main"><X className="w-3.5 h-3.5" /></button>
          </div>)}
        </div>}
        <textarea ref={textareaRef} rows={1} value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={handleKeyDown} placeholder="Message Orbit" className="w-full resize-none bg-transparent pt-3.5 pb-3.5 pl-5 pr-14 text-[15px] leading-relaxed text-text-main placeholder:text-text-muted focus:outline-hidden max-h-[200px] overflow-y-auto" />
        <div className="absolute left-2.5 bottom-2.5 flex items-center gap-1">
          <button type="button" onClick={() => fileInputRef.current?.click()} disabled={disabled || isStreaming} aria-label="Attach files" title="Attach TXT, MD, CSV, PDF, DOCX, PNG, or JPG" className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:text-text-main hover:bg-hover disabled:opacity-40"><Paperclip className="w-4 h-4" /></button>
          <input ref={fileInputRef} type="file" multiple accept={ACCEPTED_FILES} className="hidden" onChange={(event) => { addFiles(event.target.files); event.target.value = ''; }} />
        </div>
        <div className="absolute right-2.5 bottom-2.5">
          {isStreaming ? <button onClick={onStop} aria-label="Stop generation" title="Stop generating" className="w-8 h-8 rounded-full bg-text-main text-main flex items-center justify-center hover:opacity-85"><Square className="w-3.5 h-3.5 fill-current" /></button> : <button onClick={send} disabled={disabled || (!input.trim() && !attachments.length)} aria-label="Send message" title="Send message" className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${disabled || (!input.trim() && !attachments.length) ? 'bg-border-subtle text-text-muted cursor-not-allowed opacity-40' : 'bg-text-main text-main hover:opacity-90'}`}><ArrowUp className="w-4 h-4 stroke-[2.5]" /></button>}
        </div>
      </div>
      {fileError && <p role="alert" className="text-xs text-rose-500 px-3 pt-1">{fileError}</p>}
      <p className="text-center text-[11px] text-text-muted mt-2 select-none">Attach or drop TXT, MD, CSV, PDF, DOCX, PNG, or JPG · Orbit can make mistakes.</p>
    </div>
  );
}
