import { useState, useRef, useCallback } from 'react';
import { Send, Paperclip, Mic, X, Image, FileText, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSendMessage: (message: string, attachments?: File[]) => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  isRecording: boolean;
  isLoading: boolean;
}

export function ChatInput({
  onSendMessage,
  onStartRecording,
  onStopRecording,
  isRecording,
  isLoading
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback(() => {
    if (!message.trim() && attachments.length === 0) return;
    onSendMessage(message.trim(), attachments.length > 0 ? attachments : undefined);
    setMessage('');
    setAttachments([]);
    setPreviews([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [message, attachments, onSendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isPDF = file.type === 'application/pdf';
      return isImage || isPDF;
    });

    if (validFiles.length === 0) return;

    setAttachments(prev => [...prev, ...validFiles]);

    // Generate previews for images
    validFiles.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviews(prev => [...prev, e.target?.result as string]);
        };
        reader.readAsDataURL(file);
      } else {
        setPreviews(prev => [...prev, 'pdf']);
      }
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  return (
    <div className="border-t border-white/10 bg-white/5 p-3 space-y-3 backdrop-blur-xl">
      {/* Attachments preview */}
      {previews.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {previews.map((preview, index) => (
            <div key={index} className="relative flex-shrink-0">
              {preview === 'pdf' ? (
                <div className="w-16 h-16 bg-white/10 rounded-lg border border-white/12 flex items-center justify-center backdrop-blur-sm">
                  <FileText className="h-6 w-6 text-muted-foreground" />
                </div>
              ) : (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-16 h-16 object-cover rounded-lg border border-white/12 shadow-[0_10px_28px_rgba(0,0,0,0.35)]"
                />
              )}
              <button
                onClick={() => removeAttachment(index)}
                className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center shadow-sm"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input row */}
      <div className="flex items-end gap-2">
        {/* Attachment button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading || isRecording}
          className="h-10 w-10 text-muted-foreground hover:text-foreground shrink-0"
        >
          <Paperclip className="h-5 w-5" />
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />

        {/* Text input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder={isRecording ? "Gravando..." : "Digite sua mensagem..."}
            disabled={isLoading || isRecording}
            rows={1}
            className={cn(
              "w-full resize-none rounded-2xl border border-white/12 bg-white/5 px-4 py-2.5 text-sm text-foreground shadow-inner backdrop-blur-sm",
              "focus:outline-none focus:ring-2 focus:ring-primary/60 focus:ring-offset-0",
              "placeholder:text-slate-400",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "max-h-[120px]"
            )}
          />
        </div>

        {/* Mic / Send button */}
        {message.trim() || attachments.length > 0 ? (
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            size="icon"
            className="h-10 w-10 rounded-full shrink-0"
          >
            <Send className="h-5 w-5" />
          </Button>
        ) : (
          <Button
            onClick={isRecording ? onStopRecording : onStartRecording}
            disabled={isLoading}
            size="icon"
            variant={isRecording ? "destructive" : "default"}
            className="h-10 w-10 rounded-full shrink-0"
          >
            {isRecording ? (
              <Square className="h-5 w-5" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
