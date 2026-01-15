import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  StoredMessage,
  saveMessage,
  getMessages,
  saveSession,
  getSession,
  saveMessageToLocalStorage,
  getMessagesFromLocalStorage,
  saveSessionToLocalStorage,
  getSessionFromLocalStorage
} from '@/lib/chatStorage';
import { useAudioRecorder } from './useAudioRecorder';
import { toast } from 'sonner';

export function useChat() {
  const [messages, setMessages] = useState<StoredMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const { isRecording, startRecording: startAudioRecording, stopRecording: stopAudioRecording } = useAudioRecorder();
  const initializingRef = useRef(false);

  // Initialize session and load messages
  useEffect(() => {
    const init = async () => {
      if (initializingRef.current) return;
      initializingRef.current = true;

      try {
        // Try IndexedDB first, fallback to localStorage
        let storedMessages: StoredMessage[] = [];
        let storedSession = null;

        try {
          storedMessages = await getMessages();
          storedSession = await getSession();
        } catch (e) {
          console.log('IndexedDB not available, using localStorage');
          storedMessages = getMessagesFromLocalStorage();
          storedSession = getSessionFromLocalStorage();
        }

        if (storedMessages.length > 0) {
          setMessages(storedMessages);
        }

        if (storedSession) {
          setSessionId(storedSession.id);
        } else {
          // Create new session via edge function
          try {
            const { data, error } = await supabase.functions.invoke('session', {
              method: 'POST',
              body: {}
            });

            if (error) throw error;

            const newSessionId = data.sessionId;
            setSessionId(newSessionId);

            const session = { id: newSessionId, createdAt: Date.now() };
            try {
              await saveSession(session);
            } catch {
              saveSessionToLocalStorage(session);
            }
          } catch (e) {
            console.error('Failed to create session:', e);
            // Generate local session ID as fallback
            const fallbackId = crypto.randomUUID();
            setSessionId(fallbackId);
            saveSessionToLocalStorage({ id: fallbackId, createdAt: Date.now() });
          }
        }

        // Show welcome message if no messages
        if (storedMessages.length === 0) {
          const welcomeMessage: StoredMessage = {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: 'Olá! Sou a comercIA, assistente virtual da clínica. Como posso ajudar você hoje?\n\nPosso agendar consultas, informar preços de exames, ou orientar sobre sintomas. É só me contar!',
            timestamp: Date.now()
          };
          setMessages([welcomeMessage]);
          try {
            await saveMessage(welcomeMessage);
          } catch {
            saveMessageToLocalStorage(welcomeMessage);
          }
        }
      } catch (e) {
        console.error('Failed to initialize chat:', e);
      }
    };

    init();
  }, []);

  const sendMessage = useCallback(async (content: string, attachments?: File[]) => {
    if (!content.trim() && !attachments?.length) return;

    // Create user message
    const userMessage: StoredMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: Date.now()
    };

    // Handle attachments
    let attachmentData: StoredMessage['attachments'] = [];
    let base64Images: string[] = [];

    if (attachments?.length) {
      for (const file of attachments) {
        const url = URL.createObjectURL(file);
        const type = file.type.startsWith('image/') ? 'image' : 'file';
        attachmentData.push({
          type,
          url,
          name: file.name
        });

        // Convert image to base64 for AI
        if (type === 'image') {
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
          base64Images.push(base64);
        }
      }
      userMessage.attachments = attachmentData;
    }

    setMessages(prev => [...prev, userMessage]);
    try {
      await saveMessage(userMessage);
    } catch {
      saveMessageToLocalStorage(userMessage);
    }

    setIsLoading(true);

    try {
      // Prepare conversation history for AI
      const conversationHistory = messages.slice(-10).map(m => ({
        role: m.role,
        content: m.content
      }));

      const { data, error } = await supabase.functions.invoke('chat', {
        body: {
          sessionId,
          message: content,
          conversationHistory,
          images: base64Images.length > 0 ? base64Images : undefined
        }
      });

      if (error) throw error;

      const assistantMessage: StoredMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.response,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, assistantMessage]);
      try {
        await saveMessage(assistantMessage);
      } catch {
        saveMessageToLocalStorage(assistantMessage);
      }
    } catch (e) {
      console.error('Failed to send message:', e);
      toast.error('Erro ao enviar mensagem. Tente novamente.');
      
      const errorMessage: StoredMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Desculpe, tive um problema para processar sua mensagem. Pode tentar novamente?',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, sessionId]);

  const startRecording = useCallback(async () => {
    try {
      await startAudioRecording();
      toast.info('Gravando áudio...');
    } catch (e) {
      console.error('Failed to start recording:', e);
      toast.error('Não foi possível acessar o microfone');
    }
  }, [startAudioRecording]);

  const stopRecording = useCallback(async () => {
    try {
      const audioBlob = await stopAudioRecording();
      if (!audioBlob) return;

      toast.info('Processando áudio...');

      // Convert to base64
      const base64Audio = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // Remove data URL prefix
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.readAsDataURL(audioBlob);
      });

      // Send to transcription endpoint
      const { data, error } = await supabase.functions.invoke('transcribe', {
        body: { audio: base64Audio }
      });

      if (error) throw error;

      const transcription = data.text;
      if (transcription) {
        // Add as user message
        await sendMessage(transcription);
      } else {
        toast.error('Não foi possível transcrever o áudio');
      }
    } catch (e) {
      console.error('Failed to process recording:', e);
      toast.error('Erro ao processar áudio');
    }
  }, [stopAudioRecording, sendMessage]);

  return {
    messages,
    isLoading,
    isRecording,
    sendMessage,
    startRecording,
    stopRecording,
    sessionId
  };
}
