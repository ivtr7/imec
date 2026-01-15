import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatInput } from '@/components/chat/ChatInput';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { TestButtons } from '@/components/chat/TestButtons';
import { AdminLoginModal } from '@/components/chat/AdminLoginModal';
import { useChat } from '@/hooks/useChat';

export default function Chat() {
  const navigate = useNavigate();
  const {
    messages,
    isLoading,
    isRecording,
    sendMessage,
    startRecording,
    stopRecording
  } = useChat();
  
  const [showAdminModal, setShowAdminModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleAdminLogin = async (password: string): Promise<boolean> => {
    // Simple password check - in production, use proper auth
    if (password === 'admin123') {
      localStorage.setItem('comercia_admin_token', 'authenticated');
      navigate('/admin');
      return true;
    }
    return false;
  };

  const handleTestMessage = (message: string) => {
    sendMessage(message);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 opacity-80">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(34,211,238,0.12),transparent_45%),radial-gradient(circle_at_85%_10%,rgba(134,239,172,0.12),transparent_40%),radial-gradient(circle_at_50%_90%,rgba(15,23,42,0.55),transparent_55%)]" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col gap-4 px-4 pb-6 pt-4">
        <ChatHeader onAdminClick={() => setShowAdminModal(true)} />

        <TestButtons onTest={handleTestMessage} />

        <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-white/10 bg-card/80 shadow-[0_24px_60px_rgba(0,0,0,0.45)] backdrop-blur-[14px] ring-1 ring-white/5">
          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}

            {isLoading && <TypingIndicator />}

            <div ref={messagesEndRef} />
          </div>

          <ChatInput
            onSendMessage={sendMessage}
            onStartRecording={startRecording}
            onStopRecording={stopRecording}
            isRecording={isRecording}
            isLoading={isLoading}
          />
        </div>

        <AdminLoginModal
          open={showAdminModal}
          onOpenChange={setShowAdminModal}
          onLogin={handleAdminLogin}
        />
      </div>
    </div>
  );
}
