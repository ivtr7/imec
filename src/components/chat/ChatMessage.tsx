import { cn } from '@/lib/utils';
import type { StoredMessage } from '@/lib/chatStorage';
import { FileImage, FileAudio, FileText } from 'lucide-react';

interface ChatMessageProps {
  message: StoredMessage;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  
  return (
    <div
      className={cn(
        'flex animate-fade-in',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          isUser ? 'chat-bubble-user' : 'chat-bubble-agent'
        )}
      >
        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="space-y-2 mb-2">
            {message.attachments.map((attachment, index) => (
              <div key={index}>
                {attachment.type === 'image' && (
                  <img
                    src={attachment.url}
                    alt={attachment.name || 'Imagem enviada'}
                    className="max-w-full rounded-xl max-h-60 object-cover border border-white/10 shadow-[0_12px_32px_rgba(0,0,0,0.3)]"
                  />
                )}
                {attachment.type === 'audio' && (
                  <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg border border-white/10 backdrop-blur-sm">
                    <FileAudio className="h-4 w-4" />
                    <span className="text-sm">{attachment.name || 'Áudio'}</span>
                  </div>
                )}
                {attachment.type === 'file' && (
                  <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg border border-white/10 backdrop-blur-sm">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm">{attachment.name || 'Arquivo'}</span>
                  </div>
                )}
                {attachment.transcription && (
                  <p className="text-xs mt-1 opacity-80 italic">
                    Transcrição: "{attachment.transcription}"
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* Message content */}
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>
        
        {/* Timestamp */}
        <p
          className={cn(
            'text-[10px] mt-1',
            isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'
          )}
        >
          {new Date(message.timestamp).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>
    </div>
  );
}
