import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Message, Conversation } from '@shared/schema';
import { useAuth } from './useAuth';

export function useChat() {
  const { appUser } = useAuth();
  const queryClient = useQueryClient();
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  // Get user conversations
  const { data: conversations } = useQuery({
    queryKey: ['/api/conversations/user', appUser?.id],
    enabled: !!appUser?.id,
  });

  // Get messages for current conversation
  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ['/api/conversations', currentConversationId, 'messages'],
    enabled: !!currentConversationId,
  });

  // Create new conversation
  const createConversationMutation = useMutation({
    mutationFn: async (title?: string) => {
      const response = await apiRequest('POST', '/api/conversations', {
        userId: appUser?.id,
        title: title || 'Nouvelle conversation'
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/conversations/user', appUser?.id] });
      setCurrentConversationId(data.conversation.id);
    },
  });

  // Send message
  const sendMessageMutation = useMutation({
    mutationFn: async ({
      content,
      inputMode = 'text',
      language = 'fr'
    }: {
      content: string;
      inputMode?: string;
      language?: string;
    }) => {
      let conversationId = currentConversationId;
      
      // Create conversation if none exists
      if (!conversationId) {
        const convResponse = await apiRequest('POST', '/api/conversations', {
          userId: appUser?.id,
          title: content.substring(0, 50) + '...'
        });
        const convData = await convResponse.json();
        conversationId = convData.conversation.id;
        setCurrentConversationId(conversationId);
      }

      const response = await apiRequest('POST', '/api/messages', {
        conversationId,
        content,
        type: 'user',
        inputMode,
        language
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['/api/conversations', currentConversationId, 'messages'] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['/api/conversations/user', appUser?.id] 
      });
    },
  });

  // Process image with OCR
  const processImageMutation = useMutation({
    mutationFn: async ({ imageData, language = 'fr' }: { imageData: string; language?: string }) => {
      const response = await apiRequest('POST', '/api/process/image', {
        imageData,
        language
      });
      return response.json();
    },
  });

  // Process PDF
  const processPdfMutation = useMutation({
    mutationFn: async ({ pdfData, language = 'fr' }: { pdfData: string; language?: string }) => {
      const response = await apiRequest('POST', '/api/process/pdf', {
        pdfData,
        language
      });
      return response.json();
    },
  });

  // Process audio
  const processAudioMutation = useMutation({
    mutationFn: async ({ audioData, language = 'fr' }: { audioData: string; language?: string }) => {
      const response = await apiRequest('POST', '/api/process/audio', {
        audioData,
        language
      });
      return response.json();
    },
  });

  const createConversation = useCallback((title?: string) => {
    createConversationMutation.mutate(title);
  }, [createConversationMutation]);

  const sendMessage = useCallback((content: string, inputMode?: string, language?: string) => {
    sendMessageMutation.mutate({ content, inputMode, language });
  }, [sendMessageMutation]);

  const processImage = useCallback((imageData: string, language?: string) => {
    return processImageMutation.mutateAsync({ imageData, language });
  }, [processImageMutation]);

  const processPdf = useCallback((pdfData: string, language?: string) => {
    return processPdfMutation.mutateAsync({ pdfData, language });
  }, [processPdfMutation]);

  const processAudio = useCallback((audioData: string, language?: string) => {
    return processAudioMutation.mutateAsync({ audioData, language });
  }, [processAudioMutation]);

  return {
    conversations: (conversations as any)?.conversations || [],
    messages: (messages as any)?.messages || [],
    messagesLoading,
    currentConversationId,
    setCurrentConversationId,
    createConversation,
    sendMessage,
    processImage,
    processPdf,
    processAudio,
    isLoading: sendMessageMutation.isPending,
    error: sendMessageMutation.error
  };
}
